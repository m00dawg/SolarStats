<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

$app->get('/', function() use ($app) {
    return $app->welcome();
});


$app->group(['prefix' => 'v1'], function($app)
{
  DB::statement("SET time_zone='".env('APP_TIMEZONE')."'");
  DB::statement("SET SQL_MODE='TRADITIONAL'");

  $app->get('/weather/today', function()
  {
      $memcached = new Memcached();
      $memcached->addServer('127.0.0.1', 11211);
      $temperature = $memcached->get('SolarStats:'.env("STATION_ID").':currentTemperature');
      $humidity = $memcached->get('SolarStats:'.env("STATION_ID").':currentHumidity');
      $pressure = $memcached->get('SolarStats:'.env("STATION_ID").':currentPressure');
      $battery = $memcached->get('SolarStats:'.env("STATION_ID").':currentBattery');
      $memcached->quit();

      if(!isset($temperature) || $temperature == '')
        $temperature = 'Unknown';

      $result = DB::select("SELECT
        ? AS 'CurrentTemperature',
        ? AS 'CurrentHumidity',
        ? AS 'CurrentPressure',
        ? AS 'CurrentBattery',
        MIN(temperature) AS 'LowTemperature',
        MAX(temperature) AS 'HighTemperature' FROM WeatherReadings
        WHERE logDate >= CONCAT(DATE(NOW()), ' 00:00:00') AND logDate <= NOW()
        AND stationID = ?", [$temperature, $humidity, $pressure, $battery, env("STATION_ID")]);
      return response()->json($result);
  });

  $app->get('/weather/yesterday', function()
  {
      $result = DB::select("SELECT
        MIN(temperature) AS 'LowTemperature',
        MAX(temperature) AS 'HighTemperature' FROM WeatherReadings
        WHERE logDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 day), '%Y-%m-%d 00:00:00')
        AND logDate < DATE_FORMAT(NOW(), '%Y-%m-%d 00:00:00')
        AND stationID = ?", [env("STATION_ID")]);
      return response()->json($result);
  });

  $app->get('/usage/raw', function()
  {
    $days = 1;
    //$stations = DB::select("SELECT stationID FROM WeatherStations")
    $groupBy = 'GROUP BY UNIX_TIMESTAMP(logDate)';
    if(isset($_GET['days']))
      if($_GET['days'] > 0)
      {
        $days = $_GET['days'];
        if($days > 30)
          $groupBy = "GROUP BY ROUND(UNIX_TIMESTAMP(logDate), -4)";
        else if($days > 5)
          $groupBy = "GROUP BY ROUND(UNIX_TIMESTAMP(logDate), -3)";
        else if($days > 3)
          $groupBy = "GROUP BY ROUND(UNIX_TIMESTAMP(logDate), -2)";
        else if($days > 1)
          $groupBy = "GROUP BY ROUND(UNIX_TIMESTAMP(logDate), -1)";
      }
    $power = DB::select("SELECT
      UNIX_TIMESTAMP(logDate) AS logDate,
      AVG(meterGauge) AS meterGauge,
      AVG(solarGauge) AS solarGauge
      FROM PowerUsage
      WHERE logDate >= DATE_SUB(NOW(), INTERVAL ? day) $groupBy", [$days]);
    $weather = DB::select("SELECT
      UNIX_TIMESTAMP(logDate) AS logDate,
      AVG(temperature) AS temperature,
      AVG(pressure) AS pressure,
      AVG(humidity) AS humidity,
      AVG(battery) AS battery
      FROM WeatherReadings
      WHERE logDate >= DATE_SUB(NOW(), INTERVAL ? day)
      AND stationID = ? $groupBy", [$days, env("STATION_ID")]);
    return response()->json([
      'Power' => $power,
      'Weather' => $weather]);
  });

  $app->get('/usage/current', function()
  {
    $currentUsage = [];
    $egaugeHost = env("EGAUGE_HOST");
    //$memcached = new Memcached();

    //$memcached->addServer('127.0.0.1', 11211);
    //$currentUsage['outsideTemperature'] = $memcached->get('SolarStats:outsideTemperature');
    //$memcached->quit();
    $power = simplexml_load_file('http://'.$egaugeHost . '/cgi-bin/egauge?inst');
    $currentUsage['usedGauge'] = $power->r[0]->i + $power->r[1]->i;
    $currentUsage['meterGauge'] = (int)$power->r[0]->i;
    $currentUsage['solarGauge'] = (int)$power->r[1]->i;

    return response()->json($currentUsage);
    //return response()->json(DB::select('SELECT * FROM UsageCurrent'));
  });

  $app->get('/usage/average', function()
  {
    $where = "";
    $timeframe = 'hour';
    if(isset($_GET['timeframe']))
      $timeframe = $_GET['timeframe'];

    switch($timeframe)
    {
      case 'day':
      {
        if(isset($_GET['lastDays']))
            $result = DB::select('SELECT UsageByDay.logDate AS logDate,
              usedKWH,
              meterKWH,
              solarKWH,
              lowTemperature,
              avgTemperature,
              highTemperature
              FROM UsageByDay
              LEFT OUTER JOIN WeatherReadingsByDay ON WeatherReadingsByDay.logDate = UsageByDay.logDate
                AND WeatherReadingsByDay.stationID = ?
              WHERE UsageByDay.logDate >= DATE_SUB(NOW(), INTERVAL ? day)',
              [env("STATION_ID"), $_GET['lastDays']]);
        else
          $result = DB::select('SELECT * FROM UsageByDay');
        break;
      }
      case 'month':
      {
        $result = DB::select('SELECT
          YEAR(UsageByDay.logDate) AS "Year",
          MONTH(UsageByDay.logDate) AS "Month",
          ROUND(SUM(meterKWH) + SUM(solarKWH), 3) AS "UsedKWH",
          ROUND(SUM(meterKWH), 3) AS "GridKWH",
          ROUND(SUM(solarKWH), 3) AS "SolarKWH"
          FROM UsageByDay
          JOIN WeatherReadingsByDay ON WeatherReadingsByDay.logDate = UsageByDay.logDate
          WHERE WeatherReadingsByDay.stationID = ?
          GROUP BY YEAR(UsageByDay.logDate), MONTH(UsageByDay.logDate)', [env("STATION_ID")]);
        break;
      }
      default:
      {
        $result = DB::select('SELECT * FROM AverageUsageByHour');
        break;
      }
    }

    return response()->json($result);
  });

  $app->get('/usage/total', function()
  {
    $timeframe = 'today';
    if(isset($_GET['timeframe']))
      $timeframe = $_GET['timeframe'];
    switch($timeframe)
    {
      case 'yesterday':
      {
        $where = "logDate >= CONCAT(DATE(DATE_SUB(NOW(), INTERVAL 1 day)), ' 00:00:00')
                  AND logDate < CONCAT(DATE(NOW()), ' 00:00:00')";
        break;
      }
      case 'thisMonth':
      {
        $where = "logDate >= DATE_FORMAT(NOW(), '%Y-%m-1 00:00:00')";
        break;
      }
      // Today
      default:
      {
        $where = "logDate >= DATE_FORMAT(NOW(), '%Y-%m-%d 00:00:00')";
        //$where = "logDate >= CONCAT(DATE(NOW()), ' 00:00:00')";
        break;
      }
    }
    $result = DB::select("
      SELECT
        ROUND(SUM(meterKWH) + SUM(solarKWH), 3) AS 'UsedKWH',
        ROUND(SUM(meterKWH), 3) AS 'GridKWH',
        ROUND(SUM(solarKWH), 3) AS 'SolarKWH'
      FROM PowerUsage
      WHERE $where");
    $response = response()->json($result);
    return $response;
  });

  $app->get('Time', function()
  {
      $result = DB::select("SHOW VARIABLES LIKE 'time%'");
      $response = response()->json($result);
      return $response;
  });
});

$app->get('/UsageByDay', function()
{
    $result = DB::select('SELECT * FROM UsageByDay');
    $response = response()->json($result);
    return $response;
});

$app->get('/AverageUsageByHour', function()
{
    $result = DB::select('SELECT * FROM AverageUsageByHour');
    $response = response()->json($result);
    return $response;
});

$app->get('/TodaysUsageByHour', function()
{
    $result = DB::select('SELECT * FROM TodaysUsageByHour');
    $response = response()->json($result);
    return $response;
});

$app->get('/TodaysUsageByMinute', function()
{
    $result = DB::select('SELECT * FROM TodaysUsageByMinute');
    $response = response()->json($result);
    return $response;
});

$app->get('/Time', function()
{
    $result = DB::select("SHOW VARIABLES LIKE 'time%'");
    $response = response()->json($result);
    return $response;
});
