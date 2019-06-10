// going to start with the open weather API weather API 

//we also need to get users current location using an api

//someone enters the website...
//grab the users current location 

class UserSpecificClimateData {
    constructor(){
        this.latitude = 0;
        this.longitude = 0;
        this.currentWeatherLink = '';
        this.userLocation = this.getUserLocation();
        
    }

    getUserLocation() {
        let that = this;
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(that.setPosition);
        } else {
          console.error(" failed to load location data...");
        }
      }

    setPosition = (position) => {
        console.log(position.coords.latitude);
        let lat = position.coords.latitude;
        this.latitude = lat;
        this.longitude = position.coords.longitude;
        this.currentWeatherLink = `http://api.openweathermap.org/data/2.5/weather?lat=${this.latitude}&lon=${this.longitude}&APPID=8e024863714b99764415af5f004fb0e8`; 
        this.getCurrentWeather();
    }

    getCurrentWeather(){
        let that = this;
        $.ajax({
            url: this.currentWeatherLink,
            method: "GET"
        }).then(function (response) {
            //let results = response.results;
            console.log(response);
            that.locationName = response.name;
            that.currentTemp = response.main.temp;
            that.currentHumidity = response.main.humidity;
            that.currentPressure = response.main.pressure;
            that.currentDescription = response.weather[0].description;
            
        });

    }

    gethistoricalTempratureData(){


    }

    getHistoricalCO2Data(){


    }

    getcurrentAirQuality(){



    }




}
var site = new UserSpecificClimateData();

$(document).ready(function() {

console.log(site);


});