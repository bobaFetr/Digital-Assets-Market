# System Documentation (High-Level Overview)

## Overview
This system is a full-stack crypto exchange style application with a React SPA frontend, an ASP.NET Core Web API backend, and an EF Core data layer backed by PostgreSQL. The frontend handles user flows (auth, KYC, trading UI, news/education), while the backend provides secured APIs for users, orders, trades, wallets, KYC, and content.

## Key Components
### Frontend (React + Vite)
- Entry point and routing: [src/main.jsx](src/main.jsx), [src/App.jsx](src/App.jsx).
- Client auth helper and API base config: [src/Services/auth.js](src/Services/auth.js).
- Main pages: Home, Profile, Buy/Sell, Wallet, News, Education, Admin, KYC verification, and charts.
- KYC gate logic: the SPA checks KYC status after login and redirects to the KYC flow when needed (see [src/App.jsx](src/App.jsx)).

### Backend (ASP.NET Core Web API)
- Bootstrap and middleware: [MyWebApi/Program.cs](MyWebApi/Program.cs).
- JWT auth, CORS, Swagger, and SPA static file hosting are configured in the API host.
- Controllers expose REST endpoints for core domains. See [MyWebApi/Controllers](MyWebApi/Controllers).

### Data Layer (EF Core + PostgreSQL)
- DbContext and model mappings: [NetServer.DAta1/AppDbContext.cs](NetServer.DAta1/AppDbContext.cs).
- Key entities include Users, Wallets, Orders, Trades, OrderBook, KYC Documents, Sessions, Audit Logs, Blockchain Events, Transactions, Fee Tables, Referrals, FAQ, and News.

## Architecture
- Client: React SPA served in dev by Vite and in production by ASP.NET Core static file hosting.
- API: ASP.NET Core 8 Web API using JWT bearer authentication and role-based authorization.
- Data: EF Core DbContext backed by PostgreSQL through Npgsql using a shared data project.

## High-Level Data Flows
### Authentication
- Register and login flow runs through the API endpoints in the auth controller.
- Login returns a JWT; the frontend stores it in a cookie and attaches it as a Bearer token to secured calls (see [src/Services/auth.js](src/Services/auth.js)).

### KYC Verification
- After login, the SPA calls the KYC status endpoint.
- If the user is not verified, they are routed to the identity verification flow.

### Trading
- Users create orders in the API which are validated against a list of supported symbols.
- Orders are added to the order book or immediately matched depending on order type and liquidity.
- Trades are created on match, and the order book is updated accordingly.

### Content
- News and FAQ endpoints are exposed by the API.
- The frontend routes users to news and education pages for viewing content.

## API Surface (By Controller)
Core controllers in [MyWebApi/Controllers](MyWebApi/Controllers):
- Auth: registration, login, profile, admin user management.
- Users: current user details and admin user management.
- Orders, OrderBook, Trades, Transactions: trading lifecycle.
- Wallets: balances and wallet operations.
- KycDocuments, Sessions, AuditLogs: compliance and audit tracking.
- News, Faq, FeeTables, Referrals, BlockchainEvents: platform content and configuration.

## Configuration
- Frontend API base: `VITE_API_BASE` (set to your backend URL during frontend build; when unset the app will call relative `/api/*`).
- PostgreSQL is required in development and production. Configure `ConnectionStrings__DefaultConnection` or `DATABASE_URL`; the API fails fast when neither is present.
- Example local PowerShell configuration: `$env:ConnectionStrings__DefaultConnection = "Host=localhost;Port=5432;Database=digital_assets_market;Username=postgres;Password=your_password"`.
- The API applies the PostgreSQL EF Core migrations automatically during startup.
- CORS allows local dev origins for Vite (see [MyWebApi/Program.cs](MyWebApi/Program.cs)).

## Folders at a Glance
- Frontend SPA: [src](src).
- Backend API: [MyWebApi](MyWebApi).
- Shared data layer: [NetServer.DAta1](NetServer.DAta1).
- Solution file: [MyWebApiSolution.sln](MyWebApiSolution.sln).

## Notes and Assumptions
- Swagger is enabled in development for quick API discovery.
- PostgreSQL is the only runtime database provider. Automated unit tests use EF Core InMemory databases for isolation.
