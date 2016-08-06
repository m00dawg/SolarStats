/*
 * Solar Weather
 * Forked from Weather Shield Example (https://github.com/sparkfun/Wimp_Weather_Station) by Nathan Siedle
 *
 * By Tim Soderstrom
 *
 * Per the Weather Shield Example, this is also public domain.
 */

#include "Seeed_BME280.h"
#include <Wire.h> //I2C needed for sensors
#include <EEPROM.h> //To store station ID

// AVR Functions
// Sleep Functions
#include <avr/power.h>
#include <avr/sleep.h>
#include <avr/wdt.h>

BME280 bme280; //Create an instance of the Seeed BME280

// I/O pins
const byte XBEE_SLEEP = 5;
const byte BATT = A7;


// Other Constants
// How many loops through sleep/wakeup to wait before we check sensors and transmit results
// Each cycle is ~ 8 seconds.
const int sleepCycles = 8;
//const int sleepCycles = 1;
// Delay to wait on XBee to wake up
const bool xbeeSleep = true; // Whether or not to sleep the Xbee with the Arduino
const int xbeeSleepDelay = 2000;
const int serialDelay = 2000;


// A station identifier for if there are multiple sensors being used (e.g. indoor and outdoor)
const byte stationID = 1;

//Global Variables
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

float humidity = 0; // [%]
float temperature = 0; // [temperature C]
float pressure = 0; // Pressure in Pascals
float batt_lvl = 11.8; //[analog value from 0 to 1023]

int currentSleepCycle = 0; //The sleep cycle we are on

// volatiles are subject to modification by IRQs
volatile int watchdog_flag=1;

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

//Watchdog Routines
ISR(WDT_vect)
{
  if(watchdog_flag == 0)
      watchdog_flag=1;
  /*
  else
  {
    Serial.println("WDT Overrun!!!");
  }
  */
}

void enterSleep(void)
{
  //set_sleep_mode(SLEEP_MODE_PWR_SAVE);   /* EDIT: could also use SLEEP_MODE_PWR_DOWN for lowest power consumption. */
  set_sleep_mode(SLEEP_MODE_PWR_DOWN);
  sleep_enable();

  /* Now enter sleep mode. */
  sleep_mode();

  /* The program will continue from here after the WDT timeout*/
  sleep_disable(); /* First thing to do is disable sleep. */

  /* Re-enable the peripherals. */
  power_all_enable();
}

void setup()
{
	Serial.begin(9600);

  analogReference(INTERNAL);
  pinMode(BATT, INPUT);

  /* Set Sleep Status for XBee and make sure it is awake */
  if(xbeeSleep)
  {
    pinMode(XBEE_SLEEP, OUTPUT);
    digitalWrite(XBEE_SLEEP, LOW);
    delay(xbeeSleepDelay);
  }

	//Serial.println("SolarWeather");


  if(!bme280.init()){
    Serial.println("Device error!");
  }

  /*** Setup the WDT (For Sleeping) ***/
  /* Clear the reset flag. */
  MCUSR &= ~(1<<WDRF);
  /* In order to change WDE or the prescaler, we need to
   * set WDCE (This will allow updates for 4 clock cycles).
   */
  WDTCSR |= (1<<WDCE) | (1<<WDE);
  /* set new watchdog timeout prescaler value */
  WDTCSR = 1<<WDP0 | 1<<WDP3; /* 8.0 seconds */
  /* Enable the WD interrupt (note no reset). */
  WDTCSR |= _BV(WDIE);

	//Serial.println("Weather Shield online!");

  // Hang out for a while in case we want to update the firmware before we start sleeping
  //Serial.println("Waiting 5 seconds for firmware update if desired");
  delay(5000);
}

void loop()
{
  // Skip sleeping
  //digitalWrite(XBEE_SLEEP, HIGH); //FOR TESTING
  //printWeather();
  //delay(2000);
//    digitalWrite(XBEE_SLEEP, LOW); //FOR TESTING

  if(currentSleepCycle >= sleepCycles)
  {
    currentSleepCycle = 0;
    if(xbeeSleep)
    {
      digitalWrite(XBEE_SLEEP, LOW); // Wake XBee
      delay(xbeeSleepDelay);
      //Serial.println("XBee Awake");
    }

    
    printWeather();
    delay(serialDelay);
  }
  else
    ++currentSleepCycle;

  delay(serialDelay);
  if(watchdog_flag == 1)
  {
    watchdog_flag = 0;
    if(xbeeSleep)
    {
      //Serial.println("Sleeping Xbee");
      //delay(serialDelay);
      digitalWrite(XBEE_SLEEP, HIGH); // Sleep XBee
      delay(xbeeSleepDelay);
    }
    enterSleep();
  }
}

//Calculates each of the variables that wunderground is expecting
void calcWeather()
{
  humidity = bme280.getHumidity();
  temperature = bme280.getTemperature();
  pressure = bme280.getPressure();
	batt_lvl = get_battery_level();
}

float get_battery_level()
{
  // Dervied from http://seeedstudio.com/wiki/Seeeduino-Stalker_v3
  float batteryVoltage = analogRead(BATT);
  return batteryVoltage * (.0060);
}

void printWeather()
{
	calcWeather(); //Go calc all the various sensors

	Serial.println();
  Serial.print("$,stationID=");
  Serial.print(stationID);
	Serial.print(",humidity=");
	Serial.print(humidity, 1);
	Serial.print(",temperature=");
  Serial.print(temperature, 2);
	Serial.print(",pressure=");
	Serial.print(pressure, 2);
	Serial.print(",batt_lvl=");
	Serial.print(batt_lvl, 2);
	Serial.print(",");
	Serial.println("#");
}

int averageAnalogRead(int pinToRead)
{
  byte numberOfReadings = 8;
  unsigned int runningValue = 0;

  for(int x = 0 ; x < numberOfReadings ; x++)
    runningValue += analogRead(pinToRead);
  runningValue /= numberOfReadings;

  return(runningValue);
}
