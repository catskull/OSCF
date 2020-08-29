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

#define READSTART 'G'
#define READEND   'H'

#include <Arduino.h>

byte readData(){
  portMode(DATA, INPUT);
  return portRead(DATA);
}

void writeAddress(short data) {
  portMode(ADDR1, OUTPUT);
  portMode(ADDR2, OUTPUT);
  portWrite(ADDR1, data & 0xFF);
  portWrite(ADDR2, (data >> 8) & 0xFF);
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
  Serial.println("Connected to OSCF v0.0.2\r\n");
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
    digitalWrite(RST, LOW);
    delay(10);
    digitalWrite(WR, LOW);

    digitalWrite(RST, HIGH);
    digitalWrite(RD, LOW);
    digitalWrite(CS, HIGH);
    delay(10);
    for (unsigned int n = readLocation; n < (readLocation + readBytes); n++) {
      writeAddress(n);
      printHex(readData(), 2);
    }
    Serial.print(READEND);
  }
}