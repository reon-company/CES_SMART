#ifndef DHT11_SENSOR_H
#define DHT11_SENSOR_H

#include <DHT.h>
#include "config.h"

// 유지보수 메모:
// 오류 감지값 -999.0은 상위 로직에서 잘못된 측정값으로 처리됩니다.
// 센서 라이브러리 동작이 변경되면 감지값 처리를 일관되게 유지하세요.
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

