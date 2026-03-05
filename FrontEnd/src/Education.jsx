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
            link: "/education/what-is-blockchain"
        },
        {
            id: 2,
            title: "How to Secure Your Wallet",
            description: "Best practices for keeping your private keys safe.",
            link: "/education/how-to-secure-your-wallet"
        },
        {
            id: 3,
            title: "Understanding Rug Pulls",
            description: "Learn how to spot and avoid scam projects in DeFi.",
            link: "/rug-pull"
        }
    ];

    const youtubeVideos = [
        {
            id: 1,
            title: "What is Blockchain? (Beginner Friendly)",
            embedUrl: "https://www.youtube.com/embed/SSo_EIwHSd4"
        },
        {
            id: 2,
            title: "Crypto Wallets Explained",
            embedUrl: "https://www.youtube.com/embed/d8IBpfs9bf4"
        },
        {
            id: 3,
            title: "How to Avoid Crypto Scams",
            embedUrl: "https://www.youtube.com/embed/Mfk4A8q7Qmk"
        }
    ];

    return (
        <div className="crypto-layout">
            <Sidebar />
            <div className="crypto-main">
                <h1 style={{ marginBottom: '20px' }}>Crypto Education</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Master the market with our educational resources.</p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {customModules.map(module => (
                        <div key={module.id} style={{
                            background: 'var(--card-bg)',
                            padding: '25px',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <h3 style={{ marginBottom: '10px' }}>{module.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{module.description}</p>
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

                <h2 style={{ marginTop: '40px', marginBottom: '16px' }}>YouTube Videos</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Watch quick lessons to improve your crypto knowledge.</p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '20px'
                }}>
                    {youtubeVideos.map(video => (
                        <div key={video.id} style={{
                            background: 'var(--card-bg)',
                            padding: '18px',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <h3 style={{ marginBottom: '12px' }}>{video.title}</h3>
                            <div style={{
                                position: 'relative',
                                paddingBottom: '56.25%',
                                height: 0,
                                overflow: 'hidden',
                                borderRadius: '10px'
                            }}>
                                <iframe
                                    src={video.embedUrl}
                                    title={video.title}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        border: 0
                                    }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Education;
