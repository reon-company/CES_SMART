#ifndef WATER_PUMP_H
#define WATER_PUMP_H

#include "RelayControl.h"
#include "config.h"

class WaterPump : public RelayControl {
public:
  WaterPump() : RelayControl(WATER_PUMP_PIN) {}
};

#endif

