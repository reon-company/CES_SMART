#ifndef VALVE_H
#define VALVE_H

#include "RelayControl.h"
#include "config.h"

class Valve : public RelayControl {
public:
  Valve() : RelayControl(VALVE_PIN) {}
};

#endif

