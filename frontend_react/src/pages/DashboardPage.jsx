import React from 'react';
import styled from 'styled-components';
import StatCard from '../components/StatCard';
import TelemetryChart from '../components/TelemetryChart';
import GasRadarChart from '../components/GasRadarChart';
import AlertsPanel from '../components/AlertsPanel';
import { Thermometer, CloudFog, Radio, Gauge, Target, Droplets } from 'lucide-react';

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem; /* Ultra-compact gaps */
  flex: 0.8; /* Top row priority */
`;

const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.5rem; /* Nano-gap compaction */
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  flex: 3.5; /* Large focus for the Telemetry History */
  min-height: 0;
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  flex: 1.2; /* Bottom row density */
`;

const SensorCard = styled.div`
  padding: 0.5rem; /* Nano-padding */
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SensorIcon = styled.div`
  width: 40px; /* Reduced from 48px */
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$danger ? 'rgba(244, 67, 54, 0.15)' : 'rgba(76, 175, 80, 0.15)'};
  color: ${props => props.$danger ? '#f44336' : '#4caf50'};
  flex-shrink: 0;
`;

const SensorInfo = styled.div`
  flex: 1;
`;

const SensorLabel = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
`;

const SensorValue = styled.div`
  font-size: 1.4rem; /* Reduced from 1.6rem */
  font-weight: bold;
  color: var(--text-primary);
  margin-top: 0.1rem;
`;

const SensorStatus = styled.span`
  display: inline-block;
  margin-top: 0.5rem;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  background: ${props => props.$danger ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)'};
  color: ${props => props.$danger ? '#f44336' : '#4caf50'};
  border: 1px solid ${props => props.$danger ? 'rgba(244, 67, 54, 0.3)' : 'rgba(76, 175, 80, 0.3)'};
`;

const DashboardPage = ({ telemetry, history, activeMetric, setActiveMetric, gasProfile, systemStatus, alerts, onClearAlerts }) => {
  const isOffline = systemStatus === 'OFFLINE';
  return (
    <DashboardWrapper>
      <StatGrid>
        <StatCard
          title="Temperature"
          value={isOffline ? null : telemetry?.temp?.toFixed(1)}
          unit="°C"
          icon={<Thermometer size={20} />}
          trend={isOffline ? null : "up"}
          trendValue={isOffline ? null : "2%"}
          status={isOffline ? 'offline' : ''}
        />
        <StatCard
          title="Toxic Gas"
          value={isOffline ? null : telemetry?.gas?.toFixed(0)}
          unit="ppm"
          icon={<CloudFog size={20} />}
          trend={isOffline ? null : "flat"}
          trendValue={isOffline ? null : "0%"}
          status={isOffline ? 'offline' : ''}
        />
        <StatCard
          title="Radiation"
          value={isOffline ? null : telemetry?.radiation?.toFixed(1)}
          unit="CPM"
          icon={<Radio size={20} />}
          status={isOffline ? 'offline' : (telemetry?.radiation > 14 ? 'warning' : '')}
          trend={isOffline ? null : "down"}
          trendValue={isOffline ? null : "5%"}
        />
        <StatCard
          title="Pressure"
          value={isOffline ? null : telemetry?.pressure?.toFixed(1)}
          unit="hPa"
          icon={<Gauge size={20} />}
          trend={isOffline ? null : "flat"}
          trendValue={isOffline ? null : "STABLE"}
          status={isOffline ? 'offline' : ''}
        />
      </StatGrid>
      <ContentArea>
        <TelemetryChart
          data={history[activeMetric] || []}
          activeMetric={activeMetric}
          onMetricChange={setActiveMetric}
          gasProfile={gasProfile}
          pressure={telemetry?.pressure}
        />
        <GasRadarChart gasData={gasProfile} />
      </ContentArea>
      <BottomGrid>
        <SensorCard className="glass">
          <SensorIcon $danger={!isOffline && telemetry?.flame === 0}>
            <Target size={28} />
          </SensorIcon>
          <SensorInfo>
            <SensorLabel>Object Detection</SensorLabel>
            <SensorValue>
              {isOffline ? '---' : (telemetry?.flame ?? '---')}
            </SensorValue>
            <SensorStatus $danger={!isOffline && telemetry?.flame === 0}>
              {isOffline ? 'OFFLINE' : (telemetry?.flame === 0 ? 'OBJECT DETECTED' : 'CLEAR')}
            </SensorStatus>
          </SensorInfo>
        </SensorCard>
        <SensorCard className="glass">
          <SensorIcon $danger={!isOffline && telemetry?.water > 400}>
            <Droplets size={28} />
          </SensorIcon>
          <SensorInfo>
            <SensorLabel>Water Level</SensorLabel>
            <SensorValue>
              {isOffline ? '---' : (telemetry?.water ?? '---')}
            </SensorValue>
            <SensorStatus $danger={!isOffline && telemetry?.water > 400}>
              {isOffline ? 'OFFLINE' : (telemetry?.water > 400 ? 'HIGH' : 'NORMAL')}
            </SensorStatus>
          </SensorInfo>
        </SensorCard>
        <AlertsPanel alerts={alerts} onClear={onClearAlerts} />
      </BottomGrid>
    </DashboardWrapper>
  );
};

export default DashboardPage;
