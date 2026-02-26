# Digital Assets Market (DAM)

A full-stack crypto exchange–style web application. Users can register, complete KYC verification, trade digital assets, manage wallets, and browse crypto news and educational content. The platform is backed by a JWT-secured REST API and an EF Core / SQL Server data layer.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Getting Started – Local Development](#getting-started--local-development)
5. [Getting Started – Docker](#getting-started--docker)
6. [Environment Variables](#environment-variables)
7. [Architecture Overview](#architecture-overview)
8. [Key Data Flows](#key-data-flows)
9. [API Overview](#api-overview)
10. [Running Tests](#running-tests)
11. [Detailed File Documentation](#detailed-file-documentation)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router v7, Chart.js, Framer Motion |
| Backend | ASP.NET Core 8 Web API, JWT Bearer auth |
| ORM / DB | Entity Framework Core 8, SQL Server |
| Testing | NUnit, coverlet |
| Containerisation | Docker (multi-stage build) |

---

## Project Structure

```
Digital-Assets-Market/
├── src/                        # React SPA source
│   ├── App.jsx                 # Root router and KYC gate
│   ├── main.jsx                # SPA entry point
│   ├── Services/
│   │   └── auth.js             # API client helpers & JWT storage
│   └── Components/             # Shared UI components (Sidebar, Footer, …)
├── MyWebApi/                   # ASP.NET Core 8 Web API
│   ├── Controllers/            # REST endpoint controllers
│   ├── Dtos/                   # API response DTOs
│   ├── Services/               # Background and helper services
│   ├── Program.cs              # App bootstrap & middleware
│   └── appsettings.json        # Default configuration
├── NetServer.DAta1/            # Shared EF Core data layer
│   ├── AppDbContext.cs         # DbContext & entity mappings
│   ├── models/                 # Entity classes
│   ├── configurations/         # IEntityTypeConfiguration classes
│   ├── Seeding/                # Seed data classes & constants
│   └── Migrations/             # EF Core migration history
├── MyApp.Tests/                # NUnit test project
├── DockerFile                  # Multi-stage Docker build
├── docker-commands.txt         # Handy Docker CLI reference
├── FILE_DOCUMENTATION.md       # Detailed file-by-file reference
└── MyWebApiSolution.sln        # .NET solution file
```

---

## Prerequisites

### Local Development
| Tool | Minimum Version |
|---|---|
| [Node.js](https://nodejs.org/) | 20 |
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.0 |
| SQL Server | 2019+ (or LocalDB for dev) |

### Docker (no local .NET / Node required)
| Tool | Notes |
|---|---|
| [Docker](https://docs.docker.com/get-docker/) | Engine 20+ |

---

## Getting Started – Local Development

### 1. Clone the repository

```bash
git clone https://github.com/bobaFetr/Digital-Assets-Market.git
cd Digital-Assets-Market
```

### 2. Configure the backend

Copy or edit `MyWebApi/appsettings.json` (or use user-secrets / environment variables) to set:

- `ConnectionStrings:DefaultConnection` – SQL Server connection string.
- `Jwt:Key` – a random secret of **at least 32 characters**.
- `Jwt:Issuer` and `Jwt:Audience` – can keep the defaults (`MyWebApi` / `MyWebApiUsers`).

For local SQL Server Express / LocalDB the default connection string already works:

```
Server=(localdb)\MSSQLLocalDB;Database=Digital_Assets2026;Trusted_Connection=True;TrustServerCertificate=True
```

### 3. Apply database migrations

```bash
cd NetServer.DAta1
dotnet ef database update --startup-project ../MyWebApi
cd ..
```

### 4. Install frontend dependencies

```bash
npm install
```

### 5. Run both servers together

```bash
npm run dev:full
```

This uses `concurrently` to start:
- **Vite dev server** on `http://localhost:5173`
- **.NET API** on `http://localhost:5149`

Or start them individually:

```bash
# Terminal 1 – API
npm run dev:api        # equivalent to: dotnet run --project MyWebApi

# Terminal 2 – Frontend
npm run dev
```

Open **http://localhost:5173** in your browser. The Swagger UI for the API is available at **http://localhost:5149/swagger** in development.

---

## Getting Started – Docker

No local .NET or Node installation needed. See [`docker-commands.txt`](docker-commands.txt) for the full reference. Quick start:

```bash
# 1. Build the application image
docker build -f DockerFile -t dam-app .

# 2. Create a Docker network
docker network create dam-net

# 3. Start SQL Server
docker run -d --name dam-sql --network dam-net \
  -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=YourStrong!Pass123" \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest

# 4. Start the application
docker run -d --name dam-app --network dam-net -p 8080:8080 \
  -e "ConnectionStrings__DefaultConnection=Server=dam-sql,1433;Database=Digital_Assets2026;User Id=sa;Password=YourStrong!Pass123;TrustServerCertificate=True;Encrypt=False" \
  -e "Jwt__Key=THIS_IS_A_LONG_RANDOM_SECRET_KEY_32+_CHARS" \
  -e "Jwt__Issuer=MyWebApi" \
  -e "Jwt__Audience=MyWebApiUsers" \
  -e "Frontend__BaseUrl=http://localhost:8080" \
  dam-app
```

- **App:** http://localhost:8080
- **Swagger:** http://localhost:8080/swagger

---

## Environment Variables

### Frontend (`.env` or Vite inline)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE` | `http://localhost:5149` | Base URL of the backend API |

### Backend (`appsettings.json` / environment)

| Variable | Required | Description |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | ✅ | SQL Server connection string |
| `Jwt__Key` | ✅ | HMAC-SHA256 signing secret (≥ 32 chars) |
| `Jwt__Issuer` | ✅ | JWT issuer claim |
| `Jwt__Audience` | ✅ | JWT audience claim |
| `Frontend__BaseUrl` | | CORS / SPA base URL |
| `Email__SmtpHost` | | SMTP host for transactional email |
| `Email__SmtpPort` | `587` | SMTP port |
| `Email__SmtpUser` | | SMTP username |
| `Email__SmtpPassword` | | SMTP password |
| `Email__From` | | Sender address |

---

## Architecture Overview

```
Browser
  └── React SPA (Vite dev / ASP.NET static files in prod)
        └── HTTP/JSON  ──►  ASP.NET Core 8 Web API
                                  │  JWT Bearer auth
                                  │  CORS (dev origins)
                                  └── EF Core ──► SQL Server
```

- **Development:** Vite dev server proxies nothing – the SPA talks directly to the API on its own port.
- **Production / Docker:** The .NET host serves the compiled Vite output from `wwwroot` and falls back all unknown paths to `index.html` for client-side routing.

---

## Key Data Flows

### Authentication
1. User registers via `POST /api/auth/register`.
2. User logs in via `POST /api/auth/login`; the API returns a signed JWT.
3. The frontend stores the token in `sessionStorage` and attaches it as a `Bearer` header on every secured request (see [`src/Services/auth.js`](src/Services/auth.js)).

### KYC Verification
1. After any navigation event, the `KycGate` component in [`src/App.jsx`](src/App.jsx) calls `GET /api/kyc-documents/status`.
2. If the returned status is not `verified`, the user is redirected to `/VerifyIdentityPage`.
3. The KYC form submits identity data to `POST /api/kyc-documents`. Users must be at least 18 years old.

### Trading
1. A user places an order via `POST /api/orders` with a validated symbol, side, type, and quantity.
2. The order is added to the order book. For market and matching limit orders the engine immediately creates a trade and updates balances.
3. Completed trades are recorded in the `Trades` table and the order book entry is removed or reduced.

### Content
- `GET /api/news` and `GET /api/faq` are public endpoints consumed by the News and Education pages.

---

## API Overview

All REST endpoints are hosted under `/api/`. Swagger is available at `/swagger` in development.

| Controller | Endpoint prefix | Notes |
|---|---|---|
| Auth | `/api/auth` | Register, login, profile, forgot/reset password, change password, delete account |
| Users | `/api/users` | Current user profile; admin CRUD & ban/unban |
| Orders | `/api/orders` | Place, list, cancel orders; matching engine |
| OrderBook | `/api/order-book` | Read order book; admin create/update/delete |
| Trades | `/api/trades` | List trades with filters; admin manage |
| Transactions | `/api/transactions` | Deposit / withdrawal records |
| Wallets | `/api/wallets` | Balances, deposit from card |
| KycDocuments | `/api/kyc-documents` | Submit & check KYC status |
| Sessions | `/api/sessions` | Active session tracking |
| AuditLogs | `/api/audit-logs` | User action audit trail |
| BlockchainEvents | `/api/blockchain-events` | On-chain event records |
| News | `/api/news` | Public read; admin create |
| Faq | `/api/faq` | FAQ items |
| FeeTables | `/api/fee-tables` | Maker/taker fee configuration |
| Referrals | `/api/referrals` | Referral program records |

---

## Running Tests

```bash
dotnet test MyApp.Tests
```

The test project (`MyApp.Tests`) uses NUnit and covers the `ApiControllerBase` helper methods (`TryGetUserId`, `IsAdmin`).

---

## Detailed File Documentation

For a complete file-by-file reference covering every controller, model, configuration, seeding class, and migration, see [FILE_DOCUMENTATION.md](FILE_DOCUMENTATION.md).
