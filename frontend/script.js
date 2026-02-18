const API_URL = "http://localhost:5000/api"; // Proxy in dev or direct

function updateTime() {
    const now = new Date();
    document.getElementById('mission-time').innerText = now.toLocaleTimeString();
}

setInterval(updateTime, 1000);

async function fetchTelemetry() {
    try {
        // In a real scenario, this would hit the backend API
        // For demo without backend running, we might need mock data catch
        const response = await fetch(`${API_URL}/status`);
        const data = await response.json();

        updateUI(data);
    } catch (e) {
        console.log("Backend offline, using mock data for UI demo");
        // Mock data logic
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
}

// Poll telemetry every 2 seconds
setInterval(fetchTelemetry, 2000);

// AI Button
document.getElementById('ai-scan').addEventListener('click', async () => {
    const consoleDiv = document.getElementById('ai-log');
    consoleDiv.innerHTML += `<p class="log-entry">> INITIATING AI SCAN...</p>`;

    try {
        const response = await fetch(`${API_URL}/analyze`);
        const data = await response.json();
        consoleDiv.innerHTML += `<p class="log-entry">> ${JSON.stringify(data)}</p>`;
    } catch (e) {
        consoleDiv.innerHTML += `<p class="log-entry error">> CONNECTION ERROR: AI OFFLINE</p>`;
    }
});

// Camera Feed Setup (Mock or Real)
// If you have the ESP32 cam IP, set it here
const CAM_IP = "http://192.168.4.1";
// document.getElementById('cam-feed').src = `${CAM_IP}/stream`; 
