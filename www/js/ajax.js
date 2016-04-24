function updateCurrentTemp()
{
  jQuery.ajax({
    type: "GET",
    url: "/api/v1/temperature/today",
    contentType: "application/json",
    dataType: "json",
    success: function(data)
    {
      $("#currentTemperature").empty();
      $("#todayLowTemperature").empty();
      $("#todayHighTemperature").empty();
      var currentF = Math.round(data[0].CurrentTemperature * (9/5) + 32)
      var lowF = Math.round(data[0].LowTemperature * (9/5) + 32)
      var highF = Math.round(data[0].HighTemperature * (9/5) + 32)
      $("#currentTemperature").append(data[0].CurrentTemperature + "C (" + currentF + "F)");
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


jQuery.ajax({
    type: "GET",
    url: "/api/v1/temperature/yesterday",
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
    url: "/api/TodaysUsageByHour",
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
