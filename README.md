# CodeSpace — Online Judge Platform

A full-stack LeetCode-style coding platform where users can browse DSA problems, write and run code directly in the browser, submit solutions against hidden test cases, track solved problems, ask an AI for help when stuck, and watch video solutions.

🚧 **Status:** Work in progress

---

## Features

- **Authentication** — Signup/login with JWT (stored in HTTP-only cookies) and bcrypt password hashing
- **Problem Management** — Create, update, delete, and list coding problems (admin-only creation), each with visible + hidden test cases, starter code, and reference solutions in multiple languages
- **Code Execution** — Run code against visible test cases or submit against hidden test cases, powered by Judge0 via RapidAPI
- **Submission Tracking** — Every submission is stored with verdict, runtime, memory usage, and test cases passed; solved problems are tracked per user
- **AI Doubt Assistant** — Chat with Google Gemini for hints and help on a specific problem, without giving away the full solution
- **Video Solutions** — Upload/stream video walkthroughs of problems via Cloudinary
- **Redis** — Used for token blacklisting on logout

---

## Tech Stack

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- Redis
- JWT (jsonwebtoken) + bcrypt for auth
- Judge0 (via RapidAPI) for code execution
- Google Gemini (`@google/genai`) for AI chat
- Cloudinary for video storage

### Frontend
- React 19 + Vite
- Redux Toolkit + React Redux
- React Router
- Tailwind CSS + DaisyUI
- Monaco Editor (`@monaco-editor/react`) for the in-browser code editor
- React Hook Form + Zod for form handling/validation

---

## Project Structure

```
.
├── backend/
│   └── src/
│       ├── config/       # DB (MongoDB) and Redis connection setup
│       ├── controllers/  # Route handler logic (auth, problems, submissions, AI, video)
│       ├── middleware/   # JWT auth middleware, admin checks
│       ├── models/       # Mongoose schemas (User, Problem, Submission)
│       ├── routes/       # Express route definitions
│       ├── utils/        # Judge0 helper functions
│       └── index.js      # App entry point
└── frontend/
    └── src/              # React application
```

---

## API Overview

| Base Route     | Purpose                                     |
|-----------------|----------------------------------------------|
| `/user`        | Signup, login, logout, profile              |
| `/problem`     | Create, update, delete, fetch problems      |
| `/submission`  | Run code, submit code                       |
| `/ai`          | AI-powered doubt solving chat               |
| `/video`       | Upload/fetch video solutions                |

---

## Getting Started

### Prerequisites

- Node.js
- MongoDB instance (local or Atlas)
- Redis instance
- API keys for:
  - Judge0 (RapidAPI)
  - Google Gemini
  - Cloudinary

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```env
PORT=3000
DB_CONNECT_STRING=
JWT_KEY=
REDIS_PASS=
JUDGE0_KEY=
GEMINI_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Run the server:

```bash
node src/index.js
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default and is configured to talk to the backend at `http://localhost:3000` (CORS-enabled with credentials for the auth cookie).

---

## License

ISC
