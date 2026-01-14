import React from 'react';
import './App.css';

function RugPull() {
    return (
        <div className="crypto-layout">
            <div className="crypto-main" style={{ maxWidth: '900px' }}>
                <h1 style={{ marginBottom: '20px', color: '#ff6b6b' }}>⚠️ What is a Rug Pull?</h1>

                <div style={{ background: '#1a1d2e', padding: '30px', borderRadius: '12px', marginBottom: '20px' }}>
                    <p style={{ lineHeight: '1.6', fontSize: '1.1rem', marginBottom: '20px' }}>
                        A <strong>Rug Pull</strong> is a type of scam in the decentralized finance (DeFi) and crypto ecosystem
                        where legitimate-looking developers abandon a project and take their investors' money.
                    </p>

                    <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>How it works</h3>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.6', color: '#aaa' }}>
                        <li>Developers create a new token and list it on a decentralized exchange (DEX).</li>
                        <li>They pair it with a valuable currency like ETH or BNB to create a liquidity pool.</li>
                        <li>Once investors buy in and drive up the price, developers withdraw everything from the liquidity pool.</li>
                        <li>The token's value drops to zero instantly, leaving investors with worthless coins.</li>
                    </ul>

                    <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Red Flags to Watch For</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
                        <div style={{ background: 'rgba(255, 107, 107, 0.1)', padding: '15px', borderRadius: '8px' }}>
                            <h4 style={{ color: '#ff6b6b' }}>Unlocked Liquidity</h4>
                            <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>If liquidity is not locked for a significant period, devs can pull it out any time.</p>
                        </div>
                        <div style={{ background: 'rgba(255, 107, 107, 0.1)', padding: '15px', borderRadius: '8px' }}>
                            <h4 style={{ color: '#ff6b6b' }}>Anonymous Team</h4>
                            <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>While common in crypto, fully anon teams with no reputation are higher risk.</p>
                        </div>
                        <div style={{ background: 'rgba(255, 107, 107, 0.1)', padding: '15px', borderRadius: '8px' }}>
                            <h4 style={{ color: '#ff6b6b' }}>No Audit</h4>
                            <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>Smart contracts that haven't been audited by reputable firms may carry hidden backdoors.</p>
                        </div>
                        <div style={{ background: 'rgba(255, 107, 107, 0.1)', padding: '15px', borderRadius: '8px' }}>
                            <h4 style={{ color: '#ff6b6b' }}>Sky-High Yields</h4>
                            <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>If an APY seems too good to be true (e.g., 10,000%), it probably is.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RugPull;
