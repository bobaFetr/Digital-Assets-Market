// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
//svalqme pakeite
// EntityFrameworkCore 
// EntityFrameworkCore.Design
//  EntityFrameworkCore.SqlServer
//  EntityFrameworkCore.identityFramework.Core
//  make flder extensions
//  ServiceCollecitonsExtesions.cs
//  DotNetSeeding.Extensions namespace
//  claas
//Database Seeding
//public IServiceCollection AddDataBase ()
//injection
//the slaas must be static, we cannot have dependency injection in static classes
//  
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import React, { useState, useMemo, useEffect } from "react";
import "./App.css";

// -- Mock data --
const CATEGORIES = [
  { id: "nft", name: "NFTs", icon: "🖼️" },
  { id: "music", name: "Music", icon: "🎵" },
  { id: "domains", name: "Domains", icon: "🌐" },
  { id: "metaverse", name: "Metaverse", icon: "🕶️" },
];

const FEATURED = [
  {
    id: "asset-1",
    title: "Genesis Ape #001",
    creator: "ApeStudio",
    price: 12.5,
    change: 8.3,
    img: "https://picsum.photos/seed/ape/400/300",
  },
  {
    id: "asset-2",
    title: "Synthwave Beat",
    creator: "NeonSound",
    price: 3.2,
    change: -2.4,
    img: "https://picsum.photos/seed/music/400/300",
  },
  {
    id: "asset-3",
    title: "SkyDomain.eth",
    creator: "DomainLab",
    price: 42,
    change: 15.1,
    img: "https://picsum.photos/seed/domain/400/300",
  },
];

const TRENDING = Array.from({ length: 8 }).map((_, i) => ({
  id: `t-${i}`,
  name: `Asset ${i + 1}`,
  type: ["NFT", "Music", "Domain", "Metaverse"][i % 4],
  price: (Math.random() * 100).toFixed(2),
  change: (Math.random() * 20 - 10).toFixed(2),
}));

function Header() {
  return (
    <header className="da-header">
      <div className="da-brand">
        <div className="da-logo">DA</div>
        <div>
          <h1 className="da-title">DigitalAssets</h1>
          <p className="da-subtitle">Discover, trade & showcase digital collectibles</p>
        </div>
      </div>

      <div className="da-actions">
        <button className="da-btn da-btn-outlined">Connect Wallet</button>
        <button className="da-btn da-btn-primary">Create</button>
      </div>
    </header>
  );
}

function SearchBar({ query, setQuery }) {
  return (
    <div className="da-search">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search assets, creators or collections..."
        className="da-input"
      />
    </div>
  );
}

function StatsCard({ title, value, delta }) {
  return (
    <div className="da-card">
      <div className="da-card-title">{title}</div>
      <div className="da-card-row">
        <div className="da-metric">{value}</div>
        <div className={`da-delta ${delta >= 0 ? "pos" : "neg"}`}>
          {delta >= 0 ? `+${delta}%` : `${delta}%`}
        </div>
      </div>
    </div>
  );
}

function AssetCard({ asset }) {
  return (
    <div className="da-asset">
      <img src={asset.img} alt={asset.title} className="da-asset-img" />
      <div className="da-asset-body">
        <div className="da-asset-top">
          <div>
            <h3 className="da-asset-title">{asset.title}</h3>
            <p className="da-asset-creator">{asset.creator}</p>
          </div>
          <div className="da-asset-price">
            <div className="da-asset-value">{asset.price} ETH</div>
            <div className={`da-asset-change ${asset.change >= 0 ? "pos" : "neg"}`}>
              {asset.change}%
            </div>
          </div>
        </div>
        <div className="da-asset-actions">
          <button className="da-btn da-btn-primary da-btn-sm">Buy</button>
          <button className="da-btn da-btn-outlined da-btn-sm">Bid</button>
        </div>
      </div>
    </div>
  );
}

function TrendingTable({ items }) {
  return (
    <div className="da-card">
      <div className="da-card-header">
        <h3 className="da-card-heading">Trending</h3>
        <div className="da-muted">Last 24h</div>
      </div>

      <div className="da-list">
        {items.map((it) => (
          <div key={it.id} className="da-list-row">
            <div className="da-list-left">
              <div className="da-avatar">{it.name[0]}</div>
              <div>
                <div className="da-item-title">{it.name}</div>
                <div className="da-item-subtitle">{it.type}</div>
              </div>
            </div>
            <div className="da-list-right">
              <div className="da-item-price">${it.price}</div>
              <div className={`da-item-change ${it.change >= 0 ? "pos" : "neg"}`}>
                {it.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  // API state
  const [btcPrice, setBtcPrice] = useState(null);
  const [btcHistory, setBtcHistory] = useState([]);
  const [btcOrders, setBtcOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch from Node server
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, hRes, oRes] = await Promise.all([
          fetch("http://localhost:3001/api/bitcoin"),
          fetch("http://localhost:3001/api/bitcoin/history"),
          fetch("http://localhost:3001/api/bitcoin/orders"),
        ]);

        const [p, h, o] = await Promise.all([pRes.json(), hRes.json(), oRes.json()]);
        setBtcPrice(p.price);
        setBtcHistory(h);
        setBtcOrders(o);
      } catch (err) {
        console.error("API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const filteredFeatured = useMemo(() => {
    if (!query && !activeCategory) return FEATURED;
    return FEATURED.filter((f) => {
      const matchesQuery = [f.title, f.creator].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesCategory = activeCategory
        ? f.id.includes(activeCategory) || f.title.toLowerCase().includes(activeCategory)
        : true;
      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory]);

  return (
    <div className="da-page">
      <div className="da-container">
        <Header />

        <main className="da-grid">
          {/* Left column */}
          <section className="da-left">
            <div className="da-toolbar">
              <div className="da-toolbar-search">
                <SearchBar query={query} setQuery={setQuery} />
              </div>
              <div className="da-toolbar-right">
                <div className="da-muted">BTC Price</div>
                <div className="da-strong">
                  {btcPrice ? `${btcPrice} USDT` : loading ? "Loading..." : "—"}
                </div>
              </div>
            </div>

            <div className="da-stats">
              <StatsCard title="Total Volume" value="$12.4M" delta={4.2} />
              <StatsCard title="Active Traders" value="4,321" delta={2.1} />
              <StatsCard title="New Listings" value="128" delta={-1.2} />
            </div>

            <section className="da-section">
              <div className="da-section-header">
                <h2 className="da-section-title">Featured</h2>
                <div className="da-section-actions">
                  <div className="da-muted hide-sm">Curated picks from creators</div>
                  <button className="da-btn da-btn-sm da-btn-primary">See all</button>
                </div>
              </div>

              <div className="da-cards">
                {filteredFeatured.map((f) => (
                  <AssetCard key={f.id} asset={f} />
                ))}
              </div>
            </section>

            <section className="da-section">
              <TrendingTable items={TRENDING} />
            </section>

            {/* BTC History */}
            <section className="da-section">
              <div className="da-card">
                <div className="da-card-header">
                  <h3 className="da-card-heading">BTC History (last 60m)</h3>
                </div>
                <div className="da-card-body">
                  {loading && btcHistory.length === 0 ? (
                    <p>Loading...</p>
                  ) : (
                    <ul>
                      {btcHistory.map((h, i) => (
                        <li key={i}>
                          {new Date(h.time).toLocaleTimeString()} — {h.price} USDT
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>

            {/* BTC Order Book */}
            <section className="da-section">
              <div className="da-card">
                <div className="da-card-header">
                  <h3 className="da-card-heading">BTC Order Book</h3>
                </div>
                <div className="da-card-body">
                  {btcOrders ? (
                    <div className="da-orders">
                      <h4>Bids</h4>
                      <ul>
                        {btcOrders.bids.map((bid, i) => (
                          <li key={i}>{bid[0]} USDT — {bid[1]} BTC</li>
                        ))}
                      </ul>
                      <h4>Asks</h4>
                      <ul>
                        {btcOrders.asks.map((ask, i) => (
                          <li key={i}>{ask[0]} USDT — {ask[1]} BTC</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>{loading ? "Loading..." : "No data"}</p>
                  )}
                </div>
              </div>
            </section>
          </section>

          {/* Right column */}
          <aside className="da-right">
            <div className="da-sticky">
              <div className="da-card">
                <div className="da-card-body">
                  <div className="da-row">
                    <div>
                      <div className="da-muted">Your balance</div>
                      <div className="da-strong-lg">3.742 ETH</div>
                    </div>
                    <button className="da-btn da-btn-outlined da-btn-sm">Manage</button>
                  </div>

                  <div className="da-actions-grid">
                    <button className="da-btn da-btn-sm da-btn-primary">Deposit</button>
                    <button className="da-btn da-btn-sm">Withdraw</button>
                  </div>
                </div>
              </div>

              <div className="da-card">
                <div className="da-card-header">
                  <div className="da-card-heading-sm">Categories</div>
                </div>
                <div className="da-card-body">
                  <div className="da-categories">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveCategory((s) => (s === c.id ? null : c.id))}
                        className={`da-category ${activeCategory === c.id ? "active" : ""}`}
                      >
                        <div className="da-category-row">
                          <div className="da-category-left">
                            <div className="da-icon">{c.icon}</div>
                            <div>
                              <div className="da-item-title">{c.name}</div>
                              <div className="da-item-subtitle">{c.id.toUpperCase()}</div>
                            </div>
                          </div>
                          <div className="da-muted">Explore</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="da-card">
                <div className="da-card-header">
                  <div className="da-card-heading-sm">Creator Spotlight</div>
                </div>
                <div className="da-card-body">
                  <div className="da-spotlight">
                    <img
                      src="https://picsum.photos/seed/creator/80/80"
                      className="da-avatar-round"
                      alt="creator"
                    />
                    <div>
                      <div className="da-item-title">LunaCraft</div>
                      <div className="da-item-subtitle">Top seller — 24 items</div>
                    </div>
                  </div>
                  <div className="da-space-top">
                    <button className="da-btn da-btn-sm da-btn-primary">View profile</button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </main>

        <footer className="da-footer">
          © {new Date().getFullYear()} DigitalAssets — Built with React + Vite
        </footer>
      </div>
    </div>
  );
}
