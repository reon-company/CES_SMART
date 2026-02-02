#ifndef HEATER_H
#define HEATER_H

#include "RelayControl.h"
#include "config.h"

class Heater : public RelayControl {
public:
  Heater() : RelayControl(HEATER_PIN) {}
};

#endif

