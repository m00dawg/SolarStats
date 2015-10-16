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

  $app->get('/temperature/today', function()
  {
      $memcached = new Memcached();
      $memcached->addServer('127.0.0.1', 11211);
      $temperature = $memcached->get('SolarStats:outsideTemperature');
      $memcached->quit();

      if(!isset($temperature) || $temperature == '')
        $temperature = 'Unknown';

      $result = DB::select("SELECT
        '$temperature' AS 'CurrentTemperature',
        MIN(outsideTemperature) AS 'LowTemperature',
        MAX(outsideTemperature) AS 'HighTemperature' FROM PowerUsage
        WHERE logDate >= CONCAT(DATE(NOW()), ' 00:00:00') AND logDate <= NOW()");
      return response()->json($result);
  });

  $app->get('/temperature/yesterday', function()
  {
      $result = DB::select("SELECT
        MIN(outsideTemperature) AS 'LowTemperature',
        MAX(outsideTemperature) AS 'HighTemperature' FROM PowerUsage
        WHERE logDate >= CONCAT(DATE(DATE_SUB(NOW(), INTERVAL 1 day)), ' 00:00:00') AND logDate <= NOW()");
      return response()->json($result);
  });

  $app->get('/usage/current', function()
  {
    return response()->json(DB::select('SELECT * FROM UsageCurrent'));
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
            $result = DB::select('SELECT * FROM UsageByDay
              WHERE Day >= DATE_SUB(NOW(), INTERVAL ? day)', [$_GET['lastDays']]);
        else
          $result = DB::select('SELECT * FROM UsageByDay');
        break;
      }
      case 'month':
      {
        $result = DB::select('SELECT * FROM UsageByMonth');
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
        $where = "logDate >= CONCAT(DATE(DATE_SUB(NOW(), INTERVAL 1 day)), ' 00:00:00')";
        break;
      }
      case 'thisMonth':
      {
        $where = "logDate >= CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-01 00:00:00')";
        break;
      }
      // Today
      default:
      {
        $where = "logDate >= CONCAT(DATE(NOW()), ' 00:00:00')";
        break;
      }
    }
    $result = DB::select("
      SELECT
        ROUND(SUM(meterKWH) + SUM(solarKWH), 3) AS 'UsedKWH',
        ROUND(SUM(meterKWH), 3) AS 'GridKWH',
        ROUND(SUM(solarKWH), 3) AS 'SolarKWH',
        ROUND(AVG(outsideTemperature), 2) AS 'OutsideTemp'
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
