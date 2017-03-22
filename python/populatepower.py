#!/usr/bin/env python
import sys
import os
import urllib
import ConfigParser
import mysql.connector as mariadb
from influxdb import InfluxDBClient
import xml.etree.ElementTree as ET
import urllib
import datetime
#import memcache
# Read the configuration file
config = ConfigParser.ConfigParser()
config.read(os.path.dirname(sys.argv[0]) + '/config.ini')

# Open Influx Connection
influx = InfluxDBClient(config.get('influx', 'host'),
                        config.get('influx', 'port'),
                        config.get('influx', 'user'),
                        config.get('influx', 'password'),
                        config.get('influx', 'db'),
                        )

# Open DB Connection
db_connection = mariadb.connect(user=config.get('database', 'user'),
    password=config.get('database', 'password'),
    database=config.get('database', 'database'))
db_cursor = db_connection.cursor()
db_cursor.execute("SET SQL_MODE='TRADITIONAL'")

def add_influx(influx, logDate, meterCounter, solarCounter):
    json_body = [
        {
            "measurement": "Power",
            "time": logDate,
            "fields": {
                "grid": int(meterCounter),
                "solar": int(solarCounter),
            }
        }
    ]
    #print("Write points: {0}".format(json_body))
    influx.write_points(json_body)

for year in (2015, 2016, 2017):
    for month in (1,2,3,4,5,6,7,8,9,10,11,12):
        print("Current timeframe: %s-%s") % (year, month)
        db_cursor.execute("SELECT logDate, meterCounter, solarCounter \
                           FROM PowerUsage \
                           WHERE logDate >= '%s-%s-01 00:00:00' \
                           AND logDate <= CONCAT(LAST_DAY('%s-%s-01'), ' 23:59:59')",
                           (year, month, year, month))
        for (logDate, meterCounter, solarCounter) in db_cursor:
            add_influx(influx, logDate, meterCounter, solarCounter)

db_cursor.close()
db_connection.close()
#influx.close()
