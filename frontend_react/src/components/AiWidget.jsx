
import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, ArrowUpToLine, Zap, Bell, Send } from 'lucide-react';
import './AiWidget.css';

const CHAT_API = 'http://localhost:5000/api/chat';

const AiWidget = () => {
    const [messages, setMessages] = useState([
        { type: 'system', text: '> A.R.E.S. AI Assistant Online — DeepSeek R1 Ready' }
    ]);
    const [history, setHistory] = useState([]); // Ollama-format conversation history
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const msgEndRef = useRef(null);
    const abortRef = useRef(null);

    const scrollToBottom = () => {
        msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const sendToOllama = async (userText) => {
        // Add user message to display
        setMessages(prev => [...prev, { type: 'user', text: userText }]);

        // Add a placeholder for the AI response
        setMessages(prev => [...prev, { type: 'ai', text: '', isStreaming: true }]);
        setIsGenerating(true);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const response = await fetch(CHAT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText, history }),
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value, { stream: true });
                const lines = text.split('\n').filter(line => line.startsWith('data: '));

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line.slice(6));

                        if (data.error) {
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    type: 'ai',
                                    text: `> Error: ${data.error}`,
                                    isStreaming: false
                                };
                                return updated;
                            });
                            setIsGenerating(false);
                            return;
                        }

                        if (data.done) {
                            // Finalize the message
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    ...updated[updated.length - 1],
                                    isStreaming: false
                                };
                                return updated;
                            });

                            // Update conversation history for multi-turn
                            setHistory(prev => [
                                ...prev,
                                { role: 'user', content: userText },
                                { role: 'assistant', content: aiResponse }
                            ]);
                            break;
                        }

                        if (data.token) {
                            aiResponse += data.token;
                            const currentResponse = aiResponse;
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    type: 'ai',
                                    text: currentResponse,
                                    isStreaming: true
                                };
                                return updated;
                            });
                        }
                    } catch (parseErr) {
                        // Skip malformed SSE lines
                    }
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setMessages(prev => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (updated[lastIdx]?.isStreaming) {
                        updated[lastIdx] = {
                            type: 'ai',
                            text: '> AI ENGINE OFFLINE — Start backend with: python app.py',
                            isStreaming: false
                        };
                    } else {
                        updated.push({
                            type: 'ai',
                            text: '> AI ENGINE OFFLINE — Start backend with: python app.py',
                            isStreaming: false
                        });
                    }
                    return updated;
                });
            }
        } finally {
            setIsGenerating(false);
            abortRef.current = null;
        }
    };

    const handleSend = () => {
        if (!input.trim() || isGenerating) return;
        const userText = input.trim();
        setInput('');
        sendToOllama(userText);
    };

    const handleQuickAction = (action) => {
        if (isGenerating) return;
        const actionMap = {
            report: "Generate a brief environment status report from current telemetry",
            readings: "Show the latest sensor readings and flag anything unusual",
            anomaly: "Analyze current data for anomalies or safety risks",
            alert: "Summarize any active alerts or warning conditions"
        };
        sendToOllama(actionMap[action]);
    };

    return (
        <div className="ai-widget glass">
            <div className="ai-header">
                <span className="ai-label">A.R.E.S. AI Assistant</span>
                <h3>DeepSeek R1 — Mission Control</h3>
            </div>

            <div className="quick-actions">
                <button className="action-btn" onClick={() => handleQuickAction('report')} disabled={isGenerating}>
                    <BarChart3 size={18} /> Env Report
                </button>
                <button className="action-btn highlight" onClick={() => handleQuickAction('readings')} disabled={isGenerating}>
                    <ArrowUpToLine size={18} /> Top Readings
                </button>
                <button className="action-btn" onClick={() => handleQuickAction('anomaly')} disabled={isGenerating}>
                    <Zap size={18} /> Anomalies
                </button>
                <button className="action-btn" onClick={() => handleQuickAction('alert')} disabled={isGenerating}>
                    <Bell size={18} /> Alerts
                </button>
            </div>

            <div className="chat-interface">
                <div className="chat-log glass-inset">
                    {messages.map((msg, i) => (
                        <div key={i} className={`msg ${msg.type}`}>
                            {msg.text}
                            {msg.isStreaming && <span className="typing-cursor">▌</span>}
                        </div>
                    ))}
                    {isGenerating && messages[messages.length - 1]?.text === '' && (
                        <div className="thinking-indicator">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="thinking-text">Thinking...</span>
                        </div>
                    )}
                    <div ref={msgEndRef} />
                </div>

                <div className="chat-input-area glass-inset">
                    <input
                        type="text"
                        placeholder={isGenerating ? "Generating response..." : "Ask A.R.E.S. AI..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isGenerating}
                    />
                    <button
                        className={`send-btn ${isGenerating ? 'disabled' : ''}`}
                        onClick={handleSend}
                        disabled={isGenerating}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiWidget;
