
import React, { useState } from 'react';
import './VideoFeed.css';

const VideoFeed = () => {
    const [isLidarActive, setIsLidarActive] = useState(false);

    return (
        <div className="video-feed glass">
            <div className="feed-header">
                <h3>Live Visuals</h3>
                <div className="feed-controls">
                    <button
                        className={`feed-btn ${!isLidarActive ? 'active' : ''}`}
                        onClick={() => setIsLidarActive(false)}
                    >
                        Camera
                    </button>
                    <button
                        className={`feed-btn ${isLidarActive ? 'active' : ''}`}
                        onClick={() => setIsLidarActive(true)}
                    >
                        LiDAR
                    </button>
                </div>
            </div>
            <div className="feed-container">
                {isLidarActive ? (
                    <div className="lidar-view">
                        <div className="lidar-grid"></div>
                        <div className="lidar-scan"></div>
                        <span className="feed-status">LIDAR ACTIVE</span>
                    </div>
                ) : (
                    <div className="camera-view">
                        <img
                            src="placeholder_cam.jpg"
                            alt="Live Feed"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentElement.classList.add('no-signal');
                            }}
                        />
                        <div className="no-signal-overlay">NO SIGNAL</div>
                        <span className="feed-status live">LIVE FEED</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoFeed;
