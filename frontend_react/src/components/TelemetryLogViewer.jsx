import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Terminal } from 'lucide-react';

const ViewerContainer = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 400px;
  overflow: hidden;
  backdrop-filter: blur(10px);
`;

const Header = styled.div`
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Droid Sans Mono', monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
`;

const LogContent = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  font-family: 'Droid Sans Mono', monospace;
  font-size: 0.8rem;
  line-height: 1.4;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const LogLine = styled.div`
  color: #a0a0a0;
  margin-bottom: 0.25rem;
  word-break: break-all;
  display: flex;
  gap: 0.5rem;
  
  .timestamp {
    color: #4caf50;
    white-space: nowrap;
  }
  .data {
    color: #e0e0e0;
  }
`;

const TelemetryLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const logEndRef = useRef(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/logs?limit=50');
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data.logs || []);
                }
            } catch (e) {
                console.error("Failed to fetch logs", e);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <ViewerContainer>
            <Header>
                <Terminal size={18} />
                TELEMETRY_LOG_SYSTEM
            </Header>
            <LogContent>
                {logs.map((log, index) => {
                    // Fallback parsing just in case timestamp is missing
                    const logDate = new Date(log.timestamp);
                    const time = isNaN(logDate.getTime()) ? 'UNKNOWN_TIME' : logDate.toLocaleTimeString('en-US', { hour12: false });
                    const { timestamp, active, source, ...rest } = log;
                    return (
                        <LogLine key={index}>
                            <span className="timestamp">[{time}]</span>
                            <span className="data">{JSON.stringify(rest)}</span>
                        </LogLine>
                    );
                })}
                <div ref={logEndRef} />
            </LogContent>
        </ViewerContainer>
    );
};

export default TelemetryLogViewer;
