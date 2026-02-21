import React, { useState, useEffect } from 'react';
import { Power, Server, Brain, Radio, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import './ServiceManager.css';

const API_URL = "http://localhost:5000/api";

const ServiceManager = () => {
    const [services, setServices] = useState(null);
    const [starting, setStarting] = useState(false);
    const [checking, setChecking] = useState(false);

    const checkServices = async () => {
        setChecking(true);
        const start = Date.now();
        let result;
        try {
            const res = await fetch(`${API_URL}/services/status`);
            result = await res.json();
        } catch {
            result = { backend: false, ollama: false, esp32: false, object_id: false };
        }
        const elapsed = Date.now() - start;
        if (elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - elapsed));
        setServices(result);
        setChecking(false);
    };

    const startAll = async () => {
        setStarting(true);
        const start = Date.now();
        try {
            await fetch(`${API_URL}/services/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ollama: true, object_id: true }),
            });
            // Wait for services to boot
            await new Promise(r => setTimeout(r, 2000));
        } catch {
            setServices(prev => prev || { backend: false, ollama: false, esp32: false, object_id: false });
        }
        const elapsed = Date.now() - start;
        if (elapsed < 2500) await new Promise(r => setTimeout(r, 2500 - elapsed));
        await checkServices();
        setStarting(false);
    };

    useEffect(() => {
        checkServices();
    }, []);

    const StatusDot = ({ active }) => (
        active
            ? <CheckCircle size={16} className="svc-icon svc-online" />
            : <XCircle size={16} className="svc-icon svc-offline" />
    );

    const allRunning = services?.backend && services?.ollama && services?.object_id;

    return (
        <div className="service-manager glass accent-border">
            <div className="panel-header">
                <Power size={20} className="header-icon" />
                <h3>Service Manager</h3>
            </div>

            <div className="svc-list">
                <div className="svc-row">
                    <Server size={16} className="svc-row-icon" />
                    <span className="svc-name">Backend Server</span>
                    {checking
                        ? <Loader2 size={14} className="spin svc-check" />
                        : <StatusDot active={services?.backend} />
                    }
                </div>
                <div className="svc-row">
                    <Brain size={16} className="svc-row-icon" />
                    <span className="svc-name">Ollama AI</span>
                    {checking
                        ? <Loader2 size={14} className="spin svc-check" />
                        : <StatusDot active={services?.ollama} />
                    }
                </div>
                <div className="svc-row">
                    <Radio size={16} className="svc-row-icon" />
                    <span className="svc-name">ESP32 Rover</span>
                    {checking
                        ? <Loader2 size={14} className="spin svc-check" />
                        : <StatusDot active={services?.esp32} />
                    }
                </div>
                <div className="svc-row">
                    <Eye size={16} className="svc-row-icon" />
                    <span className="svc-name">Object Identification</span>
                    {checking
                        ? <Loader2 size={14} className="spin svc-check" />
                        : <StatusDot active={services?.object_id} />
                    }
                </div>
            </div>

            <div className="svc-actions">
                <button
                    className={`svc-start-btn ${starting ? 'starting' : ''} ${allRunning ? 'all-good' : ''}`}
                    onClick={startAll}
                    disabled={starting}
                >
                    {starting ? (
                        <><Loader2 size={16} className="spin" /> Starting Services...</>
                    ) : allRunning ? (
                        <><CheckCircle size={16} /> All Systems Go</>
                    ) : (
                        <><Power size={16} /> Start Services</>
                    )}
                </button>
                <button
                    className="svc-refresh-btn"
                    onClick={checkServices}
                    disabled={checking}
                >
                    {checking ? <Loader2 size={14} className="spin" /> : 'Refresh'}
                </button>
            </div>
        </div>
    );
};

export default ServiceManager;
