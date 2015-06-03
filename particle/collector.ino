#include "MQTT.h"
#include "OneWire.h"
#include "DallasTemperature.h"

/*
 * -----------
 * CONFIG OPTS
 * -----------
 */

const int temperatureProbes = D3;
byte mqttServer[] = { 192,168,100,2 };
char name[] = "OutsideSensor";

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

// MQTT client and callbacks
void callback(char* topic, byte* payload, unsigned int length);
void callback(char* topic, byte* payload, unsigned int length) { }
MQTT mqttClient(mqttServer, 1883, callback);

/*
 * ---------
 * VARIABLES
 * ---------
 */

bool sleep = false;
double currentTemp = 0;
char tempString[20];

// Device MAC Address
byte mac[6];

void setup()
{
  Serial.begin(9600);
  delay(2000);
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
  //Spark.variable("temperature", &currentTemp, DOUBLE);

  // Turn off that incredibly bright LED
  //RGB.control(true);
  //RGB.brightness(0);
}

void loop()
{
  //delay(10000);
  Serial.print("RSSI :");
  Serial.println(WiFi.RSSI());
  if(!collectTemperatures())
    Serial.println("NO SENSORS");
  /*
  sprintf(uri, "");
  sprintf(tempString, "%.2f", currentTemp);
  strcat(uri, "/setTemp.php?temp=");
  strcat(uri, tempString);
  Serial.print("URI: ");
  Serial.println(uri);
  request.path = uri;
  */
  //delay(10000);

  sprintf(tempString, "%.2f", currentTemp);
  mqttClient.connect(name);

  if (mqttClient.isConnected())
  {
    mqttClient.publish("/temperature", tempString);
    sleep = true;
  }
  if(sleep)
    Spark.sleep(SLEEP_MODE_DEEP, 60);
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
