#include <WiFi.h>
#include <WebServer.h>
#include <Adafruit_GFX.h>    
#include <Adafruit_ST7735.h> 
#include <SPI.h>

// -- WiFi Config --
const char* ssid = "12";
const char* password = "12345678";

// -- ST7735 Pinout --
#define TFT_CS    5   
#define TFT_RST   4   
#define TFT_DC    2   
#define TFT_MOSI  23  
#define TFT_SCLK  18  

Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);
WebServer server(80);

void setup() {
  Serial.begin(115200);
  
  // Init Display
  tft.initR(INITR_BLACKTAB); 
  tft.fillScreen(ST7735_BLACK);
  tft.setRotation(1); // Landscape
  
  tft.setCursor(10, 10);
  tft.setTextColor(ST7735_CYAN);
  tft.setTextSize(1);
  tft.println("A.R.E.S. BRIDGE");
  tft.setCursor(10, 30);
  tft.println("Connecting WiFi...");

  // Connect WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  tft.fillScreen(ST7735_BLACK);
  tft.setCursor(10, 10);
  tft.setTextColor(ST7735_GREEN);
  tft.println("WIFI: ONLINE");
  tft.setCursor(10, 25);
  tft.setTextColor(ST7735_WHITE);
  tft.print("IP: ");
  tft.println(WiFi.localIP());
  
  // Setup Server
  server.on("/", HTTP_GET, []() {
    server.send(200, "text/plain", "ARES OLED Bridge Active");
  });

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

void updateDisplay(String data) {
  tft.fillScreen(ST7735_BLACK);
  tft.setCursor(0, 0);
  tft.setTextColor(ST7735_CYAN);
  tft.setTextSize(1);
  tft.println("--- ARES LIVE ---");
  tft.println("");

  tft.setTextColor(ST7735_WHITE);
  
  // Simple parsing of "Key: Val, Key: Val"
  int start = 0;
  int end = data.indexOf(",");
  while (end != -1) {
    String pair = data.substring(start, end);
    pair.trim();
    tft.println(pair);
    
    start = end + 1;
    end = data.indexOf(",", start);
  }
  // Print last pair
  String lastPair = data.substring(start);
  lastPair.trim();
  
  // Special formatting for Alert at the bottom
  if (lastPair.startsWith("Alert:")) {
    tft.setCursor(0, 110);
    tft.setTextSize(2);
    if (lastPair.indexOf("SAFE") != -1) tft.setTextColor(ST7735_GREEN);
    else if (lastPair.indexOf("FIRE") != -1) tft.setTextColor(ST7735_RED);
    else tft.setTextColor(ST7735_YELLOW);
    tft.println(lastPair.substring(7));
  } else {
    tft.println(lastPair);
  }
}

void loop() {
  server.handleClient();
}
