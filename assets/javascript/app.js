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
        }).then(
            function (response) {
                //let results = response.results;
                console.log(response);
                that.locationName = response.name;
                that.currentTemp = response.main.temp;
                that.minTemp = response.main.temp_min;
                that.maxTemp = response.main.temp_max;
                that.currentHumidity = response.main.humidity;
                that.currentPressure = response.main.pressure;
                that.currentDescription = response.weather[0].description;
                that.renderCurrentWeather(response)
                $('.card-header').text(that.locationName);
                $('#average').text(" : " + that.currentTemp);
                $('#maximum').text(' : ' + that.maxTemp)
                $('#minimum').text(' : ' + that.minTemp)
                $('#humidity').text (' : ' + that.currentHumidity)
                $('#pressure').text(' : ' + that.currentPressure);
            }

        );




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
   getLastYearsDataFromHistorical(data){
        let startingIndex = data.length-12;
        let Last12MonthsOfData = [];
        for(let i = startingIndex; i < data.length; i++){
            Last12MonthsOfData.push(data[i]);
        }
        return Last12MonthsOfData;
    }


//will throw a null error if you put a number too large 20 is max
    getDataFromXyearsAgo(data, x){
        if(x>20|| x<0){
            console.error("error X is either greater that 20, undifined, or less than 0")
        }else{
        let months = x*12
        let startingIndex = data.length-months;
        let DataOver12Months = [];
        for(let i = startingIndex; i < startingIndex+12; i++){
            DataOver12Months.push(data[i]);
        }
        return DataOver12Months;
    }
    }

    //takes Data from current 12 months and compares it to past 12 months
    createComparisonDataset(Datacurrent, DataPast, label){
        if(Datacurrent.length !== DataPast.length){
            console.error("datasets are different lengths and cannot be built");
        }
        let output = []
        for(let i = 0; i<Datacurrent.length;i++){
            if(DataPast[i]["YearMonth"].toString().slice(-2) !== Datacurrent[i]["YearMonth"].toString().slice(-2)){
                console.error("The TWO datasets do not have matching dates")
            }
            let datapointmonth = parseInt(DataPast[i]["YearMonth"].toString().slice(-2));

            let datapoint = { x: i+1, y:[DataPast[i][label], Datacurrent[i][label]], label:datapointmonth
            }
            output.push(datapoint);

        }
        return output;
    }


    //function which is called after state specific historical data is recived from Firebase
    renderTAVGComparison(TAV, jquery){
        var options = {
            exportEnabled: true,
            animationEnabled: true,
            title:{
                text: "Monthly Average Temperature Variation in your state"
            },
            axisX: {
                title: "Month Of the year",
                labelFormatter: function(e){
                    return  "x: " + e.value;
                }

            },
            axisY: {
                title: "Temperature (°F)",
                suffix: " °F"

            },
            data: [{
                type: "rangeSplineArea",
                indexLabel: "{y[#index]}°",

                dataPoints: TAV
            }]
        };
        jquery.CanvasJSChart(options);

    }

    renderPCPComparison(PCP, jquery){
      var options = {
          exportEnabled: true,
          animationEnabled: true,
          title:{
              text: "Average percipitation this year vs 20 years ago"
          },
          axisX: {
              title: "Month Of the year",
              labelFormatter: function(e){
                  return  "x: " + e.value;
              }
          },
          axisY: {
              title: "Inches of rain",
              suffix: `"`,
              logarithmic:  true
          },
          data: [{
              type: "rangeSplineArea",
              indexLabel: "{y[#index]}°",

              dataPoints: PCP
          }]
      };
      jquery.CanvasJSChart(options);
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


    const data = await site.gethistoricalTempratureData("AL",0);
    console.log(data);
    const lastYearsData = site.getLastYearsDataFromHistorical(data);
    const OldData = site.getDataFromXyearsAgo(data, 20);
    let tavgComparisonData = site.createComparisonDataset(lastYearsData, OldData, "TAVG");
    site.renderTAVGComparison(tavgComparisonData, $("#chartContainer"));
    let PCPComparison = site.createComparisonDataset(lastYearsData, OldData, "PCP");
    console.log(PCPComparison);
    site.renderPCPComparison(PCPComparison, $("#chartContainer1"));




});
