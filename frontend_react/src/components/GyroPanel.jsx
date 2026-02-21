import React from 'react';
import './GyroPanel.css';
import { Compass } from 'lucide-react';

const GyroPanel = ({ telemetry }) => {
    const gyro = {
        x: telemetry?.gx || 0,
        y: telemetry?.gy || 0,
        z: telemetry?.gz || 0
    };

    // Calculate progress (assuming a reasonable range for raw LSB, or 1000 for display)
    const getProgress = (val) => Math.min(Math.abs(val / 20), 100);

    return (
        <div className="control-panel glass accent-border-cyan">
            <div className="panel-header">
                <Compass size={20} className="header-icon-cyan" />
                <h3>Bot Gyroscope</h3>
            </div>

            <div className="gyro-display">
                <div className="gyro-axis">
                    <span className="axis-label">G-X (PITCH)</span>
                    <div className="axis-value-container">
                        <span className="axis-value">{gyro.x}</span>
                        <span className="axis-unit">lsb</span>
                    </div>
                    <div className="axis-progress-bg">
                        <div className="axis-progress" style={{ width: `${getProgress(gyro.x)}%`, background: '#00bcd4' }}></div>
                    </div>
                </div>

                <div className="gyro-axis">
                    <span className="axis-label">G-Y (ROLL)</span>
                    <div className="axis-value-container">
                        <span className="axis-value">{gyro.y}</span>
                        <span className="axis-unit">lsb</span>
                    </div>
                    <div className="axis-progress-bg">
                        <div className="axis-progress" style={{ width: `${getProgress(gyro.y)}%`, background: '#00e5ff' }}></div>
                    </div>
                </div>

                <div className="gyro-axis">
                    <span className="axis-label">G-Z (YAW)</span>
                    <div className="axis-value-container">
                        <span className="axis-value">{gyro.z}</span>
                        <span className="axis-unit">lsb</span>
                    </div>
                    <div className="axis-progress-bg">
                        <div className="axis-progress" style={{ width: `${getProgress(gyro.z)}%`, background: '#18ffff' }}></div>
                    </div>
                </div>
            </div>

            <div className="gyro-footer">
                <span className="live-tag">● ROTATIONAL STATUS</span>
                <span className="timestamp">{telemetry?.timestamp ? new Date(telemetry.timestamp).toLocaleTimeString() : '--:--:--'}</span>
            </div>
        </div>
    );
};

export default GyroPanel;
