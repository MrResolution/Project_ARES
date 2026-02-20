const API_URL = "http://localhost:5000/api";

// ===== DATE / TIME DISPLAY =====
function updateTime() {
    const now = new Date();
    document.getElementById('mission-time').innerText = now.toLocaleTimeString();

    const dateEl = document.getElementById('nav-date-text');
    if (dateEl) {
        const opts = { day: 'numeric', month: 'long', year: 'numeric' };
        dateEl.innerText = now.toLocaleDateString('en-US', opts);
    }
}
setInterval(updateTime, 1000);
updateTime();

// ===== TELEMETRY DATA =====
const telemetryHistory = {
    temp: [],
    gas: [],
    radiation: [],
    pressure: []
};
const MAX_HISTORY = 30;

async function fetchTelemetry() {
    try {
        const response = await fetch(`${API_URL}/status`);
        const data = await response.json();
        updateUI(data);
    } catch (e) {
        console.log("Backend offline, using mock data for UI demo");
        const mockData = {
            temp: 24 + Math.random() * 2,
            gas: 120 + Math.random() * 10,
            radiation: 15 + Math.random() * 2,
            pressure: 1013 + Math.random()
        };
        updateUI(mockData);
    }
}

function updateUI(data) {
    document.getElementById('val-temp').innerText = data.temp ? data.temp.toFixed(1) + " °C" : "--";
    document.getElementById('val-gas').innerText = data.gas ? data.gas.toFixed(0) + " ppm" : "--";
    document.getElementById('val-rad').innerText = data.radiation ? data.radiation.toFixed(0) + " CPM" : "--";
    document.getElementById('val-press').innerText = data.pressure ? data.pressure.toFixed(1) + " hPa" : "--";

    // Save to history
    if (data.temp) pushHistory('temp', data.temp);
    if (data.gas) pushHistory('gas', data.gas);
    if (data.radiation) pushHistory('radiation', data.radiation);
    if (data.pressure) pushHistory('pressure', data.pressure);

    // Update chart
    updateChart();

    // Update big value display
    const activeTab = document.querySelector('.chart-tab.active');
    if (activeTab) updateBigValue(activeTab.dataset.chart);
}

function pushHistory(key, val) {
    telemetryHistory[key].push(val);
    if (telemetryHistory[key].length > MAX_HISTORY) {
        telemetryHistory[key].shift();
    }
}

setInterval(fetchTelemetry, 2000);

// ===== CHART.JS — WARM ORANGE BARS =====
let telemetryChart = null;
let activeMetric = 'temp';

const metricLabels = {
    temp: { name: 'Temperature', unit: '°C' },
    gas: { name: 'Toxic Gas', unit: 'ppm' },
    rad: { name: 'Radiation', unit: 'CPM' }
};

const metricKeys = {
    temp: 'temp',
    gas: 'gas',
    rad: 'radiation'
};

function createChart() {
    const ctx = document.getElementById('telemetryChart');
    if (!ctx) return;

    telemetryChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Current',
                    data: [],
                    backgroundColor: createBarGradient(ctx.getContext('2d'), '#e87b35', '#c45e1a'),
                    borderRadius: 4,
                    borderSkipped: false,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                },
                {
                    label: 'Previous',
                    data: [],
                    backgroundColor: 'rgba(122, 102, 80, 0.35)',
                    borderRadius: 4,
                    borderSkipped: false,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 600,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(26, 17, 8, 0.95)',
                    titleColor: '#f5efe8',
                    bodyColor: '#bfa98a',
                    borderColor: 'rgba(232, 123, 53, 0.3)',
                    borderWidth: 1,
                    cornerRadius: 10,
                    padding: 12,
                    displayColors: false,
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: '#7a6650',
                        font: { family: 'Outfit', size: 11 }
                    },
                    border: { display: false }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 180, 100, 0.06)',
                    },
                    ticks: {
                        color: '#7a6650',
                        font: { family: 'Outfit', size: 11 },
                        callback: function (val) {
                            return val.toFixed(0);
                        }
                    },
                    border: { display: false }
                }
            }
        }
    });
}

function createBarGradient(ctx, colorStart, colorEnd) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
}

function updateChart() {
    if (!telemetryChart) return;

    const key = metricKeys[activeMetric] || 'temp';
    const data = telemetryHistory[key];
    if (!data || data.length === 0) return;

    const labels = data.map((_, i) => i + 1);
    const previousData = data.map(d => d * (0.82 + Math.random() * 0.15));

    telemetryChart.data.labels = labels;
    telemetryChart.data.datasets[0].data = data;
    telemetryChart.data.datasets[1].data = previousData;
    telemetryChart.update('none');
}

function updateBigValue(metric) {
    const key = metricKeys[metric] || 'temp';
    const data = telemetryHistory[key];
    const info = metricLabels[metric];

    const bigValueEl = document.getElementById('chart-big-value');
    const changeEl = document.getElementById('chart-change');

    if (data && data.length > 0) {
        const latest = data[data.length - 1];
        bigValueEl.innerText = latest.toFixed(1) + (info ? ' ' + info.unit : '');

        if (data.length > 1) {
            const prev = data[data.length - 2];
            const pctChange = ((latest - prev) / prev * 100).toFixed(1);
            const sign = pctChange >= 0 ? '+' : '';
            changeEl.innerText = sign + pctChange + '%';
            changeEl.style.background = pctChange >= 0
                ? 'rgba(76, 175, 80, 0.15)'
                : 'rgba(232, 69, 69, 0.15)';
            changeEl.style.color = pctChange >= 0 ? '#4caf50' : '#e84545';
        }
    }
}

// ===== CHART TAB SWITCHING =====
document.querySelectorAll('.chart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeMetric = tab.dataset.chart;
        updateChart();
        updateBigValue(activeMetric);
    });
});

// ===== AI SCAN BUTTON =====
document.getElementById('ai-scan').addEventListener('click', async () => {
    triggerAIQuery("INITIATING FULL AI SCAN...");
});

// ===== AI QUICK ACTION BUTTONS =====
document.getElementById('btn-env-report')?.addEventListener('click', () => {
    triggerAIQuery("Requesting environment status report...");
});
document.getElementById('btn-top-readings')?.addEventListener('click', () => {
    triggerAIQuery("Fetching top critical readings...");
});
document.getElementById('btn-anomaly')?.addEventListener('click', () => {
    triggerAIQuery("Running anomaly detection scan...");
});
document.getElementById('btn-alert')?.addEventListener('click', () => {
    triggerAIQuery("Generating alert summary...");
});

// AI input send
document.getElementById('ai-send')?.addEventListener('click', () => {
    const input = document.getElementById('ai-input');
    if (input && input.value.trim()) {
        triggerAIQuery(input.value.trim());
        input.value = '';
    }
});

document.getElementById('ai-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('ai-send')?.click();
    }
});

async function triggerAIQuery(message) {
    const consoleDiv = document.getElementById('ai-log');
    consoleDiv.innerHTML += `<p class="log-entry">> ${message}</p>`;
    consoleDiv.scrollTop = consoleDiv.scrollHeight;

    try {
        const response = await fetch(`${API_URL}/analyze`);
        const data = await response.json();
        consoleDiv.innerHTML += `<p class="log-entry">> ${JSON.stringify(data)}</p>`;
    } catch (e) {
        consoleDiv.innerHTML += `<p class="log-entry error">> AI ENGINE OFFLINE — Connect backend for live analysis</p>`;
    }
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

// ===== CAMERA FEED =====
const CAM_IP = "http://192.168.4.1";
// document.getElementById('cam-feed').src = `${CAM_IP}/stream`;

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    createChart();
    fetchTelemetry();
});
