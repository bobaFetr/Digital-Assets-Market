# Simulation Platform With Real Market Data

## Purpose

This document describes how to evolve the current project into a **paper-trading / simulation platform** that uses **real market data from Binance** while keeping:

- user balances local to this application
- order execution simulated inside this application
- portfolio, PnL, fills, and history local to this application

This is **not** a plan for real order routing to Binance.

## Goal

The target user experience is:

- charts reflect the real market
- order-book view reflects the real market
- prices move in real time
- users can place buy and sell orders
- those orders affect only the user's simulated account
- the external market itself does not change because of user actions

In short:

- **Binance = market truth**
- **this app = paper trading account**

## Why This Fits The Product

The current project already behaves like a local exchange simulator:

- local order placement and matching in `BackEnd/MyWebApi/Controllers/OrdersController.cs`
- local trade records in `BackEnd/MyWebApi/Controllers/TradesController.cs`
- local order book in `BackEnd/MyWebApi/Controllers/OrderBookController.cs`
- local wallet ledger in `BackEnd/MyWebApi/Controllers/WalletsController.cs`
- frontend trading UI in `FrontEnd/src/BuyAndSell.jsx`

That means the easiest and cleanest evolution is:

1. replace fake/internal market data with real Binance market data
2. keep the account, balances, and trade simulation local
3. execute orders against a simulated engine using the latest external market state

## Product Model

There are two separate data domains.

### 1. Real Market Data

This comes from Binance and should power:

- current market price
- candles / chart series
- ticker change cards
- best bid / best ask
- visible order book depth
- market reference price for PnL

### 2. Simulation Data

This stays inside this app and should power:

- wallet balances
- order history
- open paper orders
- fills / paper trades
- transaction history
- realized and unrealized PnL
- portfolio valuation

Important rule:

- a simulated user trade does **not** move the Binance chart
- it only changes the local simulated account state

## Recommended Architecture

### Market Data Layer

Add a dedicated backend market-data integration layer that:

- connects to Binance public market data feeds
- normalizes Binance symbols into the app's symbol model
- keeps recent market state in memory
- optionally persists limited historical snapshots for charts and audit/debugging

Use Binance **public** market data only.

Good sources:

- WebSocket market streams
- REST metadata like exchange info and filters

### Paper Execution Layer

Replace the current local user-vs-user matching model with a paper execution engine that:

- accepts user orders
- validates them against external symbol rules
- simulates fills against real market state
- writes the resulting paper orders and paper trades to the local database
- updates the local wallet ledger

### Portfolio Layer

Keep the current local portfolio model:

- local wallets remain the source of truth for simulation
- local orders remain the source of truth for paper orders
- local trades remain the source of truth for paper fills

### Backend API Layer

Frontend should continue talking only to the backend.

Do **not** make the browser depend directly on Binance for core trading features.

Benefits:

- one integration point
- centralized caching
- centralized reconnect logic
- easier rate-limit handling
- safer future evolution
- frontend stays independent from Binance-specific payloads

## Binance Data To Use

For this project, the most useful Binance inputs are:

- live trade stream
- live depth stream
- candlestick stream
- exchange symbol metadata and filters

These support:

- real chart movement
- real order-book display
- realistic market and limit simulation
- correct quantity/price validation

## Current Project Mapping

### Current Files That Can Stay Conceptually

- `BackEnd/MyWebApi/Controllers/WalletsController.cs`
- `BackEnd/MyWebApi/Controllers/TradesController.cs`
- `BackEnd/MyWebApi/Controllers/TransactionsController.cs`
- `FrontEnd/src/BuyAndSell.jsx`

These still make sense in a paper trading platform because the portfolio remains local.

### Current Files That Should Change Conceptually

- `BackEnd/MyWebApi/Controllers/OrdersController.cs`
- `BackEnd/MyWebApi/Controllers/OrderBookController.cs`
- `BackEnd/MyWebApi/Services/SimulatedPriceFeedService.cs`
- `FrontEnd/src/BitcoinChart.jsx`
- `BackEnd/MyWebApi/Controllers/ExternalController.cs`

Reasons:

- `OrdersController` currently matches against the app's own DB order book
- `OrderBookController` currently exposes internal order-book rows as if they were market depth
- `SimulatedPriceFeedService` creates synthetic data, which becomes unnecessary
- `BitcoinChart.jsx` currently falls back to internal trades/order-book data
- `ExternalController` currently proxies CoinGecko only

## Execution Model

### Market Orders

For a market order:

- read the latest external order-book snapshot
- use the opposite side of the book
- walk through the levels until the requested quantity is filled
- compute average execution price
- compute slippage
- record one or more simulated fills locally
- update the local wallet balances

Example:

- user places a market buy for `0.50 BTC`
- engine reads asks from the Binance-derived depth snapshot
- engine consumes enough ask liquidity to fill `0.50 BTC`
- user gets a local paper fill at the calculated average price
- local USD wallet decreases, local BTC wallet increases

### Limit Orders

For a limit order:

- store it locally as an open paper order
- do not send it anywhere externally
- watch market data updates
- fill it only when the external market reaches the user's price

Example:

- buy limit at `BTCUSD = 60000`
- order remains open while best ask is above `60000`
- when best ask reaches or crosses `60000`, simulate a fill

### Partial Fills

Support partial fills when:

- available size at executable price levels is less than requested quantity
- the market touches a limit order but not enough external size is available in the current simulation model

### Fees

Fees should remain local and simulated.

Use the app's own fee table rules, not Binance account commissions.

### Cancellation

Cancellation stays fully local:

- cancel the paper order
- release reserved local balance
- do not call external trading APIs

## Validation Rules

The current app hardcodes allowed symbols in `OrdersController`.

For a market-data-driven simulation platform, validation should eventually come from external symbol metadata:

- supported symbols
- price tick size
- quantity step size
- minimum notional
- minimum and maximum quantity

This prevents the simulation from accepting unrealistic orders that would never pass on a real market.

## Recommended Data Model Direction

The current entities are already close to what a paper platform needs.

### Keep

- `WalletTable`
- `OrdersTable`
- `TradesTable`
- `ExchangeTransaction`

### Reinterpret

- `OrderBook`

Instead of being treated as the platform's own liquidity source, it should become either:

- a cached external market snapshot table, or
- an API projection from an in-memory market cache

### Add Later If Needed

Potential future structures:

- market snapshot cache
- candle cache
- symbol metadata cache
- per-order execution details
- PnL / position snapshots

## Frontend Behavior

### Buy / Sell Screen

`FrontEnd/src/BuyAndSell.jsx` should eventually show:

- real market chart
- real market order book
- simulated available balance
- simulated open orders
- simulated fill results

### Chart

The chart should use Binance-derived real data.

User actions should appear as overlays, not as market movement.

Recommended UI additions:

- marker for paper buy fill
- marker for paper sell fill
- horizontal line for open limit order
- portfolio value / PnL badge

### Order Book

The order book panel should show real market depth from Binance, clearly labeled as market depth.

### Portfolio

Portfolio widgets should use:

- local balances
- local fills
- current Binance market price for valuation

## Proposed Backend Responsibilities

### Market Data Service

Responsibilities:

- subscribe to Binance public streams
- normalize symbols
- maintain latest ticker, depth, and candle state
- expose safe cached access to controllers/services

### Paper Trading Service

Responsibilities:

- validate an incoming user order
- reserve local balance
- simulate fills
- update local orders and trades
- release local balance on cancellation

### Market Data Controller Or Endpoints

Responsibilities:

- provide frontend-ready market data
- expose ticker/depth/candle endpoints from cached Binance data

## Phased Rollout Plan

### Phase 1. Real Charts And Prices

Replace synthetic/internal chart sourcing with Binance market data.

Target outcome:

- chart moves with the real market
- ticker cards reflect real market changes

### Phase 2. Real Order Book Display

Replace internal order-book display with Binance-derived depth display.

Target outcome:

- order-book panel reflects real market depth
- market liquidity view becomes believable

### Phase 3. Paper Execution Engine

Stop using the internal order-book table as the matching source.

Target outcome:

- market orders fill against external depth snapshots
- limit orders rest locally and trigger from external prices

### Phase 4. Portfolio And PnL

Compute account value using real market prices.

Target outcome:

- user sees realistic unrealized PnL
- dashboard reflects real current market valuation

### Phase 5. UX Improvements

Add simulation-specific UX.

Examples:

- chart trade markers
- open order annotations
- execution slippage display
- paper-trading badges and disclaimers

## Risks And Design Notes

### 1. User Expectations

If the platform uses real data but fake execution, that must be clear in the UI.

Recommended wording:

- "Paper Trading"
- "Simulation"
- "No real funds are traded"

### 2. Market Depth Is Snapshot-Based

A simulation engine never perfectly reproduces real exchange matching.

It should be positioned as:

- realistic
- educational
- market-referenced

Not:

- exact exchange execution

### 3. Local Balance Truth Must Stay Consistent

The moment you mix simulated local balances with real market fills, consistency matters:

- reserve funds correctly
- release them correctly
- avoid double fills
- avoid re-triggering limit orders from repeated market ticks

### 4. Rate Limits And Connection Stability

The market-data integration should be designed around:

- stream reconnects
- symbol subscription limits
- stale snapshot handling
- temporary upstream outages

### 5. Current Security Policy

The current CSP in `BackEnd/MyWebApi/Program.cs` only explicitly allows outbound frontend connectivity to self and CoinGecko.

That is another reason why the backend should be the integration point for Binance market data.

## Explicit Non-Goals

This document does **not** propose:

- sending real user orders to Binance
- storing Binance API secrets for users
- syncing real exchange balances
- becoming a broker or real exchange
- using Binance private account/trading APIs

Those belong to a separate "real brokerage integration" architecture.

## Final Recommendation

The best product direction for this repository is:

- **real Binance market data**
- **local paper orders**
- **local paper fills**
- **local simulated wallets**
- **local PnL based on real prices**

That preserves the current app's strengths while removing the least realistic part: fake market movement.

## Short Version

If this project becomes a simulation platform with real market data, then:

- Binance should define what the market looks like
- your backend should define how paper orders are filled
- your database should define what the user's simulated account looks like
- your frontend should combine both into one clear paper-trading experience
