import React from 'react';
import { NavLink } from 'react-router-dom';
import { Satellite, Calendar, AlertTriangle, Search } from 'lucide-react';
import './TopNav.css';

const TopNav = ({ systemStatus }) => {
    const currentDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <nav className="top-nav glass">
            <div className="nav-left">
                <div className="logo">
                    <span className="logo-icon"><Satellite size={24} color="#e87b35" /></span>
                    <h1>A.R.E.S.</h1>
                </div>
                <ul className="nav-links">
                    <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink></li>
                    <li><NavLink to="/visuals" className={({ isActive }) => isActive ? "active" : ""}>Live Visuals</NavLink></li>
                    <li><NavLink to="/controls" className={({ isActive }) => isActive ? "active" : ""}>Controls</NavLink></li>
                    <li><NavLink to="/assistant" className={({ isActive }) => isActive ? "active" : ""}>AI Assistant</NavLink></li>
                </ul>
            </div>
            <div className="nav-right">
                <div className="nav-date glass-item">
                    <span className="icon"><Calendar size={16} /></span>
                    <span>{currentDate}</span>
                </div>
                <div className="status-badge glass-item">
                    <span className={`status-dot ${systemStatus === 'ONLINE' ? 'online' : 'offline'}`}></span>
                    <span>SYSTEM {systemStatus}</span>
                </div>
                <button className="btn-action btn-danger glass-btn">
                    <AlertTriangle size={16} style={{ marginRight: '6px' }} /> STOP
                </button>
                <button className="btn-action btn-primary glass-btn">
                    <Search size={16} style={{ marginRight: '6px' }} /> SCAN
                </button>
            </div>
        </nav>
    );
};

export default TopNav;
