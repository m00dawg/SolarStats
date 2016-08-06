/* Colors */

var gridColors =
{
  fillColor: "rgba(250,120,120,0.7)",
  strokeColor: "rgba(250,120,120,0.9)",
  highlightFill: "rgba(255,25,25,1)",
  highlightStroke: "rgba(255,0,0,1)",
  surplusFillColor: "rgba(0,100,0,0.7)",
  surplusHighlightFill: "rgba(0,200,0,1)",
};

var usageColors =
{
  fillColor: "rgba(120,120,250,0.6)",
  strokeColor: "rgba(120,120,250,0.6)",
  highlightFill: "rgba(50,50,255,1)",
  highlightStroke: "rgba(0,0,255,1)",
};

var solarColors =
{
  fillColor: "rgba(25,250,25,0.8)",
  strokeColor: "rgba(25,250,25,0.9)",
  highlightFill: "rgba(25,255,25,1)",
  highlightStroke: "rgba(0,255,0,1)",
};

var batteryColors =
{
  fillColor: "rgba(0,0,0,0.5)",
  strokeColor: "rgba(0,0,0,1)",
  highlightFill: "rgba(0,0,0,1)",
  highlightStroke: "rgba(0,0,0,1)",
};

var humidityColors =
{
  fillColor: "rgba(0,0,200,0.5)",
  strokeColor: "rgba(25,25,250,1)",
  highlightFill: "rgba(25,25,255,1)",
  highlightStroke: "rgba(0,0,255,1)",
};

var pressureColors =
{
  fillColor: "rgba(200,0,200,0.5)",
  strokeColor: "rgba(250-,25,250,1)",
  highlightFill: "rgba(255,25,255,1)",
  highlightStroke: "rgba(255,0,255,1)",
};

var tempColors =
{
  fillColor: "rgba(200,0,0,0.5)",
  strokeColor: "rgba(250,25,25,1)",
  highlightFill: "rgba(255,25,25,1)",
  highlightStroke: "rgba(255,0,0,1)",
};

var avgTempColors =
{
  fillColor: "rgba(250,50,50,1)",
  strokeColor: "rgba(250,25,25,1)",
  highlightFill: "rgba(255,25,25,1)",
  highlightStroke: "rgba(255,0,0,1)",
};

var highTempColors =
{
  fillColor: "rgba(250,200,0,1)",
  strokeColor: "rgba(250,200,25,1)",
  highlightFill: "rgba(255,200,25,1)",
  highlightStroke: "rgba(255,200,0,1)",
};

var lowTempColors =
{
  fillColor: "rgba(50,50,250,1)",
  strokeColor: "rgba(25,25,250,1)",
  highlightFill: "rgba(25,25,255,1)",
  highlightStroke: "rgba(0,0,255,1)",
};

Highcharts.setOptions({
  global: {
    useUTC: false,
  }
})

function displayUsageByDay(data, status, jqXHR)
{
  var day = []
  var usedKWH = [];
  var gridKWH = [];
  var solarKWH = [];
  var avgTemp = [];
  var highTemp = [];
  var lowTemp = [];

  var totalUsedKWH = 0;
  var totalGridKWH = 0;
  var totalSolarKWH = 0;

  if(data.length == 0)
    $("#dailyUsage").append("<tr><td colspan='5'>No Data Found</td></tr>");
  else
  {
    $.each(data, function()
    {
      var f = Math.round(this.avgTemperature * (9/5) + 32)
      $("#dailyUsage").append(
        "<tr><td>" + this.logDate +
        "</td><td>" + this.usedKWH +
        "</td><td>" + this.meterKWH +
        "</td><td>" + this.solarKWH +
        "</td><td>" + this.avgTemperature + "C (" + f + "F)" +
        "</td></tr>");

       day.push(this.logDate);
       usedKWH.push(parseInt(this.usedKWH));
       gridKWH.push(parseInt(this.meterKWH));
       solarKWH.push(parseInt(this.solarKWH));
       avgTemp.push(parseInt(this.avgTemperature));
       highTemp.push(parseInt(this.highTemperature));
       lowTemp.push(parseInt(this.lowTemperature));

       totalUsedKWH = totalUsedKWH + parseInt(this.usedKWH);
       totalGridKWH = totalGridKWH + parseInt(this.meterKWH);
       totalSolarKWH = totalSolarKWH + parseInt(this.solarKWH);
    });

    $("#dailyUsage").append(
      "<tr><th>Total</th>" +
      "<td>" + totalUsedKWH + "</td>" +
      "<td>" + totalGridKWH + "</td>" +
      "<td>" + totalSolarKWH +
      "<td></td>" +
      "</td></tr>");

    drawSolarVsUsedPie(totalGridKWH, totalSolarKWH, 'solarVsUsedPie');
    drawUsageGraph(day, usedKWH, solarKWH, avgTemp, 'dailyUsageGraph');
    drawFullTempGraph(day, avgTemp, highTemp, lowTemp, 'dailyTempGraph');
  }
}

  function displayUsageByMonth(data, status, jqXHR)
  {
    var month = [];
    var usedKWH = [];
    var gridKWH = [];
    var solarKWH = [];
    var avgTemp = [];

    var totalUsedKWH = 0;
    var totalGridKWH = 0;
    var totalSolarKWH = 0;

    if(data.length == 0)
      $("#monthlyUsage").append("<tr><td colspan='5'>No Data Found</td></tr>");
    else
    {
      $.each(data, function()
      {
        var f = Math.round(this.AvgTemp * (9/5) + 32)
        $("#monthlyUsage").append(
          "<tr><td>" + this.Month +
          "</td><td>" + this.UsedKWH +
          "</td><td>" + this.GridKWH +
          "</td><td>" + this.SolarKWH +
          "</td><td>" + this.AvgTemp + "C (" + f + "F)" +
          "</td></tr>");

         month.push(this.Year + "-" + this.Month);
         usedKWH.push(parseInt(this.UsedKWH));
         gridKWH.push(parseInt(this.GridKWH));
         solarKWH.push(parseInt(this.SolarKWH));
         avgTemp.push(parseInt(this.AvgTemp));

         totalUsedKWH = totalUsedKWH + parseInt(this.UsedKWH);
         totalGridKWH = totalGridKWH + parseInt(this.GridKWH);
         totalSolarKWH = totalSolarKWH + parseInt(this.SolarKWH);
      });

      $("#monthlyUsage").append(
        "<tr><th>Total</th>" +
        "<td>" + totalUsedKWH + "</td>" +
        "<td>" + totalGridKWH + "</td>" +
        "<td>" + totalSolarKWH +
        "<td></td>" +
        "</td></tr>");

      //drawSolarVsUsedPie(totalGridKWH, totalSolarKWH, 'solarVsUsedPie');
      drawUsageGraph(month, usedKWH, solarKWH, avgTemp, 'monthlyUsageGraph');
      //drawFullTempGraph(day, avgTemp, highTemp, lowTemp, 'monthlyTempGraph');
      //drawTempGraph(month, avgTemp, 'monthlyTempGraph', 0.1);
    }
  }

function displayTodaysUsage(data, status, jqXHR)
{
  var totalUsedKWH = 0;
  var totalGridKWH = 0;
  var totalSolarKWH = 0;

  if(data.length == 0)
    { }
  else
  {
    $.each(data, function()
    {
       totalGridKWH = totalGridKWH + parseFloat(this.GridKWH);
       totalUsedKWH = totalUsedKWH + parseFloat(this.UsedKWH);
       totalSolarKWH = totalSolarKWH + parseFloat(this.SolarKWH);
    });
    drawSolarVsUsedPie(totalGridKWH, totalSolarKWH, 'solarVsUsedPieToday');
  }
}

function drawUsageGraph(labels, usedKWH, solarKWH, temperature, element)
{
  //console.log(temperature);
  // Build the chart
  var UsageBarGraph = new Highcharts.Chart(
  {
    chart: {
      renderTo: element,
    },
    xAxis: {
      categories: labels,
    },
    yAxis: [
      {
        title: {
          text: 'kWh',
        },
        allowDecimals: false,
        min: 0,
        startOnTick: true,
        endOnTick: true,
        minPadding: 0.02,
        maxPadding: 0.02,
      },
      {
        title: {
          text: 'Temperature (C)',
          style: {
            color: tempColors.fillColor,
          }
        },
        startOnTick: true,
        endOnTick: true,
        minPadding: 0.02,
        maxPadding: 0.02,
        opposite: true
      },
    ],
    legend: {
      enabled: false,
    },
    title: {
      text: null,
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        type: 'column',
        name: 'Solar',
        data: solarKWH,
        color: solarColors.fillColor,
      },
      {
        type: 'column',
        name: 'Usage',
        data: usedKWH,
        color: usageColors.fillColor,
      },
      {
        type: 'spline',
        name: 'Temperature',
        data: temperature,
        color: tempColors.fillColor,
        lineWidth: 1.5,
        yAxis: 1,
        shadow: true,
      },
    ]
   });
};

function displayTodaysTimeseries(data, status, jqXHR)
{
  var millis = 1000;
  var logInterval = []
  var usage = [];
  var solar = [];
  var temperature = [];
  var pressure = [];
  var humidity = [];
  var battery = [];


  $.each(data['Power'], function()
  {
     usage.push([this.logDate * millis, parseInt(this.meterGauge) + parseInt(this.solarGauge)]);
     solar.push([this.logDate * millis, parseInt(this.solarGauge)]);
  });
  $.each(data['Weather'], function()
  {
    temperature.push([this.logDate * millis, parseFloat(this.temperature)]);
    pressure.push([this.logDate * millis, parseFloat(this.pressure) / 100]);
    humidity.push([this.logDate * millis, parseFloat(this.humidity)]);
    battery.push([this.logDate * millis, parseFloat(this.battery)]);
  });
  drawUsageTimeseriesGraph(usage, solar, temperature, pressure, humidity, battery, 'latestUsageGraph');
}

var showTemperature = true;
var showHumidity = false;
var showPressure = false;
var showBattery = false;
$('#toggleTemperature').click(function () {
    showTemperature = !showTemperature;
    $('#latestUsageGraph').highcharts().series[2].update({
        visible: showTemperature
    });
    $('#latestUsageGraph').highcharts().yAxis[1].update({
        visible: showTemperature
    });
});
$('#togglePressure').click(function () {
    showPressure = !showPressure;
    $('#latestUsageGraph').highcharts().series[3].update({
        visible: showPressure
    });
    $('#latestUsageGraph').highcharts().yAxis[2].update({
        visible: showPressure
    });
});
$('#toggleHumidity').click(function () {
    showHumidity = !showHumidity;
    $('#latestUsageGraph').highcharts().series[4].update({
        visible: showHumidity
    });
    $('#latestUsageGraph').highcharts().yAxis[3].update({
        visible: showHumidity
    });
});
$('#toggleBattery').click(function () {
    showBattery = !showBattery;
    $('#latestUsageGraph').highcharts().series[5].update({
        visible: showBattery
    });
    $('#latestUsageGraph').highcharts().yAxis[4].update({
        visible: showBattery
    });
});
function drawUsageTimeseriesGraph(usage, solar, temperature, pressure, humidity, battery, element)
{
  // Build the chart
  var UsageTimeseries = new Highcharts.Chart(
  {
    chart: {
        zoomType: 'x',
        renderTo: element,
    },
    xAxis: {
      type: 'datetime',
    },
    yAxis: [
      {
        title: {
          text: 'Watts',
        },
        allowDecimals: false,
        min: 0,
        startOnTick: true,
        endOnTick: true,
        minPadding: 0.02,
        maxPadding: 0.02,
      },
      {
        title: {
          text: 'Temperature (C)',
          style: {
            color: tempColors.fillColor,
          }
        },
        startOnTick: true,
        endOnTick: true,
        minPadding: 0.02,
        maxPadding: 0.02,
        opposite: true,
        visible: showTemperature,
      },
      {
        title: {
          text: 'Pressure (mb)',
          style: {
            color: pressureColors.fillColor,
          }
        },
        startOnTick: true,
        endOnTick: true,
        minPadding: 0.02,
        maxPadding: 0.02,
        opposite: true,
        visible: showPressure,
      },
      {
        title: {
          text: 'Humidity (%)',
          style: {
            color: humidityColors.fillColor,
          }
        },
        startOnTick: true,
        endOnTick: true,
        min: 0,
        max: 100,
        minPadding: 0.02,
        maxPadding: 0.02,
        opposite: true,
        visible: showHumidity,
      },
      {
        title: {
          text: 'Battery (V)',
          style: {
            color: batteryColors.fillColor,
          }
        },
        startOnTick: true,
        endOnTick: true,
        minPadding: 0.02,
        maxPadding: 0.02,
        min: 3.2,
        max: 4.2,
        opposite: true,
        visible: showBattery,
      },
    ],
    legend: {
      enabled: false,
    },
    title: {
      text: null,
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        type: 'area',
        name: 'Solar',
        data: solar,
        color: solarColors.fillColor,
      },
      {
        type: 'area',
        name: 'Usage',
        data: usage,
        color: usageColors.fillColor,
      },
      {
        type: 'spline',
        name: 'Temperature',
        data: temperature,
        color: tempColors.fillColor,
        lineWidth: 1.5,
        yAxis: 1,
        shadow: true,
        visible: showTemperature,
      },
      {
        type: 'spline',
        name: 'Pressure',
        data: pressure,
        color: pressureColors.fillColor,
        lineWidth: 1.5,
        yAxis: 2,
        shadow: true,
        visible: showPressure,
      },
      {
        type: 'spline',
        name: 'Humidity',
        data: humidity,
        color: humidityColors.fillColor,
        lineWidth: 1.5,
        yAxis: 3,
        shadow: true,
        visible: showHumidity,
      },
      {
        type: 'spline',
        name: 'Battery',
        data: battery,
        color: batteryColors.fillColor,
        lineWidth: 1.5,
        yAxis: 4,
        shadow: true,
        visible: showBattery,
      },
    ]
   });
};

function drawFullTempGraph(labels, avgTemp, highTemp, lowTemp, element, curveTension)
{
  var FullTempGraph = new Highcharts.Chart(
  {
    chart: {
      renderTo: element,
    },
    xAxis: {
      categories: labels,
    },
    yAxis:
    {
      title: {
        text: 'Temperature',
      },
      allowDecimals: false,
      min: 0,
      startOnTick: true,
      endOnTick: true,
      minPadding: 0.02,
      maxPadding: 0.02,
    },
    legend: {
      enabled: false,
    },
    title: {
      text: null,
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        type: 'spline',
        name: 'Low',
        data: lowTemp,
        color: lowTempColors.fillColor,
        lineWidth: 2,
        shadow: true,
      },
      {
        type: 'spline',
        name: 'Avg',
        data: avgTemp,
        color: avgTempColors.fillColor,
        lineWidth: 2,
        shadow: true,
      },
      {
        type: 'spline',
        name: 'High',
        data: highTemp,
        color: highTempColors.fillColor,
        lineWidth: 2,
        shadow: true,
      },
    ]
  })
};

function drawSolarVsUsedPie(totalGridKWH, totalSolarKWH, element)
{
  if(totalGridKWH >= 0)
  {
    var gridFillColor = gridColors.fillColor;
    var gridHighlightFillColor = gridColors.highlightFill;
  }
  else
  {
    var gridFillColor = gridColors.surplusFillColor;
    var gridHighlightFillColor = gridColors.surplusHighlightFill;
  }

  var solarVsUsageData = [
    {
      name: 'Usage',
      colorByPoint: true,
      data: [
        {
          name: "Grid",
          color: gridFillColor,
          borderColor: gridHighlightFillColor,
          y: Math.abs(totalGridKWH)
        },
        {
          name: "Solar",
          color: solarColors.fillColor,
          borderColor: solarColors.highlightFill,
          y: Math.abs(totalSolarKWH)
        },
      ]
    }
  ];

  // Build the chart
  var solarVsUsagePieChart = new Highcharts.Chart(
  {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        renderTo: element,
    },
    plotOptions: {
      pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
              enabled: false
          },
          showInLegend: true
      }
  },
  legend: {
    enabled: false,
  },
  title: {
    text: null,
  },
  credits: {
    enabled: false,
  },
  series: solarVsUsageData,
 });
};


function displayCurrentEnergy(data, status, jqXHR)
{
  var meterGauge = parseFloat(data[0].meterGauge);
  drawMeterUsageBar(meterGauge, 'currentEnergyUsage');
}

/*
function drawMeterUsageBar(meterGauge, element)
{
  var gauge = -meterGauge;  // Invert because - values mean energy surplus
  var color = solarColors.fillColor;

  if(gauge <= 0)
    color = gridColors.fillColor;

  var MeterUsageBarGraph = new Highcharts.Chart(
  {

    chart: {
      renderTo: element,
    },

    yAxis:
    {
      title: {
        text: 'Watts',
      },
      allowDecimals: false,
      //min: 0,
      //startOnTick: true,
      //endOnTick: true,
      //minPadding: 0.02,
      //maxPadding: 0.02,
    },
    legend: {
      enabled: false,
    },
    title: {
      text: null,
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        type: 'column',
        name: 'Meter',
        data: [gauge],
        color: color,
      },
    ]
   });
}
*/
