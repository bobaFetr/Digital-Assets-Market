# Full System Documentation

## Scope

This document is the practical full-system documentation set for the `dam` repository.

It covers the hand-written source and config files in:

- `FrontEnd/src`
- `BackEnd/MyWebApi`
- `BackEnd/NetServer.DAta1`
- `MyApp.Tests`

It intentionally excludes deep commentary on generated or vendor output such as:

- `node_modules`
- `bin`, `obj`, `dist`
- bundled frontend assets
- EF Core designer files and snapshots
- binary images

The purpose is to give you one readable document that explains every source/config file and how the system fits together.

## System Overview

The application is a full-stack crypto exchange-style system with:

- a React frontend
- an ASP.NET Core API
- an EF Core/PostgreSQL persistence layer
- a test project focused on controllers and service logic

The main functional areas are:

- authentication and sessions
- profile and account management
- wallets, cards, and bank accounts
- trading, order book, and trades
- KYC/identity verification
- news and FAQ/community content
- admin monitoring and management

## High-Level Architecture

### Frontend

The frontend is centered around `App.jsx`, which defines routing, the dashboard shell, top-level page composition, and some app-wide UI state such as theme, unread news, and profile badge display.

The frontend communicates with the API almost entirely through `Services/Service.js`. That file is the transport layer for auth, profile, wallets, KYC, deposits, and common request handling.

### Backend API

The API is hosted from `BackEnd/MyWebApi/Program.cs`. It configures:

- JWT authentication
- CORS
- Swagger
- EF Core database access
- static file hosting
- custom security headers

Controllers under `BackEnd/MyWebApi/Controllers` provide the public contract of the system.

### Data Layer

The EF Core context in `BackEnd/NetServer.DAta1/AppDbContext.cs` defines the schema and links together entities such as:

- `User`
- `WalletTable`
- `OrdersTable`
- `TradesTable`
- `OrderBook`
- `KycDocument`
- `SessionTable`
- `AuditLog`
- `ExchangeTransaction`
- `FeeTable`
- `Referral`
- `FAQ`
- `NewsTable`

### Tests

`MyApp.Tests` validates the most important controller and service behaviors, especially:

- auth
- orders
- wallets
- transactions
- news
- wallet provisioning

## Main Runtime Flows

### Registration and login

1. `SignUp.jsx` collects registration input.
2. It sends the payload to `AuthController.Register`.
3. The backend validates username/email/KYC fields, hashes the password, creates the user, and provisions wallets.
4. `Login.jsx` then authenticates the user.
5. `AuthController.Login` issues the JWT and creates a session row.
6. `Service.js` stores the JWT and uses it on later requests.

### Profile and account management

1. `Profile.jsx` loads profile, wallet, and account-export data.
2. The frontend calls `/api/auth/profile`, `/api/users/me/export`, and related endpoints.
3. `UsersController` provides current-user data and export data.
4. `WalletsController` provides wallet/card/deposit behavior.

### Trading

1. `BuyAndSell.jsx` loads the user balances, order book, and recent trades.
2. It builds a symbol like `BTCUSD` or `ETHEUR`.
3. It submits an order to `OrdersController`.
4. `OrdersController` validates supported symbols, checks balances, reserves assets, matches liquidity, creates trades, and updates order state.
5. `OrderBookController` and `TradesController` expose the resulting market state back to the UI.

### Content and community

1. `News.jsx` and `NewsDetail.jsx` consume `NewsController`.
2. `Faq.jsx` consumes `FaqController`.
3. Users can ask questions and reply.
4. The backend validates content and image references before storage.

### Security

The security model is layered:

- JWT auth and role checks
- controller-level ownership checks
- request validation in `RequestSecurity.cs`
- frontend safe-image resolution via `trustedContent.js`
- browser response headers set in `Program.cs`

## Frontend Detailed Documentation

## Frontend Entry and App Shell

### `FrontEnd/src/main.jsx`

Purpose:

- React entry point.

Responsibilities:

- imports global CSS
- imports `App`
- mounts the application to the DOM

This is the browser bootstrap for the SPA.

### `FrontEnd/src/App.jsx`

Size:

- 633 lines

Purpose:

- main route registry
- dashboard shell
- top-level navigation and profile badge
- live price/news polling
- KYC gate

Important sections:

- currency metadata constants
- helper formatting
- `UserBalanceCard`
- `Home`
- `KycGate`
- route table

Key behaviors:

- polls CoinGecko for prices
- loads unread news and stores read IDs in local storage
- loads the current profile when a token exists
- renders notification UI for unread news
- uses `resolveTrustedImageUrl` for the top profile image
- defines all user and admin routes

Design note:

- This file mixes routing, dashboard data loading, home page composition, and some app-wide UI concerns.

### `FrontEnd/src/App.css`

Size:

- 884 lines

Purpose:

- main global stylesheet

Responsibilities:

- defines theme variables
- styles dashboard cards, containers, sidebars, forms, login panels, footer, cookie popup, and admin shell

This is the visual backbone of the frontend.

### `FrontEnd/src/index.css`

Purpose:

- lightweight root-level global CSS

### `FrontEnd/src/config/api.js`

Purpose:

- centralizes API URL generation and backend-origin-aware path building

Why it matters:

- keeps backend URL decisions out of individual components

### `FrontEnd/src/Services/Service.js`

Size:

- 283 lines

Purpose:

- shared frontend API client

Main responsibilities:

- token storage and retrieval
- generic `request(...)` wrapper around `fetch`
- JSON/text response normalization
- auth failure handling
- banned-user event dispatch
- exported helpers for auth, profile, wallets, KYC, card deposit, and bank account operations

This is the frontend transport layer.

## Frontend Security and Shared Components

### `FrontEnd/src/Security/trustedContent.js`

Purpose:

- safe image trust policy on the frontend

Responsibilities:

- allows only safe upload MIME types
- allows only safe image sources for rendering
- prevents UI rendering of unsafe data-image payloads such as SVG

### `FrontEnd/src/Components/Sidebar.jsx`

Size:

- 250 lines

Purpose:

- shared desktop/mobile app navigation

Responsibilities:

- route-aware highlighting
- grouped navigation behavior
- mobile sidebar open/close support

### `FrontEnd/src/Components/Footer.jsx`

Purpose:

- shared footer with brand and support/navigation links

### `FrontEnd/src/Components/CookieConsent.jsx`

Purpose:

- displays cookie consent UI and stores consent choice locally

## Frontend Auth and Profile Pages

### `FrontEnd/src/Login.jsx`

Purpose:

- sign-in screen

Responsibilities:

- collect credentials
- call `loginUser`
- fetch profile after login
- navigate on success

### `FrontEnd/src/Login.css`

Purpose:

- styling shared across auth views

### `FrontEnd/src/SignUp.jsx`

Size:

- 329 lines

Purpose:

- registration screen

Responsibilities:

- collect username, email, password
- collect selected bank account currencies
- collect optional initial crypto currencies
- collect optional KYC data
- submit registration
- log the user in after success

Important business meaning:

- this file is where the user chooses USD-only, EUR-only, or both bank-account setup at signup time

### `FrontEnd/src/ForgotPassword.jsx`

Purpose:

- forgot-password request page

### `FrontEnd/src/ResetPassword.jsx`

Purpose:

- password reset completion page

### `FrontEnd/src/Profile.jsx`

Size:

- 941 lines

Purpose:

- main user profile page

Main responsibilities:

- load the current profile
- load exported account data
- show wallet balances by currency
- show “currencies used”
- show fiat totals for USD and EUR bank balances
- allow profile picture update
- allow username update
- allow password change
- allow account deletion
- allow deposits from saved or entered card details

Important implementation notes:

- derives “currencies used” from wallets, orders, transactions, and bank accounts
- uses `resolveTrustedImageUrl`
- uses the selected deposit currency rather than blindly following saved-card currency

### `FrontEnd/src/Profile.css`

Purpose:

- profile-specific styling

### `FrontEnd/src/ProfileActivity.jsx`

Purpose:

- secondary or legacy profile-style page

Note:

- overlaps conceptually with `Profile.jsx`

### `FrontEnd/src/VerificationEmailPage.jsx`

Purpose:

- post-registration email verification status page

### `FrontEnd/src/SentSMSToNumberPage.jsx`

Purpose:

- SMS status/confirmation page

### `FrontEnd/src/VerifyIdentityPage.jsx`

Purpose:

- KYC submission page

Responsibilities:

- collect identity details
- submit them to the API

## Frontend Wallet, Trading, and Market Pages

### `FrontEnd/src/Wallet.jsx`

Purpose:

- wallet overview page

Responsibilities:

- display user balances
- present wallet-related information and actions

### `FrontEnd/src/wallet.css`

Purpose:

- wallet page styling

### `FrontEnd/src/WithdrawPage.jsx`

Purpose:

- withdrawal interface

### `FrontEnd/src/BuyAndSell.jsx`

Size:

- 601 lines

Purpose:

- main trading page

Responsibilities:

- choose buy/sell
- choose market/limit
- choose base asset and quote fiat
- load balances, order book, and last price
- submit order payloads

Why it matters:

- this is the main trading UI and is tightly coupled to the backend order system

### `FrontEnd/src/BitcoinChart.jsx`

Purpose:

- bitcoin market/chart presentation page

### `FrontEnd/src/BNB.jsx`

Purpose:

- BNB-specific market/chart page

### `FrontEnd/src/BCrypto.jsx`

Purpose:

- broader crypto market or educational view

## Frontend News, FAQ, and Static Content

### `FrontEnd/src/News.jsx`

Purpose:

- news listing page

Responsibilities:

- load `/api/news`
- render article cards or list items
- support navigation into article detail

### `FrontEnd/src/NewsDetail.jsx`

Purpose:

- article detail page

Responsibilities:

- read route parameter
- load a single article
- render title, publication date, and content

### `FrontEnd/src/Faq.jsx`

Size:

- 331 lines

Purpose:

- question-and-answer page

Responsibilities:

- load FAQ/community entries
- submit questions
- submit replies
- upload question images
- safely render profile images and question attachments

Important note:

- this file consumes the anti-XSS image trust rules on the frontend

### `FrontEnd/src/Support.jsx`

Purpose:

- support request form

### `FrontEnd/src/Feedback.jsx`

Purpose:

- feedback submission form

### `FrontEnd/src/Education.jsx`

Purpose:

- educational landing page

### `FrontEnd/src/HowToSecureWallet.jsx`

Purpose:

- static educational article about wallet security

### `FrontEnd/src/WhatIsBlockchain.jsx`

Purpose:

- static educational article explaining blockchain basics

### `FrontEnd/src/Beginners_Tutorial.jsx`

Purpose:

- lightweight tutorial placeholder page

### `FrontEnd/src/RugPull.jsx`

Purpose:

- educational warning/risk content page

## Frontend Error and Utility Pages

### `FrontEnd/src/ErorPage1.jsx`

Purpose:

- error page variant

### `FrontEnd/src/ErrorPage2.jsx`

Purpose:

- error page variant

### `FrontEnd/src/ErrorPage3.jsx`

Purpose:

- error page variant

### `FrontEnd/src/SecondPage.jsx`

Purpose:

- placeholder or routing test page

### `FrontEnd/src/ThirdPage.jsx`

Purpose:

- placeholder page

### `FrontEnd/src/Seetings.jsx`

Purpose:

- placeholder settings page

Naming note:

- the filename appears to be a misspelling of `Settings`

### `FrontEnd/src/Chat.css`

Purpose:

- additional or legacy styling related to chat-like or panel-like layouts

## Frontend Admin Surface

### `FrontEnd/src/ADMIN/AdminMainPage.jsx`

Size:

- 1029 lines

Purpose:

- main admin dashboard and nested admin functionality hub

Responsibilities:

- render admin layout
- display summary metrics
- list user and transaction data
- manage news and FAQs
- route between admin subviews

Tradeoff:

- the file is very large and combines several admin features in one place

### `FrontEnd/src/ADMIN/Admin.css`

Purpose:

- admin-specific styling

### `FrontEnd/src/ADMIN/NewsManager.jsx`

Purpose:

- placeholder file for a future dedicated news manager

Current state:

- empty

### `FrontEnd/src/ADMIN/PostsManager.jsx`

Purpose:

- placeholder file for future post management

Current state:

- empty

### `FrontEnd/src/ADMIN/Usermanager.jsx`

Purpose:

- placeholder file for future dedicated user management

Current state:

- empty

## Frontend Dev Helper

### `FrontEnd/src/Server/server.js`

Purpose:

- local helper/dev server script

Role:

- supports development-side utility behavior separate from the ASP.NET API host

## Backend API Detailed Documentation

## Backend Startup and Project Files

### `BackEnd/MyWebApi/Program.cs`

Size:

- 191 lines

Purpose:

- main ASP.NET Core bootstrap file

Responsibilities:

- load JWT configuration from appsettings or environment variables
- configure JWT bearer authentication
- reject banned users at token-validation time
- register controllers, Swagger, EF Core, CORS, and services
- resolve connection strings
- backfill default wallets for users at startup
- add CSP and other security headers
- host static assets and API endpoints

Important note:

- startup is intentionally not reintroducing automatic `db.Database.Migrate()` behavior

### `BackEnd/MyWebApi/appsettings.json`

Purpose:

- base runtime configuration for logging, connection strings, and JWT metadata

### `BackEnd/MyWebApi/appsettings.Development.json`

Purpose:

- development-only config overrides

### `BackEnd/MyWebApi/MyWebApi.csproj`

Purpose:

- API project definition

Key package groups:

- authentication
- EF Core design-time tooling
- Npgsql provider
- Swagger
- BCrypt

### `BackEnd/MyWebApi/MyWebApi.http`

Purpose:

- manual API scratch file for local testing

### `BackEnd/MyWebApi/Properties/launchSettings.json`

Purpose:

- local launch profile definitions for development

## Backend DTO and Base Infrastructure

### `BackEnd/MyWebApi/Controllers/ApiControllerBase.cs`

Purpose:

- shared base controller with common auth helpers

Methods:

- `TryGetUserId`
- `IsAdmin`

### `BackEnd/MyWebApi/Controllers/ApiDtos.cs`

Size:

- 362 lines

Purpose:

- central DTO contract file for the API

Contained DTO groups:

- user
- wallet
- order
- trade
- order book
- KYC
- session
- audit log
- blockchain event
- exchange transaction
- fee table
- referral
- news
- FAQ

### `BackEnd/MyWebApi/Dtos/UserDto.cs`

Purpose:

- supplemental user DTO definition

Observation:

- there is overlap with `ApiDtos.cs`, which suggests the project has mixed DTO organization patterns

## Backend Services

### `BackEnd/MyWebApi/Services/IEmailSender.cs`

Purpose:

- abstraction for outbound email sending

### `BackEnd/MyWebApi/Services/SmtpEmailSender.cs`

Purpose:

- SMTP-backed implementation of email delivery

### `BackEnd/MyWebApi/Services/WalletProvisioningService.cs`

Purpose:

- wallet creation and backfill service

Responsibilities:

- create requested bank wallets from signup choices
- create requested crypto wallets from signup choices
- create defaults only when a user has no wallets
- prevent overriding already-customized wallet sets

This service is critical for correct EUR-only, USD-only, or both-currency account setup.

### `BackEnd/MyWebApi/Services/SimulatedPriceFeedService.cs`

Purpose:

- generates simulated market activity and seeded order flow for display/testing scenarios

### `BackEnd/MyWebApi/Services/RequestSecurity.cs`

Purpose:

- centralized anti-XSS and unsafe-content validation

Responsibilities:

- validate plain text fields
- reject HTML/script-like payloads
- validate image references
- allow only safe image formats for `data:image` payloads

## Backend Controllers

### `BackEnd/MyWebApi/Controllers/AuthController.cs`

Size:

- 690 lines

Purpose:

- registration, login, profile, password reset, password change, and account deletion controller

Main responsibilities:

- validate registration input
- create users
- hash passwords
- optionally create KYC documents at signup
- provision requested wallets
- authenticate users
- issue JWTs
- record sessions
- expose profile information
- process password reset and account deletion flows

Important internal patterns:

- uses BCrypt for password hashing
- validates username uniqueness
- validates optional KYC field completeness
- applies `RequestSecurity` validation on user-entered identity and username fields

### `BackEnd/MyWebApi/Controllers/UsersController.cs`

Size:

- 340 lines

Purpose:

- user-self-service and admin user-management controller

Responsibilities:

- get current user
- export current user account data
- update current user profile picture
- update current user username
- list/filter users for admins
- get individual users for admins
- ban/unban flows

### `BackEnd/MyWebApi/Controllers/WalletsController.cs`

Size:

- 346 lines

Purpose:

- wallet and deposit controller

Responsibilities:

- list wallets
- fetch a wallet
- create/update/delete wallets
- ensure default wallets
- return saved card metadata
- process deposits from card

Important implementation details:

- supports selected fiat target currency
- records transactions during deposit
- uses ownership checks for non-admin users
- contains explicit constructor selection for DI

### `BackEnd/MyWebApi/Controllers/BankAccountsController.cs`

Purpose:

- bank-account CRUD controller

### `BackEnd/MyWebApi/Controllers/OrdersController.cs`

Size:

- 431 lines

Purpose:

- core trading engine controller

Responsibilities:

- list and fetch orders
- create orders
- validate symbols and order types
- enforce sufficient balances
- reserve funds and assets
- match against existing liquidity
- create trades
- update order status
- refund reserved balances on cancel/delete

This is the core market-execution controller.

### `BackEnd/MyWebApi/Controllers/OrderBookController.cs`

Purpose:

- order book access controller

Responsibilities:

- expose market depth
- allow admin-only mutation

### `BackEnd/MyWebApi/Controllers/TradesController.cs`

Purpose:

- trade-history controller

Responsibilities:

- expose trade rows
- scope them by user-linked orders where needed

### `BackEnd/MyWebApi/Controllers/TransactionsController.cs`

Purpose:

- transaction-history controller

Responsibilities:

- list transactions
- fetch a transaction
- create/update/delete transactions

### `BackEnd/MyWebApi/Controllers/SessionsController.cs`

Purpose:

- session CRUD and visibility controller

### `BackEnd/MyWebApi/Controllers/AuditLogsController.cs`

Purpose:

- audit log controller

Responsibilities:

- list, fetch, create, update, and delete audit rows with appropriate access control

### `BackEnd/MyWebApi/Controllers/BlockchainEventsController.cs`

Purpose:

- blockchain-event controller

Responsibilities:

- exposes blockchain event rows while enforcing transaction ownership for non-admin users

### `BackEnd/MyWebApi/Controllers/FeeTablesController.cs`

Purpose:

- fee schedule management controller

### `BackEnd/MyWebApi/Controllers/ReferralsController.cs`

Purpose:

- referral record controller

### `BackEnd/MyWebApi/Controllers/KycDocumentsController.cs`

Size:

- 259 lines

Purpose:

- KYC document and verification-status controller

Responsibilities:

- create KYC docs
- list docs
- expose verification status
- update/delete docs
- validate age and UTC date handling
- validate text with anti-XSS checks

### `BackEnd/MyWebApi/Controllers/NewsController.cs`

Purpose:

- news read/create controller

Responsibilities:

- public article listing
- public article detail
- admin article creation

### `BackEnd/MyWebApi/Controllers/FaqController.cs`

Size:

- 293 lines

Purpose:

- FAQ and community Q&A controller

Responsibilities:

- list entries
- ask questions
- reply to questions
- admin create/update/delete
- validate blocked words
- validate image references
- validate plain text using `RequestSecurity`

### `BackEnd/MyWebApi/Controllers/ExternalController.cs`

Purpose:

- small external integration/proxy controller

Probable use:

- exposes external market info such as BTC price summaries

## Data Layer Detailed Documentation

## EF Context and Project Files

### `BackEnd/NetServer.DAta1/AppDbContext.cs`

Size:

- 225 lines

Purpose:

- central EF Core context

Responsibilities:

- defines the `DbSet<>` surface
- aggregates all entity configurations
- anchors the relational model

Main entity sets include:

- users
- wallets
- orders
- trades
- order book
- KYC documents
- sessions
- audit logs
- blockchain events
- transactions
- fee tables
- referrals
- FAQs
- news
- bank accounts
- cards

### `BackEnd/NetServer.DAta1/AppDbContextFactory.cs`

Purpose:

- design-time context creation for EF tooling and migrations

### `BackEnd/NetServer.DAta1/NetServer.DAta1.csproj`

Purpose:

- project definition for the data layer

## Entity Files

### `models/1.User.cs`

Purpose:

- user identity and account status entity

Fields cover:

- username
- email
- password
- role
- status
- ban flag
- profile picture
- timestamps

### `models/2. WalletTable.cs`

Purpose:

- per-currency balance holder for a user

### `models/3. OrdersTable.cs`

Purpose:

- order entity plus `OrderType` and `OrderStatus` enums

### `models/4. TradesTable.cs`

Purpose:

- executed trade entity

### `models/5. OrderBook.cs`

Purpose:

- persisted order-book row for open liquidity

### `models/6. KycDocumentTable.cs`

Purpose:

- user identity verification document

### `models/7.SessionTable.cs`

Purpose:

- login session record

### `models/8. AuditLogTable.cs`

Purpose:

- audit trail record

### `models/9. BlockchainEventTable.cs`

Purpose:

- blockchain-event record associated with a transaction

### `models/10. ExchangeTransactionTable.cs`

Purpose:

- transaction record for deposit/withdraw/exchange-related events

### `models/11. FeeTable.cs`

Purpose:

- fee rule per symbol and fee type

### `models/12. ReferralTable.cs`

Purpose:

- referral linkage and bonus row

### `models/13. FAQTable.cs`

Purpose:

- stored FAQ/community question row

### `models/14. NewsTable.cs`

Purpose:

- stored news article row with author/audit metadata

### `models/15. CreditCardDetailsTable.cs`

Purpose:

- saved card metadata for deposit convenience

### `models/BankAccountTable.cs`

Purpose:

- bank-account representation at the shared/base level

### `models/DollarBankAccountTable.cs`

Purpose:

- USD bank-account specialization

### `models/EuroBankAccountTable.cs`

Purpose:

- EUR bank-account specialization

## Configuration Files

These are small EF configuration wrappers and mostly do two things:

- define keys/constraints
- attach seed data

### `configurations/1.UserConfiguration.cs`

- configures the user entity

### `configurations/2.WalletConfiguration.cs`

- configures the wallet entity

### `configurations/3. OrderConfiguration.cs`

- configures the orders entity

### `configurations/4.TradeConfiguration.cs`

- configures the trades entity

### `configurations/5. OrderBookConfiguration.cs`

- configures the order book entity

### `configurations/6. KycDocumentConfiguration.cs`

- configures KYC document mapping

### `configurations/7. SessionConfiguration.cs`

- configures sessions

### `configurations/8. AuditLogConfiguration.cs`

- configures audit logs

### `configurations/9. BlockchainEventConfiguration.cs`

- configures blockchain events

### `configurations/10.ExchangeTransactionConfiguration.cs`

- configures transactions and FK rules

### `configurations/11. FeeConfiguration.cs`

- configures fee tables

### `configurations/12. ReferralConfiguration.cs`

- configures referrals

### `configurations/13. FAQConfiguration.cs`

- configures FAQ rows

### `configurations/14. NewsConfiguration.cs`

- configures news rows

## Seed Files

The seed files provide a deterministic sample dataset.

### `Seeding/1. UserSeeding.cs`

- seed user record

### `Seeding/2.WalletSeeding.cs`

- seed wallet record

### `Seeding/3. OrderSeeding.cs`

- seed order record

### `Seeding/4. TradeSeeding.cs`

- seed trade record

### `Seeding/5. OrderBookSeeding.cs`

- seed order-book record

### `Seeding/6. KycDocumentSeeding.cs`

- seed KYC record

### `Seeding/7.SessionSeeding.cs`

- seed session record

### `Seeding/8. AuditLogSeeding.cs`

- seed audit row

### `Seeding/9.BlockchainEventSeeding.cs`

- seed blockchain-event row

### `Seeding/10.ExchangeTransactionSeeding.cs`

- seed transaction row

### `Seeding/11. FeeSeeding.cs`

- seed fee row

### `Seeding/12. ReferralSeeding.cs`

- seed referral row

### `Seeding/13. FaqSeeding.cs`

- seed FAQ row

### `Seeding/14. NewsSeeding.cs`

- seed news rows

### `Seeding/Constants/DataSeedingConstants.cs`

Size:

- 209 lines

Purpose:

- shared seed IDs, timestamps, and values used by all seeding classes

## Migrations

Primary migration source files currently relevant:

### `Migrations/20260301170349_InitialPostgresMigration1.cs`

- initial PostgreSQL schema build

### `Migrations/20260309170010_AddBankAccounts.cs`

- adds bank-account-related schema changes

### `Migrations/20260310153347_BancAccountsTables.cs`

- adds or refines dedicated bank-account tables

Generated migration designer files and the model snapshot are excluded from full commentary because they are generated artifacts, not hand-authored business logic.

## Sample ID Files

The `ID` directory contains plain-text identity samples used for testing/demo scenarios.

Examples include:

- `12.02.26.txt`
- `AlmostAdult.txt`
- `AdminID.txt`
- `Bobata07072401.txt`
- `ChildUser.txt`
- `Demo.txt`
- `Demo1.txt`
- `Demo2.txt`
- `Identity.txt`
- `Identity - Copy.txt`
- `Ivan Petrov.txt`
- `Kris.txt`
- `Maria Petrova.txt`
- `MobileAccount.txt`
- `NIkiN.txt`
- `Vladi.txt`
- one additional non-ASCII-named sample file

These files are data fixtures, not executable code.

## Test Project Detailed Documentation

### `MyApp.Tests/MyApp.Tests.csproj`

Purpose:

- test project definition

Responsibilities:

- references the API project
- declares test dependencies and coverage support

### `MyApp.Tests/coverage.runsettings`

Purpose:

- code coverage configuration

### `MyApp.Tests/ControllerTestHelpers.cs`

Purpose:

- shared controller test helper code

Role:

- reduces repetitive setup for test contexts, principals, or controller wiring

### `MyApp.Tests/UnitTest1.cs`

Purpose:

- base/helper-level tests, including controller-base helper behavior

### `MyApp.Tests/AuthControllerTests.cs`

Size:

- 335 lines

Purpose:

- verifies registration, login, and auth-related flows

### `MyApp.Tests/UsersControllerTests.cs`

Purpose:

- verifies current-user/admin user controller behavior

### `MyApp.Tests/WalletsControllerTests.cs`

Purpose:

- verifies wallet and deposit behaviors

Important scenarios:

- deposits
- saved-card behavior
- selected fiat-currency routing

### `MyApp.Tests/WalletProvisioningServiceTests.cs`

Purpose:

- verifies wallet provisioning logic

Important scenarios:

- EUR only
- USD only
- both
- preserving existing wallet selections

### `MyApp.Tests/OrdersControllerTests.cs`

Purpose:

- verifies order placement and matching behavior

Important scenarios:

- market/limit handling
- insufficient liquidity
- insufficient balances
- partial matching

### `MyApp.Tests/OrderBookControllerTests.cs`

Purpose:

- verifies order-book controller behavior

### `MyApp.Tests/TransactionsControllerTests.cs`

Purpose:

- verifies transaction controller behavior

### `MyApp.Tests/NewsControllerTests.cs`

Purpose:

- verifies news retrieval and creation behavior

## File Inventory Summary

The following source/config files are covered by this document.

### Frontend inventory

- `App.jsx`
- `App.css`
- `main.jsx`
- `index.css`
- `config/api.js`
- `Services/Service.js`
- `Security/trustedContent.js`
- `Components/Sidebar.jsx`
- `Components/Footer.jsx`
- `Components/CookieConsent.jsx`
- `Login.jsx`
- `Login.css`
- `SignUp.jsx`
- `ForgotPassword.jsx`
- `ResetPassword.jsx`
- `VerificationEmailPage.jsx`
- `SentSMSToNumberPage.jsx`
- `VerifyIdentityPage.jsx`
- `Profile.jsx`
- `Profile.css`
- `ProfileActivity.jsx`
- `Wallet.jsx`
- `wallet.css`
- `WithdrawPage.jsx`
- `BuyAndSell.jsx`
- `BitcoinChart.jsx`
- `BNB.jsx`
- `BCrypto.jsx`
- `News.jsx`
- `NewsDetail.jsx`
- `Faq.jsx`
- `Support.jsx`
- `Feedback.jsx`
- `Education.jsx`
- `HowToSecureWallet.jsx`
- `WhatIsBlockchain.jsx`
- `Beginners_Tutorial.jsx`
- `RugPull.jsx`
- `ErorPage1.jsx`
- `ErrorPage2.jsx`
- `ErrorPage3.jsx`
- `SecondPage.jsx`
- `ThirdPage.jsx`
- `Seetings.jsx`
- `Chat.css`
- `Server/server.js`
- `ADMIN/AdminMainPage.jsx`
- `ADMIN/Admin.css`
- `ADMIN/NewsManager.jsx`
- `ADMIN/PostsManager.jsx`
- `ADMIN/Usermanager.jsx`

### Backend API inventory

- `Program.cs`
- `appsettings.json`
- `appsettings.Development.json`
- `MyWebApi.csproj`
- `MyWebApi.http`
- `Properties/launchSettings.json`
- `Controllers/ApiControllerBase.cs`
- `Controllers/ApiDtos.cs`
- `Controllers/AuthController.cs`
- `Controllers/UsersController.cs`
- `Controllers/WalletsController.cs`
- `Controllers/BankAccountsController.cs`
- `Controllers/OrdersController.cs`
- `Controllers/OrderBookController.cs`
- `Controllers/TradesController.cs`
- `Controllers/TransactionsController.cs`
- `Controllers/AuditLogsController.cs`
- `Controllers/BlockchainEventsController.cs`
- `Controllers/FeeTablesController.cs`
- `Controllers/ReferralsController.cs`
- `Controllers/SessionsController.cs`
- `Controllers/KycDocumentsController.cs`
- `Controllers/NewsController.cs`
- `Controllers/FaqController.cs`
- `Controllers/ExternalController.cs`
- `Dtos/UserDto.cs`
- `Services/IEmailSender.cs`
- `Services/SmtpEmailSender.cs`
- `Services/WalletProvisioningService.cs`
- `Services/SimulatedPriceFeedService.cs`
- `Services/RequestSecurity.cs`

### Data layer inventory

- `AppDbContext.cs`
- `AppDbContextFactory.cs`
- `NetServer.DAta1.csproj`
- all entity files under `models`
- all configuration files under `configurations`
- all seed files under `Seeding`
- primary migration source files
- sample ID text fixtures

### Test inventory

- `MyApp.Tests.csproj`
- `coverage.runsettings`
- `ControllerTestHelpers.cs`
- `UnitTest1.cs`
- `AuthControllerTests.cs`
- `UsersControllerTests.cs`
- `WalletsControllerTests.cs`
- `WalletProvisioningServiceTests.cs`
- `OrdersControllerTests.cs`
- `OrderBookControllerTests.cs`
- `TransactionsControllerTests.cs`
- `NewsControllerTests.cs`

## Key Maintenance Observations

### Largest frontend files

- `Profile.jsx`
- `BuyAndSell.jsx`
- `App.jsx`
- `ADMIN/AdminMainPage.jsx`
- `App.css`

These are the most likely future refactor targets because they contain multiple concerns in a single file.

### Largest backend files

- `AuthController.cs`
- `OrdersController.cs`
- `WalletsController.cs`
- `UsersController.cs`
- `ApiDtos.cs`

These are the main backend concentration points for logic and contract complexity.

### Placeholder and partial files

- `ADMIN/NewsManager.jsx`
- `ADMIN/PostsManager.jsx`
- `ADMIN/Usermanager.jsx`
- `Seetings.jsx`
- `SecondPage.jsx`
- `ThirdPage.jsx`

### Naming issues

- `Seetings.jsx` appears misspelled
- `ErorPage1.jsx` appears misspelled
- `BancAccountsTables` migration name contains a typo
- `NetServer.DAta1` uses inconsistent casing/spelling

## Recommended Next Step

If you want deeper documentation than this, the next useful move is to split the material into separate files:

1. `docs/frontend.md`
2. `docs/backend-api.md`
3. `docs/data-layer.md`
4. `docs/tests.md`

That would allow true block-by-block commentary on the largest files without making one file too large to maintain.
