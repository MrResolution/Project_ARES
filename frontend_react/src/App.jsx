import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TopNav from './components/TopNav';
import DashboardPage from './pages/DashboardPage';
import VisualsPage from './pages/VisualsPage';
import ControlsPage from './pages/ControlsPage';
import AssistantPage from './pages/AssistantPage';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentMain = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.5rem 2rem;
  overflow-y: auto;
`;

const API_URL = "http://localhost:5000/api";

function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [history, setHistory] = useState({ temp: [], gas: [], rad: [], pressure: [], flame: [], water: [] });
  const [activeMetric, setActiveMetric] = useState('temp');
  const [systemStatus, setSystemStatus] = useState('OFFLINE');
  const [gasProfile, setGasProfile] = useState(null);
  const [objects, setObjects] = useState([]);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch(`${API_URL}/status`);
      const data = await res.json();

      setSystemStatus(data.active ? 'ONLINE' : 'OFFLINE');
      setTelemetry(data);
      setObjects(data.objects || []);
      if (data.gasProfile) {
        setGasProfile(data.gasProfile);
      }

      // Map gas profile from API (or fallback if API hasn't implemented it yet)
      setGasProfile({
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
      });

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
        <TopNav systemStatus={systemStatus} />
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
                />
              }
            />
            <Route path="/visuals" element={<VisualsPage objects={objects} />} />
            <Route path="/controls" element={<ControlsPage telemetry={telemetry} />} />
            <Route path="/assistant" element={<AssistantPage />} />
          </Routes>
        </ContentMain>
      </AppContainer>
    </BrowserRouter>
  );
}

export default App;
