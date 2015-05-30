<?php
    $m = new Memcached();
    $m->addServer('localhost', 11211);
    $m->set('SolarStats:outsideTemperature', $_GET['temp'], time() + 300);
    echo "OK";
?>
