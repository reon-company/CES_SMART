#ifndef RELAY_CONTROL_H
#define RELAY_CONTROL_H

#include "config.h"

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

