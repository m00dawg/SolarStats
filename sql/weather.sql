DROP TABLE IF EXISTS WeatherStations;
CREATE TABLE WeatherStations (
  stationID TINYINT NOT NULL PRIMARY KEY,
  location VARCHAR(32) DEFAULT NULL,
  type ENUM('Spark', 'Xbee') DEFAULT 'Xbee',
  zone ENUM('Indoor', 'Outdoor') DEFAULT 'Outdoor',
  altitude INT DEFAULT NULL
) ENGINE='InnoDB';
INSERT INTO WeatherStations VALUES (1, 'Porch', 'Xbee', 'Outdoor', 294);

DROP TABLE IF EXISTS WeatherReadings;
CREATE TABLE WeatherReadings (
  stationID TINYINT NOT NULL,
	logDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  temperature DECIMAL(4,2) NOT NULL,
  pressure INT DEFAULT NULL,
  humidity TINYINT UNSIGNED DEFAULT NULL,
  battery DECIMAL(4,2) DEFAULT NULL,
  PRIMARY KEY (stationID, logDate)
) ENGINE='TokuDB';
