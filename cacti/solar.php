#!/usr/bin/php
<?php
    $power = simplexml_load_file('http://solar.moocow.home/cgi-bin/egauge?inst');
#    print_r($power);
     echo "MeterCounter:" . $power->r[0]->v . " SolarCounter:". $power->r[1]->v;
?>
