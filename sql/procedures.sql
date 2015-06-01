SELECT HOUR(logDate) AS hour,
(AVG(meterCounter) -
(SELECT AVG(meterCounter)
  FROM PowerUsage p2
  WHERE logDate >= DATE_SUB(NOW(), INTERVAL 12 hour)
  AND p2.logDate < p1.logDate
  GROUP BY HOUR(logDate)
  ORDER BY logDate DESC
  LIMIT 1))
/ 3600000 AS meter,
(AVG(solarCounter) -
(SELECT AVG(solarCounter)
  FROM PowerUsage p2 
  WHERE logDate >= DATE_SUB(NOW(), INTERVAL 12 hour)
  AND p2.logDate < p1.logDate
  GROUP BY HOUR(logDate)
  ORDER BY logDate DESC
  LIMIT 1))
/ 3600000 AS solar,
AVG(outsideTemperature) AS outsideTemperature
FROM PowerUsage p1
WHERE logDate >= DATE_SUB(NOW(), INTERVAL 12 hour)
GROUP BY HOUR(logDate)
ORDER BY HOUR(logDate);
