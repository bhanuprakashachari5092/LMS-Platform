# Shaivika LMS AI Foundation (KaizenQ) — Developer Documentation

Welcome to the official developer documentation for the **Shaivika LMS AI Foundation** (branded as **KaizenQ**). This document serves as a comprehensive technical guide for developers onboarding or maintaining the project codebase.

---

## 1. System Vision & Overview

**KaizenQ** is a gamified, AI-integrated Learning Management System (LMS) designed for engineering education. The platform teaches technical domains (e.g., Linux, Git/GitHub, Python, Kubernetes) through structured lessons, interactive quizzes, automated hands-on assignments, and integrated sandboxes.

### Core Philosophy: "Continuous Improvement"
Following the Japanese philosophy of *Kaizen*, the platform encourages learners to take steady, incremental steps daily through:
- **Gamified Engagement**: Daily streaks, XP (Experience Points), levels, and dynamic achievements.
- **AI-Guided Tutoring**: Built-in AI assistants evaluate assignments, explain code, and clear doubts.
- **Direct Practice**: In-browser command-line tools and sandbox integrations.

---

## 2. High-Level Architecture

The project is structured as a **TypeScript Monorepo** containing separate packages for the frontend UI, backend API, and shared types.

```mermaid
graph TD
    User([Learner / Admin]) -->|HTTP / WebSockets| FE[Frontend: React + Vite]
    FE -->|API Requests| BE[Backend: Express.js]
    BE -->|Authentication & DB| FB[Firebase Auth & Firestore]
    BE -->|AI Logic / Tutoring| AI[Firebase AI Logic / Gemini API]
    BE -->|Email Alerts| Brevo[Brevo SMTP API]
    FE -.->|Direct SDK Queries| FB
    
    FE === Shared[Shared Types & Interfaces]
    BE === Shared
```

### Components Summary

1. **Frontend (`/frontend`)**
   - Built with **React 18** and **Vite** for rapid bundling.
   - Styled using **Tailwind CSS** (v4 utility compiler/vars) and custom vanilla CSS variables for dark/light mode consistency.
   - Core animations driven by **Framer Motion** (e.g. rotating split-text, particle sparkle emitters, floating logo).
   - State managed via React Contexts (Auth, Theme, Course Progress).

2. **Backend (`/backend`)**
   - Powered by **Node.js** and **Express.js** in TypeScript.
   - Leverages **WebSockets (Socket.io)** for live classes, notifications, and real-time updates.
   - Integrates with third-party service providers (Gemini API, Brevo Email SMTP, payment checkouts).

3. **Shared Library (`/shared`)**
   - Monorepo package sharing core interfaces, types (e.g., `ICourse`, `IModule`, `IEnrollment`), and validator functions.
   - Keeps client and server data models in perfect sync.

4. **Data & Infrastructure**
   - **Authentication**: Firebase Auth (Google Sign-In, Email/Password).
   - **Database**: Cloud Firestore.
   - **File Storage**: Google Drive API / Firebase Storage.

---

## 3. Key Platform Features & Mechanics

### 3.1. Interactive Course System
Courses are composed of hierarchically structured **Modules**, **Lessons**, **Quizzes**, **Assignments**, and **Resources**. 
- **Content Integrity**: All curriculum data is structured manually in JSON files and Firestore databases.
- **Progress Tracking**: Real-time position persistence, tracking completed pages, modules, and overall course completion percentages.

### 3.2. Dynamic Gamification Engine
- **XP System**: Earned by reading lessons, completing quizzes, and finishing challenges.
- **Streaks**: Encourages daily engagement; checked and updated automatically upon login.
- **Badges/Achievements**: Awarded dynamically via `achievementService.ts` based on milestones (e.g., first lesson completed, perfect quiz score, 7-day streak).

### 3.3. AI-Integrated Tutor & Auto-Evaluation
- Powered by **Gemini API** / **Firebase AI Logic**.
- **Automated Sandbox Evaluation**: Assesses assignments by running user commands against custom validation assertions.
- **Context-Aware Tutoring**: Integrated chat assistant that accesses the current lesson metadata to guide students without giving away direct answers.

### 3.4. Premium Dark/Light Theme System
Centralized through React `ThemeContext` and standard system tokens:
- **Smooth Transition**: Global 300ms transition applied to colors, background-colors, borders, and shadows to prevent flickering.
- **Aura & Emitters**: Custom components like `<FloatingLogo />` adjust opacity, blur, and scale dynamically depending on the active theme.

---

## 4. Repository Directory Structure

```text
Shaivika LMS AI Foundation/
├── frontend/                 # Client UI (Vite + React + TS)
│   ├── src/
│   │   ├── components/       # Reusable components (Common, Landing, Courses)
│   │   ├── contexts/         # React Context State (Auth, Theme, etc.)
│   │   ├── pages/            # Page layouts (Landing, Dashboard, CourseViewer)
│   │   ├── services/         # API & Firestore Services (courseService, aiProvider)
│   │   └── styles/           # Tailwind + Custom Global Styles (index.css)
│   ├── public/               # Static assets & Brand assets
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # API Server (Node + Express + TS)
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # REST Endpoint definitions
│   │   ├── services/         # Core logic (evaluators, email, certificates)
│   │   ├── middleware/       # Auth guards, role verification
│   │   └── app.ts            # App initialization & sockets
│   └── package.json
├── shared/                   # Shared monorepo packages (TypeScript)
│   ├── types/                # Unified interfaces (course.ts)
│   └── validators/           # Shared input sanitizers
├── docs/                     # Architectural design guides
└── package.json              # Monorepo workspaces coordinator
```

---

## 5. Local Setup & Installation

### Prerequisites
- **Node.js**: `Node.js >= 20.12.0` (LTS version 22 is recommended).
- **Git**: Installed and configured.

### Step 1: Install Dependencies
From the repository root, install dependencies for all monorepo packages simultaneously using npm workspaces:
```bash
npm ci
```

### Step 2: Configure Environment Variables

Create `.env` files in both the frontend and backend directories.

#### Backend Env (`/backend/.env`):
```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GEMINI_API_KEY=your-gemini-api-key
BREVO_API_KEY=your-brevo-api-key
```

#### Frontend Env (`/frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 3: Run Development Servers
Start both the backend API and the Vite frontend dev server concurrently:
```bash
npm run dev
```

The frontend will be running on `http://localhost:5173` and the backend on `http://localhost:5000`.

---

## 6. Crucial Developer Guidelines

> [!IMPORTANT]
> **Content Protection & Safety Rules**
> This repository houses live syllabus content, progress mechanisms, and certificates. As a developer, you must strictly follow these rules:
>
> 1. **DO NOT MODIFY** course configurations, course IDs, module order, lesson contents, or quiz structures in any database/JSON file unless specifically authorized.
> 2. **DO NOT ALTER** progress computation logic, XP calculations, or database schemas.
> 3. **UI ONLY**: Limit customizations to styling, layout responsiveness, premium transitions, and hover feedback.
> 4. **ACCESSIBILITY**: Always implement `prefers-reduced-motion` fallbacks for all CSS or Framer Motion animations.

---

### Useful Monorepo Commands
- Run Linting: `npm run lint`
- Clean Build: `npm run build`
- Run Backend Unit Tests: `npm run test:backend`
