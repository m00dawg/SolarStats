/*
    Temperature v1.00
    By: Tim Soderstrom
*/
#include "OneWire.h"
#include "DallasTemperature.h"

/*
 * -----------
 * CONFIG OPTS
 * -----------
 */

/* Pins */
const int temperatureProbes = D3;

/*
 * -------
 * OBJECTS
 * -------
 */

OneWire oneWire(temperatureProbes);
DallasTemperature sensors = DallasTemperature(&oneWire);

// Arrays to hold temperature devices
// DeviceAddress insideThermometer, outsideThermometer;
DeviceAddress thermometer;

/*
 * ----------------
 * STATUS VARIABLES
 * ----------------
 */

double currentTemp = 0;

//String stats;
char stats[12];

//MAC Address
byte mac[6];

/* Switches from C to F for display */
boolean displayCelsius = true;

void setup()
{
  Serial.begin(9600);
  Delay(10000);
  //while (!Serial.available())
  //Spark.process();
  //WiFi.on();
  Serial.println("Temperator");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  WiFi.macAddress(mac);
  Serial.print("MAC Address: ");
  for (int i=0; i<6; i++) {
    if (i) Serial.print(":");
    Serial.print(mac[i], HEX);
  }
  Serial.println();


  // Subscribe variables to the cloud
  Spark.variable("temperature", &currentTemp, DOUBLE);
  Spark.variable("stats", &stats, STRING);

  // Turn off that incredibly bright LED
  RGB.control(true);
  RGB.brightness(0);
}

void loop()
{
  //WiFi.on();
  Serial.print("RSSI :");
  Serial.println(WiFi.RSSI());
  if(!collectTemperatures())
    Serial.println("NO SENSORS");
  sprintf(stats, "%.2f", currentTemp);
  Spark.connect();
  Spark.publish("temperature", stats);
  //Spark.sleep(SLEEP_MODE_DEEP,5);
  delay(60000 * 2);
}


boolean collectTemperatures()
{
  sensors.requestTemperatures();
  if(sensors.getAddress(thermometer, 0))
  {
    currentTemp = sensors.getTempC(thermometer);
    Serial.print("Current Temperature: ");
    Serial.println(currentTemp);
    return true;
  }
  return false;
}
