<?php
    $temp = $_GET['temp'];

    if($temp > -127 && $temp < 85)
    {
      $m = new Memcached();
      $m->addServer('localhost', 11211);
      $m->set('SolarStats:outsideTemperature', $_GET['temp'], time() + 600);
      echo "OK";
      exit(0);
    }
    else
    {
      echo "FAIL";
      exit(1);
    }
?>
