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
  const [history, setHistory] = useState({ temp: [], gas: [], rad: [], pressure: [] });
  const [activeMetric, setActiveMetric] = useState('temp');
  const [systemStatus, setSystemStatus] = useState('OFFLINE');

  const fetchTelemetry = async () => {
    try {
      const res = await fetch(`${API_URL}/status`);
      const data = await res.json();

      setSystemStatus('ONLINE');
      setTelemetry(data);

      setHistory(prev => {
        const newHistory = { ...prev };
        ['temp', 'gas', 'radiation', 'pressure'].forEach(key => {
          const val = data[key === 'rad' ? 'radiation' : key];
          if (val !== undefined) {
            newHistory[key === 'radiation' ? 'rad' : key] = [...prev[key === 'radiation' ? 'rad' : key], val].slice(-30);
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
                />
              }
            />
            <Route path="/visuals" element={<VisualsPage />} />
            <Route path="/controls" element={<ControlsPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
          </Routes>
        </ContentMain>
      </AppContainer>
    </BrowserRouter>
  );
}

export default App;
