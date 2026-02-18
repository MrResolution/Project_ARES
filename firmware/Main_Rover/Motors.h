#ifndef MOTORS_H
#define MOTORS_H

#include <Arduino.h>

// Motor Pins (L298N)
#define MOTOR_L_EN 14
#define MOTOR_L_IN1 26
#define MOTOR_L_IN2 27
#define MOTOR_R_EN 15
#define MOTOR_R_IN1 32
#define MOTOR_R_IN2 33

class MotorController {
public:
    void begin() {
        pinMode(MOTOR_L_EN, OUTPUT);
        pinMode(MOTOR_L_IN1, OUTPUT);
        pinMode(MOTOR_L_IN2, OUTPUT);
        pinMode(MOTOR_R_EN, OUTPUT);
        pinMode(MOTOR_R_IN1, OUTPUT);
        pinMode(MOTOR_R_IN2, OUTPUT);
        stop();
    }

    void move(int speed, int turn) {
        // Simple differential drive mixing
        int leftSpeed = speed + turn;
        int rightSpeed = speed - turn;
        
        setMotor(1, leftSpeed);
        setMotor(2, rightSpeed);
    }
    
    void stop() {
        digitalWrite(MOTOR_L_IN1, LOW);
        digitalWrite(MOTOR_L_IN2, LOW);
        analogWrite(MOTOR_L_EN, 0);
        
        digitalWrite(MOTOR_R_IN1, LOW);
        digitalWrite(MOTOR_R_IN2, LOW);
        analogWrite(MOTOR_R_EN, 0);
    }

private:
    void setMotor(int motor, int speed) {
        int en, in1, in2;
        if(motor == 1) { en = MOTOR_L_EN; in1 = MOTOR_L_IN1; in2 = MOTOR_L_IN2; }
        else           { en = MOTOR_R_EN; in1 = MOTOR_R_IN1; in2 = MOTOR_R_IN2; }
        
        speed = constrain(speed, -255, 255);
        
        if(speed > 0) {
            digitalWrite(in1, HIGH);
            digitalWrite(in2, LOW);
        } else if (speed < 0) {
            digitalWrite(in1, LOW);
            digitalWrite(in2, HIGH);
        } else {
            digitalWrite(in1, LOW);
            digitalWrite(in2, LOW);
        }
        analogWrite(en, abs(speed));
    }
};

#endif
