#ifndef COOLER_H
#define COOLER_H

#include "RelayControl.h"
#include "config.h"

class Cooler : public RelayControl {
public:
  Cooler() : RelayControl(COOLER_PIN) {}
};

#endif

