#include <Adafruit_GFX.h>    
#include <Adafruit_ST7735.h> 

#define TFT_CS    5   
#define TFT_RST   4   
#define TFT_DC    2   // Connect to A0
#define TFT_MOSI  23  // Connect to SDA
#define TFT_SCLK  18  // Connect to SCK

Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);

void setup() {
  tft.initR(INITR_BLACKTAB); 
  tft.fillScreen(ST7735_BLACK);
  tft.setTextWrap(false); 
  tft.setTextColor(ST7735_CYAN);
  tft.setTextSize(2);
}

void loop() {
  String message = "INFRASTRUCTURE ALERT: LEAK DETECTED ";
  int16_t x, y;
  uint16_t w, h;
  
  // Calculate width for smooth looping
  tft.getTextBounds(message, 0, 0, &x, &y, &w, &h);

  for (int pos = 160; pos > -(int)w; pos--) {
    tft.fillRect(0, 60, 160, 20, ST7735_BLACK); // Clear text line only
    tft.setCursor(pos, 60);
    tft.print(message);
    delay(5); // Adjust for "vibe" speed
  }
}
