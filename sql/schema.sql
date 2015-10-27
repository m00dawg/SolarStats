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

DROP TRIGGER IF EXISTS UpdateUsageByDay;
DELIMITER //
CREATE TRIGGER UpdateUsageByDay AFTER INSERT ON PowerUsage
	FOR EACH ROW
	BEGIN
		REPLACE INTO UsageByDay
			(logDate, meterKWH, solarKWH, lowOutsideTemperature, avgOutsideTemperature, highOutsideTemperature)
		SELECT
			DATE(NOW()),
			SUM(meterKWH),
			SUM(solarKWH),
			MIN(outsideTemperature),
			ROUND(AVG(outsideTemperature), 2),
			MAX(outsideTemperature)
		FROM PowerUsage
		WHERE logDate > CONCAT(DATE(NOW()), ' 00:00:00');
	END;
//
DELIMITER ;
