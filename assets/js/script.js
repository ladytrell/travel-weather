var currentCityEL = document.querySelector("#currentCity");
var currentWeatherEL = document.querySelector("#currentWeather");

var cityFormEl = document.querySelector("#cityForm");
var cityInputEl = document.querySelector("#citySearch");

var appKey = '9069b962c7379862016fc6470e9f423e';

var defaultCity = true;

var cityObj = {
    'name': "Charleston",
    'lat': 32.7766,
    'lon': -79.9309
};
var weather = {
    'current': {},
    'daily': {}
};

var searchHistory = [];

// To Do Create and display alert Dom element for errors


//Remove the Dom element with the matching selector
var removeElement = function (selector) {
    $(selector).each(function(i, object){
        this.remove();
    })
};

// Save to local storage
var updateLocalStorage = function() {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
};

var addDomHistory = function (name) {
    var newCityEL = $("<button>")
    .addClass("searched col mb-3")
    .text(name)
    .attr("type", "button")
    .attr("id", name);
    $(newCityEL).appendTo($(".history"));
};

// Review previous history from local storage
var loadHistory = function () {
    //Gets scores from localStorage.
    searchHistory = localStorage.getItem("searchHistory");
  
    if (searchHistory === null) {
        searchHistory = [];
    } else {  
        //Converts searchHistory from the string format back into an array of objects.
        searchHistory = JSON.parse(searchHistory);

        for(var i = 0; i < searchHistory.length; i++)
        {
            addDomHistory(searchHistory[i].name);
        }
    }
};


// Save searched city to an array, if the city is not all ready record.  
// To Do:  Limit history to 10 cities. Push in new city and pop out the oldest search
var saveCity = function () {

    if(defaultCity){
        return;
    }
    if(searchHistory){
        for(var i =0; i < searchHistory.length; i++){
            if(cityObj.name === searchHistory[i].name)
                return;
        }
    }

    searchHistory.push(cityObj);
    addDomHistory(cityObj.name);
    updateLocalStorage();
};

// Display UV index with a highlight color to indicate whether the conditions are favorable, moderate, or severe
var uviSeverityCheck = function (parentEL) {
    var uvi = weather.current.uvi;
    var severity
    if (uvi <= 2){
        severity= "green";
    } else if ( uvi <= 5){
        severity= "yellow";
    } else if ( uvi <= 7){
        severity= "orange";
    } else {
        severity= "red";
    }
    var uviEL = $("<span>")
    .addClass(severity)
    .text(uvi);
    $(uviEL).appendTo($(parentEL));
}

// Display current weather
var currentDisplay = function () {
    var date = moment(weather.current.dt, "X").format("l");
    currentCityEL.textContent = cityObj.name + " " + date;
    var classes = "currentWeather";

    var selector = "img.currentWeather";
    var icon = weather.current.weather[0].icon;
    var icon = "http://openweathermap.org/img/wn/" + icon + "@2x.png"
    //http://openweathermap.org/img/wn/10d@2x.png
    $(selector).attr("src", icon);

    var text = [
        "Temp:  " + weather.current.temp + "°F",
        "Wind:  " + weather.current.wind_speed + " MPH",
        "Humidity:  " + weather.current.humidity + "%",
        "UV Index:  "
        //"UV Index:  " + weather.current.uvi
    ];

    for (var i = 0; i < 4; i++){
        var tempEl = document.createElement("li");
        tempEl.classList = classes;
        tempEl.textContent = text[i];
        if(text[i].trim() === "UV Index:") {            
            uviSeverityCheck(tempEl); 
        }
        currentWeatherEL.appendChild(tempEl);
    }    
};

// Display 5 Day forecast
var dailyDisplay = function () {
     
    $(".card").each(function(i, object) {
        var day = i + 1;
        var selector = "h4[data-day=" + day + "]";
        
        var date = moment(weather.daily[i].dt, "X").format("l");
        $(selector).text(date);   
        
        selector = "img[data-day=" + day + "]";
        var icon = weather.daily[i].weather[0].icon;
        var iconLink = "http://openweathermap.org/img/wn/" + icon + "@2x.png"
        //http://openweathermap.org/img/wn/10d@2x.png
        $(selector).attr("src", iconLink);

        selector = "ul[data-day=" + day + "]";
        var dayListEL = $(selector);
        var classes = "dailyWeather";
        var text = [
            "Temp:  " + weather.daily[i].temp.day + "°F",
            "Wind:  " + weather.daily[i].wind_speed + " MPH",
            "Humidity:  " + weather.daily[i].humidity + "%"
        ];

        for (var k = 0; k < text.length; k++){
            var tempEl = document.createElement("li");
            tempEl.classList = classes;
            tempEl.textContent = text[k];
            $(tempEl).appendTo(dayListEL);
        }
    });
}

var displayWeather = function () {    
    currentDisplay();
    dailyDisplay();
};

//  Receive City weather details
//  Current date, icon representation of weather conditions the temperature, the humidity, the wind speed, and the UV index
// API Call 
// https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&unts={measurement}&appid={API key}

var getWeather = function () {
    // https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&units=imperial&appid={API key}
    var uri = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + cityObj.lat + '&lon=' + cityObj.lon + '&exclude=minutely,hourly,alerts&units=imperial&appid=' + appKey;

    fetch(uri).then(function(response) {
        if (response.ok) {
          response.json().then(function(data) {
              // assign current and daily forecasts
              console.log(data);
              weather.current = data.current;
              weather.current.temp = data.current.temp;
              weather.daily = data.daily;
              saveCity();
              displayWeather();
          });
        } else {
            // TO DO write message to City current container, not an alert
            alert('Error: Unable to retrieve forecast');
            return;
        }
      })
      .catch(function(error) {
        // TO DO write message to City current container, not an alert
        alert("Unable to retrieve forecast");
            return;
      });
}


// Collect User defined City from form, convert city to coordinates
var getCityCoordinates = function (event) {
    event.preventDefault();

    removeElement("li");

    var location = document.querySelector("input[name='citySearch']").value;
    // check if input values are empty strings
    if (!location) {
        //To Do:  add element "Enter City, State"
       // alert("Enter City");
        return;
    }

    location = location.split(",");
    var cityName = location[0].trim();
    var state = location[1].trim();

    cityObj.name = cityName;

    // Get City Coordinates
    //http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
    //var uri = "http://api.openweathermap.org/geo/1.0/direct?q=" + "Durham,NC" + ",USA&limit=1&appid=" + appKey;
    var uri = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "," + state + ",USA&limit=1&appid=" + appKey;
    
    fetch(uri).then(function(response) {
        if (response.ok) {
          response.json().then(function(data) {
              // assign coordinates
              cityObj.lat = data[0].lat;
              cityObj.lon = data[0].lon;    
              defaultCity = false;
              getWeather();
          });
        }else {
            // TO DO write message to City current container, not an alert
            alert('Error: Cannot find City');
            return;
        }
      })
      .catch(function(error) {
        // TO DO write message to City current container, not an alert
        alert("Unable to retrieve location");
        return;
      });
};


loadHistory ();

// Run with default city details
getWeather();

// A city  in the search history is clicked display all weather details again.
$(".history").on("click", "button", function() {
    //search for city id
    var name = this.getAttribute("id");
    console.log(name);

    // Get saved coordinates to use for weather collection
    for(var i =0; i < searchHistory.length; i++){
        if(name === searchHistory[i].name){
            cityObj = searchHistory[i];
            console.log("history city: ", cityObj.name);
        }
    }
    removeElement("li");
    getWeather();
});

cityFormEl.addEventListener("submit", getCityCoordinates);