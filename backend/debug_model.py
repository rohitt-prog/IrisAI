import os, traceback, sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))

results = []

def p(msg):
    print(msg)
    results.append(msg)

p(f"CWD: {os.getcwd()}")

try:
    import torch
    import torch.nn as nn
    import timm
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    p(f"Device: {device}")

    MODEL_CONFIGS = [
        {"name": "DenseNet-121",   "arch": "densenet121",     "file": "DenseNet-121_best.pth",   "feature_dim": 1024},
        {"name": "EfficientNet-B4","arch": "efficientnet_b4", "file": "EfficientNet-B4_best.pth", "feature_dim": 1792},
        {"name": "ResNet-50",      "arch": "resnet50",        "file": "ResNet-50_best.pth",       "feature_dim": 2048},
    ]
    NUM_CLASSES = 5

    for cfg in MODEL_CONFIGS:
        pth_path = os.path.join("model", cfg["file"])
        p(f"\n--- Testing {cfg['name']} ---")
        p(f"  Path: {pth_path}  exists={os.path.exists(pth_path)}")
        try:
            backbone = timm.create_model(cfg["arch"], pretrained=False, num_classes=0)
            head = nn.Sequential(
                nn.BatchNorm1d(cfg["feature_dim"]),
                nn.Dropout(0.3),
                nn.Linear(cfg["feature_dim"], 512),
                nn.ReLU(),
                nn.BatchNorm1d(512),
                nn.Dropout(0.2),
                nn.Linear(512, NUM_CLASSES),
            )

            class _Model(nn.Module):
                def __init__(self, backbone, head):
                    super().__init__()
                    self.backbone = backbone
                    self.head = head
                def forward(self, x):
                    return self.head(self.backbone(x))

            m = _Model(backbone, head)
            state = torch.load(pth_path, map_location=device, weights_only=False)
            p(f"  State type: {type(state)}")
            if isinstance(state, dict):
                p(f"  Top-level keys: {list(state.keys())[:10]}")
                if "model_state_dict" in state:
                    state = state["model_state_dict"]
                    p("  Unwrapped model_state_dict")
            result = m.load_state_dict(state, strict=False)
            p(f"  Missing keys (first 5): {result.missing_keys[:5]}")
            p(f"  Unexpected keys (first 5): {result.unexpected_keys[:5]}")
            p(f"  ✅ {cfg['name']} loaded successfully!")
        except Exception as e:
            p(f"  ❌ FAILED: {type(e).__name__}: {e}")
            p(traceback.format_exc())

except Exception as e:
    p(f"OUTER ERROR: {e}")
    p(traceback.format_exc())

# Save results
with open("model_debug_output.txt", "w") as f:
    f.write("\n".join(results))

p("\n✅ Results saved to model_debug_output.txt")
