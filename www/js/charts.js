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

/* Chart Options */
Chart.defaults.global.animation = false;
Chart.defaults.global.animationSteps = 10;
Chart.defaults.global.responsive = true;
Chart.defaults.global.maintainAspectRatio = true;
Chart.defaults.global.tooltipTitleFontSize = 14;
Chart.defaults.global.tooltipFontSize = 12;
Chart.defaults.global.scaleFontColor = "#444444";
Chart.defaults.global.scaleLineColor = "#dddddd";
Chart.defaults.global.scaleGridLineColor = "#cccccc";
Chart.defaults.global.bezierCurveTension = 0;

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
      var f = Math.round(this.avgOutsideTemperature * (9/5) + 32)
      $("#dailyUsage").append(
        "<tr><td>" + this.logDate +
        "</td><td>" + this.usedKWH +
        "</td><td>" + this.meterKWH +
        "</td><td>" + this.solarKWH +
        "</td><td>" + this.avgOutsideTemperature + "C (" + f + "F)" +
        "</td></tr>");

       day.push(this.logDate);
       usedKWH.push(parseInt(this.usedKWH));
       gridKWH.push(parseInt(this.meterKWH));
       solarKWH.push(parseInt(this.solarKWH));
       avgTemp.push(parseInt(this.avgOutsideTemperature));
       highTemp.push(parseInt(this.highOutsideTemperature));
       lowTemp.push(parseInt(this.lowOutsideTemperature));

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

  $.each(data, function()
  {
     usage.push([this.logDate * millis, parseInt(this.meterGauge) + parseInt(this.solarGauge)]);
     solar.push([this.logDate * millis, parseInt(this.solarGauge)]);
     temperature.push([this.logDate * millis, parseFloat(this.outsideTemperature)]);
  });
  drawUsageTimeseriesGraph(usage, solar, temperature, 'latestUsageGraph');
}

function drawUsageTimeseriesGraph(usage, solar, temperature, element)
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
  //solarVsUsagePieChart = new Chart(solarVsUsagePie).Pie(solarVsUsageData);
};
