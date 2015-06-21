import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';

var client = new HttpClient()
  .configure(x => {
    x.withBaseUrl('http://solarapi.moocow.home');
});

@inject(client)
export class Overview{
  //static inject() { return [HttpClient]; }

  heading = 'Pretty Graphs';
  hourlyUsageData = [];
  hourlyUsageStatusCode = null;

  constructor(http){
    this.http = http;
  }

  activate()
  {
    return this.http.get('v1/usage/average?timeframe=hour').then
      (response =>
        {
          this.hourlyUsageData = response.content;
          this.hourlyUsageStatusCode = response.statusCode;
        }
      );
    //var request = client.get('v1/usage/average?timeframe=hour');


    //this.hourlyUsageStatusCode = request;
    /*
    this.hourlyUsageData = [
      {
        "Hour": "0",
        "UsedKWH": "0.032",
        "GridKWH": "0.032",
        "SolarKWH": "-0.000",
        "OutsideTemp": "25.23"
      }
    ];
    */
  }

  //hourlyUsageData = client.get('v1/usage/average?timeframe=hour');

/*
  get fullName(){
    return `${this.firstName} ${this.lastName}`;
  }

  welcome(){
    alert(`Welcome, ${this.fullName}!`);
  }
  */

//  var apiPath = "http://solarapi.moocow.home";

  //hourlyUsageData = this.http.jsonp("http://solarapi.moocow.home/v1/usage/average?timeframe=hour");
}
