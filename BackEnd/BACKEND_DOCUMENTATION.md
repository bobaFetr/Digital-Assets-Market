# Backend Documentation

## Scope

This document describes the current backend implementation in `BackEnd/` as it exists in the repository today.

It covers:

- the API host in `BackEnd/MyWebApi`
- the EF Core data project in `BackEnd/NetServer.DAta1`
- runtime configuration, security, middleware, and deployment behavior
- every controller and route exposed by the API
- entity relationships, seed data, migrations, and test coverage

It does not try to describe frontend behavior except where the backend contract depends on it.

## Backend at a Glance

The backend is an ASP.NET Core 8 Web API with:

- JWT bearer authentication
- role-based authorization (`User` and `Admin`)
- EF Core 8 with the Npgsql PostgreSQL provider
- a split-project structure:
  - `MyWebApi` for the API host, controllers, DTOs, and services
  - `NetServer.DAta1` for entities, `AppDbContext`, configurations, seed data, and migrations
- static file hosting for the built frontend under `wwwroot`
- a maintenance-mode middleware that can block API traffic

Primary backend domains:

- authentication and account lifecycle
- user profile management
- wallets, card deposits, and bank accounts
- KYC and identity documents
- orders, order book, trades, and transactions
- sessions, audit logs, blockchain events
- news and FAQ/community content
- admin-only management actions

## Project Structure

### `BackEnd/MyWebApi`

Main responsibilities:

- bootstraps the ASP.NET Core application
- configures authentication, authorization, CORS, Swagger, EF Core, and static file hosting
- exposes REST endpoints through controllers
- contains request/response DTOs and supporting services

Important files:

- `Program.cs`: application startup and middleware pipeline
- `Controllers/`: REST API surface
- `Services/RequestSecurity.cs`: input sanitization helpers
- `Services/WalletProvisioningService.cs`: default wallet creation logic
- `Services/SmtpEmailSender.cs`: SMTP email implementation for password reset mail
- `appsettings.json` and `appsettings.Development.json`: configuration sources
- `Properties/launchSettings.json`: local development launch profiles
- `wwwroot/`: static assets and fallback SPA entry point

### `BackEnd/NetServer.DAta1`

Main responsibilities:

- defines the database model
- configures entity relationships and seed data
- contains EF Core migrations and a design-time context factory

Important files:

- `AppDbContext.cs`: DbSets and relationships
- `AppDbContextFactory.cs`: design-time factory used by EF tooling
- `models/`: entity types
- `configurations/`: `IEntityTypeConfiguration<T>` implementations
- `Seeding/`: seed data generators
- `Migrations/`: PostgreSQL schema evolution

## Technology Stack

- .NET 8
- ASP.NET Core Web API
- Entity Framework Core 8
- PostgreSQL via `Npgsql.EntityFrameworkCore.PostgreSQL`
- JWT bearer authentication
- BCrypt password hashing via `BCrypt.Net-Next`
- Swagger / Swashbuckle for development-time API discovery

## Runtime Bootstrapping

The full startup flow lives in `BackEnd/MyWebApi/Program.cs`.

### Authentication setup

The application configures JWT bearer auth and validates:

- issuer
- audience
- token lifetime
- signing key

After a token is validated, the API performs an extra database lookup to ensure:

- the user still exists
- the user is not banned

If validation fails because the user is banned, the JWT challenge is transformed into a JSON `403` response with:

```json
{ "message": "User is banned" }
```

### Controller and API behavior

Startup enables:

- MVC controllers
- manual model-state handling by disabling the default automatic invalid-model filter
- Swagger/OpenAPI in development only

### CORS

The policy name is `FrontendCors`.

Allowed origins are loaded from:

1. `Frontend:CORS_ALLOWED_ORIGINS`
2. `CORS_ALLOWED_ORIGINS`
3. a built-in fallback list

The fallback list includes local Vite dev hosts and one deployed frontend origin.

The policy allows:

- any header
- any HTTP method

### Database configuration

The database connection string is resolved in this order:

1. `ConnectionStrings:DefaultConnection`
2. `ConnectionStrings__DefaultConnection`
3. `DATABASE_URL`

The provider is PostgreSQL, configured through `UseNpgsql(...)`.

PostgreSQL is mandatory in every runtime environment, including local development. The API fails fast with a configuration error when none of the connection-string settings is present. SQLite and schema creation through `EnsureCreated()` are not used.

Example local PowerShell configuration:

```powershell
$env:ConnectionStrings__DefaultConnection = "Host=localhost;Port=5432;Database=digital_assets_market;Username=postgres;Password=your_password"
dotnet run --project BackEnd/MyWebApi
```

At startup, the API applies the committed PostgreSQL migrations with `Database.Migrate()` before performing wallet backfill.

### Dependency injection

The active service registrations are:

- `AppDbContext`
- `IEmailSender -> SmtpEmailSender`
- `WalletProvisioningService`

Important note:

- `SimulatedPriceFeedService` exists in the repository but is not registered in `Program.cs`, so it does not run in production or development unless registration is added.

### Startup wallet backfill

On startup the app creates a DI scope and calls:

- `WalletProvisioningService.EnsureDefaultWalletsForAllUsers()`

If new wallets are created, `SaveChanges()` is called.

This means wallet backfilling is not only an admin action; it also happens automatically when the service starts.

### Maintenance mode

Maintenance mode is resolved by `IsMaintenanceModeEnabled(...)` from:

- `Maintenance:Enabled`
- `MAINTENANCE_MODE`
- `MAINTENANCE_ENABLED`
- `ENABLE_MAINTENANCE_PAGE`

Accepted truthy values include:

- `true`
- `1`
- `on`
- `yes`

Behavior while enabled:

- `/api/*` and `/swagger/*` return `503`
- non-GET/non-HEAD requests outside `/api` also return `503`
- if `wwwroot/maintenance.html` exists it is served for browser traffic

### Static files and SPA fallback

The backend serves static files from `wwwroot` and ends with:

- `app.MapControllers()`
- `app.MapFallbackToFile("index.html")`

This means the backend can host the built frontend SPA in the same process.

### Security headers

For non-Swagger routes the app adds:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- a CSP that restricts scripts, frames, objects, form actions, and outbound connections

The CSP explicitly allows `connect-src` to:

- `'self'`
- `https://api.coingecko.com`

## Configuration Reference

### JWT

Expected settings:

- `Jwt:Key`
- `Jwt:Issuer`
- `Jwt:Audience`

`Jwt:Key` is required. Startup throws if it is missing.

### Email

Password reset mail uses:

- `Email:SmtpHost`
- `Email:SmtpPort`
- `Email:SmtpUser`
- `Email:SmtpPassword`
- `Email:From`
- `Email:EnableSsl`

If SMTP host or sender address is missing, the email sender throws `InvalidOperationException("Email service is not configured.")`.

### Frontend URL

`Frontend:BaseUrl` is used to build password reset links.  
If it is missing, the backend falls back to the current request host.

### Local development

`launchSettings.json` defines:

- `http`: `http://localhost:5149`
- `https`: `https://localhost:7071;http://localhost:5149`
- `IIS Express`

Swagger is the launch target in local development profiles.

### Container deployment

`BackEnd/Dockerfile`:

- builds on `mcr.microsoft.com/dotnet/sdk:8.0`
- publishes `MyWebApi`
- runs on `mcr.microsoft.com/dotnet/aspnet:8.0`
- exposes port `10000`
- uses `PORT` if provided, otherwise `10000`

## Security Model

### Identity model

JWTs store these claims:

- `ClaimTypes.NameIdentifier`
- `ClaimTypes.Email`
- `ClaimTypes.Role`

`ApiControllerBase` provides helpers used across controllers:

- `TryGetUserId(out Guid userId)`
- `IsAdmin()`

### Authorization pattern

The backend mainly uses three access levels:

- anonymous access for login, registration, password reset, public news, public FAQ reads, and the external CoinGecko proxy
- authenticated access for user-scoped resources
- admin-only access for management and write operations on shared platform resources

### Request sanitization

`RequestSecurity` provides two main validators:

- `TryValidatePlainText(...)`
- `TryValidateImageReference(...)`

It rejects:

- HTML tags
- script-like content
- `javascript:` URIs
- `vbscript:` URIs
- unsafe `data:text/html` content

Supported image inputs are:

- absolute `http`/`https` URLs
- base64 `data:image/png|jpg|jpeg|gif|webp` values

### Password handling

Passwords are stored using BCrypt for new writes.  
The login flow also supports a legacy plaintext-password fallback:

- if BCrypt parsing fails and the stored password exactly matches the submitted password, login succeeds
- the password is then upgraded in-place to a BCrypt hash

This behavior is intentional and is verified by tests.

### Ban handling

Users can be banned in two ways:

- through legacy admin endpoints in `AuthController`
- through the newer `UsersController` admin endpoints

Banned users:

- cannot pass the post-validation JWT check
- receive a `403` on authenticated requests after validation
- are also blocked during login

## Service Layer

### `WalletProvisioningService`

Purpose:

- create default wallets for users that do not already have wallets

Known currency lists:

- bank currencies: `USD`, `EUR`
- crypto currencies: `BTC`, `ETH`, `BNB`, `ALGO`, `USDT`

Default list exposed publicly:

- `USD`, `EUR`, `BTC`, `ETH`, `BNB`, `ALGO`, `USDT`

Important behavior:

- `EnsureDefaultWalletsForUser(Guid userId)` only creates wallets if the user currently has no wallets at all
- `EnsureDefaultWalletsForUser(Guid userId, IEnumerable<string>? bankCurrencies, IEnumerable<string>? cryptoCurrencies)` creates only requested known currencies and skips existing ones
- wallets are created with zero balance, empty address, status `Active`, and `CreatedAt = DateTime.UtcNow`

### `SmtpEmailSender`

Purpose:

- send password reset emails through SMTP

Behavior:

- resolves SMTP configuration from `IConfiguration`
- uses explicit credentials if `Email:SmtpUser` is set
- otherwise falls back to default network credentials
- logs and rethrows failures

### `SimulatedPriceFeedService`

Purpose:

- periodically insert synthetic order book entries for `BTCUSD`, `ETHUSD`, `BNBUSD`, and `ALGOUSD`

Current runtime state:

- not active, because it is not registered as a hosted service

If enabled later, it would:

- create synthetic buy orders
- create matching order-book rows
- prune older order-book entries beyond 200 rows per symbol

## API Surface

Base path conventions:

- all API routes start with `/api`
- route templates are attribute-based
- response shapes are usually custom DTOs or anonymous objects

### AuthController

Base route: `/api/auth`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | Anonymous | Register a normal user, optionally with KYC payload and requested wallet currencies |
| POST | `/register-admin` | Admin | Create a new admin account |
| POST | `/login` | Anonymous | Validate credentials, issue JWT, create a session row |
| POST | `/wallets/backfill` | Admin | Backfill missing default wallets for every user |
| GET | `/profile` | Authenticated | Return current user profile summary |
| GET | `/users` | Admin | Return all users with email, role, and ban flag |
| GET | `/users/banned` | Admin | Return banned users only |
| GET | `/users/active` | Admin | Return non-banned users only |
| POST | `/users/{id}/ban` | Admin | Ban a user by id |
| POST | `/users/ban-by-email` | Admin | Ban a user by email |
| POST | `/logout` | Anonymous or authenticated | Client-side logout placeholder |
| POST | `/change-password` | Authenticated | Change the current user password |
| POST | `/delete-account` | Authenticated | Deactivate the current account, optionally liquidating balances into bank-transfer transactions |
| POST | `/forgot-password` | Anonymous | Generate and email a password reset link |
| POST | `/reset-password` | Anonymous | Validate password-reset JWT and set a new password |

Important implementation details:

- registration rejects duplicate email and duplicate username checks are case-insensitive
- registration sanitizes username and optional KYC fields
- if any KYC field is supplied during registration, the full KYC set becomes required
- registration enforces minimum age 18 when KYC data is supplied
- optional KYC registration creates a `KycDocument` immediately with `Status = "Verified"`
- normal registration provisions wallets based on `BankAccountCurrencies` and `InitialCryptoCurrencies`
- admin registration always provisions the service default wallets via `EnsureDefaultWalletsForUser(user.Id)`
- login stores one `SessionTable` row per successful login
- the issued JWT expires in 1 hour
- `logout` does not revoke JWTs or delete sessions; it simply returns `200 OK`
- delete-account does not hard-delete the user row
- delete-account renames the email and username, hashes a random password, sets role to `DeletedUser`, sets `IsBanned = true`, and marks status inactive
- if the user has non-zero wallet balances, delete-account requires bank account details and creates `BankTransferOut` transactions while zeroing those wallet balances
- password reset tokens are JWTs signed with the same app signing key and include a custom `purpose = "password_reset"` claim

Request DTOs defined locally in the controller:

- `RegisterRequest`
- `RegisterAdminRequest`
- `LoginRequest`
- `ForgotPasswordRequest`
- `ResetPasswordRequest`
- `ChangePasswordRequest`
- `DeleteAccountRequest`
- `BanRequest`

### UsersController

Base route: `/api/users`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/me` | Authenticated | Return the current user as `UserDto` |
| GET | `/me/export` | Authenticated | Export a consolidated account snapshot |
| PUT | `/me/profile-picture` | Authenticated | Update profile picture URL or data URI |
| PUT | `/me/username` | Authenticated | Update username with validation and uniqueness check |
| GET | `/` | Admin | List users, optionally filtered by `status=active|banned` |
| GET | `/{id}` | Admin | Get a single user plus latest session metadata |
| POST | `/ban` | Admin | Ban by id or email |
| POST | `/unban` | Admin | Unban by id or email |

Important implementation details:

- `GET /me/export` aggregates data from users, wallets, orders, transactions, sessions, and KYC documents
- admin list endpoints decorate each user with the latest session info if available
- profile pictures are validated as safe URLs or supported `data:image/...` strings
- username changes are sanitized, must be at least 3 characters, and uniqueness is checked case-insensitively

### WalletsController

Base route: `/api/wallets`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Authenticated | List wallets, user-scoped unless admin |
| POST | `/ensure-default` | Authenticated | Create requested default wallets for current user or admin-selected user |
| GET | `/{id}` | Authenticated | Get a single wallet |
| POST | `/` | Authenticated | Create a wallet |
| PUT | `/{id}` | Authenticated | Update wallet currency, balance, address, or status |
| DELETE | `/{id}` | Authenticated | Delete a wallet |
| GET | `/card-details` | Authenticated | Return saved card metadata for current user |
| POST | `/deposit-card` | Authenticated | Simulate a fiat card deposit into a wallet and create a transaction |

Important implementation details:

- non-admin users are restricted to their own wallets
- admins can query another user via `userId` or list all wallets via `includeAll=true`
- `ensure-default` delegates to `WalletProvisioningService`
- card deposits support only `USD` and `EUR`
- card deposit amount must be greater than zero and not exceed `100000`
- first card deposit requires card details
- later deposits can reuse saved card details
- only masked card data is stored:
  - holder name
  - last four digits
  - expiry
  - preferred currency
- deposits create an `ExchangeTransaction` with:
  - `TypeOfTransaction = "CardDeposit"`
  - `Status = "Completed"`
  - a pseudo hash such as `CARD-XXXX-1234`
- if the wallet for the requested fiat currency does not exist, it is created on the fly

### BankAccountsController

Base route: `/api/bank-accounts`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Authenticated | List bank accounts for current user or admin-selected user |
| POST | `/` | Authenticated | Create a bank account |
| PUT | `/{id}` | Authenticated | Update a bank account |
| DELETE | `/{id}` | Authenticated | Delete a bank account |

Important implementation details:

- non-admin users can only manage their own bank accounts
- `Currency` is normalized to uppercase and defaults to `USD` on create
- the controller uses `BankAccountTable` directly as the request model rather than a dedicated DTO

### KycDocumentsController

Base route: `/api/kyc-documents`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Authenticated | List KYC documents, user-scoped unless admin |
| GET | `/status` | Authenticated | Return `{ verified: bool }` for the current user |
| GET | `/{id}` | Authenticated | Get one KYC document |
| POST | `/` | Authenticated | Create a KYC document |
| PUT | `/{id}` | Authenticated | Update a KYC document |
| DELETE | `/{id}` | Authenticated | Delete a KYC document |

Important implementation details:

- non-admin users can only access their own KYC rows
- `DateOfBirth` is required on creation
- the controller normalizes date fields to UTC for PostgreSQL `timestamptz` compatibility
- age must be at least 18
- text fields are sanitized with `RequestSecurity`
- creation defaults empty/whitespace status values to `Verified`

### OrdersController

Base route: `/api/orders`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Authenticated | List orders, optionally filtered by user, status, or symbol |
| GET | `/{id}` | Authenticated | Get one order |
| POST | `/` | Authenticated | Create and potentially match an order |
| PUT | `/{id}` | Authenticated | Update order fields or cancel an open order |
| DELETE | `/{id}` | Authenticated | Delete an order, refunding reserved balances if needed |

Supported trading symbols:

- `BTCUSD`
- `ETHUSD`
- `BNBUSD`
- `ALGOUSD`
- `BTCEUR`
- `ETHEUR`
- `BNBEUR`
- `ALGOEUR`

Matching behavior:

- orders can be `Buy` or `Sell`
- order kind is controlled by `CreateOrderRequest.OrderKind`
- `"Limit"` orders require an explicit price
- any non-`"Limit"` value is treated as market behavior
- opposite-side open orders are pulled from the order book and sorted by price-time priority
- buy orders match lowest price first
- sell orders match highest price first

Balance reservation rules:

- buy orders reserve quote currency
- sell orders reserve base currency
- market buys reserve the exact aggregate matched cost
- limit buys reserve `price * amount`

Settlement rules:

- buyer receives base currency in their wallet
- seller receives quote currency in their wallet
- partially matched limit orders leave the remaining amount open in the order book
- fully matched orders are marked `Filled`
- unmatched limit orders are inserted into `OrderBook`
- unmatched market orders are rejected

Cancellation/delete refund behavior:

- open buy orders refund `order.Price * order.Amount` to the quote wallet
- open sell orders refund `order.Amount` to the base wallet
- related order-book rows are removed when an open order is cancelled or deleted

Important implementation detail:

- after a fully filled order, the response DTO reports the original requested amount because the entity is reset from remaining amount back to requested amount before the final save
- after a partially filled limit order, the open order row stores only the remaining amount

### TradesController

Base route: `/api/trades`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Authenticated | List trades, optionally filtered by order id or symbol |
| GET | `/{id}` | Authenticated | Get one trade |
| POST | `/` | Authenticated | Create a trade row directly |
| PUT | `/{id}` | Admin | Update a trade |
| DELETE | `/{id}` | Admin | Delete a trade |

Important implementation details:

- when no filters are supplied, non-admin users only see trades related to their own orders
- when `symbol` is supplied, trade filtering is performed indirectly through related order ids
- direct `POST /api/trades` does not perform settlement logic; it only inserts a trade row

### OrderBookController

Base route: `/api/orderbook`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Authenticated | List order-book entries, optionally filtered by symbol |
| GET | `/{orderId}` | Authenticated | Get one order-book entry by order id |
| POST | `/` | Admin | Insert an order-book row |
| PUT | `/{orderId}` | Admin | Update an order-book row |
| DELETE | `/{orderId}` | Admin | Delete an order-book row |

Important implementation details:

- read access still requires authentication because `[Authorize]` is applied at controller level
- the API addresses order-book rows by `OrderId`, which also matches the effective key configured in `AppDbContext`
- the entity still carries an `OrderBookId` property, so the model currently has both:
  - `OrderId` as the effective key
  - `OrderBookId` as an additional identifier field

### TransactionsController

Base route: `/api/transactions`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Authenticated | List transactions, user-scoped unless admin |
| GET | `/{id}` | Authenticated | Get one transaction |
| POST | `/` | Authenticated | Create a transaction |
| PUT | `/{id}` | Authenticated | Update a transaction |
| DELETE | `/{id}` | Authenticated | Delete a transaction |

Important implementation details:

- non-admin users can only create transactions for themselves
- the controller does not apply business-side settlement logic; it is plain CRUD over `ExchangeTransaction`

### BlockchainEventsController

Base route: `/api/blockchain-events`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Authenticated | List blockchain events |
| GET | `/{id}` | Authenticated | Get one blockchain event |
| POST | `/` | Admin | Create a blockchain event |
| PUT | `/{id}` | Admin | Update a blockchain event |
| DELETE | `/{id}` | Admin | Delete a blockchain event |

Important implementation details:

- non-admin users only see events whose parent transaction belongs to them
- admin users can filter by `exchangeTransactionId`

### SessionsController

Base route: `/api/sessions`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Authenticated | List sessions, user-scoped unless admin |
| GET | `/{id}` | Authenticated | Get one session |
| POST | `/` | Authenticated | Create a session row |
| PUT | `/{id}` | Authenticated | Update a session |
| DELETE | `/{id}` | Authenticated | Delete a session |

Important implementation details:

- login also creates sessions through `AuthController`; this controller exposes direct CRUD on the same table
- session creation defaults expiry to `UtcNow + 12 hours` if not provided

### AuditLogsController

Base route: `/api/audit-logs`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Authenticated | List audit logs, user-scoped unless admin |
| GET | `/{id}` | Authenticated | Get one audit log |
| POST | `/` | Authenticated | Create an audit log |
| PUT | `/{id}` | Admin | Update an audit log |
| DELETE | `/{id}` | Admin | Delete an audit log |

Important implementation details:

- non-admin users can only create or read logs for themselves

### FeeTablesController

Base route: `/api/fee-tables`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Authenticated | List fee tables, optionally filtered by symbol |
| GET | `/{id}` | Authenticated | Get one fee table |
| POST | `/` | Admin | Create a fee table |
| PUT | `/{id}` | Admin | Update a fee table |
| DELETE | `/{id}` | Admin | Delete a fee table |

Important implementation details:

- reads require authentication because the controller has `[Authorize]`
- orders optionally reference a fee-table row via `FeeTableId`
- current order execution code does not actually apply fee deduction logic

### ReferralsController

Base route: `/api/referrals`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Authenticated | List referrals |
| GET | `/{id}` | Authenticated | Get one referral |
| POST | `/` | Authenticated | Create a referral |
| PUT | `/{id}` | Admin | Update a referral |
| DELETE | `/{id}` | Admin | Delete a referral |

Important implementation details:

- non-admin users can only access referrals where they are the referrer or referred user
- non-admin users can only create referrals for themselves as the referrer

### NewsController

Base route: `/api/news`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Anonymous | List news items ordered by `PublishedAt DESC` |
| GET | `/{id}` | Anonymous | Get one news item |
| POST | `/` | Admin | Create a news item |

Important implementation details:

- reads are public via `[AllowAnonymous]`
- creation still checks `TryGetUserId()` and `IsAdmin()`
- title and content are sanitized through `RequestSecurity`
- the entity stores audit-like fields:
  - `Author`
  - `CreatedBy`
  - `EditedBy`
  - `EditedOn`
  - `DeletedBy`
  - `DeletedOn`
  - `UpdatedAt`
- on create, `DeletedBy` is set to the creator and `DeletedOn` is set to `DateTime.MinValue`; this behaves more like placeholder metadata than true soft-delete state

### FaqController

Base route: `/api/faq`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Anonymous | List FAQ items with pagination and author metadata joins |
| POST | `/questions` | Authenticated | Create a user-submitted question |
| POST | `/{id}/replies` | Authenticated | Reply to an FAQ question |
| POST | `/` | Admin | Create an FAQ directly, optionally with an answer |
| PUT | `/{id}` | Admin | Update an FAQ |
| DELETE | `/{id}` | Admin | Delete an FAQ |

Important implementation details:

- FAQ reads are public
- user-submitted questions and replies are sanitized via `RequestSecurity`
- a blocked-word filter is applied to both questions and answers
- blocked-word list includes English and Bulgarian profanity terms
- question images can be safe URLs or supported data-image values
- users cannot reply to their own question
- admin FAQ creation can create a question with or without an answer
- admin answer updates set `RepliedByUserId` to the current admin unless the answer is empty
- list responses include author and reply-author usernames, emails, and profile-picture URLs

### ExternalController

Base route: `/api/external`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/coingecko/{coinId}/market_chart` | Anonymous | Proxy CoinGecko market-chart data |

Important implementation details:

- forwards query parameters:
  - `vs_currency`
  - `days`
  - `interval`
- adds a custom `User-Agent`
- relays upstream status code and body if CoinGecko returns an error
- returns `502` if the proxy itself throws

## DTOs

DTO definitions are concentrated in `BackEnd/MyWebApi/Controllers/ApiDtos.cs`.

They cover:

- users
- wallets
- card details
- orders
- trades
- order-book rows
- KYC documents
- sessions
- audit logs
- blockchain events
- exchange transactions
- fee tables
- referrals
- news
- FAQ

There is also a separate `BackEnd/MyWebApi/Dtos/UserDto.cs`.

Important implementation note:

- `ApiDtos.cs` already defines a `UserDto`
- `Dtos/UserDto.cs` defines another `UserDto` with a different shape
- the active controllers shown in this repository use the DTO from `ApiDtos.cs`, so the extra DTO file appears to be leftover or transitional code

## Data Model

### DbSets in `AppDbContext`

The context exposes:

- `Users`
- `Wallets`
- `Orders`
- `TradesTable`
- `OrderBookTable`
- `KycDocuments`
- `Sessions`
- `AuditLogs`
- `Transactions`
- `BlockchainEvents`
- `FeeTables`
- `Referrals`
- `FAQs`
- `News`
- `CreditCardDetails`
- `BankAccounts`
- `EuroBankAccounts`
- `DollarBankAccounts`

### Core entities

#### `User`

Fields:

- `Id`
- `UserName`
- `Email`
- `Password`
- `Role`
- `ProfilePictureUrl`
- `CreatedAt`
- `Status` (`Inactive` or `Active`)
- `IsBanned`

Notes:

- constructor initializes default values and a new `Guid`
- role defaults to `User`

#### `WalletTable`

Fields:

- `WalletID`
- `UserId`
- `Currency`
- `Balance`
- `Addres`
- `Status`
- `CreatedAt`

Notes:

- property is named `Addres`, not `Address`
- API DTOs map `Addres` to `Address`

#### `OrdersTable`

Fields:

- `OrderId`
- `UserId`
- `FeeTableId`
- `TypeOfOrder`
- `Symbol`
- `Price`
- `Amount`
- `OrderStatus`
- `CreatedAt`

Navigation:

- `OrderBook`
- optional `FeeTable`

Enums:

- `OrderType`: `Buy`, `Sell`
- `OrderStatus`: `Open`, `Filled`, `Cancelled`

#### `TradesTable`

Fields:

- `TradeId`
- `BuyOrderId`
- `SellOrderId`
- `Price`
- `Amount`
- `TimeStamp`

Notes:

- `SellOrderId` is nullable

#### `OrderBook`

Fields:

- `OrderBookId`
- `OrderId`
- `Symbol`
- `Price`
- `Amount`
- `Timestamp`

Notes:

- maps one-to-one with `OrdersTable`
- although the class contains both `OrderBookId` and `OrderId`, the effective key configured in `AppDbContext` is `OrderId`

#### `KycDocument`

Fields:

- `DocId`
- `UserId`
- `Type`
- `FilePath`
- `DocumentNumber`
- `FullName`
- `DateOfBirth`
- `CountryOfResidence`
- `ExpiryDate`
- `Status`
- `UploadedAt`

#### `SessionTable`

Fields:

- `SessionId`
- `UserId`
- `Token`
- `IpAddress`
- `DeviceInfo`
- `CreatedAt`
- `ExpiresAt`

#### `AuditLog`

Fields:

- `LogId`
- `UserId`
- `Action`
- `Details`
- `Timestamp`

#### `ExchangeTransaction`

Fields:

- `TransactionID`
- `UserID`
- `TypeOfTransaction`
- `Currency`
- `Amount`
- `Status`
- `BlockchainTransactionHash`
- `TimeStamp`

#### `BlockchainEvent`

Fields:

- `EventId`
- `ExchangeTransactionId`
- `TxHash`
- `EventType`
- `Status`
- `Timestamp`

#### `FeeTable`

Fields:

- `FeeTableId`
- `Symbol`
- `FeeType`
- `FeeAmount`
- `CreatedAt`
- `UpdatedAt`

Navigation:

- `Orders`

#### `Referral`

Fields:

- `ReferralId`
- `ReferrerId`
- `ReferredId`
- `BonusAmount`
- `Timestamp`

#### `FAQ`

Fields:

- `FaqId`
- `Question`
- `QuestionImageUrl`
- `Answer`
- `CreatedAt`
- `UpdatedAt`
- `CategoryId`
- `AuthorId`
- `RepliedByUserId`
- `PublishedAt`

#### `NewsTable`

Fields:

- `NewsId`
- `Title`
- `Content`
- `Author`
- `PublishedAt`
- `CreatedAt`
- `CreatedBy`
- `EditedBy`
- `EditedOn`
- `DeletedBy`
- `DeletedOn`
- `UpdatedAt`

#### `CreditCardDetailsTable`

Fields:

- `UserId`
- `CardHolderName`
- `CardLast4`
- `ExpiryDate`
- `Currency`
- `CreatedAt`
- `UpdatedAt`

Notes:

- keyed by `UserId`, effectively making it a one-card-per-user table

#### Bank account entities

Three bank-account entities exist:

- `BankAccountTable`
- `EuroBankAccountTable`
- `DollarBankAccountTable`

All three store:

- `BankAccountId`
- `UserId`
- `AccountHolderName`
- `BankName`
- `Iban`
- `SwiftCode`
- `Currency`
- `CreatedAt`

Important implementation note:

- the active controller uses `BankAccountTable`
- `EuroBankAccountTable` and `DollarBankAccountTable` exist in the data model and DbContext but currently do not have dedicated controllers in this API layer

## Relationships and Delete Behavior

Configured in `AppDbContext.OnModelCreating(...)`.

### User relationships

- `User -> WalletTable`: cascade delete
- `User -> CreditCardDetailsTable`: one-to-one, cascade delete
- `User -> BankAccountTable`: cascade delete
- `User -> EuroBankAccountTable`: cascade delete
- `User -> DollarBankAccountTable`: cascade delete
- `User -> OrdersTable`: cascade delete
- `User -> KycDocument`: cascade delete
- `User -> SessionTable`: cascade delete
- `User -> AuditLog`: cascade delete

### Trading relationships

- `TradesTable.BuyOrderId -> OrdersTable`: restrict delete
- `TradesTable.SellOrderId -> OrdersTable`: restrict delete
- `OrderBook.OrderId -> OrdersTable`: one-to-one, restrict delete
- `OrdersTable.FeeTableId -> FeeTable`: restrict delete

### Transaction/content relationships

- `BlockchainEvent.ExchangeTransactionId -> ExchangeTransaction`: cascade delete
- `ExchangeTransaction.UserID -> User`: restrict delete
- `FAQ.AuthorId -> User`: restrict delete
- `FAQ.RepliedByUserId -> User`: restrict delete
- `NewsTable.Author -> User`: restrict delete
- `NewsTable.CreatedBy -> User`: restrict delete
- `NewsTable.EditedBy -> User`: restrict delete
- `NewsTable.DeletedBy -> User`: restrict delete

## EF Core Configuration and Seeding

Each major entity has a matching configuration class in `BackEnd/NetServer.DAta1/configurations/`.

Each configuration typically does two things:

- defines the primary key
- attaches `HasData(...)` seed rows

### Seed data pattern

The project stores seed constants in:

- `BackEnd/NetServer.DAta1/Seeding/Constants/DataSeedingConstants.cs`

The seed set includes at least:

- one user
- one wallet
- one order
- one trade
- one order-book row
- one KYC document
- one session
- one audit log
- one transaction
- one blockchain event
- one fee-table row
- one referral
- one FAQ entry
- four news entries

Notable seeded values:

- seeded user id is fixed
- seeded username is `Alice`
- seeded wallet currency is `BTC`
- seeded FAQ and news content are demo/sample entries

Important implementation note:

- the seeded user password is stored as plain text in seed constants and `UserSeeding`
- new runtime registrations use BCrypt, but seeded/demo data does not
- the login flow supports this through its legacy-password upgrade behavior

## Migrations

Current migration files in `BackEnd/NetServer.DAta1/Migrations`:

- `20260301170349_InitialPostgresMigration1`
- `20260309170010_AddBankAccounts`
- `20260310153347_BancAccountsTables`
- `AppDbContextModelSnapshot`

This confirms the live EF migration history in the repository is PostgreSQL-oriented, not SQL Server-oriented.

## Main Business Flows

### 1. Registration

1. Client posts to `/api/auth/register`.
2. Backend validates model state.
3. Email uniqueness and case-insensitive username uniqueness are checked.
4. Optional identity verification payload is validated as an all-or-nothing set.
5. Password is hashed with BCrypt.
6. `User` is inserted.
7. Optional KYC document is inserted with `Verified` status.
8. Requested wallets are provisioned.
9. Changes are saved.

### 2. Login

1. Client posts email/password to `/api/auth/login`.
2. Backend loads the user by email.
3. Password is checked using BCrypt or legacy fallback.
4. Ban state is checked.
5. Missing wallets are provisioned if needed.
6. A one-hour JWT is issued.
7. A session row is inserted with IP and user-agent details.
8. Token is returned to the client.

### 3. Password reset

1. Client posts email to `/api/auth/forgot-password`.
2. If the user exists, backend creates a short-lived JWT reset token.
3. Backend builds a frontend reset URL.
4. Email sender delivers the link.
5. Client later posts token and new password to `/api/auth/reset-password`.
6. Backend validates signature, audience, issuer, expiry, and `purpose`.
7. Password is re-hashed and saved.

### 4. Card deposit

1. Client posts to `/api/wallets/deposit-card`.
2. Backend validates amount, currency, and card details.
3. Saved card metadata is created or updated.
4. Wallet is created if missing.
5. Wallet balance increases by deposit amount.
6. A completed `CardDeposit` transaction is recorded.

### 5. Limit or market order placement

1. Client posts to `/api/orders`.
2. Backend validates supported symbol and amount.
3. Backend classifies the order as market or limit.
4. User funds are reserved from the appropriate wallet.
5. Opposite-side open orders are loaded from the order book.
6. Matching occurs in price-time order.
7. Trades are created for each matched slice.
8. Buyer and seller wallets are updated.
9. If there is unmatched remainder on a limit order, a new order-book row is created.

### 6. Account deletion

1. Client posts current password and optional bank details to `/api/auth/delete-account`.
2. Backend verifies password.
3. If any wallet has a positive balance, bank data becomes mandatory.
4. For every positive-balance wallet, a `BankTransferOut` transaction is recorded and balance is zeroed.
5. User identity fields are anonymized.
6. Role changes to `DeletedUser`.
7. Status changes to inactive and user is banned.

### 7. FAQ/community flow

1. Any visitor can read `/api/faq`.
2. Authenticated users can submit questions.
3. Authenticated users can reply to others' questions.
4. Admins can create, edit, and delete FAQ entries directly.
5. Profanity filtering applies to both questions and answers.

## Tests

Backend tests live in `MyApp.Tests`.

The test project uses:

- NUnit
- EF Core InMemory
- coverlet

Covered areas include:

- auth registration rules
- admin registration authorization metadata
- optional KYC creation during registration
- login upgrade of legacy plaintext passwords
- delete-account behavior
- news ordering and admin-only creation
- order-book CRUD
- order matching and insufficient-liquidity cases
- transaction authorization behavior
- username case-insensitive uniqueness
- wallet access control
- card deposit behavior
- wallet provisioning rules
- `ApiControllerBase` helper behavior

Representative test files:

- `MyApp.Tests/AuthControllerTests.cs`
- `MyApp.Tests/OrdersControllerTests.cs`
- `MyApp.Tests/WalletsControllerTests.cs`
- `MyApp.Tests/TransactionsControllerTests.cs`
- `MyApp.Tests/NewsControllerTests.cs`
- `MyApp.Tests/UsersControllerTests.cs`
- `MyApp.Tests/WalletProvisioningServiceTests.cs`

## Notable Implementation Notes

These are not necessarily bugs, but they matter for maintenance and onboarding.

### 1. Duplicate user-admin management surfaces

User-ban and user-list behavior exists in both:

- `AuthController`
- `UsersController`

`UsersController` is the cleaner resource-oriented surface, but the legacy auth endpoints still exist and remain active.

### 2. Duplicate `UserDto` definitions

There are two different `UserDto` classes in the API project.  
The active controller logic shown here uses the one from `Controllers/ApiDtos.cs`.

### 3. Wallet field typo in the data model

`WalletTable` stores the address in `Addres`, while the API exposes it as `Address`.

### 4. Dormant background service

`SimulatedPriceFeedService` is implemented but not registered, so synthetic market-data generation is currently off.

### 5. Multiple bank-account tables

The data layer includes:

- a generic bank-account table
- a euro-specific table
- a dollar-specific table

Only the generic table is exposed by the API at the moment.

### 6. Seed/demo data differs from production conventions

Seeded users still use plaintext passwords, while runtime-created users use BCrypt hashes.

### 7. Order book reads are authenticated

`OrderBookController` puts `[Authorize]` on the controller, so even simple market-depth reads require a token.

### 8. Logout is not token revocation

`POST /api/auth/logout` is a no-op response.  
Tokens remain valid until expiry unless client-side storage is cleared or server-side validation rules change.

### 9. Existing repository docs are older than the code

Some root-level docs in the repository still describe older backend behavior, older file states, or an older database-provider assumption.  
This document is intended to reflect the current backend source under `BackEnd/`.

## File Map

### API host

- `BackEnd/MyWebApi/Program.cs`
- `BackEnd/MyWebApi/MyWebApi.csproj`
- `BackEnd/MyWebApi/appsettings.json`
- `BackEnd/MyWebApi/appsettings.Development.json`
- `BackEnd/MyWebApi/Properties/launchSettings.json`
- `BackEnd/MyWebApi/Controllers/*.cs`
- `BackEnd/MyWebApi/Services/*.cs`
- `BackEnd/MyWebApi/Controllers/ApiDtos.cs`

### Data layer

- `BackEnd/NetServer.DAta1/AppDbContext.cs`
- `BackEnd/NetServer.DAta1/AppDbContextFactory.cs`
- `BackEnd/NetServer.DAta1/models/*.cs`
- `BackEnd/NetServer.DAta1/configurations/*.cs`
- `BackEnd/NetServer.DAta1/Seeding/**/*.cs`
- `BackEnd/NetServer.DAta1/Migrations/*.cs`

### Tests

- `MyApp.Tests/*.cs`

## Summary

The backend is a two-project .NET 8 system centered on a JWT-protected REST API and an EF Core/PostgreSQL persistence layer. Its strongest implemented areas are authentication, wallet/card flows, order matching, KYC handling, and admin resource management. The codebase also contains a few transitional or legacy pieces, such as duplicate admin surfaces, duplicate DTO definitions, dormant price-feed infrastructure, and extra bank-account tables that are modeled but not fully surfaced.
