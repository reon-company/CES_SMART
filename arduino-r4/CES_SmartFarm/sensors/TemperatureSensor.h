#ifndef TEMPERATURE_SENSOR_H
#define TEMPERATURE_SENSOR_H

#include <OneWire.h>
#include <DallasTemperature.h>
#include "config.h"

class TemperatureSensor {
private:
  OneWire oneWire;
  DallasTemperature sensors;

public:
  TemperatureSensor(int pin = TEMPERATURE_PIN) : oneWire(pin), sensors(&oneWire) {
    sensors.begin();
  }

  // Read temperature in Celsius
  float read() {
    sensors.requestTemperatures();
    float tempC = sensors.getTempCByIndex(0);
    
    // Check if reading is valid (DS18B20 returns -127.00 if disconnected)
    if (tempC == -127.00) {
      return -999.0; // Error value
    }
    return tempC;
  }
};

#endif

