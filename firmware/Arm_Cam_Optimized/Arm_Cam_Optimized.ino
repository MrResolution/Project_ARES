#include "esp_camera.h"
#include <WiFi.h>

// ===========================
// CAMERA MODEL CONFIGURATION
// ===========================
// Assuming the most common Ai-Thinker module
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// ===========================
// WI-FI CONFIGURATION
// ===========================
const char* ssid = "12";
const char* password = "12345678";

// ===========================
// STREAM CONFIGURATION
// ===========================
#define PART_BOUNDARY "123456789000000000000987654321"
static const char* _STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char* _STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
static const char* _STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

WiFiServer server(81);

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  // 1. Camera Hardware Configuration
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;

  // 2. Camera Software Optimization
  // XCLK frequency. Higher = higher framerate but potentially less stable. (Default is often 20000000)
  config.xclk_freq_hz = 10000000; // Dropping to 10MHz significantly increases stability and reduces heat/power
  config.pixel_format = PIXFORMAT_JPEG; 
  
  // Resolution: Lower resolution = faster frame rates and less memory usage
  // FRAMESIZE_VGA (640x480), FRAMESIZE_QVGA (320x240), etc.
  config.frame_size = FRAMESIZE_VGA; 

  // Quality: 10-63. Lower number means HIGH quality. Higher number means LOW quality (more compression).
  config.jpeg_quality = 12; 

  // Frame Buffers: More buffers = smoother stream but uses more memory overhead.
  if(psramFound()) {
    config.fb_count = 2; // Use ping-pong buffers if PSRAM is available
  } else {
    config.fb_count = 1;
  }

  // Initialize the camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
  
  // Specific sensor optimzations (e.g. for OV2640)
  sensor_t * s = esp_camera_sensor_get();
  s->set_vflip(s, 0); // vertically flip
  s->set_hmirror(s, 0); // horizontally flip
  // OPTIMIZATION: Drop quality slightly to improve framerate drastically
  s->set_quality(s, 15); // Adjust from 10-63. (Lower is better quality)
  // OPTIMIZATION: Limit the AE level to keep frame rates up in low light
  s->set_ae_level(s, 0); // -2 to 2

  // 3. Wi-Fi Connection
  WiFi.begin(ssid, password);
  WiFi.setSleep(false); // OPTIMIZATION: Disable Wi-Fi sleep for more stable connectivity

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  
  // Start server on port 81 (Common for IP cameras)
  server.begin();
  
  Serial.print("Camera Stream Ready! Connect to: http://");
  Serial.print(WiFi.localIP());
  Serial.println(":81/stream");
}


// Lightweight streaming handler
void handleStream(WiFiClient client) {
  uint32_t t_last = millis(); // for calculating fps
  
  // Send the initial HTTP header
  client.print("HTTP/1.1 200 OK\r\n");
  client.print("Content-Type: ");
  client.print(_STREAM_CONTENT_TYPE);
  client.print("\r\n");
  client.print("Access-Control-Allow-Origin: *\r\n"); // Important for viewing from a browser
  client.print("\r\n");

  uint32_t ms_per_frame = 100; // Target roughly 10 FPS (1000ms / 10). Adjust to shape bandwidth.

  while (client.connected()) {
    camera_fb_t * fb = esp_camera_fb_get();
    
    if (!fb) {
      Serial.println("Camera capture failed");
      break;
    }

    // Attempt to shape the frame rate to prevent network buffer overflows
    // if a frame comes in too fast, just throw it back
    if (millis() - t_last < ms_per_frame) {
        esp_camera_fb_return(fb); 
        continue; // skip this iteration
    }

    // Send the boundary and part header
    client.print(_STREAM_BOUNDARY);
    client.printf(_STREAM_PART, fb->len);
    
    // Write the raw JPEG data out
    size_t bytes_written = client.write(fb->buf, fb->len);
    
    // Return the frame buffer back to the camera driver
    esp_camera_fb_return(fb);
    
    if (bytes_written != fb->len) {
      Serial.println("Client disconnected or error writing");
      break;
    }
    
    t_last = millis(); // Reset frame timer
  }
}

void loop() {
  WiFiClient client = server.available();
  if (client) {
    Serial.println("New client connected");
    client.setTimeout(2); // Short timeout to prevent locking up

    // Basic HTTP request parsing (just looking for an empty line to denote end of headers)
    String currentLine = "";
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        
        // If we received a newline, the line is blank, so headers are done
        if (c == '\n') {
          if (currentLine.length() == 0) {
            handleStream(client); // Start streaming!
            break;
          } else {
            currentLine = "";
          }
        } else if (c != '\r') {
          currentLine += c;
        }
      }
    }
    Serial.println("Client disconnected");
    client.stop();
  }
}
