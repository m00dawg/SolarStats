DROP VIEW IF EXISTS UsageByDayView;
CREATE VIEW UsageByDayView AS
SELECT
DATE(logDate) AS "Day",
DAYOFWEEK(logDate) AS "Weekday",
ROUND(SUM(meterKWH) + SUM(solarKWH), 3) AS "UsedKWH",
ROUND(SUM(meterKWH), 3) AS "GridKWH",
ROUND(SUM(solarKWH), 3) AS "SolarKWH",
ROUND(AVG(outsideTemperature), 2) AS "AvgTemp",
ROUND(MAX(outsideTemperature), 2) AS "HighTemp",
ROUND(MIN(outsideTemperature), 2) AS "LowTemp"
FROM PowerUsage
GROUP BY DATE(logDate);

DROP VIEW IF EXISTS UsageByMonth;
CREATE VIEW UsageByMonth AS
SELECT
YEAR(logDate) AS "Year",
MONTH(logDate) AS "Month",
ROUND(SUM(meterKWH) + SUM(solarKWH), 3) AS "UsedKWH",
ROUND(SUM(meterKWH), 3) AS "GridKWH",
ROUND(SUM(solarKWH), 3) AS "SolarKWH",
ROUND(AVG(avgOutsideTemperature), 2) AS "AvgTemp"
FROM UsageByDay
GROUP BY YEAR(logDate), MONTH(logDate);

DROP VIEW IF EXISTS AverageUsageByHour;
CREATE VIEW AverageUsageByHour AS
SELECT
HOUR(logDate) AS "Hour",
ROUND(AVG(meterKWH) + AVG(solarKWH), 3) AS "UsedKWH",
ROUND(AVG(meterKWH), 3) AS "GridKWH",
ROUND(AVG(solarKWH), 3) AS "SolarKWH",
ROUND(AVG(outsideTemperature), 2) AS "OutsideTemp"
FROM PowerUsage
GROUP BY HOUR(logDate);

DROP VIEW IF EXISTS TodaysUsageByHour;
CREATE VIEW TodaysUsageByHour AS
SELECT
HOUR(logDate) AS "Hour",
ROUND(SUM(meterKWH) + SUM(solarKWH), 3) AS "UsedKWH",
ROUND(SUM(meterKWH), 3) AS "GridKWH",
ROUND(SUM(solarKWH), 3) AS "SolarKWH",
ROUND(AVG(outsideTemperature), 2) AS "OutsideTemp"
FROM PowerUsage
WHERE logDate >= CONCAT(DATE(NOW()), ' 00:00:00')
GROUP BY HOUR(logDate);

DROP VIEW IF EXISTS TodaysUsageByMinute;
CREATE VIEW TodaysUsageByMinute AS
SELECT
DATE_FORMAT(logDate, '%Y-%m-%d %h:%i') AS "Minute",
ROUND(SUM(meterKWH) + SUM(solarKWH), 5) AS "UsedKWH",
ROUND(SUM(meterKWH), 5) AS "GridKWH",
ROUND(SUM(solarKWH), 5) AS "SolarKWH",
ROUND(AVG(outsideTemperature), 2) AS "OutsideTemp"
FROM PowerUsage
WHERE logDate > CONCAT(DATE(NOW()), ' 00:00:00')
GROUP BY DATE_FORMAT(logDate, '%Y-%m-%d %h:%i');

DROP VIEW IF EXISTS TotalUsage;
CREATE VIEW TotalUsage AS
SELECT
ROUND(SUM(meterKWH) + SUM(solarKWH), 3) AS "UsedKWH",
ROUND(SUM(meterKWH), 3) AS "GridKWH",
ROUND(SUM(solarKWH), 3) AS "SolarKWH",
ROUND(AVG(outsideTemperature), 2) AS "OutsideTemp"
FROM PowerUsage
WHERE logDate >= CONCAT(DATE(NOW()), ' 00:00:00')
GROUP BY HOUR(logDate);
