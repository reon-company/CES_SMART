#ifndef DHT11_SENSOR_H
#define DHT11_SENSOR_H

#include <DHT.h>
#include "config.h"

class DHT11Sensor {
private:
  DHT dht;
  int pin;

public:
  DHT11Sensor(int sensorPin = DHT11_PIN) : dht(sensorPin, DHT11), pin(sensorPin) {
    dht.begin();
  }

  // Read temperature in Celsius
  float readTemperature() {
    float temp = dht.readTemperature();
    if (isnan(temp)) {
      return -999.0; // Error value
    }
    return temp;
  }

  // Read humidity in percentage
  float readHumidity() {
    float humidity = dht.readHumidity();
    if (isnan(humidity)) {
      return -999.0; // Error value
    }
    return humidity;
  }
};

#endif

