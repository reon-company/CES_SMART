#ifndef RELAY_CONTROL_H
#define RELAY_CONTROL_H

#include "config.h"

// 유지보수 메모:
// 릴레이 극성(HIGH/LOW => ON/OFF)은 하드웨어 모듈에 따라 다릅니다.
// 배포 전 실제 릴레이 보드로 검증하세요.
class RelayControl {
private:
  int pin;
  bool state;

public:
        RelayControl(int relayPin) : pin(relayPin), state(false) {
          pinMode(pin, OUTPUT);
          digitalWrite(pin, LOW); // Relay module: HIGH = ON, LOW = OFF (반대로 변경)
        }

        void turnOn() {
          digitalWrite(pin, HIGH); // Activate relay (반대로 변경)
          state = true;
        }

        void turnOff() {
          digitalWrite(pin, LOW); // Deactivate relay (반대로 변경)
          state = false;
        }

  void setState(bool newState) {
    if (newState) {
      turnOn();
    } else {
      turnOff();
    }
  }

  bool getState() {
    return state;
  }
};

#endif

