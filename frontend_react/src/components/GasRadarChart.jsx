import React from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import './GasRadarChart.css';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const GasRadarChart = ({ gasData }) => {
    // Labels for the 11 gases
    const labels = [
        'Ammonia (NH3)',
        'Nitrogen (N2)',
        'Oxygen (O2)',
        'Benzene (C6H6)',
        'Smoke',
        'CO2',
        'CO',
        'Alcohol Vapour',
        'Sulfur',
        'Methane (CH4)',
        'Hydrogen (H2)'
    ];

    // Map the incoming flat data object to an array in order of the labels
    // We expect gasData to look like: { ammonia: 10, nitrogen: 78, oxygen: 21, ... }
    const dataValues = gasData ? [
        gasData.ammonia || 0,
        gasData.nitrogen || 0,
        gasData.oxygen || 0,
        gasData.benzene || 0,
        gasData.smoke || 0,
        gasData.co2 || 0,
        gasData.co || 0,
        gasData.alcohol || 0,
        gasData.sulfur || 0,
        gasData.methane || 0,
        gasData.hydrogen || 0,
    ] : Array(11).fill(0);

    const data = React.useMemo(() => ({
        labels: labels,
        datasets: [
            {
                label: 'Current Levels',
                data: dataValues,
                backgroundColor: 'rgba(232, 123, 53, 0.2)', // Orange glass fill
                borderColor: 'rgba(232, 123, 53, 1)',      // Solid orange border
                pointBackgroundColor: 'rgba(232, 123, 53, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(232, 123, 53, 1)',
                borderWidth: 2,
            },
        ],
    }), [dataValues]);

    const options = React.useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.1)' // Spider web lines
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)' // Concentric circles
                },
                pointLabels: {
                    color: 'rgba(255, 255, 255, 0.7)', // Font color for gas names
                    font: {
                        family: "'Droid Sans Mono', monospace",
                        size: 11
                    }
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)', // Number ticks
                    backdropColor: 'transparent',
                    font: {
                        family: "'Droid Sans Mono', monospace",
                        size: 9
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false // Hide the top legend to save space
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { family: "'Droid Sans Mono', monospace" },
                bodyFont: { family: "'Droid Sans Mono', monospace" },
                borderColor: 'rgba(232, 123, 53, 0.5)',
                borderWidth: 1
            }
        }
    }), []);

    return (
        <div className="gas-radar-container glass">
            <div className="radar-header">
                <h3>Gas Profile Analysis</h3>
            </div>
            <div className="radar-chart-wrapper">
                {gasData ? (
                    <Radar data={data} options={options} />
                ) : (
                    <div className="no-data">Fetching gas profile...</div>
                )}
            </div>
        </div>
    );
};

export default GasRadarChart;
