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
├── backend/    # ASP.NET Core Web API + PostgreSQL (Redis planned)
├── .github/    # CI/CD workflows (PR CI; deploys on master)
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
- Redis (planned; not implemented yet)
- Clear separation of layers (auth, validation, data)

---

## 🧪 Local Development

### 🔧 Prerequisites

- Node.js 20+
- .NET SDK 8.x
- PostgreSQL
- Redis (planned; not used in code yet)

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

> 🛠 Update `backend/Gifty.Api/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=giftydb;Username=postgres;Password=password"
  },
  "Firebase": {
    "CredentialsJson": "<firebase-service-account-json>"
  },
  "AzureStorage": {
    "ConnectionString": "<azure-storage-connection-string>",
    "ContainerName": "<container-name>"
  }
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

| Branch    | Environment | Workflow Type                       |
| --------- | ----------- | ----------------------------------- |
| `master`  | Production  | 🚀 Deploy backend + frontend        |

Workflows are separated by:

- CI (pull requests) → backend tests; frontend lint, typecheck, build
- CD (master) → build, test, deploy to Azure production
- Artifact caching + per-path triggers for faster builds

Development environment may be added later; currently Production only.

---

## 📡 API Reference

**Base URL**: `https://gifty-api.azurewebsites.net`

| Method | Endpoint                                              | Description                       | Auth |
| ------ | ----------------------------------------------------- | --------------------------------- | ---- |
| POST   | `/api/auth/login`                                     | Login with Firebase ID token      | ❌   |
| GET    | `/api/users/{firebaseUid}`                            | Get user profile                  | ✅   |
| POST   | `/api/users`                                          | Create user                       | ✅   |
| PUT    | `/api/users/{firebaseUid}`                            | Update user                       | ✅   |
| DELETE | `/api/users/{firebaseUid}`                            | Delete user                       | ✅   |
| GET    | `/api/wishlists`                                      | List wishlists                    | ✅   |
| GET    | `/api/wishlists/{id}`                                 | Get wishlist                      | ❌   |
| POST   | `/api/wishlists`                                      | Create wishlist                   | ✅   |
| PUT    | `/api/wishlists/{id}`                                 | Update wishlist                   | ✅   |
| PATCH  | `/api/wishlists/{id}`                                 | Rename wishlist                   | ✅   |
| PUT    | `/api/wishlists/reorder`                              | Reorder wishlists                 | ✅   |
| DELETE | `/api/wishlists/{id}`                                 | Delete wishlist                   | ✅   |
| GET    | `/api/wishlists/{wishlistId}/items`                   | Get wishlist items                | ❌   |
| POST   | `/api/wishlists/{wishlistId}/items`                   | Add item                          | ✅   |
| GET    | `/api/wishlists/{wishlistId}/items/{itemId}`          | Get item                          | ✅   |
| PUT    | `/api/wishlists/{wishlistId}/items/{itemId}`          | Update item                       | ✅   |
| DELETE | `/api/wishlists/{wishlistId}/items/{itemId}`          | Delete item                       | ✅   |
| PUT    | `/api/wishlists/{wishlistId}/items/reorder`           | Reorder items                     | ✅   |
| PATCH  | `/api/wishlists/{wishlistId}/items/{itemId}/reserve`  | Reserve/unreserve item            | ✅   |
| PATCH  | `/api/wishlists/{wishlistId}/items/{itemId}/image`    | Update item image (multipart)     | ✅   |
| POST   | `/api/shared-links/{wishlistId}/generate`             | Generate share link               | ✅   |
| GET    | `/api/shared-links/{shareCode}`                       | View shared wishlist              | ❌   |
| GET    | `/api/shared-links/shared-with-me`                    | List shared-with-me wishlists     | ✅   |
| DELETE | `/api/shared-links/shared-with-me/{ownerId}`          | Remove shared-with-me wishlists   | ✅   |
| GET    | `/api/notifications`                                  | List notifications                | ✅   |
| GET    | `/api/notifications/unread-count`                     | Unread count                      | ✅   |
| POST   | `/api/notifications`                                  | Create notification               | ✅   |
| POST   | `/api/notifications/mark-read`                        | Mark notifications as read        | ✅   |

---

## 🧠 Rate Limiting & Caching (Planned)

Planned (not implemented yet):
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
