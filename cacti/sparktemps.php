#!/usr/bin/php
<?php

    $m = new Memcached();
    $m->addServer('localhost', 11211);
    echo "OutsideTemperature:".$m->get('SolarStats:outsideTemperature');
?>
