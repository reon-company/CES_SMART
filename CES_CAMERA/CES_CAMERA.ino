//https://blog.naver.com/no1_devicemart/223018835439
#include "esp_camera.h"
#include <WiFi.h>
#include <Preferences.h>

// ===========================
// Select camera model in board_config.h
// ===========================
#include "board_config.h"
#include "camera_wifi_config.h"

void startCameraServer();
void setupLedFlash();

Preferences wifiPrefs;
String activeSsid;
String activePassword;

bool connectWiFi(const String &ssid, const String &password) {
  Serial.printf("WiFi connecting to SSID: %s\n", ssid.c_str());

  WiFi.disconnect(true, true);
  delay(300);
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(ssid.c_str(), password.c_str());

  const unsigned long start = millis();
  const unsigned long timeoutMs = 20000;
  while (WiFi.status() != WL_CONNECTED && millis() - start < timeoutMs) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    return true;
  }

  Serial.println();
  Serial.println("WiFi connection timeout");
  return false;
}

void loadWiFiConfig() {
  wifiPrefs.begin("camera-wifi", true);
  activeSsid = wifiPrefs.getString("ssid", CAMERA_WIFI_SSID);
  activePassword = wifiPrefs.getString("password", CAMERA_WIFI_PASSWORD);
  wifiPrefs.end();

  if (activeSsid.length() == 0) {
    activeSsid = CAMERA_WIFI_SSID;
  }
}

void saveWiFiConfig(const String &ssid, const String &password) {
  wifiPrefs.begin("camera-wifi", false);
  wifiPrefs.putString("ssid", ssid);
  wifiPrefs.putString("password", password);
  wifiPrefs.end();

  activeSsid = ssid;
  activePassword = password;
}

void clearWiFiConfig() {
  wifiPrefs.begin("camera-wifi", false);
  wifiPrefs.remove("ssid");
  wifiPrefs.remove("password");
  wifiPrefs.end();

  activeSsid = CAMERA_WIFI_SSID;
  activePassword = CAMERA_WIFI_PASSWORD;
}

void printConfigHelp() {
  Serial.println();
  Serial.println("=== WiFi Config Commands ===");
  Serial.println("HELP");
  Serial.println("SHOW_WIFI");
  Serial.println("SET_WIFI <ssid> <password>");
  Serial.println("CLEAR_WIFI");
  Serial.println("REBOOT");
  Serial.println("============================");
}

void handleSerialConfig() {
  if (!Serial.available()) {
    return;
  }

  String line = Serial.readStringUntil('\n');
  line.trim();
  if (line.length() == 0) {
    return;
  }

  if (line.equalsIgnoreCase("HELP")) {
    printConfigHelp();
    return;
  }

  if (line.equalsIgnoreCase("SHOW_WIFI")) {
    Serial.printf("ACTIVE_SSID=%s\n", activeSsid.c_str());
    Serial.printf("ACTIVE_PASSWORD_LEN=%d\n", activePassword.length());
    return;
  }

  if (line.startsWith("SET_WIFI ")) {
    String payload = line.substring(9);
    int separator = payload.indexOf(' ');
    if (separator <= 0 || separator >= payload.length() - 1) {
      Serial.println("Invalid format. Use: SET_WIFI <ssid> <password>");
      return;
    }

    String newSsid = payload.substring(0, separator);
    String newPassword = payload.substring(separator + 1);
    newSsid.trim();
    newPassword.trim();
    if (newSsid.length() == 0) {
      Serial.println("SSID cannot be empty");
      return;
    }

    saveWiFiConfig(newSsid, newPassword);
    Serial.println("Saved WiFi config to NVS");
    Serial.println("Reconnecting...");
    connectWiFi(activeSsid, activePassword);
    return;
  }

  if (line.equalsIgnoreCase("CLEAR_WIFI")) {
    clearWiFiConfig();
    Serial.println("Cleared saved WiFi config. Using fallback config.");
    connectWiFi(activeSsid, activePassword);
    return;
  }

  if (line.equalsIgnoreCase("REBOOT")) {
    Serial.println("Rebooting...");
    delay(300);
    ESP.restart();
    return;
  }

  Serial.println("Unknown command. Type HELP");
}

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

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
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG;  // for streaming
  //config.pixel_format = PIXFORMAT_RGB565; // for face detection/recognition
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  // if PSRAM IC present, init with UXGA resolution and higher JPEG quality
  //                      for larger pre-allocated frame buffer.
  if (config.pixel_format == PIXFORMAT_JPEG) {
    if (psramFound()) {
      config.jpeg_quality = 10;
      config.fb_count = 2;
      config.grab_mode = CAMERA_GRAB_LATEST;
    } else {
      // Limit the frame size when PSRAM is not available
      config.frame_size = FRAMESIZE_SVGA;
      config.fb_location = CAMERA_FB_IN_DRAM;
    }
  } else {
    // Best option for face detection/recognition
    config.frame_size = FRAMESIZE_240X240;
#if CONFIG_IDF_TARGET_ESP32S3
    config.fb_count = 2;
#endif
  }

#if defined(CAMERA_MODEL_ESP_EYE)
  pinMode(13, INPUT_PULLUP);
  pinMode(14, INPUT_PULLUP);
#endif

  // camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  sensor_t *s = esp_camera_sensor_get();
  // initial sensors are flipped vertically and colors are a bit saturated
  if (s->id.PID == OV3660_PID) {
    s->set_vflip(s, 1);        // flip it back
    s->set_brightness(s, 1);   // up the brightness just a bit
    s->set_saturation(s, -2);  // lower the saturation
  }
  // drop down frame size for higher initial frame rate
  if (config.pixel_format == PIXFORMAT_JPEG) {
    s->set_framesize(s, FRAMESIZE_QVGA);
  }

#if defined(CAMERA_MODEL_M5STACK_WIDE) || defined(CAMERA_MODEL_M5STACK_ESP32CAM)
  s->set_vflip(s, 1);
  s->set_hmirror(s, 1);
#endif

#if defined(CAMERA_MODEL_ESP32S3_EYE)
  s->set_vflip(s, 1);
#endif

// Setup LED FLash if LED pin is defined in camera_pins.h
#if defined(LED_GPIO_NUM)
  setupLedFlash();
#endif

  loadWiFiConfig();
  printConfigHelp();
  connectWiFi(activeSsid, activePassword);

  startCameraServer();

  Serial.print("Camera Ready! Use 'http://");
  Serial.print(WiFi.localIP());
  Serial.println("' to connect");
}

void loop() {
  handleSerialConfig();
  delay(20);
}
