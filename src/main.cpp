// button pins
#define DUMP 5
#define AUTO 6

// control pins
#define WR   4
#define RD   2
#define CS   7
#define RST  A4
#define SND  A5

// shift register pins
#define DS    11 // Serial data output
#define SH_CP 12 // Shift register clock pin
#define ST_CP 8  // Storage register clock pin (latch pin)

// data pins
#define D0 10
#define D1 9
#define D2 A6
#define D3 A7
#define D4 A0
#define D5 A1
#define D6 A2
#define D7 A3

#define READSTART 'G'
#define READEND   'H'

#include <Arduino.h>
#include <digitalWriteFast.h>

byte inPins[] = {D0, D1, D2, D3, D4, D5, D6, D7}; // 8 pins for data lines

// mostly taken from https://forum.arduino.cc/index.php?topic=16818.msg122430#msg122430
byte readIn(){
  byte input = 0;
  byte mask = 1;
  bool value;
  for (int i = 0; i < 8; i++) {
    // two data pins are mapped to analog 6 and 7 which doesn't support digitalRead
    // so read the analog values and map to a digital value
    if (i == 2 || i == 3) {
      value = map(analogRead(inPins[i]), 0, 1023, 0, 1);
    } else {
      value = digitalReadFast(inPins[i]);
    }
    if(value == HIGH) input |= mask;
    mask = mask << 1;
  }
  return(input);
}

// mostly taken from https://www.arduino.cc/en/Tutorial/ShftOut22
// modified to send LSB first instead of last
void shiftOut(short myDataOut) {
  int i=0;
  int pinState;

  digitalWriteFast(ST_CP, LOW);
  digitalWriteFast(DS, LOW);
  digitalWriteFast(SH_CP, LOW);

  for (i=0; i<=15; i++)  {
    digitalWriteFast(SH_CP, 0);

    if ( myDataOut & (1<<i) ) {
      pinState= 1;
    }
    else {	
      pinState= 0;
    }

    digitalWriteFast(DS, pinState);
    digitalWriteFast(SH_CP, 1);
    digitalWriteFast(DS, 0);
  }

  digitalWriteFast(SH_CP, 0);
  digitalWriteFast(ST_CP, HIGH);
}

  void printHex(int num, int precision) {
    char tmp[16];
    char format[128];

    sprintf(format, "%%.%dX", precision);

    sprintf(tmp, format, num);
    Serial.print(tmp);
  }


void setup() {
  Serial.begin(115200);
  pinModeFast(WR, OUTPUT);
  pinModeFast(RD, OUTPUT);
  pinModeFast(CS, OUTPUT);
  pinModeFast(RST, OUTPUT);
  pinModeFast(SND, OUTPUT);
  pinModeFast(DUMP, INPUT_PULLUP);
  pinModeFast(AUTO, INPUT_PULLUP);
  pinModeFast(ST_CP, OUTPUT);
  pinModeFast(DS, OUTPUT);
  pinModeFast(SH_CP, OUTPUT);
  pinModeFast(D0, INPUT);
  pinModeFast(D1, INPUT);
  pinModeFast(D2, INPUT);
  pinModeFast(D3, INPUT);
  pinModeFast(D4, INPUT);
  pinModeFast(D5, INPUT);
  pinModeFast(D6, INPUT);
  pinModeFast(D7, INPUT);

  digitalWriteFast(WR, HIGH);
  digitalWriteFast(RD, HIGH);
  digitalWriteFast(CS, HIGH);
  digitalWriteFast(RST, HIGH);
  Serial.println("Connected to OSCF v0.0.1\r\n");
}

bool flag = false;
bool command;
int count = 0;
unsigned int readLocation = 0;
unsigned int readBytes = 0;

void loop() {
  if (Serial && Serial.available()) {
    while(Serial.available() < 2){}
    int byte1 = Serial.read();;
    int byte2 = Serial.read();;
    if (byte1 == READSTART) {
      while(Serial.available() < 2){}
      byte1 = Serial.read();
      byte2 = Serial.read();
      readLocation = byte2 * 256 + byte1;
      while(Serial.available() < 2){}
      byte1 = Serial.read();
      byte2 = Serial.read();
      readBytes = byte2 * 256 + byte1;
      command = true;
    }
  }

  if (command) {
    flag = false;
    command = false;
    count = 0;
    digitalWriteFast(RST, LOW);
    delay(10);
    digitalWriteFast(WR, LOW);

    digitalWriteFast(RST, HIGH);
    digitalWriteFast(RD, LOW);
    digitalWriteFast(CS, HIGH);
    delay(10);
    // Serial.print(READSTART);
    for (unsigned int n = readLocation; n < (readLocation + readBytes); n++) {
      shiftOut(n);
      // delay(10);
      printHex(readIn(), 2);
    }
    Serial.print(READEND);
  } else if (!digitalRead(DUMP)) {
    count += 1;
    if (count > 9000) {
      Serial.print(READSTART);
      count = 0;
    }
  }
}