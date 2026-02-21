import React from 'react';
import styled from 'styled-components';
import Controls from '../components/Controls';
import ServiceManager from '../components/ServiceManager';
import GyroPanel from '../components/GyroPanel';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); /* Liquified from 450px */
  gap: 1rem;
  padding: 0.5rem 0.5rem;
  width: 100%;
  margin: 0 auto;
  height: 100%;
  overflow-y: auto;
  min-height: 0;
`;

// PanelRow removed for Grid usage

const ControlsPage = ({ telemetry }) => {
<<<<<<< HEAD
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
=======
    return (
        <Container>
            <ServiceManager />
            <Controls telemetry={telemetry} />
            <GyroPanel telemetry={telemetry} />
        </Container>
    );
>>>>>>> f62e861 (chore: Update README and commit recent changes)
};

export default ControlsPage;
