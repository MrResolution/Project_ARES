
import React, { useRef, useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './TelemetryChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TelemetryChart = ({ data, activeMetric, onMetricChange }) => {
    const chartRef = useRef(null);
    const [gradient, setGradient] = useState(null);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(232, 123, 53, 0.8)');
        gradient.addColorStop(1, 'rgba(232, 123, 53, 0.2)');
        setGradient(gradient);
    }, []);

    const chartData = {
        labels: data.map((_, i) => i + 1),
        datasets: [
            {
                label: 'Current',
                data: data,
                backgroundColor: gradient || 'rgba(232, 123, 53, 0.5)',
                borderColor: 'rgba(232, 123, 53, 1)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.6,
            },
        ],
    };

    const options = {
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
            },
        },
        animation: {
            duration: 500,
        },
    };

    return (
        <div className="telemetry-chart glass">
            <div className="chart-header">
                <h3>Telemetry History</h3>
                <div className="chart-tabs">
                    <button
                        className={`chart-tab ${activeMetric === 'temp' ? 'active' : ''}`}
                        onClick={() => onMetricChange('temp')}
                    >
                        Temp
                    </button>
                    <button
                        className={`chart-tab ${activeMetric === 'gas' ? 'active' : ''}`}
                        onClick={() => onMetricChange('gas')}
                    >
                        Gas
                    </button>
                    <button
                        className={`chart-tab ${activeMetric === 'rad' ? 'active' : ''}`}
                        onClick={() => onMetricChange('rad')}
                    >
                        Rad
                    </button>
                </div>
            </div>
            <div className="chart-container">
                <Bar ref={chartRef} data={chartData} options={options} />
            </div>
        </div>
    );
};

export default TelemetryChart;
