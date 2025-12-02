#ifndef DO_SENSOR_H
#define DO_SENSOR_H

#include "config.h"

class DOSensor {
private:
  int pin;
  float voltage;

public:
  DOSensor(int sensorPin = DO_SENSOR_PIN) : pin(sensorPin) {
    pinMode(pin, INPUT);
  }

  // Read DO level in mg/L
  // SEN0237-A outputs 0-3V, which corresponds to 0-20mg/L DO
  float read() {
    int sensorValue = analogRead(pin);
    // Convert analog reading (0-1023) to voltage (0-5V)
    // For 3.3V Arduino, use: voltage = (sensorValue / 1023.0) * 3.3;
    // For 5V Arduino, use: voltage = (sensorValue / 1023.0) * 5.0;
    voltage = (sensorValue / 1023.0) * 5.0;
    
    // SEN0237-A: 0-3V corresponds to 0-20mg/L
    // If voltage > 3V, sensor might be disconnected or error
    if (voltage > 3.0) {
      return -999.0; // Error value
    }
    
    // Convert voltage to DO (mg/L)
    // Linear relationship: 0V = 0mg/L, 3V = 20mg/L
    float doLevel = (voltage / 3.0) * 20.0;
    return constrain(doLevel, 0.0, 20.0);
  }
};

#endif

