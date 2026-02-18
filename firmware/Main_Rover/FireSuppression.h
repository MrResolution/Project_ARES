#ifndef FIRESUPPRESSION_H
#define FIRESUPPRESSION_H

#include <Arduino.h>
#include <ESP32Servo.h>

#define PIN_PUMP_RELAY 26
#define PIN_NOZZLE_SERVO 27

Servo nozzleServo;

class FireSuppressionSystem {
public:
    void begin() {
        pinMode(PIN_PUMP_RELAY, OUTPUT);
        digitalWrite(PIN_PUMP_RELAY, LOW); // Off by default
        
        nozzleServo.attach(PIN_NOZZLE_SERVO);
        nozzleServo.write(90); // Center position
    }

    void activate(int targetAngle = 90) {
        // Aim
        nozzleServo.write(targetAngle);
        delay(500);
        
        // Spray
        digitalWrite(PIN_PUMP_RELAY, HIGH);
        Serial.println("FIRE SUPPRESSION ACTIVE!");
    }

    void deactivate() {
        digitalWrite(PIN_PUMP_RELAY, LOW);
    }
    
    // Check local sensors for immediate thermal runaway
    bool checkAutoTrigger(float temperature) {
        if (temperature > 80.0) { // Safety threshold
            activate();
            return true;
        }
        return false;
    }
};

#endif
