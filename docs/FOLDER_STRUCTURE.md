# 📂 Project Folder Structure

This document provides an overview of the Gifty monorepo folder structure.  
It is split into **backend** and **frontend** sections for clarity.  
For commands and PR expectations, see `AGENTS.md`; this file stays high-level and may omit build artifacts.

---

## 🛠 Backend

<backend-tree>

### Key Folders
- **Gifty.Api** → Web API entry point (controllers, middleware, startup).  
- **Gifty.Application** → Application layer (CQRS commands/queries, validators, event handlers).  
- **Gifty.Domain** → Core entities, domain events, base abstractions.  
- **Gifty.Infrastructure** → Persistence (EF Core, repositories, services).  
- **Gifty.Tests.Integration / Gifty.Tests.Unit** → Automated test projects.  

### Folder Structure
``` 
backend/
├── Gifty.Api
│   ├── Controllers
│   │   ├── AuthController.cs
│   │   ├── NotificationsController.cs
│   │   ├── SharedLinkController.cs
│   │   ├── UserController.cs
│   │   ├── WishlistController.cs
│   │   └── WishlistItemController.cs
│   ├── Middlewares
│   │   ├── CorrelationIdMiddleware.cs
│   │   └── ExceptionHandlingMiddleware.cs
│   ├── Models
│   │   └── PatchWishlistItemImageDto.cs
│   ├── Properties
│   │   └── launchSettings.json
│   ├── Utils
│   │   └── TestAuthHandler.cs
│   ├── Program.cs
│   ├── appsettings.json
│   └── appsettings.Development.json
├── Gifty.Application
│   ├── Common
│   ├── Features
│   │   ├── Auth
│   │   ├── Notifications
│   │   ├── SharedLinks
│   │   ├── Users
│   │   ├── WishlistItems
│   │   └── Wishlists
│   └── Gifty.Application.csproj
├── Gifty.Domain
│   ├── Common
│   ├── Entities
│   ├── Interfaces
│   └── Gifty.Domain.csproj
├── Gifty.Infrastructure
│   ├── Converters
│   ├── Jobs
│   ├── Persistence
│   ├── Repositories
│   ├── Services
│   └── Gifty.Infrastructure.csproj
├── Gifty.Tests.Integration
├── Gifty.Tests.Unit
├── Gifty.sln
└── docker
    └── docker-compose.yml

```

---

## 🎨 Frontend

<frontend-tree>

### Key Folders
- **public/** → Static assets (avatars, screenshots, manifest, logo).  
- **src/app/** → App shell, routes, and providers.  
- **src/components/** → Reusable UI components + layout building blocks.  
- **src/context/** → App-wide context (auth, notifications).  
- **src/features/** → Feature-scoped modules.  
- **src/pages/** → Top-level routes (Dashboard, Login, Profile, etc.).  
- **src/firebase/** → Firebase configuration.  
- **src/shared/** → Shared utilities and API clients.  

### Folder Structure
```
# 🎨 Frontend Structure

frontend/  
├── README.md  
├── eslint.config.js  
├── firebase.json  
├── index.html  
├── package-lock.json  
├── package.json  
├── public  
│   ├── 404.html  
│   ├── avatars/  
│   │   ├── avatar1.png … avatar9.png  
│   ├── fonts/  
│   │   └── TuallyRegular.otf  
│   ├── gift.png  
│   ├── gifty-logo.png  
│   ├── manifest.json  
│   └── preview.png  
├── src  
│   ├── app  
│   ├── components  
│   ├── context  
│   ├── features  
│   ├── firebase  
│   ├── hooks  
│   ├── layouts  
│   ├── pages  
│   ├── shared  
│   ├── App.css  
│   ├── App.tsx  
│   ├── index.css  
│   ├── main.tsx  
│   └── vite-env.d.ts  
├── staticwebapp.config.json  
├── tsconfig.app.json  
├── tsconfig.json  
├── tsconfig.node.json  
└── vite.config.ts  
```

---

## ℹ️ Notes

- `bin/` and `obj/` (backend) and `node_modules/` (frontend) are excluded for clarity.  
- Trees above only show **source code**, not build artifacts.  
- For more detail, see [backend README](../backend/README.md) and [frontend README](../frontend/README.md). 
