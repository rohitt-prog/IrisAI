# 👁️ Iris Health AI — Deep Learning Based Eye Health Monitoring System

> **AI-powered anterior eye health screening** — upload an eye image, get an instant diagnosis and a downloadable clinical PDF report in under 30 seconds.

---

## 🌟 Overview

**Iris Health AI** is a full-stack web application that uses deep learning to detect eye conditions from anterior eye segment images. It combines a PyTorch classification model with Google Gemini generative AI to provide plain-language explanations, and generates professional PDF reports with embedded QR codes — all behind a secure, JWT-authenticated interface.

> ⚠️ **Medical Disclaimer:** This system is for preliminary screening purposes only. It is NOT a substitute for professional medical diagnosis. Always consult a licensed ophthalmologist.

---

## ✨ Key Features

| Feature | Details |
|---|---|
| 🩺 **6 Conditions Detected** | Normal, Glaucoma, Cataract, Diabetic Retinopathy, Uveitis, Keratoconus |
| ⚡ **Instant AI Analysis** | Deep learning classification with confidence score + per-class probability breakdown |
| 🤖 **Generative AI Explanations** | Google Gemini explains each result in clear, patient-friendly language |
| 💬 **AI Chat Assistant** | Ask follow-up eye-health questions powered by Gemini |
| 📄 **PDF + QR Reports** | Downloadable clinical reports with embedded QR codes via ReportLab |
| 📋 **Scan History** | Per-user history of all past screenings stored in MongoDB |
| 🔐 **JWT Auth** | Secure user registration & login with bcrypt password hashing |
| 🌐 **Anonymous Mode** | Run a screening without an account (results still saved) |

---

## 🏗️ Project Structure

```
projectDeep/
├── backend/                  # Flask API (Python)
│   ├── app.py                # App entry point, MongoDB & JWT setup
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variable template
│   ├── Procfile              # Gunicorn config (for deployment)
│   ├── model/
│   │   └── model.h5          # ← Place your trained Keras model here
│   ├── routes/
│   │   ├── auth.py           # /api/auth — register & login
│   │   ├── predict.py        # /api/predict — image upload & AI prediction
│   │   ├── chat.py           # /api/chat — Gemini AI chat
│   │   ├── history.py        # /api/history — scan history
│   │   └── report.py         # /api/report — PDF generation
│   └── utils/
│       ├── preprocess.py     # Image preprocessing & model inference
│       ├── llm_explainer.py  # Gemini API integration (explain + chat)
│       └── pdf_generator.py  # ReportLab PDF + QR code generation
│
├── frontend/                 # React + Vite (JavaScript)
│   └── src/
│       ├── App.jsx           # Router & layout
│       ├── config.js         # API base URL config
│       ├── context/
│       │   └── TokenContext.jsx # Global token state management for auth
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Dashboard.jsx # Hero, stats, how-it-works
│       │   ├── Upload.jsx    # Image uploader entry point
│       │   ├── Result.jsx    # Prediction result + report download
│       │   ├── History.jsx   # Per-user scan history & deletion
│       │   ├── Pricing.jsx      # Subscription pricing plans
│       │   ├── PaymentPending.jsx # Payment processing status page
│       │   ├── Privacy.jsx      # Privacy Policy
│       │   └── Terms.jsx        # Terms of Service
│       └── components/
│           ├── Navbar.jsx
│           ├── Footer.jsx
│           ├── ImageUploader.jsx  # Drag-and-drop image upload
│           ├── ResultCard.jsx     # Condition card UI
│           ├── Chart.jsx          # Probability bar chart
│           └── ChatBox.jsx        # AI chat interface
│
└── run.sh                    # One-command startup script
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+**
- **Node.js 18+** and **npm**
- **MongoDB** (local or [Atlas free tier](https://www.mongodb.com/atlas))
- **Google Gemini API Key** — get one free at [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

### 1. Clone & Configure

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
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=mongodb://localhost:27017/iris_health
JWT_SECRET_KEY=change-this-to-a-long-random-string
```

---

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 app.py
```

The Flask API will start at **`http://localhost:5001`**.

> 💡 **Apple Silicon Mac?** Replace `tensorflow` in `requirements.txt` with `tensorflow-macos`.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React app will start at **`http://localhost:5173`**.

---

### 4. One-Command Start (macOS/Linux)

```bash
chmod +x run.sh
./run.sh
```

This installs dependencies and starts both backend and frontend in the background. Press `CTRL+C` to stop both.

---

## 🤖 AI Model Integration

The system supports two modes:

### ✅ Real Model (Recommended)
1. Train a PyTorch EfficientNet-B3 model on 6 eye condition classes (in the exact order below).
2. Save the weights as `backend/model/eye_disease_model_v4.pth` and class info as `class_info.json`.
3. The app auto-loads it on startup.

**Required class order** (must match your training labels):
```python
['Normal', 'Glaucoma', 'Cataract', 'Diabetic Retinopathy', 'Uveitis', 'Keratoconus']
```

**Expected input:** `300 × 300` RGB image, standard ImageNet normalization.

### 🔁 Mock Fallback
If no valid PyTorch model is found, the system uses random mock predictions — useful for UI development without a trained model.

---

## 🔌 API Reference

All endpoints are prefixed with `/api`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | None | Create a new user account |
| `POST` | `/api/auth/login` | None | Login, returns JWT token |
| `POST` | `/api/predict/` | Optional JWT | Upload eye image, get prediction + Gemini explanation |
| `POST` | `/api/chat` | None | Ask an eye-health question |
| `GET`  | `/api/history/` | JWT required | Fetch the current user's scan history |
| `DELETE`| `/api/history/<history_id>` | JWT required | Delete a specific scan record |
| `GET`  | `/api/report/<report_id>` | JWT required | Download a PDF report for a scan |

---

## 🛠️ Tech Stack

### Backend
- **Flask** — REST API framework
- **PyTorch** — Deep learning model inference
- **Google Gemini** (`google-generativeai`) — AI explanations and chat
- **MongoDB + PyMongo** — Database for users & scan history
- **Flask-JWT-Extended** — JWT authentication
- **ReportLab + qrcode** — PDF report generation
- **bcrypt** — Password hashing
- **Gunicorn** — Production WSGI server

### Frontend
- **React 18** + **Vite** — Modern SPA framework
- **React Router v6** — Client-side routing
- **Vanilla CSS** — Custom design system with glassmorphism & dark mode
- **Space Grotesk** — Premium typography (Google Fonts)

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI explanations |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET_KEY` | Yes | Secret key for signing JWT tokens |

---

## 🗺️ Application Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | → `/upload` | Redirects to upload page |
| `/login` | Login | User authentication |
| `/signup` | Signup | User registration |
| `/dashboard` | Dashboard | Overview, stats, and how-it-works |
| `/upload` | Upload | Drag-and-drop eye image uploader |
| `/result` | Result | Prediction, confidence, chart, AI explanation |
| `/history` | History | Past scans with report download links & deletion |
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

## 📜 License

This project was built as an academic research project. Use responsibly and always include the medical disclaimer when deploying.

---

<div align="center">
  <strong>Built with ❤️ for eye health screening research</strong><br/>
  <em>⚠️ Not a medical device. For professional screening, consult a licensed ophthalmologist.</em>
</div>
