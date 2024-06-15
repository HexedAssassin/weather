// Setting up the HTML Elements that I will be putting data into
let holder = document.querySelector(".next-7-days__container");
let container = document.querySelector(".next-7-days__row");
let input = document.querySelector(".inp");
let msg = document.querySelector(".msg");
let form = document.querySelector(".citySearch");

let time = document.querySelector(".time");
let loc = document.querySelector(".location");

// Current day's weather information
let temp = document.querySelector(".currentTemp");
let condition = document.querySelector(".currentCondition");
let icon = document.querySelector(".currentIcon");
let high = document.querySelector(".currentHigh");
let low = document.querySelector(".currentLow");
let wind = document.querySelector(".currentWind");
let precipitation = document.querySelector(".currentprecipitation");
let sunrise = document.querySelector(".currentSunrise");
let sunset = document.querySelector(".currentSunset");
let dayClick = document.querySelector(".location-and-date");

// Hourly weather data (only for current day at the moment)
let hourlyHolder = document.querySelector(".weather-by-hour__container");
let hourlyContainer = document.querySelector(".weather-by-hour__item");
let hourlyIcon = document.querySelector(".hourlyIcon");
let hourlyTime = document.querySelector(".hourlyTime");
let hourlyTemp = document.querySelector(".hourlyTemp");
let dayValue = document.querySelector(".dayValue");
let hourlyHeading = document.querySelector(".hourlyHeading");

// Daily weather data for however many days I display
let dateDays = document.querySelector(".date");
let weekDays = document.querySelector(".week");
let iconDays = document.querySelector(".icon");
let highDays = document.querySelector(".high");
let lowDays = document.querySelector(".low");
let windDays = document.querySelector(".wind");
let precipitationDays = document.querySelector(".precipitation");

// API ID - Used to call a web service and request information to display. Very unsafe way of storing. Limited requests of 1,000 per day, no charge.
const API = "LKZP3X7X38ZPFELNCEP27BLZL";

// Declaring constants
const DEGREES = 22.5;
const CARDINAL = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];

// When the application loads, everything in "load" is called.
window.addEventListener("load", () => {
      userLocation();
});

// Called when you submit the text field to search for a city.
form.addEventListener("submit", e => {
// Prevents the default action from occuring, which would be submitting the form.
  e.preventDefault();
  let inputVal = input.value; //grabs input from the html page with the class inp
   fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${inputVal}/next7days?key=${API}`)
   .then((response) => {
	 return response.json();
   })
   .then((data) => {
		todayData(data);
	 	sevenDays(data);
		hourlyData(data,0);
	})
    .catch(() => { //if no city is found
      msg.textContent = "Please search for a valid city";
    });
	//clears the content so the next input is ready
  msg.textContent = "";
  input.value = "";
  input.focus();
});

function todayData(data) {
	console.log(data);
	var utcSeconds = data.currentConditions.datetimeEpoch;
	var date = new Date(0);
	date.setUTCSeconds(utcSeconds);
	time.textContent = date;
	loc.textContent = data.resolvedAddress
	temp.textContent = Math.round(data.currentConditions.temp) + "°F";
	let direction = data.currentConditions.winddir;
	for ( let i = CARDINAL.length; i >= 0; i-- ) { 
		if ( direction < DEGREES/2 + DEGREES * i ) {
		cardDirection = CARDINAL[i];
		}
	}
	wind.textContent = Math.round(data.currentConditions.windspeed) + " mph " + cardDirection
	condition.textContent = data.currentConditions.conditions
	high.textContent = Math.round(data.days[0].tempmax) + "°F";
	low.textContent = Math.round(data.days[0].tempmin) + "°F";
	precipitation.textContent = Math.round(data.days[0].precipprob) + "%";
	sunrise.textContent = data.currentConditions.sunrise.slice(0,5);
	sunset.textContent = data.currentConditions.sunset.slice(0,5);
	icon.innerHTML =  `<img src="https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/3rd%20Set%20-%20Color/${data.currentConditions.icon}.png"/>`;
	dayClick.addEventListener("click", function(event){
		let path = event.target;
		if (path.className !== "location-and-date"){
			while (path.className != "location-and-date") {
				path = path.parentElement;
			}
		}
		let date = new Date(data.days[0].datetime)
		date.setDate(date.getDate() + 1)
		hourlyHeading.textContent = `Hourly Weather for: ${data.days[0].datetime.slice(5,7) + "/" + data.days[0].datetime.slice(8,10)}`;
		hourlyData(data,0);
	}, false);
}

function sevenDays(data) {
	holder.textContent = '';
	let x = 0
	 let i = 1;
	 while (i < 8) {
		dayValue.value = i
		let direction = data.days[i].winddir;
		for ( let i = CARDINAL.length; i >= 0; i-- ) {
			if ( direction < DEGREES/2 + DEGREES * i ) {
			cardDirection = CARDINAL[i];
			}
		}
		let date = new Date(data.days[i].datetime)
		date.setDate(date.getDate() + 1)
		weekDays.innerHTML = date.toLocaleDateString('en-us',{ weekday: 'short'}) + `<div class="next-7-days__label date">${data.days[i].datetime.slice(5,7) + "/" + data.days[i].datetime.slice(8,10)}</div>`;
		windDays.innerHTML = Math.round(data.days[i].windspeed) + " mph " + cardDirection + `<div class="next-7-days__label">Wind</div>`;
		highDays.innerHTML = Math.round(data.days[i].tempmax) + "°F"  + `<div class="next-7-days__label">High</div>`;
		lowDays.innerHTML = Math.round(data.days[i].tempmin) + "°F" + `<div class="next-7-days__label">Low</div>`;
		precipitationDays.innerHTML = Math.round(data.days[i].precipprob) +`&percnt; <div class="next-7-days__label">Precipitation</div>`;
		iconDays.innerHTML =  `<img src="https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/3rd%20Set%20-%20Color/${data.days[i].icon}.png"/>`;
		let clone = container.cloneNode(true);
		clone.addEventListener("click", function(event){
			let path = event.target;
			if (path.className !== "next-7-days__row"){
				while (path.className != "next-7-days__row") {
					path = path.parentElement;
				}
			}
			hourlyHeading.textContent = `Hourly Weather for: ${path.children[1].children[0].innerText}`;
			hourlyData(data,path.children[0].value);
		}, false);
	   holder.appendChild(clone);
	   i++;
	   }	
}

function hourlyData(data, i) {
	j = 3;
	var dayWeather = data.days[i];
	hourlyHolder.textContent = '';
	while (j < 24) {
		let d = parseInt(dayWeather.hours[j].datetime.slice(0,2))
		if (d >= 12) {
			if (d == 12){
				d = d + "PM"
			}
			else{
				d = (d - 12) + "PM"
			}
		}
		else{
			d += "AM"
		}
		hourlyTime.innerHTML = d
		hourlyIcon.innerHTML = `<img src="https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/3rd%20Set%20-%20Color/${dayWeather.hours[j].icon}.png"/>`;
		hourlyTemp.innerHTML = Math.round(dayWeather.hours[j].temp) + "°F"
		j += 3;
		let clone = hourlyContainer.cloneNode(true);
		hourlyHolder.appendChild(clone);
	}
}

function userLocation() {
	if (!navigator.geolocation) {
		window.alert("Your browser doesn't support geolocations. Please feel free to still use the search city field for weather information.")
	}
	else{
		navigator.geolocation.getCurrentPosition(success, error);
	}
}

function success(position) {
	fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${position.coords.latitude}%2C${position.coords.longitude}/next7days?key=${API}`) //uses latitude and longitude
        .then((response) => {
          return response.json();
        })
        .then((data) => {
			todayData(data);
          	sevenDays(data);
			hourlyData(data,0);
        });
}

function error() {
	window.alert("You may have your location disabled. You can enable it or feel free to use the search city field.");
}