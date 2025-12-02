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
    digitalWrite(pin, HIGH); // Relay module typically LOW = ON, HIGH = OFF
  }

  void turnOn() {
    digitalWrite(pin, LOW); // Activate relay
    state = true;
  }

  void turnOff() {
    digitalWrite(pin, HIGH); // Deactivate relay
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

