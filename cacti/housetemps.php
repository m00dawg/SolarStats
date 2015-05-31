#!/usr/bin/php
<?php

    $m = new Memcached();
    $m->addServer('localhost', 11211);
    if($m->get('SolarStats:outsideTemperature'))
        $outsideTemp = $m->get('SolarStats:outsideTemperature');
    else
        $outsideTemp = 'U';
    echo "OutsideTemperature:$outsideTemp";
?>
