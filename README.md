# 👁️ IrisAI — Deep Learning Based Eye Health Monitoring System

> **AI-powered anterior eye health screening** — upload an eye image, get an instant diagnosis and a downloadable clinical PDF report in under 30 seconds.

---

## 🌟 Overview

**IrisAI** is a full-stack web application that uses deep learning to detect eye conditions from anterior eye segment images. It combines a PyTorch classification model with Google Gemini generative AI to provide plain-language explanations and an interactive AI chat assistant, and generates professional PDF reports with embedded QR codes — all behind a secure, JWT-authenticated interface.

> ⚠️ **Medical Disclaimer:** This system is for preliminary screening purposes only. It is NOT a substitute for professional medical diagnosis. Always consult a licensed ophthalmologist.

---

## ✨ Key Features

| Feature | Details |
|---|---|
| 🩺 **5 Conditions Detected** | Cataract, Diabetic Retinopathy, Glaucoma, Keratoconus, Normal |
| 🧠 **3-Model Ensemble** | DenseNet-121 (95.86%) + EfficientNet-B4 (95.30%) + ResNet-50 (95.09%) — weighted average |
| ⚡ **Instant AI Analysis** | Deep learning ensemble classification with confidence score + per-class probability breakdown |
| 🤖 **Generative AI Explanations** | Google Gemini explains each result in clear, patient-friendly language |
| 🎙️ **Multilingual Voice Chat** | Speak to the AI assistant in 10+ languages (Hindi, Spanish, etc.) with voice responses |
| 💬 **AI Chat Assistant** | Dedicated chat page — ask any eye-health question anytime, powered by Gemini |
| 📄 **PDF + QR Reports** | Downloadable clinical reports with embedded QR codes via ReportLab |
| 📋 **Scan History** | Per-user history of all past screenings with analytics charts stored in MongoDB |
| 🔐 **JWT Auth** | Secure user registration & login with bcrypt password hashing |
| 🌐 **Anonymous Mode** | Run a screening without an account (results still saved) |
| 🛡️ **Rate Limiting** | Flask-Limiter protects auth and prediction endpoints from abuse |
| 🗄️ **DB Indexes** | Optimized MongoDB queries on users, history, and token logs |

---

## 🏗️ Project Structure

```
projectDeep/
├── docker-compose.yml        # Multi-container Docker configuration
├── run.sh                    # One-command startup script
├── backend/                  # Flask API (Python)
│   ├── Dockerfile            # Container build configuration
│   ├── app.py                # App entry point, MongoDB & JWT setup, health check
│   ├── config.py             # Centralised application configuration
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variable template (with docs)
│   ├── Procfile              # Gunicorn config (for deployment)
│   ├── model/
│   │   ├── DenseNet-121_best.pth      # Trained DenseNet-121 (val acc: 95.86%)
│   │   ├── EfficientNet-B4_best.pth   # Trained EfficientNet-B4 (val acc: 95.30%)
│   │   ├── ResNet-50_best.pth         # Trained ResNet-50 (val acc: 95.09%)
│   │   └── class_info.json            # Class label metadata & ensemble config
│   ├── routes/
│   │   ├── auth.py           # /api/auth — register & login (with validation)
│   │   ├── predict.py        # /api/predict — image upload & AI prediction
│   │   ├── chat.py           # /api/chat — Gemini AI chat assistant
│   │   ├── voice.py          # /api/voice — Multilingual voice interaction (STT/TTS)
│   │   ├── history.py        # /api/history — scan history & deletion
│   │   ├── report.py         # /api/report — PDF report generation
│   │   └── tokens.py         # /api/tokens — token balance & top-up
│   └── utils/
│       ├── preprocess.py     # Image preprocessing & model inference
│       ├── llm_explainer.py  # Gemini API integration (explain + chat, with caching)
│       ├── voice_service.py  # Voice pipeline: STT → Gemini → TTS
│       ├── pdf_generator.py  # ReportLab PDF + QR code generation
│       └── cleanup.py        # File cleanup utilities (old uploads & orphaned reports)
│
└── frontend/                 # React + Vite (JavaScript)
    ├── Dockerfile            # Nginx production container build
    └── src/
        ├── App.jsx           # Router & layout
        ├── config.js         # API base URL config
        ├── context/
        │   └── TokenContext.jsx # Global token state management
        ├── pages/
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── Dashboard.jsx    # Hero, stats, how-it-works
        │   ├── Upload.jsx       # Image uploader entry point
        │   ├── Result.jsx       # Prediction result + report download + inline chat
        │   ├── Chat.jsx         # ✨ Dedicated AI Assistant chat page (/chat)
        │   ├── History.jsx      # Per-user scan history & deletion
        │   ├── Pricing.jsx      # Subscription pricing plans
        │   ├── PaymentPending.jsx # Payment processing status page
        │   ├── Privacy.jsx      # Privacy Policy
        │   └── Terms.jsx        # Terms of Service
        └── components/
            ├── Navbar.jsx
            ├── Footer.jsx
            ├── ImageUploader.jsx  # Drag-and-drop image upload
            ├── VoiceButton.jsx    # ✨ Multilingual microphone component
            ├── ResultCard.jsx     # Condition card UI
            ├── Chart.jsx          # Probability bar chart
            ├── ChatBox.jsx        # Embedded AI chat (used on Result page)
            ├── GoldCoin.jsx       # Token display icon
            └── Logo.jsx           # IrisAI logo SVG
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+**
- **Node.js 18+** and **npm**
- **MongoDB** (local or [Atlas free tier](https://www.mongodb.com/atlas))
- **Docker Desktop** (Highly Recommended for easy setup)
- **Google Gemini API Key** — get one free at [aistudio.google.com](https://aistudio.google.com/app/apikey)
- **Google Cloud Service Account** — for STT/TTS voice features (Speech-to-Text and Text-to-Speech APIs enabled)

---

### 🐳 1. Run with Docker (Recommended)

The easiest way to run the entire stack (Frontend, Backend, and MongoDB) is using Docker:

```bash
git clone <your-repo-url>
cd projectDeep
cp backend/.env.example backend/.env
# ⚠️ Edit backend/.env to add your GEMINI_API_KEY and generate a secure JWT_SECRET_KEY!

docker compose up --build
```

- **Frontend:** `http://localhost:8080`
- **Backend API:** `http://localhost:5001`
- **Database:** Auto-configured locally `mongodb:27017`

---

### 💻 2. Manual Clone & Configure (Without Docker)

If you'd rather run the servers manually:

```bash
git clone <your-repo-url>
cd projectDeep
```

Copy the environment template and fill in your values:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
# Generate a secure key: python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET_KEY=your-64-char-random-string

MONGO_URI=mongodb://localhost:27017/iris_health

# Get free key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Path to Google Cloud Service Account JSON key (for Voice)
GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/backend/gcloud-key.json"
```

---

### 3. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 app.py
```

The Flask API will start at **`http://localhost:5001`**.

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React app will start at **`http://localhost:5173`**.

---

### 5. One-Command Start (macOS/Linux)

```bash
chmod +x run.sh
./run.sh
```

This installs dependencies and starts both backend and frontend in the background. Press `CTRL+C` to stop both.

---

## 💬 AI Chat Assistant

IrisAI includes a fully featured AI chat assistant powered by Google Gemini. You can access it two ways:

1. **Dedicated Chat Page** — click **🤖 AI Assistant** in the top navbar to chat anytime, even without performing a scan. Includes suggested starter questions.
2. **Inline on Result Page** — after completing a scan, a chat panel appears automatically so you can ask follow-up questions about your specific diagnosis.

The chat assistant can answer questions about eye conditions, symptoms, treatments, and general eye health. It always includes a medical disclaimer reminding users to consult a licensed ophthalmologist.

---

## 🎙️ Multilingual Voice Interaction

IrisAI features a sophisticated voice-to-voice pipeline that allows users to interact with the AI assistant naturally in their preferred language.

### How it works:
1. **Speech-to-Text:** Converts user speech to text while auto-detecting the language (Powered by Google Cloud STT).
2. **AI Processing:** Gemini processes the query and generates a response in the *same* detected language or dialect (e.g., Hinglish).
3. **Text-to-Speech:** Converts the AI's response back to high-quality audio bytes (Powered by Google Cloud TTS).
4. **Auto-Playback:** The frontend automatically plays the AI response as soon as it's received.

**Supported Languages:** English, Hindi, Spanish, French, German, Arabic, Chinese, Portuguese, Japanese, Korean, and Russian.

---

## 🤖 AI Model Integration

The system uses a **3-model weighted ensemble** for robust, high-accuracy predictions.

### 🧠 Trained Ensemble Models

| Model | Architecture | Val Accuracy | Ensemble Weight | File |
|-------|-------------|--------------|-----------------|------|
| DenseNet-121 | `densenet121` (timm) | **95.86%** | 0.3341 | `DenseNet-121_best.pth` |
| EfficientNet-B4 | `efficientnet_b4` (timm) | **95.30%** | 0.3322 | `EfficientNet-B4_best.pth` |
| ResNet-50 | `resnet50` (timm) | **95.09%** | 0.3317 | `ResNet-50_best.pth` |

**Ensemble strategy:** Weighted average of softmax probabilities, with each model's weight proportional to its validation accuracy. The model with the highest accuracy contributes the most to the final prediction.

**Detected conditions (5 classes):**
```python
['Cataract', 'Diabetic_Retinopathy', 'Glaucoma', 'Keratoconus', 'Normal']
```

**Expected input:** `380 × 380` RGB image, standard ImageNet normalization (`mean=[0.485, 0.456, 0.406]`, `std=[0.229, 0.224, 0.225]`).

### ✅ Setup
1. Place all three `.pth` files inside `backend/model/`.
2. Ensure `backend/model/class_info.json` is present (already included in repo).
3. The app auto-loads all models on startup. The health endpoint reports how many models are loaded.

### 🔁 Mock Fallback
If no valid PyTorch model files are found, the system uses random mock predictions — useful for UI development without trained weights.

---

## 🔌 API Reference

All endpoints are prefixed with `/api`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/health` | None | Health check — DB, model & Gemini API status |
| `POST` | `/api/auth/signup` | None | Create a new user account |
| `POST` | `/api/auth/login` | None | Login, returns JWT token |
| `GET`  | `/api/auth/me` | JWT required | Get current user profile |
| `POST` | `/api/predict/` | Optional JWT | Upload eye image, get prediction + Gemini explanation |
| `POST` | `/api/chat` | None | Ask any eye-health question to the AI assistant |
| `POST` | `/api/voice` | None | Multilingual voice pipeline (Audio file in → STT → Gemini → TTS → Audio out) |
| `GET`  | `/api/history/` | JWT required | Fetch the current user's scan history |
| `DELETE` | `/api/history/<report_id>` | JWT required | Delete a specific scan record & associated files |
| `GET`  | `/api/report/download-report?id=<id>` | None | Download PDF report for a scan |
| `GET`  | `/api/tokens/` | JWT required | Get current token balance |
| `POST` | `/api/tokens/add` | JWT required | Add tokens (simulated purchase) |

---

## 🛠️ Tech Stack

### Backend
- **Flask** — REST API framework
- **PyTorch** — Deep learning model inference
- **timm** — Model architectures: DenseNet-121, EfficientNet-B4, ResNet-50 (weighted ensemble)
- **Google Gemini** (`google-genai`) — AI explanations and chat (with LRU caching)
- **MongoDB + PyMongo** — Database for users & scan history
- **Flask-JWT-Extended** — JWT authentication
- **Flask-Limiter** — Rate limiting for auth & prediction endpoints
- **ReportLab + qrcode** — PDF report generation
- **bcrypt** — Password hashing
- **Gunicorn** — Production WSGI server

### Frontend
- **React 18** + **Vite** — Modern SPA framework
- **React Router v6** — Client-side routing
- **Recharts** — Analytics bar & pie charts
- **Axios** — HTTP client
- **Vanilla CSS** — Custom design system with glassmorphism & dark mode
- **Space Grotesk** — Premium typography (Google Fonts)

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET_KEY` | **Yes** | Secret key for signing JWT tokens. Generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `GEMINI_API_KEY` | Recommended | Google Gemini API key for AI explanations & chat |
| `GOOGLE_APPLICATION_CREDENTIALS` | Recommended | Absolute path to Google Cloud service account JSON (for Voice features) |

---

## 🗺️ Application Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | → `/upload` | Redirects to upload page |
| `/login` | Login | User authentication |
| `/signup` | Signup | User registration |
| `/dashboard` | Dashboard | Overview, stats, and how-it-works |
| `/upload` | Upload | Drag-and-drop eye image uploader |
| `/result` | Result | Prediction, confidence, chart, AI explanation + inline chat |
| `/chat` | **AI Assistant** | ✨ Standalone chatbot page — ask any eye-health question |
| `/history` | History | Past scans with analytics charts, report download & deletion |
| `/pricing` | Pricing | Subscription pricing plans |
| `/payment-pending` | Payment Pending | Payment processing status |
| `/privacy` | Privacy | Privacy Policy |
| `/terms` | Terms | Terms of Service |

---

## 📦 Deploying

### Backend (e.g. Railway / Render)
The `Procfile` is configured for Gunicorn:
```
web: gunicorn app:app
```
Set all environment variables in your hosting dashboard.

### Frontend (e.g. Vercel / Netlify)
```bash
cd frontend
npm run build        # Outputs to frontend/dist/
```
Update `frontend/src/config.js` to point to your deployed backend URL.

---

## 🧪 Running Without a Real Model

The system gracefully degrades — no model file means random mock predictions are used. This is ideal for:
- UI/UX development
- API integration testing
- Demonstration environments

---

## 🧹 File Cleanup

The backend includes a `cleanup.py` utility to manage disk usage:

```bash
# Run manually via Flask CLI
cd backend && flask cleanup

# Or run directly (dry run - just shows what would be deleted)
python -c "from utils.cleanup import cleanup_old_files; cleanup_old_files(days=30, dry_run=True)"
```

---

## 📜 License

This project was built as an academic research project. Use responsibly and always include the medical disclaimer when deploying.

---

<div align="center">
  <strong>Built with ❤️ for eye health screening research</strong><br/>
  <em>⚠️ Not a medical device. For professional screening, consult a licensed ophthalmologist.</em>
</div>
