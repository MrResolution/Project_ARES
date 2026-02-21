
import React, { useState, useRef, useCallback } from 'react';
import './VideoFeed.css';

const ESP32_CAM_STREAM_URL = "http://10.202.253.217:81/stream";

const VideoFeed = ({ objects = [] }) => {
    const [camStatus, setCamStatus] = useState('connecting'); // 'connecting' | 'live' | 'error'
    const imgRef = useRef(null);
    const [streamKey, setStreamKey] = useState(0); // Used to force reconnect

    const handleStreamLoad = useCallback(() => {
        setCamStatus('live');
    }, []);

    const handleStreamError = useCallback(() => {
        setCamStatus('error');
    }, []);

    const handleReconnect = useCallback(() => {
        setCamStatus('connecting');
        setStreamKey(prev => prev + 1); // Force re-mount of img element
    }, []);

    return (
        <div className="video-feed glass">
            <div className="feed-header">
                <h3>Live Visuals</h3>
            </div>
            <div className="feed-container">
                <div className="camera-view">
                    <img
                        ref={imgRef}
                        key={streamKey}
                        src={ESP32_CAM_STREAM_URL}
                        alt="ESP32-CAM Live Feed"
                        onLoad={handleStreamLoad}
                        onError={handleStreamError}
                        style={{ display: camStatus === 'error' ? 'none' : 'block' }}
                    />

                    {camStatus === 'live' && (
                        <svg className="detection-overlay" viewBox="0 0 1 1" preserveAspectRatio="none">
                            {objects.map((obj, i) => (
                                obj.box && (
                                    <g key={i}>
                                        <rect
                                            x={obj.box.x}
                                            y={obj.box.y}
                                            width={obj.box.w}
                                            height={obj.box.h}
                                            className="detection-box"
                                        />
                                        <text
                                            x={obj.box.x}
                                            y={obj.box.y - 0.01}
                                            className="detection-label"
                                            style={{ fontSize: '0.04px' }}
                                        >
                                            {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
                                        </text>
                                    </g>
                                )
                            ))}
                        </svg>
                    )}

                    {camStatus === 'connecting' && (
                        <div className="connecting-overlay">
                            <div className="connecting-spinner"></div>
                            <span>CONNECTING TO CAM...</span>
                        </div>
                    )}

                    {camStatus === 'error' && (
                        <div className="no-signal-overlay">
                            <span>NO SIGNAL</span>
                            <button className="reconnect-btn" onClick={handleReconnect}>
                                ↻ Reconnect
                            </button>
                        </div>
                    )}

                    <span className={`feed-status ${camStatus === 'live' ? 'live' : ''}`}>
                        {camStatus === 'live' ? '● LIVE' : camStatus === 'connecting' ? '◌ CONNECTING' : '✕ OFFLINE'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VideoFeed;

