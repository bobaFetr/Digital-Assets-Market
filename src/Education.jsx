import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import Sidebar from "./Components/Sidebar";

function Education() {
    const customModules = [
        {
            id: 1,
            title: "What is Blockchain?",
            description: "Learn the fundamentals of distributed ledger technology.",
            link: "#"
        },
        {
            id: 2,
            title: "How to Secure Your Wallet",
            description: "Best practices for keeping your private keys safe.",
            link: "#"
        },
        {
            id: 3,
            title: "Understanding Rug Pulls",
            description: "Learn how to spot and avoid scam projects in DeFi.",
            link: "/rug-pull"
        }
    ];

    return (
        <div className="crypto-layout">
            <Sidebar />
            <div className="crypto-main">
                <h1 style={{ marginBottom: '20px' }}>Crypto Education</h1>
                <p style={{ color: '#aaa', marginBottom: '30px' }}>Master the market with our educational resources.</p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {customModules.map(module => (
                        <div key={module.id} style={{
                            background: '#1a1d2e',
                            padding: '25px',
                            borderRadius: '12px',
                            border: '1px solid #22283a',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <h3 style={{ marginBottom: '10px' }}>{module.title}</h3>
                                <p style={{ color: '#aaa', marginBottom: '20px' }}>{module.description}</p>
                            </div>
                            <Link to={module.link} style={{
                                display: 'inline-block',
                                marginTop: 'auto',
                                color: '#7f8cff',
                                textDecoration: 'none',
                                fontWeight: 'bold'
                            }}>
                                Start Topic →
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Education;
