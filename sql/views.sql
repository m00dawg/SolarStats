DROP VIEW IF EXISTS UsageByDay;
CREATE VIEW UsageByDay AS
SELECT
DATE(logDate) AS "Day",
DAYOFWEEK(logDate) AS "Weekday",
ROUND(SUM(meterKWH) + SUM(solarKWH), 3) AS "UsedKWH",
ROUND(SUM(meterKWH), 3) AS "GridKWH",
ROUND(SUM(solarKWH), 3) AS "SolarKWH",
ROUND(AVG(outsideTemperature), 2) AS "OutsideTemp"
FROM PowerUsage
GROUP BY DATE(logDate);

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
ROUND(AVG(meterKWH) + AVG(solarKWH), 3) AS "UsedKWH",
ROUND(AVG(meterKWH), 3) AS "GridKWH",
ROUND(AVG(solarKWH), 3) AS "SolarKWH",
ROUND(AVG(outsideTemperature), 2) AS "OutsideTemp"
FROM PowerUsage
WHERE logDate >= CONCAT(DATE(NOW()), ' 00:00:00')
GROUP BY HOUR(logDate);

DROP VIEW IF EXISTS AverageSolarVsGrid;
CREATE VIEW AverageUsageByHour AS
SELECT
HOUR(logDate) AS "Hour",
ROUND(AVG(meterKWH) + AVG(solarKWH), 3) AS "UsedKWH",
ROUND(AVG(meterKWH), 3) AS "GridKWH",
ROUND(AVG(solarKWH), 3) AS "SolarKWH",
ROUND(AVG(outsideTemperature), 2) AS "OutsideTemp"
FROM PowerUsage
GROUP BY HOUR(logDate);
