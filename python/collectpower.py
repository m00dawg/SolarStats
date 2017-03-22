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

# Do some XML Stuff
url = urllib.urlopen('http://' + config.get('egauge', 'host') + '/cgi-bin/egauge')
tree = ET.parse(url)
root = tree.getroot()

# Grid and Solar raw values
grid = root[1][0].text
solar = root[2][0].text

url.close()


# Insert info Influx
influx = InfluxDBClient(config.get('influx', 'host'),
                        config.get('influx', 'port'),
                        config.get('influx', 'user'),
                        config.get('influx', 'password'),
                        config.get('influx', 'db'),
                        )

json_body = [
    {
        "measurement": "Power",
        #"time": datetime.datetime.utcnow(),
        "fields": {
            "grid": int(grid),
            "solar": int(solar),
        }
    }
]

#print("Write points: {0}".format(json_body))
influx.write_points(json_body)

# Insert into MySQL
# Open DB Connection
db_connection = mariadb.connect(user=config.get('database', 'user'),
    password=config.get('database', 'password'),
    database=config.get('database', 'database'))
db_cursor = db_connection.cursor()
db_cursor.execute("SET SQL_MODE='TRADITIONAL'")

try:
    db_cursor.execute("INSERT INTO PowerUsage (meterCounter, solarCounter) \
        VALUES (%s, %s)",
        (grid, solar))
    db_cursor.execute("COMMIT")
except Exception, e:
    print "Exception in INSERT encountered!"
    print e

db_cursor.close()
db_connection.close()
