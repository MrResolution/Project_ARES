import React from 'react';
import styled from 'styled-components';
import PingTester from '../components/PingTester';
import TelemetryLogViewer from '../components/TelemetryLogViewer';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); /* Liquified from 450px */
  gap: 1rem;
  padding: 0.5rem 0.5rem;
  width: 100%;
  margin: 0 auto;
  height: 100%;
  min-height: 0;
`;

const AdminPage = () => {
    return (
        <Container>
            <PingTester />
            <TelemetryLogViewer />
        </Container>
    );
};

export default AdminPage;
