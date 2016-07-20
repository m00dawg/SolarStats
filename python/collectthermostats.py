#!/usr/bin/env python
import ConfigParser
import mysql.connector as mariadb
import radiotherm
import time
#import memcache

# Read the configuration file
config = ConfigParser.ConfigParser()
config.read('config.ini')

# User Settings
debug_output = config.getboolean('debug', 'output')
debug_level = config.getint('debug', 'level')
polling_interval = config.getint('thermostats', 'polling_interval')
#mc = memcache.Client(['127.0.0.1:11211'], debug=0)
#memcached_host = config.get('memcache', 'host')
#memcached_port = config.get('memcache', 'port')
#memcached_expiry = config.getint('memcache', 'expiry')
#mc = memcache.Client([memcached_host + ":" + memcached_port], debug=0)

## Functions
def collect_thermostats(station_id, ip):
    try:
        if debug_output:
            print "IP: " + ip
        ct80 = radiotherm.thermostat.CT80(ip)
        temp = ct80.temp['raw']
        humidity = ct80.humidity['raw']
        if debug_output:
            print "Temperature: " + str(temp)
            print "Humidity: " + str(humidity)
        db_cursor.execute("INSERT INTO WeatherReadings (stationID, temperature, humidity) \
            VALUES (%s, %s, %s)",
            (station_id, temp, round(humidity)))
    except Exception, e:
        print e

while True:
    db_connection = mariadb.connect(user=config.get('database', 'user'),
        password=config.get('database', 'password'),
        database=config.get('database', 'database'))
    db_connection.ping(True)
    db_cursor = db_connection.cursor()
    db_cursor.execute("SET SQL_MODE='TRADITIONAL'")
    collect_thermostats(
        config.getint('downstairs_thermostat', 'station_id'),
        config.get('downstairs_thermostat', 'ip'))
    collect_thermostats(
        config.getint('upstairs_thermostat', 'station_id'),
        config.get('upstairs_thermostat', 'ip'))
    db_connection.commit()
    db_cursor.close()
    db_connection.close()
    if debug_output and debug_level > 2:
        print "Sleeping for " + str(polling_interval) + " seconds"
    time.sleep(polling_interval)
