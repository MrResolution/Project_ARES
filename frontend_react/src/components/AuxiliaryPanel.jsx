import React from 'react';
import './AuxiliaryPanel.css';
import { LayoutGrid } from 'lucide-react';

const AuxiliaryPanel = ({ objects = [] }) => {
    return (
        <div className="auxiliary-panel glass">
            <div className="panel-header">
                <LayoutGrid size={20} className="header-icon" />
                <h3>Auxiliary Data</h3>
            </div>
            <div className="panel-content">
                {objects.length > 0 ? (
                    <div className="object-list">
                        <div className="list-header">
                            <span className="pulse"></span> IDENTIFIED OBJECTS
                        </div>
                        {objects.map((obj, idx) => (
                            <div key={idx} className="object-item">
                                <div className="obj-info">
                                    <span className="obj-name">{obj.label}</span>
                                    <span className="obj-meta">TRACK_ID: 0x{((idx + 1) * 2351).toString(16).toUpperCase()}</span>
                                </div>
                                <span className="obj-confidence">
                                    {obj.confidence ? `${(obj.confidence * 100).toFixed(0)}%` : '---'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="placeholder-msg scanning">
                        <div className="scanning-radar"></div>
                        <p>SYSTEM SCANNING FOR TARGETS</p>
                        <span className="status-tag pulse">ACTIVE SCAN MODE</span>
                    </div>
                )}
            </div>
            <div className="panel-footer">
                <span className="channel-tag">CHANNEL B</span>
                <span className="encryption-tag">SSL: ENCRYPTED</span>
            </div>
            <div className="scanline"></div>
        </div>
    );
};

export default AuxiliaryPanel;
