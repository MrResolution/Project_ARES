#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>
// #include <Adafruit_BMP280.h> // Example library

// Pin Definitions
#define PIN_GAS_MQ2 34
#define PIN_RAD_DETECTOR 35

struct SensorData {
    float temperature;
    float pressure;
    int gasLevel;
    int radiationCPM;
};

class SensorManager {
public:
    void begin() {
        pinMode(PIN_GAS_MQ2, INPUT);
        pinMode(PIN_RAD_DETECTOR, INPUT);
        // bmp.begin();
    }

    SensorData readAll() {
        SensorData data;
        data.temperature = 25.0; // Placeholder: bmp.readTemperature();
        data.pressure = 1013.25; // Placeholder: bmp.readPressure();
        data.gasLevel = analogRead(PIN_GAS_MQ2);
        data.radiationCPM = readRadiation(); 
        return data;
    }

private:
    int readRadiation() {
        // Simple pulse counting logic or analog read depending on sensor
        return random(10, 50); // Simulation
    }
};

#endif
