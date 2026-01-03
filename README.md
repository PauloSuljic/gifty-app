![Build Backend](https://github.com/PauloSuljic/gifty-app/actions/workflows/backend-production.yml/badge.svg)
![Build Frontend](https://github.com/PauloSuljic/gifty-app/actions/workflows/frontend-production.yml/badge.svg)
![License](https://img.shields.io/github/license/PauloSuljic/gifty-app)
![Live](https://img.shields.io/website?url=https%3A%2F%2Fgiftyapp.live)

# 🎁 Gifty — The Smart Gift Planning App

Gifty is a modern wishlist-sharing platform that lets users create, manage, and share gift wishlists — with smooth reservation logic for both users and guests.

Built with a full-stack architecture powered by **React + Vite + Firebase** on the frontend and **ASP.NET Core + PostgreSQL** on the backend, deployed with Azure and GitHub Actions.

---

## 🌐 Live Demo

👉 [https://giftyapp.live](https://giftyapp.live)

---

## 📁 Monorepo Structure

```
gifty-app/
├── frontend/   # Vite + React + Firebase + Tailwind
├── backend/    # ASP.NET Core Web API + PostgreSQL + Redis
├── .github/    # CI/CD workflows (CI on PRs, prod deploys on master)
└── README.md   # You're here
```

---

## ✨ Features

### 🔐 Authentication

- Email/password + Google login (via Firebase Auth)
- Email verification before access
- Guest-accessible shared wishlists

### 📦 Wishlist Management

- Wishlist + item CRUD
- Shareable wishlist links
- Reservation logic (1 item per user per wishlist)

### 📱 Frontend

- Fully responsive UI (mobile-first)
- Route protection
- Smooth transitions + toast feedback
- Custom avatar/profile editing

### ⚙️ Backend API

- RESTful endpoints secured with Firebase JWT
- PostgreSQL DB (code-first via EF Core)
- Redis integration (rate limiting & caching)
- Clear separation of layers (auth, validation, data)

---

## 🧪 Local Development

### 🔧 Prerequisites

- Node.js 20+
- .NET SDK 8.x
- PostgreSQL
- Redis (Currently disabled, but recommended for future use)

---

### 🖥 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> 🔐 Set the following in `.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_API_BASE_URL=https://gifty-api.azurewebsites.net
```

---

### 🛠 Backend Setup

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

> 🛠 Create `backend/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=giftydb;Username=postgres;Password=password"
  },
  "Redis": "localhost:6379"
}
```

---

## 🧪 Testing

### ✅ Backend Tests

```bash
cd backend
dotnet test
```

### ⚠️ Frontend Tests

Coming soon! (e.g. Vitest or Playwright)

---

## 🚀 CI/CD Workflows

CI/CD is fully automated using **GitHub Actions** + **Azure**:

| Branch    | Environment | Workflow Type                  |
| --------- | ----------- | ------------------------------ |
| `master`  | Production  | 🚀 Full production deploys on merge |

Workflows are separated by:

- CI (pull requests) → build & test both frontend + backend
- CD (master) → build, test, deploy to Azure production
- Artifact caching + per-path triggers for faster builds

---

## 📡 API Reference

**Base URL**: `https://gifty-api.azurewebsites.net/api`

| Method | Endpoint                              | Description            | Auth |
| ------ | ------------------------------------- | ---------------------- | ---- |
| GET    | `/users/{id}`                         | Get user profile       | ✅   |
| POST   | `/users`                              | Create user            | ✅   |
| GET    | `/wishlists`                          | List wishlists         | ✅   |
| POST   | `/wishlists`                          | Create wishlist        | ✅   |
| DELETE | `/wishlists/{id}`                     | Delete wishlist        | ✅   |
| GET    | `/wishlist-items/{wishlistId}`        | Get wishlist items     | ✅   |
| POST   | `/wishlist-items`                     | Add item               | ✅   |
| PATCH  | `/wishlist-items/{itemId}`            | Edit item              | ✅   |
| DELETE | `/wishlist-items/{itemId}`            | Delete item            | ✅   |
| PATCH  | `/wishlist-items/{itemId}/reserve`    | Reserve/unreserve item | ✅   |
| POST   | `/shared-links/{wishlistId}/generate` | Generate share link    | ✅   |
| GET    | `/shared-links/{shareCode}`           | View shared wishlist   | ❌   |

---

## 🧠 Rate Limiting & Caching (Currently disabled)

- Redis-backed rate limiting for unauthenticated requests
- Caching for common GETs (e.g. shared links)

---

## 📦 Tech Stack

| Layer    | Tech Stack                             |
| -------- | -------------------------------------- |
| Frontend | Vite, React, TypeScript, Tailwind      |
| Backend  | ASP.NET Core 8 Web API                 |
| Auth     | Firebase Auth (Google + Email)         |
| DB       | PostgreSQL + EF Core                   |
| Caching  | Redis (planned, currently disabled)    |
| CI/CD    | GitHub Actions                         |
| Hosting  | Azure Web Apps + Azure Static Web Apps |

---

## 🤝 Contributing

Open to ideas, issues, and PRs.  
Feel free to fork and submit a pull request — collaboration welcome!

---

## 👤 Maintainer

**Paulo Suljic**  
🔗 [GitHub](https://github.com/PauloSuljic) ・ 🌍 [giftyapp.live](https://giftyapp.live)
