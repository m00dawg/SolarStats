#!/usr/bin/env python
import serial
import math

baudrate = 9600
serial_port = '/dev/ttyUSB0'
altitude = 294 #meters

serial_input = []
line = []

port = serial.Serial(serial_port, baudrate)  # open serial port

# Split a string by equals sign and return second result
def split_value(chunk):
    return chunk.split('=')[1]

# Taken from https://learn.sparkfun.com/tutorials/weather-station-wirelessly-connected-to-wunderground
def convert_to_mb(pressure_Pa):
    global altitude
    pressure_mb = float(pressure_Pa) / 100
    part1 = pressure_mb - 0.3 # Part 1 of formula
    part2 = 8.42288 / 100000.0
    part3 = math.pow((pressure_mb - 0.3), 0.190284)
    part4 = altitude / part3
    part5 = (1.0 + (part2 * part4))
    part6 = math.pow(part5, (1.0/0.190284))
    altimeter_setting_pressure_mb = part1 * part6 # Output is now in adjusted millibars
    #baromin = altimeter_setting_pressure_mb * 0.02953
    return round(altimeter_setting_pressure_mb,2)

# Process weather string
def process_weather(string):
    global altitude
    humidity = None
    temperature = None
    pressure = None
    battery = None
    light = None
    string = string.split(',')
    for chunk in string:
        if chunk.startswith('humidity'):
            humidity = split_value(chunk)
        if chunk.startswith('tempc'):
            temperature = split_value(chunk)
        if chunk.startswith('pressure'):
            pressure = split_value(chunk)
        if chunk.startswith('batt_lvl'):
            battery = split_value(chunk)
        if chunk.startswith('light_lvl'):
            light = split_value(chunk)

    if temperature:
        print 'Temperature: {}C'.format(temperature)
    if humidity > 0:
        print 'Humidity: {}%'.format(humidity)
    if pressure > 0:
        print 'Pressure: {} Pa'.format(pressure)
        print 'Corrected Pressure {} m: {} mb'.format(altitude,convert_to_mb(pressure))
    if light:
        print 'Light Level: {} '.format(light)
    if battery > 0:
        print 'Battery: {} V'.format(battery)
    return

while True:
    for c in port.read():
        serial_input.append(c)
        line = ''.join(str(v) for v in serial_input) #Make a string from array
        if c == '\n':
            serial_input = []
            if line[0] is '$':
                process_weather(line)
            break
port.close()
