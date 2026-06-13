import os


class Config:
    """Application configuration — centralised settings for the IRISAI backend."""

    # ── MongoDB ──────────────────────────────────────────────────────────────
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/iris_health")

    # ── JWT ──────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours in seconds

    # ── File Upload ──────────────────────────────────────────────────────────
    MAX_CONTENT_LENGTH = 20 * 1024 * 1024  # 20 MB
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

    # ── Tokens ───────────────────────────────────────────────────────────────
    TOKENS_PER_PURCHASE = 10
    TOKENS_INITIAL = 10
    TOKENS_WARNING_THRESHOLD = 5

    # ── AI Model ─────────────────────────────────────────────────────────────
    MODEL_PATH = os.path.join('model', 'eye_disease_model_v4.pth')
    CLASS_INFO_PATH = os.path.join('model', 'class_info.json')

    # ── Gemini API ───────────────────────────────────────────────────────────
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    @staticmethod
    def validate():
        """Validate required configuration at startup. Raises on fatal errors."""
        errors = []
        warnings = []

        if not Config.JWT_SECRET_KEY:
            errors.append("JWT_SECRET_KEY must be set in .env")
        elif Config.JWT_SECRET_KEY in {"super-secret-key-12345", "change-this-to-a-long-random-string"}:
            errors.append("JWT_SECRET_KEY cannot be the default value in production")

        if not Config.GEMINI_API_KEY or Config.GEMINI_API_KEY == "your_gemini_api_key_here":
            warnings.append("GEMINI_API_KEY not configured - AI features will be limited")

        if warnings:
            warning_msg = "Configuration warnings:\n" + "\n".join(f"  ⚠️  {w}" for w in warnings)
            print(f"\n{warning_msg}\n")

        if errors:
            error_msg = "Configuration errors:\n" + "\n".join(f"  ❌ {e}" for e in errors)
            raise ValueError(error_msg)
