import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import "./App.css";

const topics = [
  {
    title: "Blockchain basics",
    description: "How distributed transaction records are organized and verified.",
    to: "/education/what-is-blockchain",
  },
  {
    title: "Wallet security",
    description: "Practical precautions for passwords, recovery phrases, and account access.",
    to: "/education/how-to-secure-your-wallet",
  },
  {
    title: "Rug pulls",
    description: "Common warning signs in fraudulent token and liquidity projects.",
    to: "/rug-pull",
  },
];

export default function Education() {
  return (
    <div className="crypto-layout">
      <Sidebar />
      <main className="crypto-main">
        <header className="page-header">
          <h1>Education</h1>
          <p>Short reference articles about digital assets and account safety.</p>
        </header>
        <div className="article-index">
          {topics.map((topic) => (
            <article className="article-index-item" key={topic.to}>
              <h2>{topic.title}</h2>
              <p>{topic.description}</p>
              <Link to={topic.to}>Read article</Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
