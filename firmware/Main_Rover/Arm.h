#ifndef ARM_H
#define ARM_H

#include <Arduino.h>
#include <ESP32Servo.h>

#define SERVO_BASE_PIN 18
#define SERVO_SHOULDER_PIN 19
#define SERVO_ELBOW_PIN 21
#define SERVO_GRIPPER_PIN 22 // or separate ESP32-CAM mount control

class RoboticArm {
    Servo base;
    Servo shoulder;
    Servo elbow;
    Servo gripper;

public:
    void begin() {
        base.attach(SERVO_BASE_PIN);
        shoulder.attach(SERVO_SHOULDER_PIN);
        elbow.attach(SERVO_ELBOW_PIN);
        gripper.attach(SERVO_GRIPPER_PIN);
        home();
    }

    void home() {
        base.write(90);
        shoulder.write(90);
        elbow.write(90);
        gripper.write(0);
    }

    void setPose(int b, int s, int e, int g) {
        base.write(b);
        shoulder.write(s);
        elbow.write(e);
        gripper.write(g);
    }
    
    // Remote inspection mode - moves arm to scan area
    void scanRoutine() {
        for(int i=45; i<135; i+=5) {
            base.write(i);
            delay(100);
        }
        home();
    }
};

#endif
