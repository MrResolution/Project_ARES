
import React from 'react';
import './TopNav.css';

const TopNav = ({ systemStatus }) => {
    const currentDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <nav className="top-nav glass">
            <div className="nav-left">
                <div className="logo">
                    <span className="logo-icon">🛰️</span>
                    <h1>Project A.R.E.S.</h1>
                </div>
                <ul className="nav-links">
                    <li className="active"><a href="#">Dashboard</a></li>
                    <li><a href="#">Diagnostics</a></li>
                    <li><a href="#">Mission Logs</a></li>
                    <li><a href="#">Settings</a></li>
                </ul>
            </div>
            <div className="nav-right">
                <div className="nav-date glass-item">
                    <span className="icon">📅</span>
                    <span>{currentDate}</span>
                </div>
                <div className="status-badge glass-item">
                    <span className={`status-dot ${systemStatus === 'ONLINE' ? 'online' : 'offline'}`}></span>
                    <span>SYSTEM {systemStatus}</span>
                </div>
                <button className="btn-action btn-danger glass-btn">⚠ STOP</button>
                <button className="btn-action btn-primary glass-btn">🔍 SCAN</button>
            </div>
        </nav>
    );
};

export default TopNav;
