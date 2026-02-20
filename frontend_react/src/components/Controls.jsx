
import React, { useState } from 'react';
import './Controls.css';

const Controls = () => {
    const [armValues, setArmValues] = useState({
        base: 90,
        shoulder: 90,
        elbow: 90,
        gripper: 0
    });

    const handleSliderChange = (joint, value) => {
        setArmValues(prev => ({ ...prev, [joint]: value }));
    };

    return (
        <div className="controls-container">
            <div className="control-panel glass">
                <h3>Rover Nav</h3>
                <div className="d-pad">
                    <button className="d-btn up">W</button>
                    <div className="d-row">
                        <button className="d-btn left">A</button>
                        <button className="d-btn down">S</button>
                        <button className="d-btn right">D</button>
                    </div>
                </div>
            </div>

            <div className="control-panel glass">
                <h3>Arm Manipulator</h3>
                <div className="sliders">
                    {Object.entries(armValues).map(([joint, val]) => (
                        <div key={joint} className="slider-group">
                            <label>{joint.charAt(0).toUpperCase() + joint.slice(1)}</label>
                            <input
                                type="range"
                                min="0"
                                max={joint === 'gripper' ? 100 : 180}
                                value={val}
                                onChange={(e) => handleSliderChange(joint, parseInt(e.target.value))}
                            />
                            <span className="slider-val">{val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Controls;
