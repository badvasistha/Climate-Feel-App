// going to start with the open weather API weather API 

//we also need to get users current location using an api

//someone enters the website...
//grab the users current location 

class UserSpecificClimateData {
    constructor(firebaseDb) {
        this.latitude = 0;
        this.longitude = 0;
        this.currentWeatherLink = ''; //https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?datatypeid=TOBS
        this.historicalWeatherLink = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOM&stationid=GHCND:USC00010008&units=standard&startdate=2010-05-01&enddate=2010-05-31'
        this.userLocation = this.getUserLocation();
        this.currentyear = new Date().getFullYear();
        this.db = firebaseDb;
        this.historicalData;

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

    getCurrentWeather() {
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

    // gethistoricalTempratureData( state, monthsBack) {
    //     let that = this;
    //     let states = {CA:"04",CO:"05",AL:"01",AK:"50",AZ:"02"}
    //     this.db.ref().once("value")
    //     .then(function(snapshot) {
    //          that.historicalData = snapshot.child(`USA${states[state]}`).val()
    //         console.log(that.historicalData);
    //         //need to write function which uses histroical Data here
    //         //get the past 12 months of data with this function
    //        console.log(that.getLastYearsDataFromHistorical());
    //        console.log(that.getDataFromXyearsAgo(20));
    //     });
       

    // }
//get data from the last 12 months and returns an ARRAY containing the object datapoints
   getLastYearsDataFromHistorical(){
        let startingIndex = this.historicalData.length-12;
        let Last12MonthsOfData = [];
        for(let i = startingIndex; i < this.historicalData.length; i++){
            Last12MonthsOfData.push(this.historicalData[i]);
        }
        return Last12MonthsOfData;
    }
//will throw a null error if you put a number too large 20 is max
    getDataFromXyearsAgo(x){
        if(x>20||x === undifined|| x<0){
            console.error("error X is either greater that 20, undifined, or less than 0")
        }else{
        let months = x*12
        let startingIndex = this.historicalData.length-months;
        let DataOver12Months = [];
        for(let i = startingIndex; i < startingIndex+12; i++){
            DataOver12Months.push(this.historicalData[i]);
        }
        return DataOver12Months;
    }
    }

    //takes Data from current 12 months and compares it to past 12 months
    createTempratureComparisonDataset(Datacurrent, DataPast){
        Datacurrent.forEach(element => {
             element['TAVG']
        });



    }

    //function which is called after state specific historical data is recived from Firebase
    renderHistoricalData(){
        

    }

    getHistoricalCO2Data() {


    }

    getcurrentAirQuality() {



    }

    




}
//firebase variable


// firebase.initializeApp(firebaseConfig);
// var database = firebase.database();

var site = new UserSpecificClimateData();

$(document).ready(function () {
    // site.gethistoricalTempratureData();
    // var test = site.gethistoricalTempratureData("CA",0);
    



});