# 🛠️ Gifty Backend

This is the **ASP.NET Core 8 Web API** powering Gifty.  
It provides secure endpoints for authentication, wishlist management, shared links, and reservations.

---

## ✨ Features

- **Authentication** via Firebase (Google + Email/Password).
- **Wishlist management** (CRUD + reservations).
- **Shared links** (guest access to wishlists).
- **Refactored architecture (2025):**
  - CQRS with MediatR (commands + queries).
  - FluentValidation pipeline for automatic request validation.
  - Centralized exception middleware with clean JSON errors.
  - Domain events + handlers (extensible for notifications, analytics, integrations).
  - Structured logging with Serilog + correlation IDs.
- **Database**: PostgreSQL with EF Core migrations.
- **Tests**: Full suite of unit + integration tests.

---

## 🧪 Local Development

### 🔧 Prerequisites
- .NET 8 SDK
- PostgreSQL  
- (Optional) Redis (planned for rate limiting / caching, currently disabled for MVP)

---

### ⚙️ Setup

1. Restore dependencies
   ```bash
   dotnet restore
   ```
2. Apply migrations
   ```bash
   dotnet ef database update
   ```
3. Run the API
   ```bash
   dotnet run
   ```

API will be available at:  
👉 http://localhost:5140 (HTTP)  
👉 https://localhost:7252 (HTTPS)

Swagger docs:  
👉 https://localhost:5140/swagger

---

### 📂 Config
Create `backend/Gifty.Api/appsettings.Development.json` (or set env vars):

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

Secrets are managed via:  
- dotnet user-secrets (local dev, Firebase keys).  
- Azure App Service settings (production).  
- GitHub Actions secrets (CI/CD).

---

## 🧪 Testing

Run all tests:

```bash
dotnet test
```

Types of tests:  
- Unit tests → business logic validation.  
- Integration tests → real DB interactions & API endpoints (with test auth).

---

## 🚀 Deployment

- Production: auto-deployed from `master` via GitHub Actions.
- Staging: auto-deployed from `staging` via GitHub Actions.

Workflow stages:  
1. Build → restore, compile.  
2. Test → run unit + integration tests.  
3. Publish → package for deployment.  
4. Deploy → push to Azure Web App.

---

## 📡 API Overview

Base URL (production):  
👉 https://gifty-api.azurewebsites.net/api

Endpoints include:  
- /users  
- /wishlists  
- /wishlist-items  
- /shared-links

See root README for full reference.

---

## 🧱 Tech Stack

- ASP.NET Core 8  
- MediatR (CQRS)  
- FluentValidation (input validation)  
- Serilog (structured logging + correlation IDs)  
- Entity Framework Core (Postgres provider)  
- xUnit (unit + integration tests)  
- Azure App Service (hosting)  
- GitHub Actions (CI/CD)

---
