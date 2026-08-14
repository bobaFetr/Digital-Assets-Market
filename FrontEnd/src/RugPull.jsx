import React from 'react';
import './App.css';
import Sidebar from "./Components/Sidebar";

function RugPull() {
  return (
    <div className="crypto-layout">
            <Sidebar />
            <div className="crypto-main">
                <h1>What is a Rug Pull?</h1>

                <div>
                    <p>
                        A <strong>Rug Pull</strong> is a type of scam in the decentralized finance (DeFi) and crypto ecosystem
                        where legitimate-looking developers abandon a project and take their investors' money.
                    </p>

                    <h3>How it works</h3>
                    <ul>
                        <li>Developers create a new token and list it on a decentralized exchange (DEX).</li>
                        <li>They pair it with a valuable currency like ETH or BNB to create a liquidity pool.</li>
                        <li>Once investors buy in and drive up the price, developers withdraw everything from the liquidity pool.</li>
                        <li>The token's value drops to zero instantly, leaving investors with worthless coins.</li>
                    </ul>

                    <h3>Red Flags to Watch For</h3>
                    <div>
                        <div>
                            <h4>Unlocked Liquidity</h4>
                            <p>If liquidity is not locked for a significant period, devs can pull it out any time.</p>
                        </div>
                        <div>
                            <h4>Anonymous Team</h4>
                            <p>While common in crypto, fully anon teams with no reputation are higher risk.</p>
                        </div>
                        <div>
                            <h4>No Audit</h4>
                            <p>Smart contracts that haven't been audited by reputable firms may carry hidden backdoors.</p>
                        </div>
                        <div>
                            <h4>Sky-High Yields</h4>
                            <p>If an APY seems too good to be true (e.g., 10,000%), it probably is.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>);

}

export default RugPull;
