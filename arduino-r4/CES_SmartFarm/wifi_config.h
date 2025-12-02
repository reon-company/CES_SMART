#ifndef WIFI_CONFIG_H
#define WIFI_CONFIG_H

#include <WiFiS3.h>
#include <EEPROM.h>

// EEPROM 주소 정의
#define EEPROM_SIZE 512
#define EEPROM_SSID_ADDR 0
#define EEPROM_PASSWORD_ADDR 64
#define EEPROM_CONFIGURED_ADDR 128

// WiFi 설정 관리 클래스
class WiFiConfig {
private:
  String ssid;
  String password;
  bool configured;
  
  // EEPROM에서 문자열 읽기
  String readStringFromEEPROM(int address, int maxLength) {
    String str = "";
    for (int i = 0; i < maxLength; i++) {
      char c = EEPROM.read(address + i);
      if (c == 0 || c == 255) break;
      str += c;
    }
    return str;
  }
  
  // EEPROM에 문자열 쓰기
  void writeStringToEEPROM(int address, String str, int maxLength) {
    for (int i = 0; i < maxLength; i++) {
      if (i < str.length()) {
        EEPROM.write(address + i, str.charAt(i));
      } else {
        EEPROM.write(address + i, 0);
      }
    }
  }

public:
  WiFiConfig() {
    // 주의: 이 생성자는 전역 객체로 생성될 때 호출됨
    // 이 시점에는 Serial이 아직 초기화되지 않았을 수 있음
    // Arduino R4 WiFi EEPROM은 begin() 없이 바로 사용 가능
    loadFromEEPROM();
  }
  
  // EEPROM에서 설정 로드
  void loadFromEEPROM() {
    // 주의: 이 함수는 생성자에서 호출될 수 있으므로 Serial 사용 주의
    configured = EEPROM.read(EEPROM_CONFIGURED_ADDR) == 1;
    if (configured) {
      ssid = readStringFromEEPROM(EEPROM_SSID_ADDR, 64);
      password = readStringFromEEPROM(EEPROM_PASSWORD_ADDR, 64);
    } else {
      ssid = "";
      password = "";
    }
  }
  
  // 설정 저장
  void save(String newSSID, String newPassword) {
    ssid = newSSID;
    password = newPassword;
    writeStringToEEPROM(EEPROM_SSID_ADDR, ssid, 64);
    writeStringToEEPROM(EEPROM_PASSWORD_ADDR, password, 64);
    EEPROM.write(EEPROM_CONFIGURED_ADDR, 1);
    // Arduino R4 WiFi EEPROM은 commit() 없이 즉시 저장됨
    configured = true;
  }
  
  // 설정 초기화
  void reset() {
    configured = false;
    ssid = "";
    password = "";
    EEPROM.write(EEPROM_CONFIGURED_ADDR, 0);
    // Arduino R4 WiFi EEPROM은 commit() 없이 즉시 저장됨
  }
  
  String getSSID() { return ssid; }
  String getPassword() { return password; }
  bool isConfigured() { return configured; }
  
  // WiFi AP 모드로 설정 페이지 시작
  void startConfigPortal() {
    Serial.println("Starting WiFi Configuration Portal...");
    
    // AP 모드로 시작
    WiFi.beginAP("CES_SmartFarm_Setup");
    IPAddress apIP(192, 168, 4, 1);
    WiFi.config(apIP);
    
    Serial.print("AP IP address: ");
    Serial.println(WiFi.localIP());
    Serial.println("Connect to WiFi: CES_SmartFarm_Setup");
    Serial.println("Then open browser: http://192.168.4.1");
    
    // 간단한 웹 서버 시작
    WiFiServer server(80);
    server.begin();
    
    while (true) {
      WiFiClient client = server.available();
      if (client) {
        Serial.println("New client connected");
        String request = "";
        
        while (client.connected()) {
          if (client.available()) {
            char c = client.read();
            request += c;
            
            if (request.endsWith("\r\n\r\n")) {
              break;
            }
          }
        }
        
        Serial.println(request);
        
        // 설정 페이지 HTML
        if (request.indexOf("GET / ") != -1 || request.indexOf("GET /index") != -1) {
          client.println("HTTP/1.1 200 OK");
          client.println("Content-Type: text/html");
          client.println("Connection: close");
          client.println();
          client.println("<!DOCTYPE HTML>");
          client.println("<html>");
          client.println("<head><meta charset='UTF-8'>");
          client.println("<title>CES SmartFarm WiFi 설정</title>");
          client.println("<style>");
          client.println("body { font-family: Arial; margin: 40px; background: #f0f0f0; }");
          client.println(".container { background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: 0 auto; }");
          client.println("h1 { color: #4CAF50; }");
          client.println("input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }");
          client.println("button { width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }");
          client.println("button:hover { background: #45a049; }");
          client.println("</style></head>");
          client.println("<body>");
          client.println("<div class='container'>");
          client.println("<h1>🌱 CES SmartFarm</h1>");
          client.println("<h2>WiFi 설정</h2>");
          client.println("<form method='POST' action='/save'>");
          client.println("<label>WiFi 이름 (SSID):</label>");
          client.println("<input type='text' name='ssid' required>");
          client.println("<label>WiFi 비밀번호:</label>");
          client.println("<input type='password' name='password' required>");
          client.println("<button type='submit'>설정 저장</button>");
          client.println("</form>");
          client.println("</div></body></html>");
        }
        // 설정 저장 처리
        else if (request.indexOf("POST /save") != -1) {
          // POST 데이터 파싱
          int ssidStart = request.indexOf("ssid=");
          int passwordStart = request.indexOf("password=");
          
          if (ssidStart != -1 && passwordStart != -1) {
            String newSSID = "";
            String newPassword = "";
            
            // SSID 추출
            int ssidEnd = request.indexOf("&", ssidStart);
            if (ssidEnd == -1) ssidEnd = request.indexOf(" ", ssidStart);
            newSSID = request.substring(ssidStart + 5, ssidEnd);
            newSSID.replace("+", " ");
            newSSID.replace("%20", " ");
            
            // Password 추출
            int passwordEnd = request.indexOf("&", passwordStart);
            if (passwordEnd == -1) passwordEnd = request.indexOf(" ", passwordStart);
            newPassword = request.substring(passwordStart + 9, passwordEnd);
            newPassword.replace("+", " ");
            newPassword.replace("%20", " ");
            
            // URL 디코딩 (간단한 버전)
            newSSID.replace("%21", "!");
            newSSID.replace("%40", "@");
            newPassword.replace("%21", "!");
            newPassword.replace("%40", "@");
            
            // 설정 저장
            save(newSSID, newPassword);
            
            Serial.print("WiFi 설정 저장됨: ");
            Serial.println(newSSID);
            
            // 성공 페이지
            client.println("HTTP/1.1 200 OK");
            client.println("Content-Type: text/html");
            client.println("Connection: close");
            client.println();
            client.println("<!DOCTYPE HTML>");
            client.println("<html><head><meta charset='UTF-8'>");
            client.println("<title>설정 완료</title>");
            client.println("<style>body { font-family: Arial; text-align: center; margin-top: 100px; }");
            client.println("h1 { color: #4CAF50; }</style></head>");
            client.println("<body><h1>✅ 설정이 저장되었습니다!</h1>");
            client.println("<p>아두이노를 재시작하면 WiFi에 연결됩니다.</p>");
            client.println("</body></html>");
            
            delay(2000);
            return; // 설정 완료, 루프 종료
          }
        }
        
        delay(10);
        client.stop();
        Serial.println("Client disconnected");
      }
    }
  }
  
  // WiFi 연결 시도 (EEPROM에서 로드한 정보 사용)
  bool connect() {
    if (!configured || ssid.length() == 0) {
      Serial.println("WiFi 설정이 없습니다. 설정 포털을 시작합니다.");
      startConfigPortal();
      return false;
    }
    
    return connect(ssid, password);
  }
  
  // WiFi 연결 시도 (SSID와 Password 직접 지정)
  bool connect(String wifiSSID, String wifiPassword) {
    if (wifiSSID.length() == 0 || wifiPassword.length() == 0) {
      Serial.println("WiFi SSID or password is empty!");
      return false;
    }
    
    Serial.print("WiFi에 연결 중: ");
    Serial.println(wifiSSID);
    
    WiFi.begin(wifiSSID.c_str(), wifiPassword.c_str());
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println();
      Serial.print("WiFi 연결 성공! IP 주소: ");
      Serial.println(WiFi.localIP());
      return true;
    } else {
      Serial.println();
      Serial.println("WiFi 연결 실패. 설정 포털을 시작합니다.");
      startConfigPortal();
      return false;
    }
  }
};

#endif

