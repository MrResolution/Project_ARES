import React from 'react';
import styled from 'styled-components';
import AiWidget from '../components/AiWidget';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const AssistantPage = () => {
    return (
        <Container>
            <AiWidget />
        </Container>
    );
};

export default AssistantPage;
