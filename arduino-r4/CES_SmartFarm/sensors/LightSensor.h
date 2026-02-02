#ifndef LIGHT_SENSOR_H
#define LIGHT_SENSOR_H

#include "config.h"

class LightSensor {
private:
  int pin;

public:
  LightSensor(int sensorPin = LIGHT_SENSOR_PIN) : pin(sensorPin) {
    pinMode(pin, INPUT);
  }

  // Read light level (0-100%)
  // Grove Light Sensor v1.2 outputs analog value
  float read() {
    int sensorValue = analogRead(pin);
    // Convert analog reading (0-1023) to percentage (0-100)
    // Adjust these values based on your sensor calibration
    float percentage = (sensorValue / 1023.0) * 100.0;
    return constrain(percentage, 0.0, 100.0);
  }
};

#endif

