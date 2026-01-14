import React, { useState } from 'react';
import './App.css';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{
            borderBottom: '1px solid #22283a',
            marginBottom: '10px',
            background: isOpen ? '#1a1d2e' : 'transparent',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
        }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 'bold'
                }}
            >
                <span>{question}</span>
                <span style={{ fontSize: '1.2rem', color: '#7f8cff' }}>{isOpen ? '-' : '+'}</span>
            </div>
            {isOpen && (
                <div style={{ padding: '0 20px 20px', color: '#aaa', lineHeight: '1.6' }}>
                    {answer}
                </div>
            )}
        </div>
    );
};

function FAQ() {
    const faqs = [
        {
            question: "How do I deposit funds?",
            answer: "Go to the wallet section, click on 'Deposit', choose your asset and follow the instructions to transfer to the provided address."
        },
        {
            question: "Is my data secure?",
            answer: "Yes, we use industry-standard encryption and security measures to protect your personal information and assets."
        },
        {
            question: "What are the trading fees?",
            answer: "We charge a flat 0.1% fee on all trades. There are no deposit fees, but standard network fees apply for withdrawals."
        },
        {
            question: "Can I use this platform globally?",
            answer: "Our services are available in most countries, with the exception of sanctioned regions. Please check our terms of service for the full list."
        },
        {
            question: "How do I contact support?",
            answer: "You can reach our support team 24/7 via the Chat page or by emailing support@cryptomatrix.com."
        }
    ];

    return (
        <div className="crypto-layout">
            <Sidebar />
            <div className="crypto-main">
                <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Frequently Asked Questions</h1>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FAQ;
