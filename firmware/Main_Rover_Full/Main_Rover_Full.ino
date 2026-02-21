#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <MPU6050.h>
#include <TinyGPS++.h>
#include <ESP32Servo.h>
#include <SPI.h>
#include <SD.h>

/* ================= WIFI ================= */
const char* ssid     = "12";
const char* password = "12345678";
WebServer server(80);

/* ================= SD ================= */
#define SD_CS 5
File logFile;
unsigned long lastLogTime = 0;
const unsigned long logInterval = 5000;

/* ================= SERVOS ================= */
Servo baseServo, shoulderServo, elbow1Servo, elbow2Servo;
int basePos = 90, shoulderPos = 90, elbow1Pos = 90, elbow2Pos = 90;

/* ================= PINS ================= */
#define BASE_PIN      13
#define SHOULDER_PIN  12
#define ELBOW1_PIN    14
#define ELBOW2_PIN    27
#define MQ135_PIN     34
#define WATER_PIN     35
#define FLAME_PIN     26

/* ================= SENSORS ================= */
MPU6050 mpu;
Adafruit_BMP280 bmp;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

/* ================= CORS HELPER ================= */
void addCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin",  "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

/* ================= OPTIONS PREFLIGHT ================= */
void handleOptions() {
  addCORSHeaders();
  server.send(204);
}

/* ================= SMOOTH SERVO ================= */
void smoothMove(Servo &servo, int &current, int target) {
  target = constrain(target, 0, 180);
  if (target > current) {
    for (int i = current; i <= target; i++) { servo.write(i); delay(10); }
  } else {
    for (int i = current; i >= target; i--) { servo.write(i); delay(10); }
  }
  current = target;
}

/* ================= SD LOG ================= */
void logToSD(int air, int water, int flame,
             float temp, float pressure,
             int16_t ax, int16_t ay, int16_t az,
             int16_t gx, int16_t gy, int16_t gz,
             double lat, double lng) {

  logFile = SD.open("/blackbox.csv", FILE_APPEND);
  if (!logFile) return;

  logFile.print(millis());   logFile.print(",");
  logFile.print(air);        logFile.print(",");
  logFile.print(water);      logFile.print(",");
  logFile.print(flame);      logFile.print(",");
  logFile.print(temp);       logFile.print(",");
  logFile.print(pressure);   logFile.print(",");
  logFile.print(ax);         logFile.print(",");
  logFile.print(ay);         logFile.print(",");
  logFile.print(az);         logFile.print(",");
  logFile.print(gx);         logFile.print(",");
  logFile.print(gy);         logFile.print(",");
  logFile.print(gz);         logFile.print(",");
  logFile.print(lat, 6);     logFile.print(",");
  logFile.print(lng, 6);     logFile.print(",");
  logFile.print(basePos);    logFile.print(",");
  logFile.print(shoulderPos);logFile.print(",");
  logFile.print(elbow1Pos);  logFile.print(",");
  logFile.println(elbow2Pos);
  logFile.close();
}

/* ================= JSON DATA ================= */
void handleData() {

  int air   = analogRead(MQ135_PIN);
  int water = analogRead(WATER_PIN);
  int flame = digitalRead(FLAME_PIN);

  int16_t ax, ay, az, gx, gy, gz;
  mpu.getAcceleration(&ax, &ay, &az);
  mpu.getRotation(&gx, &gy, &gz);

  float temp     = bmp.readTemperature();
  float pressure = bmp.readPressure() / 100.0F;

  double lat = 0, lng = 0;
  while (gpsSerial.available()) gps.encode(gpsSerial.read());
  if (gps.location.isValid()) {
    lat = gps.location.lat();
    lng = gps.location.lng();
  }

  String json = "{";
  json += "\"air\":"      + String(air)          + ",";
  json += "\"water\":"    + String(water)         + ",";
  json += "\"flame\":"    + String(flame)         + ",";
  json += "\"temp\":"     + String(temp)          + ",";
  json += "\"pressure\":" + String(pressure)      + ",";
  json += "\"ax\":"       + String(ax)            + ",";
  json += "\"ay\":"       + String(ay)            + ",";
  json += "\"az\":"       + String(az)            + ",";
  json += "\"gx\":"       + String(gx)            + ",";
  json += "\"gy\":"       + String(gy)            + ",";
  json += "\"gz\":"       + String(gz)            + ",";
  json += "\"lat\":"      + String(lat, 6)        + ",";
  json += "\"lng\":"      + String(lng, 6);
  json += "}";

  addCORSHeaders();
  server.send(200, "application/json", json);

  if (millis() - lastLogTime >= logInterval) {
    logToSD(air, water, flame, temp, pressure, ax, ay, az, gx, gy, gz, lat, lng);
    lastLogTime = millis();
  }
}

/* ================= DASHBOARD ================= */
void handleRoot() {
  addCORSHeaders();
  server.send(200, "text/plain", "ESP32 OK - open dashboard.html in your browser");
}

/* ================= ARM CONTROL ================= */
void handleMove() {
  int b  = server.arg("b").toInt();
  int s  = server.arg("s").toInt();
  int e1 = server.arg("e1").toInt();
  int e2 = server.arg("e2").toInt();

  smoothMove(baseServo,   basePos,     b);
  smoothMove(shoulderServo, shoulderPos, s);
  smoothMove(elbow1Servo, elbow1Pos,   e1);
  smoothMove(elbow2Servo, elbow2Pos,   e2);

  addCORSHeaders();
  server.send(200, "text/plain", "Moved");
}

/* ================= SETUP ================= */
void setup() {

  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);

  pinMode(FLAME_PIN, INPUT);

  Wire.begin();
  mpu.initialize();
  bmp.begin(0x76);

  baseServo.attach(BASE_PIN);
  shoulderServo.attach(SHOULDER_PIN);
  elbow1Servo.attach(ELBOW1_PIN);
  elbow2Servo.attach(ELBOW2_PIN);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());

  SD.begin(SD_CS);

  server.on("/",       HTTP_GET,     handleRoot);
  server.on("/data",   HTTP_GET,     handleData);
  server.on("/data",   HTTP_OPTIONS, handleOptions);
  server.on("/move",   HTTP_GET,     handleMove);
  server.on("/move",   HTTP_OPTIONS, handleOptions);

  server.begin();
  Serial.println("HTTP server started");
}

/* ================= LOOP ================= */
void loop() {
  server.handleClient();
}
