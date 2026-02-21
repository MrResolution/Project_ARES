import React from 'react';
import './Controls.css';
import { Activity } from 'lucide-react';

const Controls = ({ telemetry }) => {
    const accel = {
        x: telemetry?.ax || 0,
        y: telemetry?.ay || 0,
        z: telemetry?.az || 0
    };

    return (
        <div className="control-panel glass accent-border">
            <div className="panel-header">
                <Activity size={20} className="header-icon" />
                <h3>Bot Accelerometer</h3>
            </div>

            <div className="accel-display">
                <div className="accel-axis">
                    <span className="axis-label">X-AXIS</span>
                    <div className="axis-value-container">
                        <span className="axis-value">{accel.x}</span>
                        <span className="axis-unit">mg</span>
                    </div>
                    <div className="axis-progress-bg">
                        <div className="axis-progress" style={{ width: `${Math.min(Math.abs(accel.x / 16.384), 100)}%`, background: 'var(--accent-primary)' }}></div>
                    </div>
                </div>

                <div className="accel-axis">
                    <span className="axis-label">Y-AXIS</span>
                    <div className="axis-value-container">
                        <span className="axis-value">{accel.y}</span>
                        <span className="axis-unit">mg</span>
                    </div>
                    <div className="axis-progress-bg">
                        <div className="axis-progress" style={{ width: `${Math.min(Math.abs(accel.y / 16.384), 100)}%`, background: '#4caf50' }}></div>
                    </div>
                </div>

                <div className="accel-axis">
                    <span className="axis-label">Z-AXIS</span>
                    <div className="axis-value-container">
                        <span className="axis-value">{accel.z}</span>
                        <span className="axis-unit">mg</span>
                    </div>
                    <div className="axis-progress-bg">
                        <div className="axis-progress" style={{ width: `${Math.min(Math.abs(accel.z / 16.384), 100)}%`, background: '#2196f3' }}></div>
                    </div>
                </div>
            </div>

            <div className="accel-footer">
                <span className="live-tag">● REAL-TIME DATA</span>
                <span className="timestamp">{telemetry?.timestamp ? new Date(telemetry.timestamp).toLocaleTimeString() : '--:--:--'}</span>
            </div>
        </div>
    );
};

export default Controls;
