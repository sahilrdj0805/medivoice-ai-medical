# MediVoice - AI Medical Consultation & Triage System

MediVoice is an advanced, AI-powered medical consultation web application designed to connect patients with virtual medical specialists. By combining natural language symptom triage, voice-enabled AI consultations (Text-to-Speech), and automated clinical documentation, MediVoice streamlines patient assessment and delivers structured medical advice securely.

---

## 🌟 Key Features

*   **Interactive Voice Consultations (TTS):** Engage in spoken dialogue with AI medical specialists. The system uses high-quality, real-time Text-to-Speech (TTS) via `node-edge-tts` to stream doctor responses directly.
*   **AI Symptom Triage & Specialist Router:** Describe how you feel, and the system's triage engine (powered by OpenRouter AI) will correct typos, analyze symptoms, and match you with the 1-3 best medical specialists.
*   **Specialist Mismatch Warning:** If you manually select a doctor that doesn't fit your described symptoms, the AI displays a warning, recommending the proper specialist.
*   **Structured Consultation Reports:** Generates structured diagnostic reports summarizing the consultation, listing suspected conditions, non-pharmacological wellness advice, OTC drug dosages, and critical red-flag emergency warnings.
*   **Stripe Credit Packages:** Consultation features are credit-driven. Patients can buy Bronze, Silver, or Gold credit packages via Stripe Checkout, which are atomically managed and deducted.
*   **Admin Dashboard:** Specialized admin interface allowing admins to create, edit, or delete doctors, configure custom AI system prompts, assign voices, and view statistics.
*   **Hybrid Authentication Security:** Modern authentication utilizing JSON Web Tokens (JWT) with HTTP-only cookies and Authorization header fallback, preventing XSS attacks while maintaining 100% browser compatibility.

---

## 🛠️ Technology Stack

### Frontend (Client)
*   **Core:** React 19, Vite (JavaScript)
*   **Styling:** Tailwind CSS (v4), Framer Motion (animations)
*   **State & Navigation:** React Router, Context API
*   **APIs:** Axios (with dynamic interceptors & credential support)
*   **Icons:** Lucide React

### Backend (Server)
*   **Runtime & Framework:** Node.js, Express.js
*   **Database:** MongoDB Atlas (Mongoose ODM)
*   **Authentication:** JWT, Cookie-Parser
*   **AI Services:** OpenRouter API (GPT-4o-mini model)
*   **Text-to-Speech:** Node Edge TTS (Microsoft Edge TTS API wrapper)
*   **Payments:** Stripe SDK

---

## 📂 Project Structure

```text
ai-medical/
├── client/              # React frontend application (Vite)
│   ├── public/          # Static assets (Favicons, welcome video)
│   └── src/             # Frontend source code (Components, Pages, Hooks, Context)
├── server/              # Node.js Express backend API
│   └── src/             # Backend source code (Routes, Models, Middleware, Scripts)
└── README.md            # Project documentation
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or MongoDB Atlas Cluster)
*   OpenRouter API Key
*   Stripe Developer Account (for test keys)

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository and navigate to root
cd ai-medical

# Install Backend dependencies
cd server
npm install

# Install Frontend dependencies
cd ../client
npm install
```

### Step 2: Configure Environment Variables

#### Backend (`server/.env`)
Create a `.env` file in the `server` directory and configure the following variables:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_token

# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-medical

# API Keys
OPENROUTER_API_KEY=your_openrouter_api_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# URLs
CLIENT_URL=http://localhost:5173

# Admin Initial Credentials
ADMIN_EMAIL=admin@medivoice.com
ADMIN_PASSWORD=SecureAdminPassword123
```

#### Frontend (`client/.env`)
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Seed the Database

Before running the application, seed the initial database with the Admin account:
```bash
cd server
npm run seed
```

### Step 4: Run the Application

Start both the backend and frontend servers in separate terminals:

```bash
# Start Backend API Server (Runs on http://localhost:5000)
cd server
npm run dev

# Start Frontend Vite App (Runs on http://localhost:5173 or 5174)
cd client
npm run dev
```

---

## 🔒 Deployment Configuration (Render)

When deploying to Render, apply these configurations:

1.  **Backend Web Service:**
    *   **Root Directory:** `server`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
    *   **Environment Variables:** Add all variables from `server/.env`. Set `NODE_ENV=production` and `CLIENT_URL` to your frontend live URL.

2.  **Frontend Static Site:**
    *   **Root Directory:** `client`
    *   **Build Command:** `npm run build`
    *   **Publish Directory:** `dist`
    *   **Environment Variables:** `VITE_API_URL` set to `https://your-backend-service.onrender.com/api`.
    *   **Redirects/Rewrites:** Add a rule: Source `/*` -> Destination `/index.html` -> Action `Rewrite` (to fix React Router path page refresh errors).
