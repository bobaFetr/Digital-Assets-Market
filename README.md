# System Documentation

## Overview
This system is a full-stack crypto exchange–style application called **Digital Assets Market**. It consists of:

- A **React + Vite** single-page application (SPA) for the user interface.
- An **ASP.NET Core 8 Web API** backend that handles all business logic and data access.
- An **EF Core** data layer backed by **SQL Server** (or LocalDB in development).

The frontend handles all user-facing flows (authentication, KYC identity verification, trading, wallet management, news, and education). The backend exposes JWT-secured REST endpoints covering users, orders, trades, wallets, KYC, sessions, audit logs, and content.

---

## How the System Works

### 1. Architecture

```
Browser (React SPA)
        │  HTTP/REST (JSON)
        ▼
ASP.NET Core Web API  ──►  SQL Server (EF Core)
        │
        └── Background Service: SimulatedPriceFeedService
```

- In **development**, the frontend runs on its own Vite dev server (default `http://localhost:5173`) and proxies API calls to the ASP.NET backend (default `http://localhost:5000` or `5001`).
- In **production**, the Vite build output is copied into `BackEnd/MyWebApi/wwwroot/` and served directly by ASP.NET Core's static file middleware. The API then handles both API requests (under `/api/`) and serves the SPA for every other route via a fallback to `index.html`.
- A separate **Docker** deployment can run the frontend through **nginx** and the backend as its own container, both on a shared Docker network, with SQL Server in a third container.

### 2. User Registration and Authentication

1. A visitor submits the registration form (`/signup`). The frontend calls `POST /api/auth/register`.
2. The backend validates the request, hashes the password with **BCrypt**, creates a `User` record, optionally creates a `KycDocument`, and immediately provisions default wallets for the new user (see *Wallet Provisioning* below).
3. The visitor then logs in (`/login`) via `POST /api/auth/login`. The backend:
   - Looks up the user by email.
   - Verifies the BCrypt hash (and upgrades legacy hashes transparently if needed).
   - Rejects banned accounts with HTTP 403.
   - Issues a **JWT** (HS256, 1-hour expiry) containing the user's ID, email, and role claims.
   - Records a `SessionTable` entry with IP address and user-agent metadata.
   - Returns `{ token }` to the client.
4. The frontend stores the JWT (in `localStorage` or a session cookie depending on the *remember me* flag) and attaches it as `Authorization: Bearer <token>` to every subsequent API call.
5. After login, if the user's role is `"Admin"` they are redirected to `/Admin`; otherwise to `/profile`.

**Key files:** [`BackEnd/MyWebApi/Controllers/AuthController.cs`](BackEnd/MyWebApi/Controllers/AuthController.cs), [`FrontEnd/src/Login.jsx`](FrontEnd/src/Login.jsx), [`FrontEnd/src/Services/Service.js`](FrontEnd/src/Services/Service.js)

### 3. KYC (Know Your Customer) Gate

All authenticated non-admin users must pass identity verification before accessing trading features.

1. After login the SPA's `KycGate` component (in [`FrontEnd/src/App.jsx`](FrontEnd/src/App.jsx)) calls `GET /api/kycdocuments/status`.
2. If the user has no verified KYC document they are redirected to `/verify-identity`.
3. The KYC form collects document type, document number, full name, date of birth (must be 18+), country of residence, and expiry date, then calls `POST /api/kycdocuments`.
4. Once the document is stored with status `"Verified"`, the gate lifts and the user can access all platform features.

**Key files:** [`BackEnd/MyWebApi/Controllers/KycDocumentsController.cs`](BackEnd/MyWebApi/Controllers/KycDocumentsController.cs), [`FrontEnd/src/VerifyIdentityPage.jsx`](FrontEnd/src/VerifyIdentityPage.jsx)

### 4. Wallet Provisioning

Every user automatically receives a wallet for each supported currency.

- Supported currencies: **USD, EUR, BTC, ETH, BNB, ALGO, USDT**.
- `WalletProvisioningService.EnsureDefaultWalletsForUser(userId)` is called on both **registration** and **login** to create any missing wallets idempotently.
- Admins can trigger a bulk backfill for all users via `POST /api/auth/wallets/backfill`.

**Key file:** [`BackEnd/MyWebApi/Services/WalletProvisioningService.cs`](BackEnd/MyWebApi/Services/WalletProvisioningService.cs)

### 5. Simulated Price Feed

Because this is a demo platform without a live exchange connection, a background service continuously simulates market activity.

- `SimulatedPriceFeedService` runs as a **hosted background service** (`BackgroundService`) and fires every **10 seconds**.
- For each of the four symbols (`BTCUSD`, `ETHUSD`, `BNBUSD`, `ALGOUSD`) it:
  1. Reads the most recent order-book price for that symbol.
  2. Applies a random walk delta of ±0.2% to compute a new price.
  3. Inserts a new synthetic `OrdersTable` + `OrderBook` entry (a small random amount between 0.001 and 0.021 units).
  4. Prunes entries beyond the most recent 200 per symbol to prevent unbounded growth.
- Seed prices used when the order book is empty: BTC ≈ $66,000, ETH ≈ $3,500, BNB ≈ $420, ALGO ≈ $0.20.
- This data drives the price charts and the "latest trade price" shown on the Buy/Sell page.

**Key file:** [`BackEnd/MyWebApi/Services/SimulatedPriceFeedService.cs`](BackEnd/MyWebApi/Services/SimulatedPriceFeedService.cs)

### 6. Trading: Order Placement and Matching

The core trading flow lives in `OrdersController` and works as follows:

1. The user selects a trading pair (e.g. BTC/USD), an order type (**Market** or **Limit**), a side (**Buy** or **Sell**), and an amount on the Buy/Sell page.
2. The frontend calls `POST /api/orders` with `{ typeOfOrder, symbol, price (limit only), amount }`.
3. The backend validates the symbol against the allowed list and checks that limit orders include a price.
4. It queries the opposite side of the order book (e.g., for a Buy it looks at Sell entries), filtered by price for limit orders (buy price ≥ ask, sell price ≤ bid), and sorted by best price then oldest timestamp.
5. **Market orders** require enough total liquidity in the book; they fail immediately if there isn't enough.
6. **Matching loop:** For each matched order-book entry, a `TradesTable` record is created at the matched price. Amounts are decremented on both sides. Fully filled order-book entries are removed and their parent orders are marked `Filled`.
7. If the incoming order is only partially filled (or unmatched):
   - A **limit** order gets an order-book entry for the remaining amount and stays `Open`.
   - A **market** order with no match returns a 400 error.
8. The trade price is also used by the frontend to show the current exchange rate.

**Supported trading pairs:** BTCUSD, ETHUSD, BNBUSD, ALGOUSD, BTCEUR, ETHEUR, BNBEUR, ALGOEUR.

**Key files:** [`BackEnd/MyWebApi/Controllers/OrdersController.cs`](BackEnd/MyWebApi/Controllers/OrdersController.cs), [`FrontEnd/src/BuyAndSell.jsx`](FrontEnd/src/BuyAndSell.jsx)

### 7. Roles and Permissions

There are two roles:

| Role | Capabilities |
|------|-------------|
| `User` | Register, login, KYC, view own wallets/orders/trades/transactions, place orders, view news and education content. |
| `Admin` | Everything a user can do, plus: list and ban/unban users, manage order book entries, update/delete any trade or transaction, manage news and FAQ content, access the Admin dashboard. |

JWT claims carry the role. The `ApiControllerBase` base class exposes `IsAdmin()` and `TryGetUserId()` helpers used by every controller to enforce access control.

**Key file:** [`BackEnd/MyWebApi/Controllers/ApiControllerBase.cs`](BackEnd/MyWebApi/Controllers/ApiControllerBase.cs)

### 8. Frontend Pages and Routing

| Route | Page | Notes |
|-------|------|-------|
| `/` | Home (SecondPage / ThirdPage) | Landing and marketing pages |
| `/login` | Login | JWT login |
| `/signup` | Sign Up | Registration |
| `/profile` | Profile | User account info and activity |
| `/buy-and-sell` | Buy & Sell | Order placement and live price |
| `/wallet` | Wallet | Balance overview per currency |
| `/withdraw` | Withdraw | Withdrawal form |
| `/news` | News | News feed |
| `/education/*` | Education hub | Beginners tutorial, blockchain guide, wallet security |
| `/faq` | FAQ | Frequently asked questions |
| `/verify-identity` | KYC | Identity verification form |
| `/Admin/*` | Admin panel | Dashboard, users, assets, transactions, news, FAQs, announcements, security, settings |
| `*` | 404 page | Catch-all error page |

The admin panel is a nested `<Routes>` block inside the `Admin` layout component and is only reachable by users whose JWT carries the `Admin` role.

### 9. Data Model

Key entities managed by EF Core:

| Entity | Purpose |
|--------|---------|
| `User` | Account with email, BCrypt password, role (`User`/`Admin`), ban flag |
| `WalletTable` | Per-user, per-currency balance |
| `OrdersTable` | Buy/sell orders with type, symbol, price, amount, status |
| `OrderBook` | Live price/amount snapshot for unmatched orders |
| `TradesTable` | Completed matches between a buy and a sell order |
| `KycDocument` | Identity verification document and status per user |
| `SessionTable` | Active JWT sessions with IP and device metadata |
| `AuditLog` | User action history |
| `ExchangeTransaction` | Deposits and withdrawals |
| `BlockchainEvent` | On-chain event linked to a transaction |
| `FeeTable` | Maker/taker fee rates per symbol |
| `Referral` | Referrer/referred relationship with bonus amounts |
| `FAQ` | Question/answer content |
| `NewsTable` | Published news articles |

Seed data for all entities is applied via EF Core configurations so the database starts with initial data for local development.

---

## Quick Start

### Option A – Docker (no local .NET or npm required)

```bash
# 1. Build the application image
docker build -f BackEnd/Dockerfile -t dam-app .

# 2. Create a shared Docker network
docker network create dam-net

# 3. Start SQL Server
docker run -d --name dam-sql --network dam-net \
  -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong!Pass123" \
  -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest

# 4. Start the application
docker run -d --name dam-app --network dam-net -p 8080:8080 \
  -e "ConnectionStrings__DefaultConnection=Server=dam-sql,1433;Database=Digital_Assets2026;User Id=sa;Password=YourStrong!Pass123;TrustServerCertificate=True;Encrypt=False" \
  -e "Jwt__Key=THIS_IS_A_LONG_RANDOM_SECRET_KEY_32+_CHARS" \
  -e "Jwt__Issuer=MyWebApi" \
  -e "Jwt__Audience=MyWebApiUsers" \
  dam-app

# 5. Open in browser
#   App:     http://localhost:8080
#   Swagger: http://localhost:8080/swagger
```

### Option B – Local development (native)

**Prerequisites:** .NET 8 SDK, Node.js 20+, SQL Server or LocalDB.

```bash
# Terminal 1 – Backend
cd BackEnd
dotnet run --project MyWebApi/MyWebApi.csproj
# API available at https://localhost:5001  (Swagger at /swagger)

# Terminal 2 – Frontend
cd FrontEnd
npm install
npm run dev
# SPA available at http://localhost:5173
```

Set `VITE_API_BASE=https://localhost:5001` in a `FrontEnd/.env.local` file so the SPA calls the correct backend URL.

---

## API Surface (By Controller)

| Controller | Route prefix | Description |
|------------|-------------|-------------|
| `AuthController` | `/api/auth` | Register, login, profile, ban/unban users |
| `UsersController` | `/api/users` | Current user details, admin user management |
| `OrdersController` | `/api/orders` | Create and read orders; order matching |
| `OrderBookController` | `/api/orderbook` | Read order-book entries; admin write access |
| `TradesController` | `/api/trades` | Trade history; admin update/delete |
| `TransactionsController` | `/api/transactions` | Deposit/withdrawal records |
| `WalletsController` | `/api/wallets` | Wallet balances; user-scoped or admin access |
| `KycDocumentsController` | `/api/kycdocuments` | KYC submission, status check, age validation |
| `SessionsController` | `/api/sessions` | Active session listing and management |
| `AuditLogsController` | `/api/auditlogs` | User action audit trail |
| `BlockchainEventsController` | `/api/blockchainevents` | On-chain event records |
| `FeeTablesController` | `/api/feetables` | Trading fee configuration |
| `ReferralsController` | `/api/referrals` | Referral program records |
| `NewsController` | `/api/news` | News articles; admin create |
| `FaqController` | `/api/faq` | FAQ content |

---

## Configuration Reference

| Setting | Where | Description |
|---------|-------|-------------|
| `ConnectionStrings:DefaultConnection` | `appsettings.json` / env var | SQL Server connection string |
| `Jwt:Key` | `appsettings.json` / env var | HMAC-SHA256 signing key (≥32 chars) |
| `Jwt:Issuer` | `appsettings.json` | JWT issuer claim |
| `Jwt:Audience` | `appsettings.json` | JWT audience claim |
| `Frontend:BaseUrl` | `appsettings.json` | Allowed CORS origin for local Vite dev server |
| `VITE_API_BASE` | `.env` / build arg | Backend URL used by the React app |
| `Email:SmtpHost` / `SmtpUser` / etc. | `appsettings.json` | SMTP settings for password-reset emails (optional) |

---

## Folders at a Glance

```
/
├── FrontEnd/              React + Vite SPA
│   └── src/
│       ├── App.jsx        Root component, routing, KYC gate
│       ├── ADMIN/         Admin panel pages and layout
│       ├── Components/    Shared UI components (Sidebar, etc.)
│       └── Services/      API client helpers
├── BackEnd/
│   ├── MyWebApi/          ASP.NET Core Web API
│   │   ├── Controllers/   REST controllers
│   │   ├── Services/      SimulatedPriceFeedService, WalletProvisioningService
│   │   ├── Dtos/          Response DTOs
│   │   └── Program.cs     App bootstrap and middleware pipeline
│   └── NetServer.DAta1/   EF Core data project
│       ├── models/        Entity classes
│       ├── configurations/ EF Core entity configs
│       └── Seeding/       Seed data classes
└── MyApp.Tests/           NUnit unit tests for controller base helpers
```

---

## Notes

- Swagger UI is enabled in development mode at `/swagger` for interactive API exploration.
- The simulated price feed means you will see price charts populate automatically without needing to place orders yourself.
- KYC verification in this demo auto-approves submissions (status is set to `"Verified"` immediately).
- SQL Server is the expected database provider. The `AppDbContextFactory` targets LocalDB for EF Core migrations during development.
