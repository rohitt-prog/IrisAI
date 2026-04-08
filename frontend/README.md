# 👁️ Iris Health AI — Frontend

React + Vite frontend for the **Deep Learning Based Eye Health Monitoring System**.

> See the [root README](../README.md) for full project documentation.

---

## 🚀 Quick Start

```bash
# Recommendation: use Docker from the root directory instead
docker compose up --build

# Or manually:
npm install
npm run dev     # Development server at http://localhost:5173
npm run build   # Production build → dist/
```

---

## 📁 Structure

```
src/
├── App.jsx              # Router setup + global layout + medical disclaimer footer
├── config.js            # API base URL (point this at your backend)
├── index.css            # Full design system — dark mode, glassmorphism, tokens
├── context/
│   └── TokenContext.jsx # Global token state management for auth
├── pages/
│   ├── Login.jsx        # JWT login form
│   ├── Signup.jsx       # User registration form
│   ├── Dashboard.jsx    # Hero banner, feature cards, stats, how-it-works
│   ├── Upload.jsx       # Eye image uploader entry point
│   ├── Result.jsx       # Prediction result, confidence, chart, AI explanation, PDF download
│   ├── History.jsx      # Per-user scan history table with report links and deletion
│   ├── Pricing.jsx      # Subscription pricing plans
│   ├── PaymentPending.jsx # Payment processing status page
│   ├── Privacy.jsx      # Privacy Policy
│   └── Terms.jsx        # Terms of Service
└── components/
    ├── Navbar.jsx        # Top navigation with auth state
    ├── Footer.jsx        # Global footer with legal/navigation links
    ├── ImageUploader.jsx # Drag-and-drop + file select uploader
    ├── ResultCard.jsx    # Condition result card component
    ├── Chart.jsx         # Probability bar chart visualization
    └── ChatBox.jsx       # Gemini AI chat interface
```

---

## ⚙️ Configuration

Edit `src/config.js` to point to the backend:

```js
// Development
export const API_URL = 'http://localhost:5001';

// Production — replace with your deployed backend URL
export const API_URL = 'https://your-backend.onrender.com';
```

---

## 🎨 Design System

The app uses a custom CSS design system defined in `index.css`:

- **Dark mode by default** with CSS custom properties (`--bg-base`, `--text-primary`, etc.)
- **Glassmorphism cards** (`.glass-card`, `.glass-card-elevated`)
- **Gradient system** (`--gradient-primary`, `--gradient-iris`)
- **Glow effects** for interactive elements
- **Stagger animations** for entrance sequences
- **Typography:** Space Grotesk + Inter (Google Fonts)

---

## 🔗 Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | → `/upload` | Redirect |
| `/login` | `Login.jsx` | Email + password auth |
| `/signup` | `Signup.jsx` | New account creation |
| `/dashboard` | `Dashboard.jsx` | System overview |
| `/upload` | `Upload.jsx` | Upload an eye image |
| `/result` | `Result.jsx` | View AI prediction results |
| `/history` | `History.jsx` | View past screenings with delete option |
| `/pricing` | `Pricing.jsx` | Subscription pricing plans |
| `/payment-pending` | `PaymentPending.jsx` | Payment status processing |
| `/privacy` | `Privacy.jsx` | Privacy Policy |
| `/terms` | `Terms.jsx` | Terms of Service |
