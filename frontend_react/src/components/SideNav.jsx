import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, AlertTriangle, Search, Shield, LayoutDashboard, Eye, Settings2, MessagesSquare, ShieldCheck } from 'lucide-react';
import './SideNav.css';

const SideNav = ({ systemStatus }) => {
    const currentDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <nav className="side-nav glass">
            <div className="nav-top">
                <div className="logo">
                    <img src="/ares_logo.png" alt="A.R.E.S. Rover" className="logo-icon" />
                    <h1>A.R.E.S.</h1>
                </div>

                <ul className="nav-links">
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/visuals" className={({ isActive }) => isActive ? "active" : ""}>
                            <Eye size={20} />
                            <span>Live Visuals</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/controls" className={({ isActive }) => isActive ? "active" : ""}>
                            <Settings2 size={20} />
                            <span>Controls</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/assistant" className={({ isActive }) => isActive ? "active" : ""}>
                            <MessagesSquare size={20} />
                            <span>AI Assistant</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}>
                            <ShieldCheck size={20} />
                            <span>System Admin</span>
                        </NavLink>
                    </li>
                </ul>
            </div>

            <div className="nav-bottom">
                <div className="status-container glass-item-v">
                    <div className="status-badge-v">
                        <span className={`status-dot ${systemStatus === 'ONLINE' ? 'online' : 'offline'}`}></span>
                        <span>SYSTEM {systemStatus}</span>
                    </div>
                    <div className="nav-date-v">
                        <Calendar size={14} />
                        <span>{currentDate}</span>
                    </div>
                </div>

                <div className="nav-actions-v">
                    <button className="btn-action-v btn-danger-v glass-btn-v">
                        <AlertTriangle size={18} />
                        <span>STOP</span>
                    </button>
                    <button className="btn-action-v btn-primary-v glass-btn-v">
                        <Search size={18} />
                        <span>SCAN</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default SideNav;
