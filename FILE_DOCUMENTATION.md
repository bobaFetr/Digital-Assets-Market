# File-by-File Documentation (MyApp.Tests, MyWebApi, NetServer.DAta1)

## MyApp.Tests
- [MyApp.Tests/MyApp.Tests.csproj](MyApp.Tests/MyApp.Tests.csproj) - NUnit test project targeting net8.0 with coverlet and a project reference to the API; defines the test project packaging and dependencies.
- [MyApp.Tests/UnitTest1.cs](MyApp.Tests/UnitTest1.cs) - Contains `ApiControllerBaseTests`, which uses a private `TestController` to exercise `TryGetUserId` and `IsAdmin` behavior for valid, missing, and invalid claims.

## MyWebApi
### Root configuration and project files
- [MyWebApi/appsettings.json](MyWebApi/appsettings.json) - Base configuration for logging, allowed hosts, SQL Server connection string, and JWT issuer/audience values.
- [MyWebApi/appsettings.Development.json](MyWebApi/appsettings.Development.json) - Development overrides for logging levels.
- [MyWebApi/MyWebApi.csproj](MyWebApi/MyWebApi.csproj) - ASP.NET Core Web SDK project targeting net8.0 with JWT, EF Core design-time, and Swagger packages plus a reference to the data layer project.
- [MyWebApi/MyWebApi.csproj.user](MyWebApi/MyWebApi.csproj.user) - Local user settings defining the active debug profile.
- [MyWebApi/MyWebApi.http](MyWebApi/MyWebApi.http) - HTTP scratch file with a sample request template for the dev host.
- [MyWebApi/Program.cs](MyWebApi/Program.cs) - Application bootstrap configuring JWT auth, CORS, Swagger, EF Core SQL Server, static file hosting, and controller routing with SPA fallback.

### Controllers
- [MyWebApi/Controllers/ApiControllerBase.cs](MyWebApi/Controllers/ApiControllerBase.cs) - Base API controller exposing `TryGetUserId` (claims-based GUID parsing) and `IsAdmin` (role check) helpers.
- [MyWebApi/Controllers/ApiDtos.cs](MyWebApi/Controllers/ApiDtos.cs) - Request/response DTOs for users, wallets, orders, trades, order book entries, KYC documents, sessions, audit logs, blockchain events, transactions, fee tables, referrals, and news.
- [MyWebApi/Controllers/AuthController.cs](MyWebApi/Controllers/AuthController.cs) - Auth endpoints for register/login/profile; issues JWTs, hashes passwords with BCrypt, and provides admin-only user listing and ban operations.
- [MyWebApi/Controllers/UsersController.cs](MyWebApi/Controllers/UsersController.cs) - User endpoints for current profile, admin listing, admin lookup by id, and admin ban/unban actions with role checks.
- [MyWebApi/Controllers/OrdersController.cs](MyWebApi/Controllers/OrdersController.cs) - Order CRUD and matching logic; validates symbols, handles market vs limit orders, updates order book, and creates trades on match.
- [MyWebApi/Controllers/OrderBookController.cs](MyWebApi/Controllers/OrderBookController.cs) - Order book read endpoints for all users and admin-only create/update/delete for entries.
- [MyWebApi/Controllers/TradesController.cs](MyWebApi/Controllers/TradesController.cs) - Trade list/filter endpoints with access control, plus create/update/delete (admin-only updates/deletes).
- [MyWebApi/Controllers/TransactionsController.cs](MyWebApi/Controllers/TransactionsController.cs) - Exchange transaction CRUD with admin override and user-scoped access.
- [MyWebApi/Controllers/WalletsController.cs](MyWebApi/Controllers/WalletsController.cs) - Wallet CRUD, enforcing user ownership or admin access, with DTO mapping.
- [MyWebApi/Controllers/AuditLogsController.cs](MyWebApi/Controllers/AuditLogsController.cs) - Audit log CRUD with user scoping and admin-only updates/deletes.
- [MyWebApi/Controllers/BlockchainEventsController.cs](MyWebApi/Controllers/BlockchainEventsController.cs) - Blockchain event CRUD; read access is scoped to user-owned transactions unless admin.
- [MyWebApi/Controllers/FaqController.cs](MyWebApi/Controllers/FaqController.cs) - Empty placeholder controller file; no actions defined.
- [MyWebApi/Controllers/FeeTablesController.cs](MyWebApi/Controllers/FeeTablesController.cs) - Fee table CRUD with admin-only writes and symbol filtering.
- [MyWebApi/Controllers/KycDocumentsController.cs](MyWebApi/Controllers/KycDocumentsController.cs) - KYC document CRUD plus status endpoint and age validation (must be at least 18).
- [MyWebApi/Controllers/NewsController.cs](MyWebApi/Controllers/NewsController.cs) - Public read for news items and admin-only create with author/audit fields.
- [MyWebApi/Controllers/ReferralsController.cs](MyWebApi/Controllers/ReferralsController.cs) - Referral CRUD with user scope checks and admin-only updates/deletes.
- [MyWebApi/Controllers/SessionsController.cs](MyWebApi/Controllers/SessionsController.cs) - Session CRUD with user scoping and token/device metadata support.

### DTOs
- [MyWebApi/Dtos/UserDto.cs](MyWebApi/Dtos/UserDto.cs) - `UserDto` definition used for API responses, including wallet balance and status data.

### Services
- [MyWebApi/Services/SimulatedPriceFeedService.cs](MyWebApi/Services/SimulatedPriceFeedService.cs) - Background service that periodically inserts simulated order book entries for configured symbols and prunes older records.

### Properties
- [MyWebApi/Properties/launchSettings.json](MyWebApi/Properties/launchSettings.json) - Local launch profiles for HTTP/HTTPS/IIS Express and development environment variables.

### Static web assets (built output)
- [MyWebApi/wwwroot/index.html](MyWebApi/wwwroot/index.html) - Built SPA entry point served by ASP.NET Core static files.
- [MyWebApi/wwwroot/assets/index-FNeBReNa.js](MyWebApi/wwwroot/assets/index-FNeBReNa.js) - Minified frontend JavaScript bundle generated by the Vite build.
- [MyWebApi/wwwroot/assets/index-t2I7nLW3.css](MyWebApi/wwwroot/assets/index-t2I7nLW3.css) - Minified frontend CSS bundle generated by the Vite build.
- [MyWebApi/wwwroot/assets/Gemini_Generated_Image_sb5zszsb5zszsb5z-D8EZKbtC.png](MyWebApi/wwwroot/assets/Gemini_Generated_Image_sb5zszsb5zszsb5z-D8EZKbtC.png) - Static image asset used by the frontend build.
- [MyWebApi/wwwroot/assets/Copilot_20251008_144326-BDYUD0GT.png](MyWebApi/wwwroot/assets/Copilot_20251008_144326-BDYUD0GT.png) - Static image asset used by the frontend build.

## NetServer.DAta1
### Root files
- [NetServer.DAta1/AppDbContext.cs](NetServer.DAta1/AppDbContext.cs) - EF Core context defining DbSets, entity keys, and relationships for users, wallets, orders, trades, order book, KYC, sessions, audit logs, transactions, fees, referrals, FAQ, and news.
- [NetServer.DAta1/AppDbContextFactory.cs](NetServer.DAta1/AppDbContextFactory.cs) - Design-time factory for migrations using a LocalDB SQL Server connection string.
- [NetServer.DAta1/NetServer.DAta1.csproj](NetServer.DAta1/NetServer.DAta1.csproj) - Class library project targeting net8.0 with EF Core packages.

### Models
- [NetServer.DAta1/models/1.User.cs](NetServer.DAta1/models/1.User.cs) - `User` entity with identity, role, status enum, and ban flag.
- [NetServer.DAta1/models/2.%20WalletTable.cs](NetServer.DAta1/models/2.%20WalletTable.cs) - `WalletTable` entity storing currency balances and wallet metadata, keyed by `WalletID`.
- [NetServer.DAta1/models/3.%20OrdersTable.cs](NetServer.DAta1/models/3.%20OrdersTable.cs) - `OrdersTable` entity plus `OrderType` and `OrderStatus` enums; includes link to `OrderBook` and optional `FeeTable`.
- [NetServer.DAta1/models/4.%20TradesTable.cs](NetServer.DAta1/models/4.%20TradesTable.cs) - `TradesTable` entity with buy/sell order references and trade pricing.
- [NetServer.DAta1/models/5.%20OrderBook.cs](NetServer.DAta1/models/5.%20OrderBook.cs) - `OrderBook` entity with price/amount snapshot linked to a single order.
- [NetServer.DAta1/models/6.%20KycDocumentTable.cs](NetServer.DAta1/models/6.%20KycDocumentTable.cs) - `KycDocument` entity with identity metadata, residence details, and status.
- [NetServer.DAta1/models/7.SessionTable.cs](NetServer.DAta1/models/7.SessionTable.cs) - `SessionTable` entity tracking session token, device, and expiry info.
- [NetServer.DAta1/models/8.%20AuditLogTable.cs](NetServer.DAta1/models/8.%20AuditLogTable.cs) - `AuditLog` entity capturing user actions and timestamps.
- [NetServer.DAta1/models/9.%20BlockchainEventTable.cs](NetServer.DAta1/models/9.%20BlockchainEventTable.cs) - `BlockchainEvent` entity linked to a transaction, storing hash, type, and status.
- [NetServer.DAta1/models/10.%20ExchangeTransactionTable.cs](NetServer.DAta1/models/10.%20ExchangeTransactionTable.cs) - `ExchangeTransaction` entity for deposits/withdrawals with status and blockchain hash.
- [NetServer.DAta1/models/11.%20FeeTable.cs](NetServer.DAta1/models/11.%20FeeTable.cs) - `FeeTable` entity for maker/taker fees per symbol with timestamps.
- [NetServer.DAta1/models/12.%20ReferralTable.cs](NetServer.DAta1/models/12.%20ReferralTable.cs) - `Referral` entity storing referrer/referred ids and bonus amounts.
- [NetServer.DAta1/models/13.%20FAQTable.cs](NetServer.DAta1/models/13.%20FAQTable.cs) - `FAQ` entity with question/answer and author metadata.
- [NetServer.DAta1/models/14.%20NewsTable.cs](NetServer.DAta1/models/14.%20NewsTable.cs) - `NewsTable` entity with author/audit fields and publish timestamps.

### Entity configurations
- [NetServer.DAta1/configurations/1.UserConfiguration.cs](NetServer.DAta1/configurations/1.UserConfiguration.cs) - Configures `User` primary key and seed data via `UserSeeding`.
- [NetServer.DAta1/configurations/2.WalletConfiguration.cs](NetServer.DAta1/configurations/2.WalletConfiguration.cs) - Configures `WalletTable` primary key and seed data via `WalletSeeding`.
- [NetServer.DAta1/configurations/3.%20OrderConfiguration.cs](NetServer.DAta1/configurations/3.%20OrderConfiguration.cs) - Configures `OrdersTable` primary key and seed data via `OrderSeeding`.
- [NetServer.DAta1/configurations/4.TradeConfiguration.cs](NetServer.DAta1/configurations/4.TradeConfiguration.cs) - Configures `TradesTable` primary key and seed data via `TradeSeeding`.
- [NetServer.DAta1/configurations/5.%20OrderBookConfiguration.cs](NetServer.DAta1/configurations/5.%20OrderBookConfiguration.cs) - Configures `OrderBook` primary key and seed data via `OrderBookSeeding`.
- [NetServer.DAta1/configurations/6.%20KycDocumentConfiguration.cs](NetServer.DAta1/configurations/6.%20KycDocumentConfiguration.cs) - Configures `KycDocument` primary key and seed data via `KycDocumentSeeding`.
- [NetServer.DAta1/configurations/7.%20SessionConfiguration.cs](NetServer.DAta1/configurations/7.%20SessionConfiguration.cs) - Configures `SessionTable` primary key and seed data via `Session1Seeding`.
- [NetServer.DAta1/configurations/8.AuditLogConfiguration.cs](NetServer.DAta1/configurations/8.AuditLogConfiguration.cs) - Configures `AuditLog` primary key and seed data via `AuditLogSeeding`.
- [NetServer.DAta1/configurations/9.%20BlockchainEventConfiguration.cs](NetServer.DAta1/configurations/9.%20BlockchainEventConfiguration.cs) - Configures `BlockchainEvent` primary key and seed data via `BlockchainEventSeeding`.
- [NetServer.DAta1/configurations/10.ExchangeTransactionConfiguration.cs](NetServer.DAta1/configurations/10.ExchangeTransactionConfiguration.cs) - Configures `ExchangeTransaction` primary key, user FK, and seed data via `ExchangeTransactionSeeding`.
- [NetServer.DAta1/configurations/11.%20FeeConfiguration.cs](NetServer.DAta1/configurations/11.%20FeeConfiguration.cs) - Configures `FeeTable` primary key and seed data via `FeeSeeding`.
- [NetServer.DAta1/configurations/12.%20ReferralConfiguration.cs](NetServer.DAta1/configurations/12.%20ReferralConfiguration.cs) - Configures `Referral` primary key and seed data via `ReferralSeeding`.
- [NetServer.DAta1/configurations/13.%20FAQConfiguration.cs](NetServer.DAta1/configurations/13.%20FAQConfiguration.cs) - Configures `FAQ` primary key and seed data via `FAQSeeding`.
- [NetServer.DAta1/configurations/14.%20NewsConfiguration.cs](NetServer.DAta1/configurations/14.%20NewsConfiguration.cs) - Configures `NewsTable` primary key and seed data via `NewsSeeding`.

### Seed data
- [NetServer.DAta1/Seeding/1.%20UserSeeding.cs](NetServer.DAta1/Seeding/1.%20UserSeeding.cs) - Generates a single seed user using values from `DataSeedingConstants.UserConstants`.
- [NetServer.DAta1/Seeding/2.WalletSeeding.cs](NetServer.DAta1/Seeding/2.WalletSeeding.cs) - Generates a seed wallet for the default user.
- [NetServer.DAta1/Seeding/3.%20OrderSeeding.cs](NetServer.DAta1/Seeding/3.%20OrderSeeding.cs) - Generates a seed order for BTCUSD using constants.
- [NetServer.DAta1/Seeding/4.%20TradeSeeding.cs](NetServer.DAta1/Seeding/4.%20TradeSeeding.cs) - Generates a seed trade linked to the seeded buy order.
- [NetServer.DAta1/Seeding/5.%20OrderBookSeeding.cs](NetServer.DAta1/Seeding/5.%20OrderBookSeeding.cs) - Generates a single order book entry tied to the seeded order.
- [NetServer.DAta1/Seeding/6.%20KycDocumentSeeding.cs](NetServer.DAta1/Seeding/6.%20KycDocumentSeeding.cs) - Generates a seed KYC document for the default user.
- [NetServer.DAta1/Seeding/7.SessionSeeding.cs](NetServer.DAta1/Seeding/7.SessionSeeding.cs) - Generates a seed session with token/device metadata.
- [NetServer.DAta1/Seeding/8.%20AuditLogSeeding.cs](NetServer.DAta1/Seeding/8.%20AuditLogSeeding.cs) - Generates a seed audit log entry for a login event.
- [NetServer.DAta1/Seeding/9.BlockchainEventSeeding.cs](NetServer.DAta1/Seeding/9.BlockchainEventSeeding.cs) - Generates a seed blockchain event for the seed transaction.
- [NetServer.DAta1/Seeding/10.ExchangeTransactionSeeding.cs](NetServer.DAta1/Seeding/10.ExchangeTransactionSeeding.cs) - Generates a seed exchange transaction with a blockchain hash.
- [NetServer.DAta1/Seeding/11.%20FeeSeeding.cs](NetServer.DAta1/Seeding/11.%20FeeSeeding.cs) - Generates a seed fee table entry for BTCUSD maker fees.
- [NetServer.DAta1/Seeding/12.%20ReferralSeeding.cs](NetServer.DAta1/Seeding/12.%20ReferralSeeding.cs) - Generates a seed referral with a bonus amount.
- [NetServer.DAta1/Seeding/13.%20FaqSeeding.cs](NetServer.DAta1/Seeding/13.%20FaqSeeding.cs) - Generates a seed FAQ entry with author and category metadata.
- [NetServer.DAta1/Seeding/14.%20NewsSeeding.cs](NetServer.DAta1/Seeding/14.%20NewsSeeding.cs) - Generates multiple news items for the initial dataset.
- [NetServer.DAta1/Seeding/Constants/DataSeedingConstants.cs](NetServer.DAta1/Seeding/Constants/DataSeedingConstants.cs) - Centralized constants for all seeded entities (users, wallets, orders, trades, KYC, sessions, audit logs, blockchain events, transactions, fees, referrals, FAQ, and news).

### ID samples
- [NetServer.DAta1/ID/12.02.26.txt](NetServer.DAta1/ID/12.02.26.txt) - Sample identity data for a user named Boris P with document details.
- [NetServer.DAta1/ID/AdminID.txt](NetServer.DAta1/ID/AdminID.txt) - Empty placeholder file for an admin identity sample.
- [NetServer.DAta1/ID/AlmostAdult.txt](NetServer.DAta1/ID/AlmostAdult.txt) - Sample identity data for a user near the age threshold.
- [NetServer.DAta1/ID/Bobata07072401.txt](NetServer.DAta1/ID/Bobata07072401.txt) - Sample identity data for an adult user.
- [NetServer.DAta1/ID/ChildUser.txt](NetServer.DAta1/ID/ChildUser.txt) - Sample identity data for a minor user.
- [NetServer.DAta1/ID/Identity%20-%20Copy.txt](NetServer.DAta1/ID/Identity%20-%20Copy.txt) - Duplicate copy of the base identity sample.
- [NetServer.DAta1/ID/Identity.txt](NetServer.DAta1/ID/Identity.txt) - Base identity sample with name, DOB, and document fields.
- [NetServer.DAta1/ID/Vladi.txt](NetServer.DAta1/ID/Vladi.txt) - Sample identity data for a user named Vladimir Vladov.

### Migrations
- [NetServer.DAta1/Migrations/20260124163137_InitialCreate.cs](NetServer.DAta1/Migrations/20260124163137_InitialCreate.cs) - `InitialCreate` migration creates the Users table and inserts the seed user.
- [NetServer.DAta1/Migrations/20260124163137_InitialCreate.Designer.cs](NetServer.DAta1/Migrations/20260124163137_InitialCreate.Designer.cs) - EF Core model snapshot for `InitialCreate` describing the Users table and seed data.
- [NetServer.DAta1/Migrations/20260204184058_SecondTable.cs](NetServer.DAta1/Migrations/20260204184058_SecondTable.cs) - `SecondTable` migration creates WalletTable with FK to Users and inserts the seed wallet.
- [NetServer.DAta1/Migrations/20260204184058_SecondTable.Designer.cs](NetServer.DAta1/Migrations/20260204184058_SecondTable.Designer.cs) - EF Core model snapshot for `SecondTable` including Users and WalletTable.
- [NetServer.DAta1/Migrations/20260205080321_AddOrderTable.cs](NetServer.DAta1/Migrations/20260205080321_AddOrderTable.cs) - `AddOrderTable` renames WalletTable to Wallets, adds Orders, seeds a sample order, and restores FKs.
- [NetServer.DAta1/Migrations/20260205080321_AddOrderTable.Designer.cs](NetServer.DAta1/Migrations/20260205080321_AddOrderTable.Designer.cs) - EF Core model snapshot after Orders are introduced and Wallets are renamed.
- [NetServer.DAta1/Migrations/20260205163654_AddTradesTable.cs](NetServer.DAta1/Migrations/20260205163654_AddTradesTable.cs) - `AddTradesTable` migration creates TradesTable with Buy/Sell order FKs and seeds a trade.
- [NetServer.DAta1/Migrations/20260205163654_AddTradesTable.Designer.cs](NetServer.DAta1/Migrations/20260205163654_AddTradesTable.Designer.cs) - EF Core model snapshot after TradesTable is added.
- [NetServer.DAta1/Migrations/20260206072224_AddOrderBookTable.cs](NetServer.DAta1/Migrations/20260206072224_AddOrderBookTable.cs) - `AddOrderBookTable` migration adds the order book table with a unique order FK and seeds an entry.
- [NetServer.DAta1/Migrations/20260206072224_AddOrderBookTable.Designer.cs](NetServer.DAta1/Migrations/20260206072224_AddOrderBookTable.Designer.cs) - EF Core model snapshot after OrderBookTable is introduced.
- [NetServer.DAta1/Migrations/20260206165528_AddKycDocumentTable.cs](NetServer.DAta1/Migrations/20260206165528_AddKycDocumentTable.cs) - `AddKycDocumentTable` migration creates KycDocument table and seeds a document.
- [NetServer.DAta1/Migrations/20260206165528_AddKycDocumentTable.Designer.cs](NetServer.DAta1/Migrations/20260206165528_AddKycDocumentTable.Designer.cs) - EF Core model snapshot after KycDocument is added.
- [NetServer.DAta1/Migrations/20260207114601_AddSessionTable.cs](NetServer.DAta1/Migrations/20260207114601_AddSessionTable.cs) - `AddSessionTable` renames KycDocument to KycDocuments, creates Sessions, and seeds session data.
- [NetServer.DAta1/Migrations/20260207114601_AddSessionTable.Designer.cs](NetServer.DAta1/Migrations/20260207114601_AddSessionTable.Designer.cs) - EF Core model snapshot after Sessions are added.
- [NetServer.DAta1/Migrations/20260207162637_AddAuditLogTable.cs](NetServer.DAta1/Migrations/20260207162637_AddAuditLogTable.cs) - `AddAuditLogTable` creates AuditLogs and shifts OrderBookTable primary key to OrderId.
- [NetServer.DAta1/Migrations/20260207162637_AddAuditLogTable.Designer.cs](NetServer.DAta1/Migrations/20260207162637_AddAuditLogTable.Designer.cs) - EF Core model snapshot after AuditLogs and OrderBook PK change.
- [NetServer.DAta1/Migrations/20260207165525_SeedAuditLogs.cs](NetServer.DAta1/Migrations/20260207165525_SeedAuditLogs.cs) - `SeedAuditLogs` inserts a login audit log and updates the seeded OrderBookId.
- [NetServer.DAta1/Migrations/20260207165525_SeedAuditLogs.Designer.cs](NetServer.DAta1/Migrations/20260207165525_SeedAuditLogs.Designer.cs) - EF Core model snapshot reflecting the seeded audit log.
- [NetServer.DAta1/Migrations/20260208130015_AddBlockChainEventTable.cs](NetServer.DAta1/Migrations/20260208130015_AddBlockChainEventTable.cs) - `AddBlockChainEventTable` creates ExchangeTransaction and BlockchainEvent tables and indexes.
- [NetServer.DAta1/Migrations/20260208130015_AddBlockChainEventTable.Designer.cs](NetServer.DAta1/Migrations/20260208130015_AddBlockChainEventTable.Designer.cs) - EF Core model snapshot after blockchain entities are added.
- [NetServer.DAta1/Migrations/20260208162544_AddBlockchainAndTransactions.cs](NetServer.DAta1/Migrations/20260208162544_AddBlockchainAndTransactions.cs) - `AddBlockchainAndTransactions` renames ExchangeTransaction to Transactions, seeds a transaction and event, and adds FKs.
- [NetServer.DAta1/Migrations/20260208162544_AddBlockchainAndTransactions.Designer.cs](NetServer.DAta1/Migrations/20260208162544_AddBlockchainAndTransactions.Designer.cs) - EF Core model snapshot after Transactions rename and seed.
- [NetServer.DAta1/Migrations/20260208174413_UpdateUserModel.cs](NetServer.DAta1/Migrations/20260208174413_UpdateUserModel.cs) - `UpdateUserModel` renames PasswordHash to Role, adds Password, and updates seed data.
- [NetServer.DAta1/Migrations/20260208174413_UpdateUserModel.Designer.cs](NetServer.DAta1/Migrations/20260208174413_UpdateUserModel.Designer.cs) - EF Core model snapshot after user schema changes.
- [NetServer.DAta1/Migrations/20260209184147_AddFeeTable.cs](NetServer.DAta1/Migrations/20260209184147_AddFeeTable.cs) - `AddFeeTable` adds fee tables, links orders to fees, and seeds a fee row.
- [NetServer.DAta1/Migrations/20260209184147_AddFeeTable.Designer.cs](NetServer.DAta1/Migrations/20260209184147_AddFeeTable.Designer.cs) - EF Core model snapshot after fee tables are introduced.
- [NetServer.DAta1/Migrations/20260210071851_AddReferraTable.cs](NetServer.DAta1/Migrations/20260210071851_AddReferraTable.cs) - `AddReferraTable` adds Referrals and seeds a referral record.
- [NetServer.DAta1/Migrations/20260210071851_AddReferraTable.Designer.cs](NetServer.DAta1/Migrations/20260210071851_AddReferraTable.Designer.cs) - EF Core model snapshot after referrals are added.
- [NetServer.DAta1/Migrations/20260211103342_AddKycIdentityFields.cs](NetServer.DAta1/Migrations/20260211103342_AddKycIdentityFields.cs) - `AddKycIdentityFields` renames tables, adds KYC identity fields, and updates related FKs.
- [NetServer.DAta1/Migrations/20260211103342_AddKycIdentityFields.Designer.cs](NetServer.DAta1/Migrations/20260211103342_AddKycIdentityFields.Designer.cs) - EF Core model snapshot after KYC identity fields and table renames.
- [NetServer.DAta1/Migrations/20260214150902_AddFAQTable.cs](NetServer.DAta1/Migrations/20260214150902_AddFAQTable.cs) - `AddFAQTable` creates FAQs, sets author FK, and seeds one FAQ.
- [NetServer.DAta1/Migrations/20260214150902_AddFAQTable.Designer.cs](NetServer.DAta1/Migrations/20260214150902_AddFAQTable.Designer.cs) - EF Core model snapshot after FAQs are added.
- [NetServer.DAta1/Migrations/20260214163716_AddNewsTable.cs](NetServer.DAta1/Migrations/20260214163716_AddNewsTable.cs) - `AddNewsTable` creates NewsTable with multiple user FKs and seeds a news item.
- [NetServer.DAta1/Migrations/20260214163716_AddNewsTable.Designer.cs](NetServer.DAta1/Migrations/20260214163716_AddNewsTable.Designer.cs) - EF Core model snapshot after NewsTable is added.
- [NetServer.DAta1/Migrations/20260217070738_SeedMoreNews.cs](NetServer.DAta1/Migrations/20260217070738_SeedMoreNews.cs) - `SeedMoreNews` inserts additional news items and updates the order book seed key.
- [NetServer.DAta1/Migrations/20260217070738_SeedMoreNews.Designer.cs](NetServer.DAta1/Migrations/20260217070738_SeedMoreNews.Designer.cs) - EF Core model snapshot reflecting the expanded news seed data.
- [NetServer.DAta1/Migrations/AppDbContextModelSnapshot.cs](NetServer.DAta1/Migrations/AppDbContextModelSnapshot.cs) - Latest EF Core model snapshot for the full schema and all seed data.
