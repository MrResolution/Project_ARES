#ifndef NAVIGATION_H
#define NAVIGATION_H

#include <Arduino.h>
#include "Motors.h"

// Placeholder for LiDAR serial interface
// #include <RPLidar.h> 

class NavigationSystem {
    MotorController* motors;
    bool autoMode = false;

public:
    NavigationSystem(MotorController* m) : motors(m) {}

    void begin() {
        // LiDAR.begin(Serial2);
    }

    void toggleAutonomous(bool enable) {
        autoMode = enable;
        if(!autoMode) motors->stop();
    }

    void update() {
        if(!autoMode) return;
        
        // Simple obstacle avoidance logic
        float distance = readFrontDistance();
        
        if(distance < 30.0 && distance > 0) {
            // Obstacle! Turn
            motors->move(0, 150); // Spin right
        } else {
            // Clear path
            motors->move(150, 0); // Forward
        }
    }
    
    float readFrontDistance() {
        // Placeholder for LiDAR read
        // In real impl, read RPLidar data
        return random(20, 200); // Simulated distance cm
    }
};

#endif
