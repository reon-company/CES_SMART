#ifndef PH_SENSOR_H
#define PH_SENSOR_H

#include "config.h"

class PHSensor {
private:
  int pin;
  float voltage;

public:
  PHSensor(int sensorPin = PH_SENSOR_PIN) : pin(sensorPin) {
    pinMode(pin, INPUT);
  }

  // Read pH level (0-14)
  // Typical pH sensor outputs 0-2.5V for pH 0-14
  float read() {
    int sensorValue = analogRead(pin);
    // Convert analog reading (0-1023) to voltage (0-5V)
    // For 3.3V Arduino, use: voltage = (sensorValue / 1023.0) * 3.3;
    // For 5V Arduino, use: voltage = (sensorValue / 1023.0) * 5.0;
    voltage = (sensorValue / 1023.0) * 5.0;
    
    // Convert voltage to pH
    // Typical calibration: 0V = pH 0, 2.5V = pH 14
    // Adjust these values based on your sensor calibration
    float phLevel = (voltage / 2.5) * 14.0;
    return constrain(phLevel, 0.0, 14.0);
  }
};

#endif

