#!/usr/bin/env python
import serial
import math
import urllib
import ConfigParser
import mysql.connector as mariadb

# Read the configuration file
config = ConfigParser.ConfigParser()
config.read('config.ini')

# Serial Parameters
baudrate = config.getint('serial', 'baudrate')
serial_port = config.get('serial' ,'port')

# User Settings
output = config.getboolean('debug', 'output')

# Wunderground
update_wunderground = config.getboolean('wunderground', 'update')
wunderground_station_id = config.get('wunderground', 'station_id')
wunderground_password = config.get('wunderground', 'password')
altitude = config.getint('wunderground', 'altitude')

# Internal variables
serial_input = []
line = []

# Open some stuff
port = serial.Serial(serial_port, baudrate)  # open se'rial port
db_connection = mariadb.connect(user='solarcollector', password='enDEGTwujbaDB9yMU3wnwRJZ', database='solar')
db_cursor = db_connection.cursor()

## Functions
# Insert values into the database

def temp_c_to_f(temperature):
    return 9.0/5.0 * float(temperature) + 32

# Split a string by equals sign and return second result
def split_value(chunk):
    return chunk.split('=')[1]

# Taken from https://learn.sparkfun.com/tutorials/weather-station-wirelessly-connected-to-wunderground
def convert_to_baromin(pressure_Pa):
    global altitude
    pressure_mb = float(pressure_Pa) / 100
    part1 = pressure_mb - 0.3 # Part 1 of formula
    part2 = 8.42288 / 100000.0
    part3 = math.pow((pressure_mb - 0.3), 0.190284)
    part4 = float(altitude) / part3
    part5 = (1.0 + (part2 * part4))
    part6 = math.pow(part5, (1.0/0.190284))
    altimeter_setting_pressure_mb = part1 * part6 # Output is now in adjusted millibars
    baromin = altimeter_setting_pressure_mb * 0.02953
    return baromin
    #return round(altimeter_setting_pressure_mb,2)

# Process weather string
def process_weather(string):
    global altitude, output, db_cursor, update_wunderground, wunderground_station_id
    station_id = None
    humidity = None
    temperature = None
    pressure = None
    battery = None
    light = None
    string = string.split(',')
    for chunk in string:
        if chunk.startswith('stationID'):
            station_id = split_value(chunk)
        if chunk.startswith('humidity'):
            humidity = split_value(chunk)
        if chunk.startswith('temperature'):
            temperature = split_value(chunk)
        if chunk.startswith('pressure'):
            pressure = split_value(chunk)
        if chunk.startswith('batt_lvl'):
            battery = split_value(chunk)
        if chunk.startswith('light_lvl'):
            light = split_value(chunk)
    if station_id > 0 and temperature:
        try:
            db_cursor.execute("INSERT INTO WeatherReadings (stationID, temperature, pressure, humidity, battery) \
                VALUES (%s, %s, %s, %s, %s)",
                (station_id, temperature, pressure, humidity, battery))
        except:
            print "Exception in INSERT encountered! Continuing Anyway"
            pass
    if output:
        if station_id:
            print 'Station ID: {}'.format(station_id)
        if temperature:
            print 'Temperature: {}C'.format(temperature)
        if humidity > 0:
            print 'Humidity: {}%'.format(humidity)
        if pressure > 0:
            print 'Pressure: {} Pa'.format(pressure)
            print 'Corrected Pressure at {} m: {} baroin'.format(altitude,convert_to_baromin(pressure))
        if light:
            print 'Light Level: {} '.format(light)
        if battery > 0:
            print 'Battery: {} V'.format(battery)
    if update_wunderground:
        params = urllib.urlencode({
            'action': 'updateraw',
            'ID': wunderground_station_id,
            'PASSWORD': wunderground_password,
            'dateutc': 'now',
            'tempf': temp_c_to_f(temperature),
            'humidity': humidity,
            'baromin': convert_to_baromin(pressure)
        })
        result = urllib.urlopen("http://weatherstation.wunderground.com/weatherstation/updateweatherstation.php?%s" % params)
        if result.read() != 'success':
            print "Error from Wunderground"
            print result.read()
    return

while True:
    for c in port.read():
        serial_input.append(c)
        line = ''.join(str(v) for v in serial_input) #Make a string from array
        if c == '\n':
            serial_input = []
            if line[0] is '$':
                process_weather(line)
                db_connection.commit()
            break

port.close()
db_cursor.close()
db_connection.close()
