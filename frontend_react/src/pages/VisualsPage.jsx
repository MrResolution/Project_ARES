import React from 'react';
import styled from 'styled-components';
import VideoFeed from '../components/VideoFeed';
import AuxiliaryPanel from '../components/AuxiliaryPanel';

const Container = styled.div`
  display: flex;
  gap: 1.5rem;
  flex: 1;
  min-height: 500px;
  max-height: 600px;
`;

const VisualContainer = styled.div`
  flex: 1.5;
  display: flex;
  flex-direction: column;
`;

const AuxContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const VisualsPage = ({ objects }) => {
  return (
    <Container>
      <VisualContainer>
        <VideoFeed objects={objects} />
      </VisualContainer>
      <AuxContainer>
        <AuxiliaryPanel objects={objects} />
      </AuxContainer>
    </Container>
  );
};

export default VisualsPage;
