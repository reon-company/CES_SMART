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
  
  // EEPROM에서 문자열 읽기 (0 또는 255를 만나면 중단)
  String readStringFromEEPROM(int address, int maxLength) {
    String str = "";
    for (int i = 0; i < maxLength; i++) {
      char c = EEPROM.read(address + i);
      // 0 또는 255 (초기화되지 않은 값)를 만나면 중단
      if (c == 0 || c == 255) break;
      // 유효한 ASCII 문자만 추가 (32-126 범위)
      if (c >= 32 && c <= 126) {
        str += c;
      } else {
        // 유효하지 않은 문자를 만나면 중단
        break;
      }
    }
    return str;
  }
  
  // EEPROM에 문자열 쓰기 (이전 값 완전 삭제 후 쓰기)
  void writeStringToEEPROM(int address, String str, int maxLength) {
    // 먼저 전체 영역을 0으로 초기화 (이전 값 완전 삭제)
    for (int i = 0; i < maxLength; i++) {
      EEPROM.write(address + i, 0);
    }
    // 약간의 지연 (EEPROM 쓰기 완료 대기)
    delay(10);
    
    // 새 문자열 쓰기
    for (int i = 0; i < maxLength; i++) {
      if (i < str.length()) {
        EEPROM.write(address + i, str.charAt(i));
      } else {
        EEPROM.write(address + i, 0);
      }
    }
    // EEPROM 쓰기 완료 대기
    delay(10);
  }

public:
  WiFiConfig() {
    // Constructor runs before setup() - must be safe
    // Initialize to safe defaults first (no EEPROM access in constructor)
    configured = false;
    ssid = "";
    password = "";
    
    // NOTE: EEPROM access moved to loadFromEEPROM() which is called
    // explicitly in setup() after Serial is ready
    // This prevents constructor from blocking or failing
  }
  
  // EEPROM에서 설정 로드 (setup()에서 호출)
  void loadFromEEPROM() {
    // Safe EEPROM read
    configured = false;
    ssid = "";
    password = "";
    
    // Read configuration flag
    uint8_t configFlag = EEPROM.read(EEPROM_CONFIGURED_ADDR);
    configured = (configFlag == 1);
    
    if (configured) {
      ssid = readStringFromEEPROM(EEPROM_SSID_ADDR, 64);
      password = readStringFromEEPROM(EEPROM_PASSWORD_ADDR, 64);
      
      // Validate: if SSID is empty, treat as not configured
      if (ssid.length() == 0) {
        configured = false;
        password = "";
      }
    }
  }
  
  // 설정 저장 (이전 값 완전 삭제 후 저장)
  void save(String newSSID, String newPassword) {
    Serial.println();
    Serial.println("========================================");
    Serial.println("EEPROM에 WiFi 설정 저장 중...");
    Serial.print("새 SSID: ");
    Serial.println(newSSID);
    Serial.print("SSID 길이: ");
    Serial.println(newSSID.length());
    Serial.println("========================================");
    
    // 먼저 EEPROM 영역을 완전히 초기화
    Serial.println("이전 EEPROM 데이터 삭제 중...");
    for (int i = 0; i < 64; i++) {
      EEPROM.write(EEPROM_SSID_ADDR + i, 0);
      EEPROM.write(EEPROM_PASSWORD_ADDR + i, 0);
    }
    EEPROM.write(EEPROM_CONFIGURED_ADDR, 0);
    delay(50); // EEPROM 쓰기 완료 대기
    
    // 새 설정 저장
    ssid = newSSID;
    password = newPassword;
    
    Serial.println("새 WiFi 정보를 EEPROM에 저장 중...");
    writeStringToEEPROM(EEPROM_SSID_ADDR, ssid, 64);
    writeStringToEEPROM(EEPROM_PASSWORD_ADDR, password, 64);
    EEPROM.write(EEPROM_CONFIGURED_ADDR, 1);
    delay(50); // EEPROM 쓰기 완료 대기
    
    // 저장 검증: EEPROM에서 다시 읽어서 확인
    Serial.println("EEPROM 저장 검증 중...");
    String verifySSID = readStringFromEEPROM(EEPROM_SSID_ADDR, 64);
    String verifyPassword = readStringFromEEPROM(EEPROM_PASSWORD_ADDR, 64);
    
    Serial.print("검증된 SSID: ");
    Serial.println(verifySSID);
    Serial.print("검증된 SSID 길이: ");
    Serial.println(verifySSID.length());
    
    if (verifySSID == ssid) {
      Serial.println("✅ EEPROM 저장 검증 성공!");
      configured = true;
    } else {
      Serial.println("❌ EEPROM 저장 검증 실패! 다시 시도...");
      // 다시 저장 시도
      for (int i = 0; i < 64; i++) {
        EEPROM.write(EEPROM_SSID_ADDR + i, 0);
        EEPROM.write(EEPROM_PASSWORD_ADDR + i, 0);
      }
      delay(50);
      writeStringToEEPROM(EEPROM_SSID_ADDR, ssid, 64);
      writeStringToEEPROM(EEPROM_PASSWORD_ADDR, password, 64);
      EEPROM.write(EEPROM_CONFIGURED_ADDR, 1);
      delay(50);
      
      // 다시 검증
      verifySSID = readStringFromEEPROM(EEPROM_SSID_ADDR, 64);
      if (verifySSID == ssid) {
        Serial.println("✅ 재시도 후 EEPROM 저장 검증 성공!");
        configured = true;
      } else {
        Serial.println("❌ EEPROM 저장 실패! 설정 포털을 다시 시작합니다.");
        configured = false;
      }
    }
    Serial.println("========================================");
  }
  
  // 설정 초기화 (EEPROM 영역 완전 삭제)
  void reset() {
    Serial.println("EEPROM WiFi 설정 초기화 중...");
    configured = false;
    ssid = "";
    password = "";
    
    // EEPROM 영역을 0으로 완전 초기화
    for (int i = 0; i < 64; i++) {
      EEPROM.write(EEPROM_SSID_ADDR + i, 0);
      EEPROM.write(EEPROM_PASSWORD_ADDR + i, 0);
    }
    EEPROM.write(EEPROM_CONFIGURED_ADDR, 0);
    delay(50); // EEPROM 쓰기 완료 대기
    Serial.println("✅ EEPROM 초기화 완료");
  }
  
  String getSSID() { return ssid; }
  String getPassword() { return password; }
  bool isConfigured() { return configured; }
  
  // WiFi 상태 코드를 문자열로 변환
  String getWiFiStatusString(int status) {
    switch (status) {
      case WL_IDLE_STATUS:      return "WL_IDLE_STATUS (대기 중)";
      case WL_NO_SSID_AVAIL:     return "WL_NO_SSID_AVAIL (SSID 없음)";
      case WL_SCAN_COMPLETED:    return "WL_SCAN_COMPLETED (스캔 완료)";
      case WL_CONNECTED:         return "WL_CONNECTED (연결됨)";
      case WL_CONNECT_FAILED:    return "WL_CONNECT_FAILED (연결 실패)";
      case WL_CONNECTION_LOST:   return "WL_CONNECTION_LOST (연결 끊김)";
      case WL_DISCONNECTED:      return "WL_DISCONNECTED (연결 해제됨)";
      case WL_AP_LISTENING:      return "WL_AP_LISTENING (AP 모드 대기 중)";
      case WL_AP_CONNECTED:      return "WL_AP_CONNECTED (AP 모드 연결됨)";
      case WL_AP_FAILED:         return "WL_AP_FAILED (AP 모드 실패)";
      default:                   return "알 수 없는 상태 (" + String(status) + ")";
    }
  }
  
  // WiFi AP 모드로 설정 페이지 시작
  void startConfigPortal() {
    Serial.println();
    Serial.println("========================================");
    Serial.println("🌐 WiFi Configuration Portal 시작");
    Serial.println("========================================");
    
    // 현재 WiFi 상태 확인
    Serial.print("현재 WiFi 상태: ");
    int currentStatus = WiFi.status();
    Serial.println(getWiFiStatusString(currentStatus));
    
    // 기존 WiFi 연결 종료
    if (currentStatus == WL_CONNECTED) {
      Serial.println("기존 WiFi 연결 종료 중...");
      WiFi.disconnect();
      delay(500);
      Serial.print("연결 종료 후 상태: ");
      Serial.println(getWiFiStatusString(WiFi.status()));
    }
    
    Serial.println();
    Serial.println("AP 모드로 전환 시도 중...");
    Serial.print("AP 이름: CES_SmartFarm_Setup");
    Serial.println();
    
    // AP 모드로 시작 (Arduino R4 WiFi)
    int status = WiFi.beginAP("CES_SmartFarm_Setup");
    
    Serial.print("beginAP() 반환값: ");
    Serial.println(status);
    Serial.print("상태 설명: ");
    Serial.println(getWiFiStatusString(status));
    
    // 상태 확인을 위해 잠시 대기
    delay(2000);
    
    // 다시 상태 확인
    int newStatus = WiFi.status();
    Serial.print("2초 후 WiFi 상태: ");
    Serial.println(getWiFiStatusString(newStatus));
    
    if (newStatus != WL_AP_LISTENING && newStatus != WL_AP_CONNECTED) {
      Serial.println();
      Serial.println("❌ AP 모드 시작 실패!");
      Serial.print("상태 코드: ");
      Serial.println(newStatus);
      Serial.println("가능한 원인:");
      Serial.println("  1. WiFi 모듈 초기화 실패");
      Serial.println("  2. 하드웨어 문제");
      Serial.println("  3. 보드 리셋 필요");
      Serial.println();
      Serial.println("보드를 리셋하고 다시 시도하세요.");
      delay(5000);
      return;
    }
    
    // AP IP 주소 확인
    delay(1000); // AP 모드 초기화 대기
    IPAddress apIP = WiFi.localIP();
    
    Serial.println();
    Serial.println("========================================");
    Serial.println("✅ AP 모드 시작 성공!");
    Serial.println("========================================");
    Serial.print("AP IP 주소: ");
    Serial.println(apIP);
    Serial.print("AP MAC 주소: ");
    uint8_t mac[6];
    WiFi.macAddress(mac);
    Serial.print(mac[0], HEX);
    for (int i = 1; i < 6; i++) {
      Serial.print(":");
      if (mac[i] < 16) Serial.print("0");
      Serial.print(mac[i], HEX);
    }
    Serial.println();
    Serial.println("========================================");
    Serial.println();
    Serial.println("📱 스마트폰이나 컴퓨터에서 다음 WiFi에 연결하세요:");
    Serial.println("   WiFi 이름: CES_SmartFarm_Setup");
    Serial.println("   비밀번호: 없음");
    Serial.println();
    Serial.print("🌐 그 다음 브라우저에서 다음 주소로 접속하세요: ");
    Serial.print("http://");
    Serial.println(apIP);
    Serial.println();
    Serial.println("⏳ 클라이언트 연결 대기 중...");
    Serial.println("========================================");
    
    // 간단한 웹 서버 시작
    WiFiServer server(80);
    server.begin();
    Serial.println("웹 서버 시작됨 (포트 80)");
    Serial.println();
    
    unsigned long lastStatusCheck = 0;
    
    while (true) {
      // 5초마다 AP 상태 확인
      if (millis() - lastStatusCheck > 5000) {
        lastStatusCheck = millis();
        int apStatus = WiFi.status();
        Serial.print("[");
        Serial.print(millis() / 1000);
        Serial.print("초] AP 상태: ");
        Serial.println(getWiFiStatusString(apStatus));
        Serial.print("   AP IP: ");
        Serial.println(WiFi.localIP());
        Serial.println("   클라이언트 연결 대기 중...");
      }
      
      WiFiClient client = server.available();
      if (client) {
        Serial.println();
        Serial.println("========================================");
        Serial.println("✅ 새 클라이언트 연결됨!");
        Serial.print("클라이언트 IP: ");
        Serial.println(client.remoteIP());
        Serial.println("========================================");
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
            
            if (!configured) {
              // 저장 실패
              client.println("HTTP/1.1 200 OK");
              client.println("Content-Type: text/html");
              client.println("Connection: close");
              client.println();
              client.println("<!DOCTYPE HTML>");
              client.println("<html><head><meta charset='UTF-8'>");
              client.println("<title>설정 실패</title>");
              client.println("<style>body { font-family: Arial; text-align: center; margin-top: 100px; }");
              client.println("h1 { color: #f44336; }</style></head>");
              client.println("<body><h1>❌ 설정 저장 실패</h1>");
              client.println("<p>EEPROM에 저장하는데 실패했습니다.</p>");
              client.println("<p>다시 시도해주세요.</p>");
              client.println("</body></html>");
              delay(1000);
              client.stop();
              return;
            }
            
            Serial.println();
            Serial.println("========================================");
            Serial.println("✅ WiFi 설정 저장 완료!");
            Serial.print("저장된 SSID: ");
            Serial.println(newSSID);
            Serial.println("========================================");
            Serial.println();
            
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
            client.println("<p>아두이노가 저장된 WiFi에 연결을 시도합니다.</p>");
            client.println("<p>잠시만 기다려주세요...</p>");
            client.println("</body></html>");
            
            // 클라이언트 응답 완료 대기
            delay(500);
            client.stop();
            
            Serial.println("설정 포털 종료. WiFi 연결 시도...");
            Serial.println("AP 모드 종료 중...");
            
            // AP 모드 종료
            WiFi.disconnect();
            delay(1000);
            
            // EEPROM에서 새로 로드 (저장된 값 확인)
            Serial.println("EEPROM에서 저장된 설정 다시 로드 중...");
            loadFromEEPROM();
            Serial.print("로드된 SSID: ");
            Serial.println(ssid);
            Serial.print("로드된 SSID 길이: ");
            Serial.println(ssid.length());
            
            // 저장된 WiFi로 연결 시도
            Serial.println("저장된 WiFi로 연결 시도 중...");
            if (connect()) {
              Serial.println("✅ WiFi 연결 성공! 설정 포털을 종료합니다.");
            } else {
              Serial.println("❌ WiFi 연결 실패. 설정 포털을 다시 시작합니다.");
              delay(2000);
              startConfigPortal(); // 연결 실패 시 다시 설정 포털 시작
            }
            
            return; // 설정 완료, 루프 종료
          }
        }
        
        delay(10);
        client.stop();
        Serial.println("Client disconnected");
      }
    }
  }
  
  // WiFi 연결 시도
  bool connect() {
    // 설정이 없으면 설정 포털 시작
    if (!configured || ssid.length() == 0) {
      Serial.println("EEPROM에 WiFi 설정이 없습니다.");
      Serial.println("설정 포털을 시작합니다...");
      startConfigPortal();
      return false;
    }
    
    // 기존 연결이 있으면 먼저 끊기
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("기존 WiFi 연결 종료 중...");
      WiFi.disconnect();
      delay(500);
    }
    
    Serial.println("========================================");
    Serial.print("WiFi에 연결 시도 중: ");
    Serial.println(ssid);
    Serial.println("========================================");
    
    // WiFi 연결 시작
    int status = WiFi.begin(ssid.c_str(), password.c_str());
    
    if (status == WL_NO_SSID_AVAIL) {
      Serial.println("오류: WiFi 네트워크를 찾을 수 없습니다.");
      return false;
    }
    
    // 연결 대기 (최대 30초)
    int attempts = 0;
    int maxAttempts = 60; // 30초 (500ms * 60)
    
    while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
      delay(500);
      Serial.print(".");
      attempts++;
      
      // 5초마다 상태 출력
      if (attempts % 10 == 0) {
        Serial.print(" (");
        Serial.print(attempts * 500 / 1000);
        Serial.println("초 경과)");
      }
    }
    
    Serial.println();
    
    // 연결 결과 확인
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("========================================");
      Serial.println("✅ WiFi 연결 성공!");
      Serial.print("IP 주소: ");
      Serial.println(WiFi.localIP());
      Serial.print("신호 강도 (RSSI): ");
      Serial.print(WiFi.RSSI());
      Serial.println(" dBm");
      Serial.println("========================================");
      return true;
    } else {
      Serial.println("========================================");
      Serial.println("❌ WiFi 연결 실패!");
      Serial.print("상태 코드: ");
      Serial.println(WiFi.status());
      Serial.println("========================================");
      Serial.println("가능한 원인:");
      Serial.println("  1. WiFi SSID 또는 비밀번호가 잘못되었습니다");
      Serial.println("  2. WiFi 신호가 약합니다");
      Serial.println("  3. WiFi 라우터가 응답하지 않습니다");
      Serial.println();
      Serial.println("설정 포털을 시작합니다...");
      delay(2000);
      startConfigPortal();
      return false;
    }
  }
  
  // WiFi 재연결 시도 (loop에서 사용)
  bool reconnect() {
    if (!configured || ssid.length() == 0) {
      return false;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      return true; // 이미 연결됨
    }
    
    Serial.println("WiFi 재연결 시도 중...");
    WiFi.disconnect();
    delay(1000);
    return connect();
  }
};

#endif

