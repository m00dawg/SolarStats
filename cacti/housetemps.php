#!/usr/bin/php
<?php
    $m = new Memcached();
    $m->addServer('localhost', 11211);
    $outsideTemp = 'U';
    if($m->get('SolarStats:outsideTemperatureBad'))
        $outsideTemp = $m->get('SolarStats:outsideTemperature');
    echo "OutsideTemperature:$outsideTemp";
?>
