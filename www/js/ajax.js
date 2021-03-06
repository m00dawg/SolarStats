function updateCurrentTemp()
{
  jQuery.ajax({
    type: "GET",
    url: "/api/v1/weather/today",
    contentType: "application/json",
    dataType: "json",
    success: function(data)
    {
      $("#currentTemperature").empty();
      $("#currentHumidity").empty();
      $("#currentPressure").empty();
      $("#currentBattery").empty();
      $("#todayLowTemperature").empty();
      $("#todayHighTemperature").empty();
      var currentF = Math.round(data[0].CurrentTemperature * (9/5) + 32)
      var lowF = Math.round(data[0].LowTemperature * (9/5) + 32)
      var highF = Math.round(data[0].HighTemperature * (9/5) + 32)
      $("#currentTemperature").append(data[0].CurrentTemperature + "C (" + currentF + "F)");
      $("#currentHumidity").append(data[0].CurrentHumidity);
      $("#currentPressure").append(data[0].CurrentPressure / 100);
      $("#currentBattery").append(data[0].CurrentBattery);
      $("#todayLowTemperature").append(data[0].LowTemperature + "C (" + lowF + "F)");
      $("#todayHighTemperature").append(data[0].HighTemperature + "C (" + highF + "F)");
    }
  });
}
updateCurrentTemp();
setInterval(function()
{
  updateCurrentTemp();
}, 60000);

function updateCurrentEnergy()
{
  jQuery.ajax({
    type: "GET",
    url: "/api/v1/usage/current",
    contentType: "application/json",
    dataType: "json",
    success: function(data)
    {
      $("#currentUsageWatts").empty();
      $("#currentSolarWatts").empty();
      $("#currentGridWatts").empty();
      $("#currentUsageWatts").append(data.usedGauge);
      $("#currentSolarWatts").append(data.solarGauge);
      $("#currentGridWatts").append(data.meterGauge);
    }
  });
}
updateCurrentEnergy();
setInterval(function()
{
  updateCurrentEnergy();
}, 5000);

jQuery.ajax({
    type: "GET",
    url: "/api/v1/weather/yesterday",
    contentType: "application/json",
    dataType: "json",
    success: function(data)
    {
      var lowF = Math.round(data[0].LowTemperature * (9/5) + 32)
      var highF = Math.round(data[0].HighTemperature * (9/5) + 32)
      $("#yesterdayLowTemperature").append(data[0].LowTemperature + "C (" + lowF + "F)");
      $("#yesterdayHighTemperature").append(data[0].HighTemperature + "C (" + highF + "F)");
    }
});

jQuery.ajax({
    type: "GET",
    url: "/api/v1/usage/average?timeframe=day&lastDays=30",
    contentType: "application/json",
    dataType: "json",
    success: displayUsageByDay,
});

jQuery.ajax({
    type: "GET",
    url: "/api/v1/usage/average?timeframe=month",
    contentType: "application/json",
    dataType: "json",
    success: displayUsageByMonth,
});

function updateRaw()
{
  jQuery.ajax({
    type: "GET",
    url: "/api/v1/usage/raw?days=" + document.getElementById('rawDaysInput').value,
    contentType: "application/json",
    dataType: "json",
    success: displayTodaysTimeseries,
  });
}
this.updateRaw();
setInterval(function()
{
  updateRaw();
}, 60000);



/*
jQuery.ajax({
    type: "GET",
    url: "/api/v1/usage/average?timeframe=hour",
    contentType: "application/json",
    dataType: "json",
    success: displayAverageUsageByHour,
});
*/

jQuery.ajax({
    type: "GET",
    //url: "/api/TodaysUsageByHour",
    url: "/api/v1/usage/total?timeframe=today",
    contentType: "application/json",
    dataType: "json",
    success: displayTodaysUsage,
});

jQuery.ajax({
    type: "GET",
    url: "/api/v1/usage/total?timeframe=yesterday",
    contentType: "application/json",
    dataType: "json",
    success: function(data)
    {
      drawSolarVsUsedPie(data[0].GridKWH, data[0].SolarKWH, 'solarVsUsedPieYesterday');
    },
});
