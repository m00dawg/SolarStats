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

/*
$app->get('/', function() {
    return 'Hello World';
});
*/

$app->get('/UsageByDay', function()
{
    DB::statement("SET time_zone='".env('APP_TIMEZONE')."'");
    $result = DB::select('SELECT * FROM UsageByDay');
    $response = response()->json($result);
    return $response;
});

$app->get('/AverageUsageByHour', function()
{
    DB::statement("SET time_zone='".env('APP_TIMEZONE')."'");
    $result = DB::select('SELECT * FROM AverageUsageByHour');
    $response = response()->json($result);
    return $response;
});

$app->get('/TodaysUsageByHour', function()
{
    DB::statement("SET time_zone='".env('APP_TIMEZONE')."'");
    $result = DB::select('SELECT * FROM TodaysUsageByHour');
    $response = response()->json($result);
    return $response;
});

$app->get('/TodaysUsageByMinute', function()
{
    DB::statement("SET time_zone='".env('APP_TIMEZONE')."'");
    $result = DB::select('SELECT * FROM TodaysUsageByMinute');
    $response = response()->json($result);
    return $response;
});

$app->get('/Time', function()
{
    DB::statement("SET time_zone='".env('APP_TIMEZONE')."'");
    $result = DB::select("SHOW VARIABLES LIKE 'time%'");
    $response = response()->json($result);
    return $response;

});
