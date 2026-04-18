import numpy as np
import random
import os
import json

# ─────────────────────────────────────────────────────────────────────────────
# PyTorch Model Integration
# ─────────────────────────────────────────────────────────────────────────────

MODEL_PATH = os.path.join('model', 'eye_disease_model_v4.pth')
INFO_PATH = os.path.join('model', 'class_info.json')

model = None
device = None
transform = None
classes_from_json = []

if os.path.exists(MODEL_PATH) and os.path.exists(INFO_PATH):
    try:
        import torch
        import torch.nn as nn
        import timm

        print("Loading class info...")
        with open(INFO_PATH, 'r') as f:
            info = json.load(f)
            classes_from_json = info.get("class_names", [])

        print("Initializing efficientnet_b3 architecture via timm CustomModel...")
        class CustomModel(nn.Module):
            def __init__(self, num_classes=6):
                super().__init__()
                self.backbone = timm.create_model('efficientnet_b3', pretrained=False, num_classes=0)
                self.head = nn.Sequential(
                    nn.BatchNorm1d(1536),
                    nn.Dropout(0.2),
                    nn.Linear(1536, 512),
                    nn.ReLU(),
                    nn.BatchNorm1d(512),
                    nn.Dropout(0.2),
                    nn.Linear(512, num_classes)
                )

            def forward(self, x):
                x = self.backbone(x)
                return self.head(x)

        model = CustomModel(num_classes=len(classes_from_json) if classes_from_json else 6)
        
        print(f"Loading weights from {MODEL_PATH}...")
        device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model.to(device)
        model.eval()

        print(f"✅ AI model loaded successfully on {device}")
        
        # NOTE: torchvision transforms are still used below, so they need to be imported
        from torchvision import transforms
        transform = transforms.Compose([
            transforms.Resize((300, 300)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
    except Exception as e:
        import traceback
        print(f"⚠️  Failed to load model: {e}. Using mock predictions.")
        traceback.print_exc()
        model = None

FRONTEND_CLASSES = [
    'Normal', 'Glaucoma', 'Cataract', 'Diabetic Retinopathy', 'Uveitis', 'Keratoconus'
]

def format_class_name(c):
    c = c.replace('_', ' ')
    mapping = {fc.lower(): fc for fc in FRONTEND_CLASSES}
    return mapping.get(c.lower(), c)

if classes_from_json:
    CLASSES = [format_class_name(c) for c in classes_from_json]
else:
    CLASSES = FRONTEND_CLASSES

def predict_disease(image_path):
    if model is not None and transform is not None:
        try:
            import torch
            import torch.nn.functional as F
            from PIL import Image

            img = Image.open(image_path).convert('RGB')
            img_tensor = transform(img).unsqueeze(0).to(device)

            with torch.no_grad():
                outputs = model(img_tensor)
                probs = F.softmax(outputs, dim=1)[0]
                
            raw_preds = probs.cpu().numpy()
            pred_index = int(np.argmax(raw_preds))
            prediction = CLASSES[pred_index]
            confidence = float(raw_preds[pred_index])
            probabilities = { CLASSES[i]: round(float(raw_preds[i]), 4) for i in range(len(CLASSES)) }
            return prediction, round(confidence, 4), probabilities
        except Exception as e:
            print(f"⚠️  Inference error: {e}. Falling back to mock.")

    # ── Mock fallback ──
    prediction = random.choice(CLASSES)
    confidence = round(random.uniform(0.75, 0.99), 4)

    remaining = 1.0 - confidence
    per_class = round(remaining / (len(CLASSES) - 1), 4)
    probabilities = { c: (confidence if c == prediction else per_class) for c in CLASSES }

    return prediction, confidence, probabilities
