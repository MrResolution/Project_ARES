import React, { useState } from 'react';
import { Wifi, WifiOff, Camera, Cpu, Loader2 } from 'lucide-react';
import './PingTester.css';

const API_URL = "http://localhost:5000/api";

const PingTester = () => {
    const [sensorStatus, setSensorStatus] = useState(null);
    const [cameraStatus, setCameraStatus] = useState(null);
    const [pingSensor, setPingSensor] = useState(false);
    const [pingCamera, setPingCamera] = useState(false);

    const pingDevice = async (target) => {
        const setLoading = target === 'sensor' ? setPingSensor : setPingCamera;
        const setStatus = target === 'sensor' ? setSensorStatus : setCameraStatus;

        setLoading(true);
        setStatus(null);

        const startTime = Date.now();
        let result;

        try {
            const res = await fetch(`${API_URL}/ping`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target }),
            });
            result = await res.json();
        } catch (e) {
            result = { status: 'error', error: 'Backend unreachable', latency_ms: null };
        }

        // Ensure animation plays for at least 1.5s so it doesn't flicker
        const elapsed = Date.now() - startTime;
        if (elapsed < 1500) {
            await new Promise(r => setTimeout(r, 1500 - elapsed));
        }

        setStatus(result);
        setLoading(false);
    };

    const getStatusClass = (status) => {
        if (!status) return '';
        if (status.status === 'online') return 'status-online';
        if (status.status === 'timeout') return 'status-timeout';
        return 'status-offline';
    };

    const renderLoading = () => (
        <div className="ping-loading-container">
            <div className="ping-loading-text">
                <span className="scanning-text">SCANNING</span>
                <span className="ping-dots">
                    <span className="dot dot-1">.</span>
                    <span className="dot dot-2">.</span>
                    <span className="dot dot-3">.</span>
                </span>
            </div>
            <div className="ping-loading-bar">
                <div className="loading-bar-fill"></div>
            </div>
        </div>
    );

    const renderResult = (status) => {
        if (!status) return <span className="ping-placeholder">Ready to test</span>;

        const isOnline = status.status === 'online';
        const isTimeout = status.status === 'timeout';

        return (
            <div className={`ping-result ${getStatusClass(status)}`}>
                <div className="ping-result-row">
                    <div className="ping-result-header">
                        {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
                        <span className="ping-status-label">
                            {isOnline ? 'ONLINE' : isTimeout ? 'TIMEOUT' : 'OFFLINE'}
                        </span>
                    </div>
                    {status.latency_ms !== null && (
                        <div className="ping-latency">
                            <span className="latency-value">{status.latency_ms}</span>
                            <span className="latency-unit">ms</span>
                        </div>
                    )}
                </div>
                {status.url && <span className="ping-url">{status.url}</span>}
                {status.error && <span className="ping-error">{status.error}</span>}
                {isOnline && status.http_code && (
                    <span className="ping-http-code">HTTP {status.http_code}</span>
                )}
            </div>
        );
    };

    const renderCard = (target, label, icon, ip, status, isLoading) => (
        <div className={`ping-card ${isLoading ? 'pinging' : ''} ${status ? getStatusClass(status) : ''}`}>
            <div className="ping-card-header">
                {icon}
                <span>{label}</span>
                <span className="ping-ip">{ip}</span>
            </div>
            <div className="ping-card-body">
                {isLoading ? renderLoading() : renderResult(status)}
            </div>
            <button
                className={`ping-btn ${isLoading ? 'btn-pinging' : ''}`}
                onClick={() => pingDevice(target)}
                disabled={isLoading}
            >
                {isLoading ? (
                    <><Loader2 size={14} className="spin" /> Pinging...</>
                ) : (
                    <><Wifi size={14} /> Ping {label}</>
                )}
            </button>
        </div>
    );

    return (
        <div className="ping-tester glass accent-border">
            <div className="panel-header">
                <Wifi size={20} className="header-icon" />
                <h3>Connection Tester</h3>
            </div>

            <div className="ping-grid">
                {renderCard('sensor', 'Sensor Board', <Cpu size={18} />, '10.202.253.93', sensorStatus, pingSensor)}
                {renderCard('camera', 'ESP32-CAM', <Camera size={18} />, '10.202.253.217', cameraStatus, pingCamera)}
            </div>
        </div>
    );
};

export default PingTester;
