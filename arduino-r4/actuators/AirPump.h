#ifndef AIR_PUMP_H
#define AIR_PUMP_H

#include "RelayControl.h"
#include "config.h"

class AirPump : public RelayControl {
public:
  AirPump() : RelayControl(AIR_PUMP_PIN) {}
};

#endif

