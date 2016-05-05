DROP TABLE IF EXISTS PowerUsage;
CREATE TABLE PowerUsage(
	logDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	meterCounter bigint NOT NULL,
	solarCounter bigint NOT NULL,
	meterGauge smallint NOT NULL DEFAULT 0,
	solarGauge smallint NOT NULL DEFAULT 0,
	meterKWH float NOT NULL DEFAULT '0',
  solarKWH float NOT NULL DEFAULT '0',
  outsideTemperature decimal(4,2) DEFAULT NULL,
	PRIMARY KEY (logDate)
) ENGINE='TokuDB';

INSERT INTO PowerUsage VALUES (NOW(), 0, 0, 0, 0, 0, NULL);

DROP TABLE IF EXISTS UsageByDay;
CREATE TABLE UsageByDay(
	logDate DATE,
	meterKWH float NOT NULL DEFAULT '0',
	solarKWH float NOT NULL DEFAULT '0',
	usedKWH float AS (meterKWH + solarKWH) VIRTUAL,
	lowOutsideTemperature decimal(4,2) DEFAULT NULL,
	avgOutsideTemperature decimal(4,2) DEFAULT NULL,
	highOutsideTemperature decimal(4,2) DEFAULT NULL,
	PRIMARY KEY (logDate)
)	ENGINE='InnoDB';

DROP TABLE IF EXISTS WeatherReadingsByDay;
CREATE TABLE WeatherReadingsByDay(
	stationID TINYINT UNSIGNED NOT NULL,
	logDate DATE,
	lowTemperature decimal(4,2) DEFAULT NULL,
	avgTemperature decimal(4,2) DEFAULT NULL,
	highTemperature decimal(4,2) DEFAULT NULL,
	PRIMARY KEY (stationID, logDate)
)	ENGINE='InnoDB';

DROP TRIGGER IF EXISTS CalcPowerUsageGauges;
DELIMITER //
CREATE TRIGGER CalcPowerUsageGauges BEFORE INSERT ON PowerUsage
  FOR EACH ROW
  BEGIN
		SELECT logDate, meterCounter, solarCounter FROM PowerUsage
			WHERE logDate = (SELECT MAX(logDate) FROM PowerUsage)
			INTO @oldDate, @oldMeterCounter, @oldSolarCounter;
		SELECT TIMESTAMPDIFF(SECOND, @oldDate, NOW())
			INTO @timeDiff;
		SELECT ROUND((NEW.meterCounter - @oldMeterCounter) / @timeDiff) INTO @newMeterGauge;
		SELECT ROUND((NEW.solarCounter - @oldSolarCounter) / @timeDiff) INTO @newSolarGauge;
		SELECT (NEW.meterCounter - @oldMeterCounter) / 3600000 INTO @newMeterKWH;
		SELECT (NEW.solarCounter - @oldSolarCounter) / 3600000 INTO @newSolarKWH;

		IF @newmeterGauge IS NOT NULL
		THEN
			SET NEW.meterGauge = @newMeterGauge;
		ELSE
			SET NEW.meterGauge = 0;
		END IF;

		IF @newSolarGauge IS NOT NULL
		THEN
			SET NEW.solarGauge = @newSolarGauge;
		ELSE
			SET NEW.solarGauge = 0;
		END IF;

		IF @newMeterKWH IS NOT NULL
		THEN
			SET NEW.meterKWH = @newMeterKWH;
		ELSE
			SET NEW.meterKWH = 0;
		END IF;

		IF @newSolarKWH IS NOT NULL
		THEN
			SET NEW.solarKWH = @newSolarKWH;
		ELSE
			SET NEW.solarKWH = 0;
		END IF;
  END;
//
DELIMITER ;

DROP TRIGGER IF EXISTS UpdatePowerUsageByDay;
DELIMITER //
CREATE TRIGGER UpdatePowerUsageByDay AFTER INSERT ON PowerUsage
	FOR EACH ROW
	BEGIN
		REPLACE INTO UsageByDay
			(logDate, meterKWH, solarKWH)
		SELECT
			DATE(NOW()),
			SUM(meterKWH),
			SUM(solarKWH)
		FROM PowerUsage
		WHERE logDate > CONCAT(DATE(NOW()), ' 00:00:00');
	END;
//
DELIMITER ;

DROP TRIGGER IF EXISTS UpdateWeatherReadingsByDay;
DELIMITER //
CREATE TRIGGER UpdateWeatherReadingsByDay AFTER INSERT ON WeatherReadings
	FOR EACH ROW
	BEGIN
		REPLACE INTO WeatherReadingsByDay
			(logDate, stationID, lowTemperature, avgTemperature, highTemperature)
		SELECT
			DATE(NOW()),
			stationID,
			MIN(temperature),
			ROUND(AVG(temperature), 2),
			MAX(temperature)
		FROM WeatherReadings
		WHERE logDate > CONCAT(DATE(NOW()), ' 00:00:00')
		AND stationID = NEW.stationID;
	END;
//
DELIMITER ;
