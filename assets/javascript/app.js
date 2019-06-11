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
            that.renderCurrentWeather(response)
        });

    }

    renderCurrentWeather(data){

    }

    gethistoricalTempratureData( state, monthsBack) {
        let that = this;
        let states = {CA:"04",CO:"05",AL:"01",AK:"50",AZ:"03",AR:"02",CT:'06',DE:"07",FL:"08",GE:"09",ID:"10",
         IL:"11",IN:"12", IO:"13",KA:"14", KE:"15",MA:"19",MD:"18",ME:"17",MI:"20"}
        return this.db.ref().once("value")
        .then(function(snapshot) {
            that.historicalData = snapshot.child(`USA${states[state]}`).val()
           return that.historicalData;
        });
           
    }

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


 // dataPoints: [
    //        { x: new Date(2017, 10, 1), y: [4, 14] },
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
var firebaseConfig = {
    apiKey: "AIzaSyAJe06nmla8caiFGdvD9f3MhHGZVdvSwD0",
    authDomain: "climate-feel.firebaseapp.com",
    databaseURL: "https://climate-feel.firebaseio.com",
    projectId: "climate-feel",
    storageBucket: "",
    messagingSenderId: "76697086015",
    appId: "1:76697086015:web:806c5d978abc1e0b"
  };

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

var site = new UserSpecificClimateData(database);

$(document).ready(async function () {
    // site.gethistoricalTempratureData();
    // site.gethistoricalTempratureData("CA",0).then(data => {
    //     console.log(data);

    // });

    const data = await site.gethistoricalTempratureData("CA",0);
    console.log(data);





});