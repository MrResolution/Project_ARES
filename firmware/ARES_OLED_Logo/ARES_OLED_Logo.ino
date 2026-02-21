#include <WiFi.h>
#include <WebServer.h>
#include <Adafruit_GFX.h>    
#include <Adafruit_ST7735.h> 
#include <SPI.h>
#include "rover_logo.h"

/* ================= WIFI ================= */
const char* ssid = "12";
const char* password = "12345678";

/* ================= TFT PINS ================= */
#define TFT_CS    5   
#define TFT_RST   4   
#define TFT_DC    2   
#define TFT_MOSI  23  
#define TFT_SCLK  18  

Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);
WebServer server(80);

/* ================= SPLASH SCREEN ================= */
void showSplashScreen() {
  tft.fillScreen(ST77XX_BLACK);
  
  // Center the logo
  int x = (160 - logo_width) / 2;
  int y = (128 - logo_height) / 3; 
  
  tft.drawRGBBitmap(x, y, rover_logo, logo_width, logo_height);
  
  tft.setTextSize(1);
  tft.setTextColor(0xFC00); // ORANGE
  tft.setCursor(45, y + logo_height + 15);
  tft.print("A.R.E.S. BRIDGE");
  
  tft.setTextColor(ST77XX_WHITE);
  tft.setCursor(40, 110);
  tft.print("SYSTEM INITIALIZING");
}

/* ================= UPDATE DISPLAY ================= */
void updateDisplay(String data) {
  tft.fillScreen(ST77XX_BLACK);
  tft.setCursor(0, 0);
  tft.setTextColor(ST77XX_CYAN);
  tft.setTextSize(1);
  tft.println("--- ARES LIVE ---");
  tft.println("");

  tft.setTextColor(ST77XX_WHITE);
  
  // Parsing "Key: Val, Key: Val" format
  int start = 0;
  int end = data.indexOf(",");
  while (end != -1) {
    String pair = data.substring(start, end);
    pair.trim();
    tft.println(pair);
    
    start = end + 1;
    end = data.indexOf(",", start);
  }
  
  // Handle the last metric (Alert)
  String lastPair = data.substring(start);
  lastPair.trim();
  
  // Special Alert Logic (Large font at the bottom)
  if (lastPair.startsWith("Alert:")) {
    tft.setCursor(0, 105);
    tft.setTextSize(2);
    if (lastPair.indexOf("SAFE") != -1) tft.setTextColor(ST77XX_GREEN);
    else if (lastPair.indexOf("FIRE") != -1) tft.setTextColor(ST77XX_RED);
    else tft.setTextColor(ST77XX_YELLOW);
    tft.println(lastPair.substring(7));
  } else {
    tft.println(lastPair);
  }
}

/* ================= SETUP ================= */
void setup() {
  Serial.begin(115200);
  
  // Init Display
  tft.initR(INITR_BLACKTAB); 
  tft.setRotation(1); // Landscape mode
  
  // Show Splash Screen
  showSplashScreen();

  // Connect WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Online");
  tft.fillScreen(ST77XX_BLACK);
  tft.setCursor(10, 10);
  tft.setTextColor(ST77XX_GREEN);
  tft.println("WIFI: ONLINE");
  tft.setCursor(10, 25);
  tft.setTextColor(ST77XX_WHITE);
  tft.print("IP: ");
  tft.println(WiFi.localIP());
  
  // -- Setup Endpoint --
  server.on("/upload", HTTP_POST, []() {
    if (server.hasArg("plain")) {
      String data = server.arg("plain");
      updateDisplay(data);
      server.send(200, "text/plain", "OK");
    } else {
      server.send(400, "text/plain", "No Data");
    }
  });

  server.begin();
  Serial.println("Bridge Ready");
}

/* ================= LOOP ================= */
void loop() {
  server.handleClient();
}
