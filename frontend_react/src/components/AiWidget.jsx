
import React, { useState, useRef, useEffect } from 'react';
import './AiWidget.css';

const AiWidget = () => {
    const [messages, setMessages] = useState([
        { type: 'system', text: '> Awaiting Telemetry Data...' }
    ]);
    const [input, setInput] = useState('');
    const msgEndRef = useRef(null);

    const scrollToBottom = () => {
        msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const addMessage = (text, type = 'user') => {
        setMessages(prev => [...prev, { type, text }]);

        if (type === 'user') {
            (async () => {
                try {
                    const response = await fetch('http://localhost:5000/api/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: text })
                    });
                    const data = await response.json();
                    setMessages(prev => [...prev, { type: 'ai', text: `> ${JSON.stringify(data)}` }]);
                } catch (e) {
                    setMessages(prev => [...prev, { type: 'ai', text: `> AI ENGINE OFFLINE — Connect backend for live analysis` }]);
                }
            })();
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        addMessage(input);
        setInput('');
    };

    const handleQuickAction = (action) => {
        const actionMap = {
            report: "Generate environment report",
            readings: "Show top readings",
            anomaly: "Check for anomalies",
            alert: "Summarize alerts"
        };
        addMessage(actionMap[action]);
    };

    return (
        <div className="ai-widget glass">
            <div className="ai-header">
                <span className="ai-label">Hi Commander</span>
                <h3>Can I help you?</h3>
            </div>

            <div className="quick-actions">
                <button className="action-btn" onClick={() => handleQuickAction('report')}>
                    📊 Env Report
                </button>
                <button className="action-btn highlight" onClick={() => handleQuickAction('readings')}>
                    🔝 Top Readings
                </button>
                <button className="action-btn" onClick={() => handleQuickAction('anomaly')}>
                    ⚡ Anomalies
                </button>
                <button className="action-btn" onClick={() => handleQuickAction('alert')}>
                    🔔 Alerts
                </button>
            </div>

            <div className="chat-interface">
                <div className="chat-log glass-inset">
                    {messages.map((msg, i) => (
                        <div key={i} className={`msg ${msg.type}`}>
                            {msg.text}
                        </div>
                    ))}
                    <div ref={msgEndRef} />
                </div>

                <div className="chat-input-area glass-inset">
                    <input
                        type="text"
                        placeholder="Ask AI..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="send-btn" onClick={handleSend}>➤</button>
                </div>
            </div>
        </div>
    );
};

export default AiWidget;
