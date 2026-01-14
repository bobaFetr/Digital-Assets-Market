import React from 'react';
import './App.css';

function Posts() {
    const posts = [
        {
            id: 1,
            user: "CryptoKing",
            content: "Just bought the dip! Who else is accumulating right now? #BTC #HODL",
            likes: 124,
            comments: 45
        },
        {
            id: 2,
            user: "DeFi_Wizard",
            content: "Yield farming on the new protocol is insane. 500% APY but risky. DYOR.",
            likes: 89,
            comments: 12
        },
        {
            id: 3,
            user: "AliceInChains",
            content: "Can someone explain what a 'Rug Pull' is? I keep hearing about it.",
            likes: 56,
            comments: 34
        }
    ];

    return (
        <div className="crypto-layout">
            <div className="crypto-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1>Community Posts</h1>
                    <button style={{
                        padding: '10px 20px',
                        background: '#7f8cff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}>Create Post</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
                    {posts.map(post => (
                        <div key={post.id} style={{
                            background: '#1a1d2e',
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid #22283a'
                        }}>
                            <div style={{ fontWeight: 'bold', color: '#7f8cff', marginBottom: '8px' }}>@{post.user}</div>
                            <p style={{ marginBottom: '15px' }}>{post.content}</p>
                            <div style={{ display: 'flex', gap: '20px', color: '#aaa', fontSize: '0.9rem' }}>
                                <span>👍 {post.likes}</span>
                                <span>💬 {post.comments}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Posts;
