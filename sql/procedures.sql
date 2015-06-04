SELECT
DATE(logDate) AS "Day",
DAYOFWEEK(logDate) AS "Weekday",
ROUND(SUM(meterKWH) + SUM(solarKWH), 3) AS "UsedKWH",
ROUND(SUM(meterKWH), 3) AS "GridKWH",
ROUND(SUM(solarKWH), 3) AS "SolarKWH",
ROUND(AVG(outsideTemperature), 2) AS "AvgTemp"
FROM PowerUsage
GROUP BY DATE(logDate);
