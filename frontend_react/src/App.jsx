import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SideNav from './components/SideNav';
import DashboardPage from './pages/DashboardPage';
import VisualsPage from './pages/VisualsPage';
import ControlsPage from './pages/ControlsPage';
import AssistantPage from './pages/AssistantPage';
import AdminPage from './pages/AdminPage';

const AppContainer = styled.div`
  display: flex;
  flex-direction: row; /* Horizontal layout for Sidebar */
  min-height: 100vh;
  background: #050505;
`;

const ContentMain = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0.3rem 0.5rem; /* Phase II Ultra-slim margins */
  overflow: hidden; /* Prevent scrolling */
  position: relative;
`;

const API_URL = "http://localhost:5000/api";

function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [history, setHistory] = useState({
    temp: [],
    gas: [],
    rad: [],
    pressure: [],
    flame: [],
    water: []
  });
  const [activeMetric, setActiveMetric] = useState('temp');
  const [systemStatus, setSystemStatus] = useState('OFFLINE');
  const [gasProfile, setGasProfile] = useState(null);
  const [objects, setObjects] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const addAlert = (type, message) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAlerts(prev => {
      // Don't add duplicate messages within the same minute
      if (prev.length > 0 && prev[prev.length - 1].message === message) return prev;
      return [...prev, { type, message, time }].slice(-20);
    });
  };

  const clearAlerts = () => setAlerts([]);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch(`${API_URL}/status`);
      const data = await res.json();

      setSystemStatus(data.active ? 'ONLINE' : 'OFFLINE');
      setTelemetry(data);
      setObjects(data.objects || []);

      // Consolidated gas Profile logic to avoid double-renders
      const mappedGasProfile = data.gasProfile || {
        ammonia: data.ammonia || (Math.random() * 20),
        nitrogen: data.nitrogen || (Math.random() * 80),
        oxygen: data.oxygen || (18 + Math.random() * 5),
        benzene: data.benzene || (Math.random() * 5),
        smoke: data.smoke || (Math.random() * 10),
        co2: data.co2 || (300 + Math.random() * 100),
        co: data.co || (Math.random() * 15),
        alcohol: data.alcohol || (Math.random() * 5),
        sulfur: data.sulfur || (Math.random() * 8),
        methane: data.methane || (Math.random() * 10),
        hydrogen: data.hydrogen || (Math.random() * 5),
      };
      setGasProfile(mappedGasProfile);

      setHistory(prev => {
        const newHistory = { ...prev };
        ['temp', 'gas', 'radiation', 'pressure', 'flame', 'water'].forEach(key => {
          const val = data[key];
          if (val !== undefined) {
            const historyKey = key === 'radiation' ? 'rad' : key;
            newHistory[historyKey] = [...(prev[historyKey] || []), val].slice(-30);
          }
        });
        return newHistory;
      });

      // Monitor Thresholds for Alerts (Only if system is ACTIVE)
      if (data.active) {
        if (data.temp > 45) addAlert('critical', `Critical Temperature: ${data.temp.toFixed(1)}°C`);
        else if (data.temp > 40) addAlert('warning', `High Temperature: ${data.temp.toFixed(1)}°C`);

        // Trigger fire hazard from both Hardware Sensor AND Vision AI
        const hasVisionFlame = data.objects && data.objects.some(obj => obj.label === 'FLAME' && obj.confidence > 0.6);
        if (data.flame === 0 || hasVisionFlame) addAlert('critical', "OBJECT HAZARD DETECTED!");

        if (data.gas > 800) addAlert('warning', "High Gas Levels Detected");
        if (data.water > 400) addAlert('warning', "High Water Level Detected");
      }

    } catch (e) {
      setSystemStatus('OFFLINE');
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <AppContainer>
        <SideNav systemStatus={systemStatus} />
        <ContentMain>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  telemetry={telemetry}
                  history={history}
                  activeMetric={activeMetric}
                  setActiveMetric={setActiveMetric}
                  gasProfile={gasProfile}
                  systemStatus={systemStatus}
                  alerts={alerts}
                  onClearAlerts={clearAlerts}
                />
              }
            />
            <Route path="/visuals" element={<VisualsPage objects={objects} />} />
            <Route path="/controls" element={<ControlsPage telemetry={telemetry} />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </ContentMain>
      </AppContainer>
    </BrowserRouter>
  );
}

export default App;
