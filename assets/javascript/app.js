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
        this.getIpAdressLink = "http://api.ipstack.com/check?access_key=a6a4e3b1ccb05e38dd1bb8fec6d55403";

        this.currentyear = new Date().getFullYear();
        this.db = firebaseDb;
        this.historicalData;
        this.state;
        this.latitude;
        this.longitude;

    }

    async LoadNewGraphs(input){
        if(input === undefined){

            await this.GetUserLocationByIPAddress();
            console.log(this.state)
            let data = await this.gethistoricalTempratureData(this.state);
            //console.log(data);
            let lastYearsData = this.getLastYearsDataFromHistorical(data);
            let OldData = this.getDataFromXyearsAgo(data, 20);
            let tavgComparisonData = this.createComparisonDataset(lastYearsData, OldData, "TAVG");
            this.renderTAVGComparison(tavgComparisonData, $("#chartContainer"));
            let PCPComparison = this.createComparisonDataset(lastYearsData, OldData, "PCP");
            this.renderPCPComparison(PCPComparison, $("#chartContainer1"));
            let oldMinMax = this.createMinMaxComparisonDataset(OldData);
            let CurrentMinMax = this.createMinMaxComparisonDataset(lastYearsData);
            this.renderMinMaxComparrisonData(oldMinMax, CurrentMinMax, "chartContainer2");
        
            let NationalAverage = await this.gethistoricalTempratureData("GLOBAL");
            this.renderNationalAverage(NationalAverage, $('#chartContainer3'));


        } else{
            let data = await this.gethistoricalTempratureData(input);
            //console.log(data);
            let lastYearsData = this.getLastYearsDataFromHistorical(data);
            let OldData = this.getDataFromXyearsAgo(data, 20);
            let tavgComparisonData = this.createComparisonDataset(lastYearsData, OldData, "TAVG");
            this.renderTAVGComparison(tavgComparisonData, $("#chartContainer"));
            let PCPComparison = this.createComparisonDataset(lastYearsData, OldData, "PCP");
            this.renderPCPComparison(PCPComparison, $("#chartContainer1"));
            let oldMinMax = this.createMinMaxComparisonDataset(OldData);
            let CurrentMinMax = this.createMinMaxComparisonDataset(lastYearsData);
            this.renderMinMaxComparrisonData(oldMinMax, CurrentMinMax, "chartContainer2");
        
            let NationalAverage = await this.gethistoricalTempratureData("GLOBAL");
            this.renderNationalAverage(NationalAverage, $('#chartContainer3'));

        }
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
        // console.log(position.coords.latitude);
        let lat = position.coords.latitude;
        this.latitude = lat;
        this.longitude = position.coordresponses.longitude;
        this.currentWeatherLink = `http://api.openweathermap.org/data/2.5/weather?lat=${this.latitude}&lon=${this.longitude}&units=imperial&APPID=8e024863714b99764415af5f004fb0e8`;
        this.getCurrentWeather();
    }

    async GetUserLocationByIPAddress() {
        const response = await $.ajax({
            url: this.getIpAdressLink,
            method: "GET"
        });
        console.log(response)
        this.state = response.region_code;
        this.zipCode = response.zip;
        this.latitude = response.latitude;
        this.longitude = response.longitude;
        this.getCurrentWeather();

    }

    async getCurrentWeather() {
        if (this.latitude === undefined || this.longitude === undefined) {
            this.getUserLocation();
        }
        this.currentWeatherLink = `http://api.openweathermap.org/data/2.5/weather?lat=${this.latitude}&lon=${this.longitude}&units=imperial&APPID=8e024863714b99764415af5f004fb0e8`;
        const response = await $.ajax({
            url: this.currentWeatherLink,
            method: "GET"

        });
        console.log(response);
        this.locationName = response.name;
        this.currentTemp = response.main.temp;
        this.minTemp = response.main.temp_min;
        this.maxTemp = response.main.temp_max;
        this.currentHumidity = response.main.humidity;
        this.currentPressure = response.main.pressure;
        this.currentDescription = response.weather[0].description;
        this.renderCurrentWeather();
    }

    renderCurrentWeather() {
        $('.current-weather').text(this.locationName);
        $('#average').text("Average Temprature °F: " + this.currentTemp);
        $('#maximum').text('Max Temprature °F: ' + this.maxTemp)
        $('#minimum').text('Min Temprature °F: ' + this.minTemp)
        $('#humidity').text('Humidity%: ' + this.currentHumidity)
        $('#pressure').text('current Pressure(hPa): ' + this.currentPressure);
    }

    gethistoricalTempratureData(state) {
        let that = this;
        let states = {
            CA: "04", CO: "05", AL: "01", AK: "50", AZ: "03", AR: "02", CT: '06', DE: "07", FL: "08", GE: "09", ID: "10",
            IL: "11", IN: "12", IO: "13", KA: "14", KE: "15", MA: "19", MD: "18", ME: "17", MI: "20", GLOBAL: "111"
        }
        return this.db.ref().once("value")
            .then(function (snapshot) {
                that.historicalData = snapshot.child(`USA${states[state]}`).val()
                return that.historicalData;
            });

    }

    //get data from the last 12 months and returns an ARRAY containing the object datapoints
    getLastYearsDataFromHistorical(data) {
        let startingIndex = data.length - 12;
        let Last12MonthsOfData = [];
        for (let i = startingIndex; i < data.length; i++) {
            Last12MonthsOfData.push(data[i]);
        }
        return Last12MonthsOfData;
    }


    //will throw a null error if you put a number too large 20 is max
    getDataFromXyearsAgo(data, x) {
        if (x > 20 || x < 0) {
            console.error("error X is either greater that 20, undifined, or less than 0")
        } else {
            let months = x * 12
            let startingIndex = data.length - months;
            let DataOver12Months = [];
            for (let i = startingIndex; i < startingIndex + 12; i++) {
                DataOver12Months.push(data[i]);
            }
            return DataOver12Months;
        }
    }

    //takes Data from current 12 months and compares it to past 12 months
    createComparisonDataset(Datacurrent, DataPast, label) {
        if (Datacurrent.length !== DataPast.length) {
            console.error("datasets are different lengths and cannot be built");
        }
        let output = []
        for (let i = 0; i < Datacurrent.length; i++) {
            if (DataPast[i]["YearMonth"].toString().slice(-2) !== Datacurrent[i]["YearMonth"].toString().slice(-2)) {
                console.error("The TWO datasets do not have matching dates")
            }
            let datapointmonth = parseInt(DataPast[i]["YearMonth"].toString().slice(-2));

            let datapoint = {
                x: i + 1, y: [DataPast[i][label], Datacurrent[i][label]], label: datapointmonth
            }
            output.push(datapoint);

        }
        return output;
    }


    //takes Data from current 12 months and compares it to past 12 months
    createMinMaxComparisonDataset(Dataset) {
        let output = []
        for (let i = 0; i < Dataset.length; i++) {
            let datapointmonth = parseInt(Dataset[i]["YearMonth"].toString().slice(-2));
            let datapoint = {
                x: i + 1, y: [Dataset[i]["TMIN"], Dataset[i]["TMAX"]], label: datapointmonth
            }
            output.push(datapoint);

        }
        return output;
    }

    toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }

    //function which is called after state specific historical data is recived from Firebase
    renderTAVGComparison(TAV, jquery) {
        var options = {
            exportEnabled: true,
            zoomEnabled: true,
            animationEnabled: true,
            title: {
                text: "Monthly Average Temperature Variation in your state"
            },
            axisX: {
                title: "Month Of the year",
                labelFormatter: function (e) {
                    return "x: " + e.value;
                }

            },
            axisY: {
                title: "Temperature (°F)",
                suffix: " °F"

            },
            data: [{
                // type: "rangeSplineArea",
                type: "rangeArea",
                indexLabel: "{y[#index]}°",

                dataPoints: TAV
            }]
        };
        jquery.CanvasJSChart(options);

    }

    renderPCPComparison(PCP, jquery) {
        console.log(JSON.stringify(PCP));
        var options = {
            exportEnabled: true,
            zoomEnabled: true,
            animationEnabled: true,
            title: {
                text: "Average percipitation this year vs 20 years ago"
            },
            axisX: {
                title: "Month Of the year",
                labelFormatter: function (e) {
                    return "x: " + e.value;
                }
            },
            axisY: {
                title: "Inches of rain",
                suffix: `"`,
                alueFormatString: "##.#",
                logarithmic: true
            },
            data: [{
                type: "rangeSplineArea",
                indexLabel: "{y[#index]}",

                dataPoints: PCP
            }]
        };
        jquery.CanvasJSChart(options);
    }

    renderMinMaxComparrisonData(Past, current, DisplayID) {

        var chart = new CanvasJS.Chart(DisplayID, {
            exportEnabled: true,
            animationEnabled: true,
            theme: "light2",
            title: {
                text: "Temperature Variation - last Year vs 20 Years Ago"
            },
            axisX: {
                title: "12 month Period"
            },
            axisY: {
                suffix: " °F"
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                horizontalAlign: "right",
                itemclick: this.toggleDataSeries
            },
            data: [{
                type: "rangeArea",
                showInLegend: true,
                name: "Past Data",
                markerSize: 0,
                dataPoints: Past
            },
            {
                type: "rangeArea",
                showInLegend: true,
                name: "Current Data",
                markerSize: 0,
                dataPoints: current
            }]
        });
        chart.render();

    }

    renderNationalAverage(Data, jquery) {
        let DPtoGraph = [];
        for (let i = Data.length - 1; i > Data.length - 300; i--) {
            let year = Data[i]['YearMonth'].toString().slice(0,3)
            let month = Data[i]['YearMonth'].toString().slice(-2);
            let datapoint = {
                x: new Date(year, 1, month), y: Data[i]['TAVG']
            }
            DPtoGraph.push(datapoint);

        }

        var options = {
            animationEnabled: true,
            title: {
                text: "Monthly Sales - 2017"
            },
            axisX: {
                
            },
            axisY: {
                title: "Sales (in USD)",
                prefix: "$",
                includeZero: true,
                logarithmic: true
            },
            data: [{
                yValueFormatString: "##.#",
                xValueFormatString: "MMMM",
                type: "spline",
                dataPoints: DPtoGraph
            }]
        };

        jquery.CanvasJSChart(options);
    }



    //class ends
}
//class ends
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

$(document).ready(function () {
    site.LoadNewGraphs("FL");



    $(document).on("click", "idname", function(){


    });

});
