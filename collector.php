#!/usr/bin/php
<?php

include 'global.inc.php';

$mysqli = new MySQLi($dbHost, $dbUser, $dbPassword, $db);

$power = simplexml_load_file('http://'.$egaugeHost . '/cgi-bin/egauge?inst');
#if($memcached->get('SolarStats:outsideTemperature'))
#    $temperature = $memcached->get('SolarStats:outsideTemperature');
#else
#    $temperature = null;
$mysqli->query("SET SQL_MODE='TRADITIONAL'");
$stmt = $mysqli->prepare("INSERT INTO PowerUsage (meterCounter, solarCounter) VALUES (?, ?)")
    or die($mysqli->error);
$stmt->bind_param('ii', $power->r[0]->v, $power->r[1]->v);
$stmt->execute();
$stmt->close();
$mysqli->close();
#$memcached->quit();
?>
