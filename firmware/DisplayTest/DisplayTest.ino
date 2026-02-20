#include <Adafruit_GFX.h>    
#include <Adafruit_ST7735.h> 
#include <SPI.h>

#define TFT_CS    5   
#define TFT_RST   4   
#define TFT_DC    2   // Connect to A0
#define TFT_MOSI  23  // Connect to SDA
#define TFT_SCLK  18  // Connect to SCK

Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);

void setup() {
  tft.initR(INITR_BLACKTAB); 
  tft.fillScreen(ST7735_BLACK);
}

void loop() {
  uint16_t testColors[] = {ST7735_RED, ST7735_GREEN, ST7735_BLUE, ST7735_YELLOW, ST7735_MAGENTA, ST7735_CYAN, ST7735_WHITE};
  for (int i = 0; i < 7; i++) {
    tft.fillScreen(testColors[i]);
    delay(500);
  }
}
