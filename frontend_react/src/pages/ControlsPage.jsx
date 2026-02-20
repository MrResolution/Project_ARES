import React from 'react';
import styled from 'styled-components';
import Controls from '../components/Controls';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ControlsPage = () => {
    return (
        <Container>
            <Controls />
        </Container>
    );
};

export default ControlsPage;
