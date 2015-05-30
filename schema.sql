DROP TABLE IF EXISTS PowerUsage;

CREATE TABLE PowerUsage(
	logDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	meterCounter bigint NOT NULL,
	solarCounter bigint NOT NULL,
	meterGauge smallint NOT NULL DEFAULT 0,
	solarGauge smallint NOT NULL DEFAULT 0,
	usageGauge smallint NOT NULL DEFAULT 0,
  outsideTemperature decimal(4,2) DEFAULT NULL,
	PRIMARY KEY (logDate)
) ENGINE='TokuDB';

DROP TRIGGER IF EXISTS CalcPowerUsageGauges;

DELIMITER //

CREATE TRIGGER CalcPowerUsageGauges BEFORE INSERT ON PowerUsage
  FOR EACH ROW
  BEGIN
    SELECT logDate, meterCounter, solarCounter FROM PowerUsage
      WHERE logDate = (SELECT MAX(logDate) FROM PowerUsage)
      INTO @oldDate, @oldmeterCounter, @oldSolarCounter;
    SELECT TIMESTAMPDIFF(SECOND, @oldDate, NOW())
      INTO @timeDiff;
    SELECT ROUND((NEW.meterCounter - @oldmeterCounter) / @timeDiff) INTO @newMeterGauge;
    SELECT ROUND((NEW.solarCounter - @oldSolarCounter) / @timeDiff) INTO @newSolarGauge;

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

		SET NEW.usageGauge = @newMeterGauge + @newSolarGauge;

  END;
//

DELIMITER ;
