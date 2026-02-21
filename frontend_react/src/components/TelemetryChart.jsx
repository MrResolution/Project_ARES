import React, { useRef, useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';
import './TelemetryChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend
);

const TelemetryChart = ({ data, activeMetric, onMetricChange, gasProfile, pressure }) => {
    const chartRef = useRef(null);
    const [gradient, setGradient] = useState(null);

    useEffect(() => {
        if (activeMetric === 'gasRadar' || activeMetric === 'pressure') return;
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.ctx;
        const grad = ctx.createLinearGradient(0, 0, 0, 400);
        grad.addColorStop(0, 'rgba(232, 123, 53, 0.8)');
        grad.addColorStop(1, 'rgba(232, 123, 53, 0.2)');
        setGradient(grad);
    }, [activeMetric]);

    const lineData = {
        labels: data.map((_, i) => i + 1), // Dynamic label population up to 30
        datasets: [
            {
                label: 'Current',
                data: data,
                backgroundColor: 'rgba(232, 123, 53, 0.2)',
                borderColor: 'rgba(232, 123, 53, 1)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: 'rgba(232, 123, 53, 1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#e87b35',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { display: false },
                border: { display: false },
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#888', font: { family: 'Droid Sans Mono' } },
                border: { display: false },
                beginAtZero: true,
            },
        },
        animation: { duration: 500 },
    };

    const radarData = {
        labels: [
            'CO₂', 'NH₃', 'Benzene', 'Smoke',
            'Alcohol', 'NOx', 'CO', 'CH₄',
            'Sulfur', 'H₂'
        ],
        datasets: [
            {
                label: 'Est. PPM',
                data: gasProfile
                    ? [
                        gasProfile.co2 || 0,
                        gasProfile.ammonia || 0,
                        gasProfile.benzene || 0,
                        gasProfile.smoke || 0,
                        gasProfile.alcohol || 0,
                        gasProfile.nox || 0,
                        gasProfile.co || 0,
                        gasProfile.methane || 0,
                        gasProfile.sulfur || 0,
                        gasProfile.hydrogen || 0
                    ]
                    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(232, 123, 53, 0.2)',
                borderColor: 'rgba(232, 123, 53, 1)',
                pointBackgroundColor: 'rgba(232, 123, 53, 1)',
                pointBorderColor: '#fff',
                borderWidth: 2,
            },
        ],
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: { family: "'Droid Sans Mono', monospace", size: 12 },
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
                    backdropColor: 'transparent',
                    font: { family: "'Droid Sans Mono', monospace", size: 10 },
                },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { family: "'Droid Sans Mono', monospace" },
                bodyFont: { family: "'Droid Sans Mono', monospace" },
                borderColor: 'rgba(232, 123, 53, 0.5)',
                borderWidth: 1,
            },
        },
        animation: { duration: 500 },
    };

    // Pressure gauge
    const pressureVal = pressure || 0;
    const pMin = 900, pMax = 1100;
    const pPercent = Math.min(100, Math.max(0, ((pressureVal - pMin) / (pMax - pMin)) * 100));
    const pColor = pPercent < 30 ? '#e87b35' : pPercent > 80 ? '#f44336' : '#4caf50';

    const getTitle = () => {
        if (activeMetric === 'gasRadar') return 'Gas Profile (MQ135 Est.)';
        if (activeMetric === 'pressure') return 'Pressure';
        return 'Telemetry History';
    };

    const renderChart = () => {
        if (activeMetric === 'gasRadar') {
            return <Radar data={radarData} options={radarOptions} />;
        }
        if (activeMetric === 'pressure') {
            return (
                <div className="pressure-gauge">
                    <div className="pressure-readout">
                        <span className="pressure-number">{pressureVal.toFixed(1)}</span>
                        <span className="pressure-unit">hPa</span>
                    </div>
                    <div className="pressure-column">
                        <div className="pressure-track">
                            <div
                                className="pressure-fill"
                                style={{ width: `${pPercent}%`, background: pColor }}
                            />
                        </div>
                        <div className="pressure-scale">
                            <span>{pMin}</span>
                            <span>{Math.round((pMax + pMin) / 2)}</span>
                            <span>{pMax}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return <Line ref={chartRef} data={lineData} options={lineOptions} />;
    };

    return (
        <div className="telemetry-chart glass">
            <div className="chart-header">
                <h3>{getTitle()}</h3>
                <div className="chart-tabs">
                    <button
                        className={`chart-tab ${activeMetric === 'temp' ? 'active' : ''}`}
                        onClick={() => onMetricChange('temp')}
                    >
                        Temp
                    </button>
                    <button
                        className={`chart-tab ${activeMetric === 'pressure' ? 'active' : ''}`}
                        onClick={() => onMetricChange('pressure')}
                    >
                        Pressure
                    </button>
                    <button
                        className={`chart-tab ${activeMetric === 'gasRadar' ? 'active' : ''}`}
                        onClick={() => onMetricChange('gasRadar')}
                    >
                        Gas Radar
                    </button>
                </div>
            </div>
            <div className="chart-container">
                {renderChart()}
            </div>
        </div>
    );
};

export default TelemetryChart;

