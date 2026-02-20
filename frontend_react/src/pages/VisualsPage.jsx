import React from 'react';
import styled from 'styled-components';
import VideoFeed from '../components/VideoFeed';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 600px;
`;

const VisualsPage = () => {
    return (
        <Container>
            <VideoFeed />
        </Container>
    );
};

export default VisualsPage;
