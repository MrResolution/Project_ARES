import React from 'react';
import styled from 'styled-components';
import StatCard from '../components/StatCard';
import TelemetryChart from '../components/TelemetryChart';
import GasRadarChart from '../components/GasRadarChart';
import { Thermometer, CloudFog, Radio, Gauge } from 'lucide-react';

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  flex: 1;
  min-height: 400px;
`;

const DashboardPage = ({ telemetry, history, activeMetric, setActiveMetric, gasProfile }) => {
    return (
        <>
            <StatGrid>
                <StatCard
                    title="Temperature"
                    value={telemetry?.temp?.toFixed(1)}
                    unit="°C"
                    icon={<Thermometer size={20} />}
                    trend="up"
                    trendValue="2%"
                />
                <StatCard
                    title="Toxic Gas"
                    value={telemetry?.gas?.toFixed(0)}
                    unit="ppm"
                    icon={<CloudFog size={20} />}
                    trend="flat"
                    trendValue="0%"
                />
                <StatCard
                    title="Radiation"
                    value={telemetry?.radiation?.toFixed(1)}
                    unit="CPM"
                    icon={<Radio size={20} />}
                    status={telemetry?.radiation > 14 ? 'warning' : ''}
                    trend="down"
                    trendValue="5%"
                />
                <StatCard
                    title="Pressure"
                    value={telemetry?.pressure?.toFixed(1)}
                    unit="hPa"
                    icon={<Gauge size={20} />}
                    trend="flat"
                    trendValue="STABLE"
                />
            </StatGrid>
            <ContentArea>
                <TelemetryChart
                    data={history[activeMetric]}
                    activeMetric={activeMetric}
                    onMetricChange={setActiveMetric}
                />
                <GasRadarChart gasData={gasProfile} />
            </ContentArea>
        </>
    );
};

export default DashboardPage;
