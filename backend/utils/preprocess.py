import numpy as np
import random
import os
import json

# ─────────────────────────────────────────────────────────────────────────────
# Ensemble Model Integration (DenseNet-121 + EfficientNet-B4 + ResNet-50)
# Weighted average based on individual validation accuracies
# ─────────────────────────────────────────────────────────────────────────────

MODEL_DIR  = 'model'
INFO_PATH  = os.path.join(MODEL_DIR, 'class_info.json')

# Individual model weight files
MODEL_CONFIGS = [
    {
        "name":     "DenseNet-121",
        "arch":     "densenet121",
        "file":     "DenseNet-121_best.pth",
        "weight":   0.9586,   # val accuracy used as ensemble weight
        "feature_dim": 1024,
    },
    {
        "name":     "EfficientNet-B4",
        "arch":     "efficientnet_b4",
        "file":     "EfficientNet-B4_best.pth",
        "weight":   0.9530,
        "feature_dim": 1792,
    },
    {
        "name":     "ResNet-50",
        "arch":     "resnet50",
        "file":     "ResNet-50_best.pth",
        "weight":   0.9509,
        "feature_dim": 2048,
    },
]

# Normalise weights so they sum to 1
_total_weight = sum(c["weight"] for c in MODEL_CONFIGS)
for _cfg in MODEL_CONFIGS:
    _cfg["weight"] /= _total_weight

# ─────────────────────────────────────────────────────────────────────────────

models  = []          # list of loaded nn.Module instances (parallel to MODEL_CONFIGS)
device  = None
transform = None
classes_from_json = []

# Load class names
if os.path.exists(INFO_PATH):
    try:
        with open(INFO_PATH, 'r') as f:
            info = json.load(f)
            classes_from_json = info.get("class_names", [])
        print(f"✅ Class info loaded: {classes_from_json}")
    except Exception as e:
        print(f"⚠️  Could not load class_info.json: {e}")

NUM_CLASSES = len(classes_from_json) if classes_from_json else 5

# ─── Try loading all three models ────────────────────────────────────────────
try:
    import torch
    import torch.nn as nn
    import timm
    from torchvision import transforms as T

    device = torch.device(
        "cuda"  if torch.cuda.is_available()               else
        "mps"   if torch.backends.mps.is_available()       else
        "cpu"
    )
    print(f"🖥️  Using device: {device}")

    # ── Input transform (same for all models — largest required size is 380 for B4)
    transform = T.Compose([
        T.Resize((380, 380)),
        T.ToTensor(),
        T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    for cfg in MODEL_CONFIGS:
        pth_path = os.path.join(MODEL_DIR, cfg["file"])
        if not os.path.exists(pth_path):
            print(f"⚠️  Model file not found, skipping: {pth_path}")
            models.append(None)
            continue

        print(f"Loading {cfg['name']} from {pth_path} …")

        # ── Load as a complete timm model (backbone + built-in classifier) ──
        # The .pth files were saved from full timm models with num_classes=NUM_CLASSES,
        # so we create the same architecture and load the state dict directly.
        m = timm.create_model(cfg["arch"], pretrained=False, num_classes=NUM_CLASSES)

        state = torch.load(pth_path, map_location=device, weights_only=False)
        # Support checkpoints saved as {"model_state_dict": ...} or plain state_dict
        if isinstance(state, dict) and "model_state_dict" in state:
            state = state["model_state_dict"]


        result = m.load_state_dict(state, strict=True)
        m.to(device)
        m.eval()
        models.append(m)
        print(f"✅ {cfg['name']} loaded (weight={cfg['weight']:.4f})")

    loaded_count = sum(1 for m in models if m is not None)
    print(f"✅ Ensemble ready: {loaded_count}/{len(MODEL_CONFIGS)} models loaded on {device}")

except Exception as e:
    import traceback
    print(f"⚠️  Failed to load ensemble models: {e}. Using mock predictions.")
    traceback.print_exc()
    models = []
    print("\n🔴 RUNNING IN MOCK MODE — all predictions are RANDOM (not real AI)")
    print("   Fix the error above to enable real model inference.")

# ─────────────────────────────────────────────────────────────────────────────
# Class name helpers
# ─────────────────────────────────────────────────────────────────────────────

FRONTEND_CLASSES = [
    'Normal', 'Glaucoma', 'Cataract', 'Diabetic Retinopathy', 'Keratoconus'
]

def format_class_name(c):
    c = c.replace('_', ' ')
    mapping = {fc.lower(): fc for fc in FRONTEND_CLASSES}
    return mapping.get(c.lower(), c)

if classes_from_json:
    CLASSES = [format_class_name(c) for c in classes_from_json]
else:
    CLASSES = FRONTEND_CLASSES

# ─────────────────────────────────────────────────────────────────────────────
# Inference
# ─────────────────────────────────────────────────────────────────────────────

def predict_disease(image_path):
    """
    Run weighted ensemble inference.
    Returns (predicted_class, confidence, {class: prob}) or falls back to mock.
    """
    active_models = [(cfg, m) for cfg, m in zip(MODEL_CONFIGS, models) if m is not None]

    if active_models and transform is not None:
        try:
            import torch
            import torch.nn.functional as F
            from PIL import Image

            img = Image.open(image_path).convert('RGB')
            img_tensor = transform(img).unsqueeze(0).to(device)

            weighted_probs = np.zeros(NUM_CLASSES, dtype=np.float64)
            with torch.no_grad():
                for cfg, m in active_models:
                    logits = m(img_tensor)
                    probs  = F.softmax(logits, dim=1)[0].cpu().numpy()
                    weighted_probs += cfg["weight"] * probs

            # Re-normalise (in case any model was skipped)
            total_weight = sum(cfg["weight"] for cfg, _ in active_models)
            weighted_probs /= total_weight

            pred_index  = int(np.argmax(weighted_probs))
            prediction  = CLASSES[pred_index]
            confidence  = float(weighted_probs[pred_index])
            probabilities = {
                CLASSES[i]: round(float(weighted_probs[i]), 4)
                for i in range(len(CLASSES))
            }
            return prediction, round(confidence, 4), probabilities

        except Exception as e:
            print(f"⚠️  Ensemble inference error: {e}. Falling back to mock.")

    # ── Mock fallback ──────────────────────────────────────────────────────────
    prediction = random.choice(CLASSES)
    confidence = round(random.uniform(0.75, 0.99), 4)
    remaining  = 1.0 - confidence
    per_class  = round(remaining / (len(CLASSES) - 1), 4)
    probabilities = {c: (confidence if c == prediction else per_class) for c in CLASSES}
    return prediction, confidence, probabilities

# Back-compat: expose a single `model` variable for health-check in app.py
# Set AFTER the loading loop so it reflects the actual loaded state
def _get_first_model():
    return next((m for m in models if m is not None), None)

model = _get_first_model()
