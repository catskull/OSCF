// port names
#define ADDR1 0
#define ADDR2 1
#define DATA  2
#define PORTD 3

// control pins
#define WR   PIN_PD6
#define RD   PIN_PD5
#define CS   PIN_PD4
#define RST  PIN_PD3
#define SND  PIN_PD2

#define READSTART  'G'
#define READEND    'H'
#define WRITESTART 'I'
#define WRITEEND   'J'

#include <Arduino.h>

unsigned int address = 0;
unsigned int readBytes = 0;
byte dataByte = 0; 

byte readData() {
  // portMode(DATA, INPUT);
  return portRead(DATA);
}

void writeAddress(short address) {
  // portMode(ADDR1, OUTPUT);
  // portMode(ADDR2, OUTPUT);
  portWrite(ADDR1, address & 0xFF);
  portWrite(ADDR2, (address >> 8) & 0xFF);
  digitalWrite(CS, (~(address >> 16) & 1));
}

void printHex(int num, int precision) {
  char tmp[16];
  char format[128];

  sprintf(format, "%%.%dX", precision);

  sprintf(tmp, format, num);
  Serial.print(tmp);
}

void dumpData() {
  // digitalWrite(RST, LOW);
  // delay(10);
  digitalWrite(WR, HIGH);
  // digitalWrite(RST, HIGH);
  digitalWrite(RD, LOW);
  delay(10);
  portMode(DATA, INPUT);
  portMode(ADDR1, OUTPUT);
  portMode(ADDR2, OUTPUT);
  for (unsigned int n = address; n <= (address + readBytes); n++) {
    writeAddress(n);
    printHex(readData(), 2);
  }
  delay(10);
  Serial.print(READEND);
}

void writeData() {
  digitalWrite(WR, LOW);
  digitalWrite(RD, HIGH);
  delay(10);
  portMode(ADDR1, OUTPUT);
  portMode(ADDR2, OUTPUT);
  portMode(DATA, OUTPUT);
  writeAddress(address);
  portWrite(DATA, dataByte);
  Serial.print(WRITEEND);
}

void setup() {
  Serial.begin(115200);
  pinMode(WR, OUTPUT);
  pinMode(RD, OUTPUT);
  pinMode(CS, OUTPUT);
  pinMode(RST, OUTPUT);
  pinMode(SND, OUTPUT);
  
  portMode(ADDR1, OUTPUT); // Port A (address 0-7)
  portMode(ADDR2, OUTPUT); // Port B (address 8-15)
  portMode(DATA, INPUT);   // Port C (data 0-7)

  digitalWrite(WR, HIGH);
  digitalWrite(RD, HIGH);
  digitalWrite(CS, HIGH);
  digitalWrite(RST, HIGH);
  digitalWrite(SND, HIGH);
  Serial.println("Connected to OSCF v0.0.2\r\n");
}

void loop() {
  if (Serial && Serial.available()) {
    while(Serial.available() < 2){}
    int byte1 = Serial.read();;
    int byte2 = Serial.read();;
    if (byte1 == READSTART) {
      while(Serial.available() < 2){}
      byte1 = Serial.read();
      byte2 = Serial.read();
      address = byte2 * 256 + byte1;
      while(Serial.available() < 2){}
      byte1 = Serial.read();
      byte2 = Serial.read();
      readBytes = byte2 * 256 + byte1;
      dumpData();
    } else if (byte1 == WRITESTART) {
      while(Serial.available() < 2){}
      byte1 = Serial.read();
      byte2 = Serial.read();
      address = byte2 * 256 + byte1;
      while(Serial.available() < 2){}
      byte1 = Serial.read();
      byte2 = Serial.read();
      dataByte = byte1;
      writeData();
    }
  }
}