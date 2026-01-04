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
- **Gifty.Tests / Gifty.Tests.Integration / Gifty.Tests.Unit** → Automated test projects.  

### Folder Structure
``` 
backend/
├── Gifty.Api
│   ├── Controllers
│   │   ├── AuthController.cs
│   │   ├── SharedLinkController.cs
│   │   ├── UserController.cs
│   │   ├── WishlistController.cs
│   │   └── WishlistItemController.cs
│   ├── Middlewares
│   │   ├── CorrelationIdMiddleware.cs
│   │   └── ExceptionHandlingMiddleware.cs
│   ├── Utils
│   │   └── TestAuthHandler.cs
│   ├── Program.cs
│   ├── StartupWrapper.cs
│   ├── appsettings.Development.json
│   ├── appsettings.json
│   └── Gifty.Api.csproj
│
├── Gifty.Application
│   ├── Common
│   │   ├── Behaviors
│   │   │   ├── LoggingBehavior.cs
│   │   │   └── ValidationBehavior.cs
│   │   └── Exceptions
│   │       ├── BadrequestException.cs
│   │       ├── ConflictException.cs
│   │       ├── ForbiddenAccessException.cs
│   │       └── NotFoundException.cs
│   ├── Features
│   │   ├── Auth
│   │   │   ├── Dtos
│   │   │   │   └── TokenRequestDto.cs
│   │   │   ├── Queries
│   │   │   │   └── AuthenticateUserQuery.cs
│   │   │   └── Validators
│   │   │       └── AuthenticateUserQueryValidator.cs
│   │   ├── SharedLinks
│   │   │   ├── Commands
│   │   │   │   ├── GenerateShareLinkCommand.cs
│   │   │   │   └── RecordSharedLinkVisitCommand.cs
│   │   │   ├── Dtos
│   │   │   │   ├── ShareLinkResponseDto.cs
│   │   │   │   ├── SharedWishlistResponseDto.cs
│   │   │   │   └── SharedWithMeWishlistOwnerGroupDto.cs
│   │   │   ├── EventHandlers
│   │   │   │   ├── SharedLinkCreatedEventHandler.cs
│   │   │   │   └── SharedLinkVisitedEventHandler.cs
│   │   │   ├── Queries
│   │   │   │   ├── GetSharedWishlistQuery.cs
│   │   │   │   └── GetWishlistsSharedWithMeQuery.cs
│   │   │   └── Validators
│   │   │       ├── GenerateShareLinkCommandValidator.cs
│   │   │       ├── GetSharedWishlistQueryValidator.cs
│   │   │       └── GetWishlistsSharedWithMeQueryValidator.cs
│   │   ├── Users
│   │   │   ├── Commands
│   │   │   │   ├── CreateUserCommand.cs
│   │   │   │   ├── DeleteUserCommand.cs
│   │   │   │   └── UpdateUserCommand.cs
│   │   │   ├── Dtos
│   │   │   │   ├── CreateUserDto.cs
│   │   │   │   ├── UpdateUserDto.cs
│   │   │   │   └── UserDto.cs
│   │   │   ├── EventHandlers
│   │   │   │   ├── UserCreatedEventHandler.cs
│   │   │   │   ├── UserDeletedEventHandler.cs
│   │   │   │   └── UserUpdatedEventHandler.cs
│   │   │   ├── Queries
│   │   │   │   ├── GetAllUsersQuery.cs
│   │   │   │   ├── GetUserByIdQuery.cs
│   │   │   │   └── SearchUsersQuery.cs
│   │   │   └── Validators
│   │   │       ├── CreateUserValidator.cs
│   │   │       ├── DeleteUserCommandValidator.cs
│   │   │       ├── GetUserByIdQueryValidator.cs
│   │   │       ├── SearchUsersQueryValidator.cs
│   │   │       └── UpdateUserCommandValidator.cs
│   │   ├── WishlistItems
│   │   │   ├── Commands
│   │   │   │   ├── CreateWishlistItemCommand.cs
│   │   │   │   ├── DeleteWishlistitemCommand.cs
│   │   │   │   ├── ToggleWishlistItemReservationCommand.cs
│   │   │   │   ├── UpdateWishlistItemCommand.cs
│   │   │   │   └── UpdateWishlistItemPartialCommand.cs
│   │   │   ├── Dtos
│   │   │   │   ├── CreateWishlistItemDto.cs
│   │   │   │   ├── PatchWishlistItemDto.cs
│   │   │   │   ├── UpdateWishlistItemDto.cs
│   │   │   │   └── WishlistItemDto.cs
│   │   │   ├── EventHandlers
│   │   │   │   ├── WishlistItemCreatedEventHandler.cs
│   │   │   │   ├── WishlistItemDeletedEventHandler.cs
│   │   │   │   ├── WishlistItemPartiallyUpdatedEventHandler.cs
│   │   │   │   ├── WishlistItemReservationToggledEventHandler.cs
│   │   │   │   └── WishlistItemUpdatedEventHandler.cs
│   │   │   ├── Queries
│   │   │   │   ├── GetAllWishlistItemsQuery.cs
│   │   │   │   └── GetWishlistItemByIdQuery.cs
│   │   │   └── Validators
│   │   │       ├── CreateWishlistItemCommandValidator.cs
│   │   │       ├── DeleteWishlistItemCommandValidator.cs
│   │   │       ├── GetAllWishlistItemsQueryValidator.cs
│   │   │       ├── GetWishlistItemByIdQueryValidator.cs
│   │   │       ├── ToggleWishlistItemReservationCommandValidator.cs
│   │   │       ├── UpdateWishlistItemCommandValidator.cs
│   │   │       └── UpdateWishlistItemPartialCommandValidator.cs
│   │   └── Wishlists
│   │       ├── Commands
│   │       │   ├── CreateWishlistCommand.cs
│   │       │   ├── DeleteWishlistCommand.cs
│   │       │   ├── RenameWishlistCommand.cs
│   │       │   ├── ReorderWishlistsCommand.cs
│   │       │   └── UpdateWishlistCommand.cs
│   │       ├── Dtos
│   │       │   ├── CreateWishlistDto.cs
│   │       │   ├── RenameWishlistDto.cs
│   │       │   ├── ReorderWishlistDto.cs
│   │       │   ├── UpdateWishlistDto.cs
│   │       │   └── WishlistDto.cs
│   │       ├── EventHandlers
│   │       │   ├── WishlistCreatedEventHandler.cs
│   │       │   ├── WishlistDeletedEventHandler.cs
│   │       │   ├── WishlistRenamedEventHandler.cs
│   │       │   ├── WishlistUpdatedEventHandler.cs
│   │       │   └── WishlistsReorderedEventHandler.cs
│   │       ├── Queries
│   │       │   ├── GetWishlistByIdQuery.cs
│   │       │   └── GetWishlistsByUserIdQuery.cs
│   │       └── Validators
│   │           ├── CreateWishlistCommandValidator.cs
│   │           ├── DeleteWishlistCommandValidator.cs
│   │           ├── GetWishlistByIdQueryValidator.cs
│   │           ├── GetWishlistsByUserIdQueryValidator.cs
│   │           ├── ReorderWishlistsCommandValidator.cs
│   │           └── UpdateWishlistCommandValidator.cs
│   └── Gifty.Application.csproj
│
├── Gifty.Domain
│   ├── Common
│   │   └── Events
│   │       └── IDomainEvent.cs
│   ├── Entities
│   │   ├── BaseEntity.cs
│   │   ├── SharedLink.cs
│   │   ├── SharedLinkVisit.cs
│   │   ├── SharedLinks
│   │   │   ├── SharedLinkCreatedEvent.cs
│   │   │   └── SharedLinkVisitedEvent.cs
│   │   ├── Users
│   │   │   ├── Events
│   │   │   │   ├── UserCreatedEvent.cs
│   │   │   │   ├── UserDeletedEvent.cs
│   │   │   │   └── UserUpdatedEvent.cs
│   │   │   └── User.cs
│   │   ├── Wishlist.cs
│   │   ├── WishlistItem.cs
│   │   ├── WishlistItems
│   │   │   └── Events
│   │   │       ├── WishlistItemCreatedEvent.cs
│   │   │       ├── WishlistItemDeletedEvent.cs
│   │   │       ├── WishlistItemPartiallyUpdatedEvent.cs
│   │   │       ├── WishlistItemReservationToggledEvent.cs
│   │   │       └── WishlistItemUpdatedEvent.cs
│   │   └── Wishlists
│   │       ├── WishlistCreatedEvent.cs
│   │       ├── WishlistDeletedEvent.cs
│   │       ├── WishlistRenamedEvent.cs
│   │       ├── WishlistReorderedEvent.cs
│   │       └── WishlistUpdatedEvent.cs
│   ├── Interfaces
│   │   ├── IFirebaseAuthService.cs
│   │   ├── ISharedLinkRepository.cs
│   │   ├── ISharedLinkVisitRepository.cs
│   │   ├── IUserRepository.cs
│   │   ├── IWishlistItemRepository.cs
│   │   └── IWishlistRepository.cs
│   └── Gifty.Domain.csproj
│
├── Gifty.Infrastructure
│   ├── GiftyDbContext.cs
│   ├── Migrations/
│   ├── Repositories/
│   ├── Services
│   │   └── FirebaseAuthService.cs
│   └── Gifty.Infrastructure.csproj
│
├── Gifty.Tests
│   └── Gifty.Tests.csproj
│
├── Gifty.Tests.Integration
│   ├── Controllers/
│   ├── Integration/
│   └── Gifty.Tests.Integration.csproj
│
├── Gifty.Tests.Unit
│   ├── Features/
│   └── Gifty.Tests.Unit.csproj
│
├── Gifty.sln
└── docker
    └── docker-compose.yml

```

---

## 🎨 Frontend

<frontend-tree>

### Key Folders
- **public/** → Static assets (avatars, screenshots, manifest, logo).  
- **src/components/** → Reusable UI components + layout building blocks.  
- **src/pages/** → Top-level routes (Dashboard, Login, Profile, etc.).  
- **src/firebase/** → Firebase configuration.  
- **src/utils/** → Small helpers (e.g., className utilities).  

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
│   ├── index.html  
│   ├── manifest.json  
│   ├── preview.png  
│   ├── screenshots/  
│   │   ├── dashboard-mobile.png  
│   │   └── dashboard.png  
│   └── vite.svg  
├── src  
│   ├── App.css  
│   ├── App.tsx  
│   ├── api.ts  
│   ├── assets/  
│   │   └── react.svg  
│   ├── components  
│   │   ├── AuthProvider.tsx  
│   │   ├── DashboardHeader.tsx  
│   │   ├── PrivateRoute.tsx  
│   │   ├── Sidebar.tsx  
│   │   ├── Wishlist.tsx  
│   │   ├── WishlistItem.tsx  
│   │   ├── layout/  
│   │   └── ui/  
│   ├── firebase/  
│   │   └── firebaseConfig.ts  
│   ├── index.css  
│   ├── main.tsx  
│   ├── pages  
│   │   ├── Dashboard.tsx  
│   │   ├── Home.tsx  
│   │   ├── Login.tsx  
│   │   ├── NotFound.tsx  
│   │   ├── PrivacyPolicy.tsx  
│   │   ├── Profile.tsx  
│   │   ├── Register.tsx  
│   │   ├── Settings.tsx  
│   │   ├── SharedWishlist.tsx  
│   │   ├── SharedWithMe.tsx  
│   │   ├── TermsOfService.tsx  
│   │   └── VerifyEmail.tsx  
│   ├── utils/  
│   │   └── cn.ts  
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
- For more detail, see [backend README](./backend/README.md) and [frontend README](./frontend/README.md). 
