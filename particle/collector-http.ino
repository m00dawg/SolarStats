/*
    Temperature v1.00
    By: Tim Soderstrom
*/
#include "particle-dallas-temperature.h"
#include "HttpClient.h"

/*
 * -----------
 * CONFIG OPTS
 * -----------
 */

#define LOGGING true

/* Pins */
const int temperatureProbes = D3;

/* Settings */
const int sleepSeconds = 180;

/* How many times to try and grab sensor data */
const int max_attempts = 3;

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

// HTTP Client
HttpClient http;

// Headers currently need to be set at init, useful for API keys etc.
http_header_t headers[] = {
    //  { "Content-Type", "application/json" },
    //  { "Accept" , "application/json" },
    { "Accept" , "*/*"},
    { NULL, NULL } // NOTE: Always terminate headers will NULL
};

/*
 * ----------------
 * VARIABLES
 * ----------------
 */

bool sleep = false;
double currentTemp = -255;

//MAC Address
byte mac[6];

http_request_t request;
http_response_t response;

char uri[32];
char tempString[20];

void setup()
{
  Serial.begin(9600);
  delay(5000);
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
  //Spark.variable("temperature", &currentTemp, DOUBLE);
  //Spark.variable("stats", &stats, STRING);

  // Turn off that incredibly bright LED
  //RGB.control(true);
  //RGB.brightness(0);

  request.hostname = "solarstats.moocow.home";
  request.port = 80;
}

void loop()
{
  //delay(10000);
  Serial.print("RSSI :");
  Serial.println(WiFi.RSSI());
  if(!collectTemperatures())
    Serial.println("NO SENSORS");
  sprintf(uri, "");
  sprintf(tempString, "%.2f", currentTemp);
  strcat(uri, "/setTemp.php?temp=");
  strcat(uri, tempString);
  Serial.print("URI: ");
  Serial.println(uri);
  request.path = uri;
  //delay(10000);
  http.get(request, response, headers);
  Serial.print("Application>\tResponse status: ");
  Serial.println(response.status);
  Serial.print("Application>\tHTTP Response Body: ");
  Serial.println(response.body);
  if(response.status == 200)
    sleep = true;
  //Spark.sleep(60);
  if(sleep)
    Spark.sleep(SLEEP_MODE_DEEP, sleepSeconds);
}

boolean collectTemperatures()
{
  for(int count = 0; count < max_attempts; ++count)
  {
    sensors.requestTemperatures();
    if(sensors.getAddress(thermometer, 0))
    {
      currentTemp = sensors.getTempC(thermometer);
      Serial.print("Current Temperature: ");
      Serial.println(currentTemp);
      return true;
    }
    delay(1000);
  }
  return false;
}
