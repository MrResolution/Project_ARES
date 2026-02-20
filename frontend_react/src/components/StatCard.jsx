import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './StatCard.css';

const StatCard = ({ title, value, unit, trend, trendValue, icon, status }) => {
    const renderTrendIcon = () => {
        if (trend === 'up') return <TrendingUp size={14} />;
        if (trend === 'down') return <TrendingDown size={14} />;
        return <Minus size={14} />;
    };

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
                        <span className="trend-arrow">{renderTrendIcon()}</span>
                        <span className="trend-value">{trendValue}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
