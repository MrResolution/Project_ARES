#include <Adafruit_GFX.h>    
#include <Adafruit_ST7735.h> 

#define TFT_CS    5   
#define TFT_RST   4   
#define TFT_DC    2   // A0
#define TFT_MOSI  23  // SDA
#define TFT_SCLK  18  // SCK

Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);

void setup() {
  tft.initR(INITR_BLACKTAB); 
  tft.fillScreen(ST7735_BLACK);
}

void loop() {
  for (int angle = 0; angle < 360; angle += 10) {
    tft.fillScreen(ST7735_BLACK);
    
    // Calculate 3D Parallax Offsets
    float rad = angle * 0.01745;
    int x = 80 + (40 * cos(rad));
    int z_scale = 2 + (sin(rad) * 2); // Simulates depth scaling

    // Draw 3D "Shadow" for depth
    tft.setCursor(x + 2, 62);
    tft.setTextColor(ST7735_BLUE);
    tft.setTextSize(z_scale);
    tft.print("ARES");

    // Draw Main "ARES" Text
    tft.setCursor(x, 60);
    tft.setTextColor(ST7735_WHITE);
    tft.setTextSize(z_scale);
    tft.print("ARES");

    // Dynamic 3D Wireframe Line
    tft.drawLine(0, 128, x + 20, 60, ST7735_RED);
    
    delay(30);
  }
}
