#ifndef WATER_LEVEL_SENSOR_H
#define WATER_LEVEL_SENSOR_H

#include "config.h"

class WaterLevelSensor {
private:
  int pin;

public:
  WaterLevelSensor(int sensorPin = WATER_LEVEL_PIN) : pin(sensorPin) {
    pinMode(pin, INPUT);
  }

  // Read water level (0-100%)
  float read() {
    int sensorValue = analogRead(pin);
    // Convert analog reading (0-1023) to percentage (0-100)
    // Adjust these values based on your sensor calibration
    float percentage = (sensorValue / 1023.0) * 100.0;
    return constrain(percentage, 0.0, 100.0);
  }
};

#endif

