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
  return (
    <Container>
      <ServiceManager />
      <Controls telemetry={telemetry} />
      <GyroPanel telemetry={telemetry} />
    </Container>
  );
};

export default ControlsPage;
