import React from 'react';
import styled from 'styled-components';
import Controls from '../components/Controls';
import PingTester from '../components/PingTester';
import ServiceManager from '../components/ServiceManager';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2rem;
  padding: 0;
`;

const PanelRow = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const ControlsPage = ({ telemetry }) => {
  return (
    <Container>
      <PanelRow>
        <ServiceManager />
      </PanelRow>

      <PanelRow>
        <Controls telemetry={telemetry} />
        <PingTester />
      </PanelRow>
    </Container>
  );
};

export default ControlsPage;
