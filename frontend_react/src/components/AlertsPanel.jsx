import React from 'react';
import { AlertCircle, Bell, X, Info, AlertTriangle } from 'lucide-react';
import './AlertsPanel.css';

const AlertsPanel = ({ alerts, onClear }) => {
    return (
        <div className="alerts-panel glass accent-border-red">
            <div className="panel-header">
                <div className="header-left">
                    <Bell className="header-icon-red" size={18} />
                    <h3>System Alerts</h3>
                </div>
                <button className="clear-btn" onClick={onClear} title="Clear All">
                    <X size={14} />
                    <span>Clear</span>
                </button>
            </div>

            <div className="alerts-list">
                {alerts.length === 0 ? (
                    <div className="no-alerts">
                        <Info size={16} />
                        <span>No active threats detected</span>
                    </div>
                ) : (
                    alerts.map((alert, index) => (
                        <div key={index} className={`alert-item ${alert.type}`}>
                            <div className="alert-type-icon">
                                {alert.type === 'critical' ? <AlertCircle size={14} /> : <AlertTriangle size={14} />}
                            </div>
                            <div className="alert-content">
                                <span className="alert-msg">{alert.message}</span>
                                <span className="alert-time">{alert.time}</span>
                            </div>
                        </div>
                    ))
                ).reverse()}
            </div>
        </div>
    );
};

export default AlertsPanel;
