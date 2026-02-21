#include <Adafruit_GFX.h>    
#include <Adafruit_ST7735.h> 
#include <SPI.h>

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
  // 1. Draw "Radar" Scanner
  for(int i=0; i<160; i+=5) {
    tft.drawLine(80, 160, i, 0, ST7735_GREEN);
    delay(10);
  }
  tft.fillScreen(ST7735_BLACK);

  // 2. Draw Concentric Circles (Infrastructure Pulse)
  for(int r=10; r<60; r+=5) {
    tft.drawCircle(80, 80, r, ST7735_MAGENTA);
    delay(50);
  }
  
  // 3. Draw Solid Rectangles (System Load)
  for(int h=0; h<100; h+=10) {
    tft.fillRect(10, 10, h, 20, ST7735_YELLOW);
    delay(30);
  }
  
  delay(1000);
  tft.fillScreen(ST7735_BLACK);
}
