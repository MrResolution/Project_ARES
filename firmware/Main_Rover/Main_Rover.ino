/*
 * Project A.R.E.S. - Main Rover Firmware
 * Target: ESP32 / Arduino Mega (Dual Architecture)
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>

#include "Sensors.h"
#include "Motors.h"
#include "Arm.h"
#include "Navigation.h"
#include "FireSuppression.h"
#include "Display.h"

// -- Configuration --
#define WIFI_SSID "ARES_NET"
#define WIFI_PASS "securepassword"
#define BACKEND_URL "http://192.168.1.100:5000/api/telemetry"

// -- Global Objects --
SensorManager sensors;
MotorController motors;
RoboticArm arm;
NavigationSystem nav(&motors);
FireSuppressionSystem fireSystem;
DisplayManager display;

long lastTelemetryTime = 0;

void setup() {
    Serial.begin(115200);
    Serial.println("A.R.E.S. System Initializing...");

    // Initialize Subsystems
    display.begin();
    sensors.begin();
    motors.begin();
    arm.begin();
    fireSystem.begin();
    
    // Connect to WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    int attempts = 0;
    while(WiFi.status() != WL_CONNECTED && attempts < 10) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if(WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi Connected");
        display.updateStatus("Online", 0, 0);
    } else {
        Serial.println("\nWiFi Failed - Offline Mode");
        display.updateStatus("Offline", 0, 0);
    }
    
    Serial.println("System Ready.");
}

void loop() {
    // 1. Read Sensors
    SensorData data = sensors.readAll();
    
    // 2. Update Display
    static long lastDisplayUpdate = 0;
    if(millis() - lastDisplayUpdate > 1000) {
        display.updateStatus(WiFi.status() == WL_CONNECTED ? "Online" : "Offline", data.temperature, data.gasLevel);
        lastDisplayUpdate = millis();
    }
    
    // 3. Safety Checks (Local Edge Logic)
    if(fireSystem.checkAutoTrigger(data.temperature)) {
        display.updateStatus("FIRE ALERT!", data.temperature, 999);
        // Stop moving if fire detected
        motors.stop();
    }
    
    // 4. Navigation Loop
    nav.update();
    
    // 5. Send Telemetry to Backend
    if(millis() - lastTelemetryTime > 2000 && WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(BACKEND_URL);
        http.addHeader("Content-Type", "application/json");
        
        String json = "{";
        json += "\"temp\":" + String(data.temperature) + ",";
        json += "\"pressure\":" + String(data.pressure) + ",";
        json += "\"gas\":" + String(data.gasLevel) + ",";
        json += "\"radiation\":" + String(data.radiationCPM);
        json += "}";
        
        int httpResponseCode = http.POST(json);
        if(httpResponseCode > 0) {
            Serial.printf("Telemetry Sent: %d\n", httpResponseCode);
        }
        http.end();
        
        lastTelemetryTime = millis();
    }
    
    // 6. Check for Incoming Commands (UDP/TCP/HTTP)
    // implementation pending...
}
