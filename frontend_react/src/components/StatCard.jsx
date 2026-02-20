
import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, unit, trend, trendValue, icon, status }) => {
    return (
        <div className={`stat-card glass ${status || ''}`}>
            <div className="stat-header">
                <span className="stat-icon">{icon}</span>
                <h3 className="stat-title">{title}</h3>
            </div>
            <div className="stat-body">
                <div className="stat-value">
                    {value !== null ? value : '--'}
                    <span className="stat-unit">{unit}</span>
                </div>
                {trend && (
                    <div className={`stat-trend ${trend}`}>
                        <span className="trend-arrow">{trend === 'up' ? '▲' : trend === 'down' ? '▼' : '▬'}</span>
                        <span className="trend-value">{trendValue}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
