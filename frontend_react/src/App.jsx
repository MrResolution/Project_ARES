
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TopNav from './components/TopNav';
import StatCard from './components/StatCard';
import TelemetryChart from './components/TelemetryChart';
import VideoFeed from './components/VideoFeed';
import Controls from './components/Controls';
import AiWidget from './components/AiWidget';

const Dashboard = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
  padding: 1.5rem 2rem;
  gap: 1.5rem;
  overflow-y: auto;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  flex: 1;
  min-height: 0; 
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 0;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 0;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
`;

const API_URL = "http://localhost:5000/api";

function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [history, setHistory] = useState({ temp: [], gas: [], rad: [], pressure: [] });
  const [activeMetric, setActiveMetric] = useState('temp');
  const [systemStatus, setSystemStatus] = useState('OFFLINE');

  const fetchTelemetry = async () => {
    try {
      // Mock fetch for now, replace with real API call
      // const res = await fetch(`${API_URL}/status`);
      // const data = await res.json();

      // Simulate data randomly
      const data = {
        temp: 20 + Math.random() * 5,
        gas: 100 + Math.random() * 20,
        radiation: 10 + Math.random() * 5,
        pressure: 1010 + Math.random() * 5
      };

      setSystemStatus('ONLINE');
      setTelemetry(data);

      setHistory(prev => {
        const newHistory = { ...prev };
        ['temp', 'gas', 'radiation', 'pressure'].forEach(key => {
          const val = data[key === 'rad' ? 'radiation' : key]; // mapping check
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
    <>
      <TopNav systemStatus={systemStatus} />
      <Dashboard>
        {/* Stat Cards Row */}
        <StatGrid>
          <StatCard
            title="Temperature"
            value={telemetry?.temp?.toFixed(1)}
            unit="°C"
            icon="🌡️"
            trend="up"
            trendValue="2%"
          />
          <StatCard
            title="Toxic Gas"
            value={telemetry?.gas?.toFixed(0)}
            unit="ppm"
            icon="☁️"
            trend="flat"
            trendValue="0%"
          />
          <StatCard
            title="Radiation"
            value={telemetry?.radiation?.toFixed(1)}
            unit="CPM"
            icon="☢️"
            status={telemetry?.radiation > 14 ? 'warning' : ''}
            trend="down"
            trendValue="5%"
          />
          <StatCard
            title="Pressure"
            value={telemetry?.pressure?.toFixed(1)}
            unit="hPa"
            icon="🔵"
            trend="flat"
            trendValue="STABLE"
          />
        </StatGrid>

        <GridContainer>
          <LeftColumn>
            <TelemetryChart
              data={history[activeMetric]}
              activeMetric={activeMetric}
              onMetricChange={setActiveMetric}
            />
            <VideoFeed />
            <Controls />
          </LeftColumn>

          <RightColumn>
            <AiWidget />
          </RightColumn>
        </GridContainer>

      </Dashboard>
    </>
  );
}

export default App;
