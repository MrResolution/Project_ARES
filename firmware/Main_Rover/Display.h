#ifndef DISPLAY_H
#define DISPLAY_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

class DisplayManager {
public:
    void begin() {
        if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
            Serial.println(F("SSD1306 allocation failed"));
            return;
        }
        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(WHITE);
        display.setCursor(0, 0);
        display.println("A.R.E.S. System");
        display.display();
    }

    void updateStatus(String status, float temp, int gas) {
        display.clearDisplay();
        display.setCursor(0, 0);
        display.println("A.R.E.S. Active");
        display.print("Status: "); display.println(status);
        display.print("Temp: "); display.print(temp); display.println(" C");
        display.print("Gas: "); display.println(gas);
        display.display();
    }
};

#endif
