#include <Arduino.h>

void setup() {
  // put your setup code here, to run once:
  pinMode(2, OUTPUT);
  pinMode(4, OUTPUT);
  pinMode(5, INPUT_PULLUP);
  pinMode(6, INPUT_PULLUP);
}

void loop() {
  digitalWrite(4,digitalRead(5));
  digitalWrite(2,digitalRead(6));
}