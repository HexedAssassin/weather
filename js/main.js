// Setting up the HTML Elements that I will be putting data into
let holder = document.querySelector(".next-8-days__container");
let container = document.querySelector(".next-8-days__row");
let input = document.querySelector(".search-input");
let msg = document.querySelector(".errMsg");
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

// Hourly weather data
let hourlyHolder = document.querySelector(".weather-by-hour__container");
let hourlyHeading = document.querySelector(".hourlyHeading");

let highlightTimeout;

// API ID - Used to call a web service and request information to display. Very unsafe way of storing. Limited requests of 1,000 per day, no charge.
const API = 'LKZP3X7X38ZPFELNCEP27BLZL';

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
	 	eightDays(data);
		hourlyData(data);
	})
    .catch(() => { //if no city is found
      msg.textContent = "Please search for a valid city";
	  msg.classList.add("shake");

	  setTimeout(() => {
        msg.classList.remove("shake");
      }, 300);

      setTimeout(() => {
        msg.textContent = "";
      }, 3000);
	  
    });
	//clears the content so the next input is ready
  input.value = "";
  input.focus();
});

function todayData(data) { // Touch this up, combine this with hourly data
	console.log("Logging VisualCrossing API data:");
	console.log(data);
	var utcSeconds = data.currentConditions.datetimeEpoch;
	var date = new Date(0);
	date.setUTCSeconds(utcSeconds);
	time.textContent = date;
	loc.textContent = data.resolvedAddress;
	temp.textContent = Math.round(data.currentConditions.temp) + "°F";
	wind.textContent = Math.round(data.currentConditions.windspeed) + " mph " + getCardinalDirection(data.currentConditions.winddir)
	condition.textContent = data.currentConditions.conditions
	high.textContent = Math.round(data.days[0].tempmax) + "°F";
	low.textContent = Math.round(data.days[0].tempmin) + "°F";
	precipitation.textContent = Math.round(data.days[0].precipprob) + "%";
	sunrise.textContent = data.currentConditions.sunrise.slice(0,5);
	sunset.textContent = data.currentConditions.sunset.slice(0,5);
	icon.innerHTML =  `<img src="https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/3rd%20Set%20-%20Color/${data.currentConditions.icon}.png"/>`;
}

function eightDays(data) {
	holder.textContent = '';
	for (let i = 0; i < 8; i++){
		let date = new Date(data.days[i].datetime)
		date.setDate(date.getDate() + 1)
		let eightData = {
			data: data,
			id: i,
			date: date,
			datetime: data.days[i].datetime,
			high: data.days[i].tempmax,
			low: data.days[i].tempmin,
			icon: data.days[i].icon,
			precipprob: data.days[i].precipprob,
			wind: data.days[i].windspeed,
			direction: getCardinalDirection(data.days[i].winddir)
		}
		createEightDaysElement(eightData);
	}
}

function hourlyData(data, i = 0) {
	var dayWeather = data.days[i];
	hourlyHeading.textContent = `Hourly Weather for: ${dayWeather.datetime.slice(5,7) + "/" + dayWeather.datetime.slice(8,10)}`;
	if (hourlyHolder.textContent != null){
		hourlyHolder.textContent = '';
	}
	var currentEpoch = data.currentConditions.datetimeEpoch;
	var nums = [];
	for (let j = 0; j < 24; j++) {
		let hour = parseInt(dayWeather.hours[j].datetime.slice(0,2));
		let period = hour >= 12 ? 'PM' : 'AM';
		hour = hour % 12 || 12;

		let hourData = {
			hour: hour,
			period: period,
			icon: dayWeather.hours[j].icon,
			temp: dayWeather.hours[j].temp,
			precipprob: dayWeather.hours[j].precipprob
		}
		createHourlyElement(hourData);
		var compare = currentEpoch - dayWeather.hours[j].datetimeEpoch // Possibly move this around?
		nums.push(compare);
	}
	if (i === 0){
		var index = findClosestNumber(nums);
		console.log(index);
		highlightItem(index);
		scrollToItem(index);
	}
}

function createHourlyElement(hourData){
	 let itemContainer = document.createElement('div');
	 itemContainer.className = 'weather-by-hour__item';

	 let hourlyTime = document.createElement('div');
	 hourlyTime.className = 'weather-by-hour__hour hourlyTime';
	 hourlyTime.innerHTML = hourData.hour + " " + hourData.period;

	 let hourlyIcon = document.createElement('div');
	 hourlyIcon.className = 'hourlyIcon';
	 hourlyIcon.innerHTML = `<img src="https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/3rd%20Set%20-%20Color/${hourData.icon}.png"/>`;

	 let hourlyTemp = document.createElement('div');
	 hourlyTemp.className = 'hourlyTemp';
	 hourlyTemp.innerHTML = Math.round(hourData.temp) + "°F";

	 let hourlyPrecip = document.createElement('div');
	 hourlyPrecip.className = 'hourlyPrecip';
	 hourlyPrecip.innerHTML = "💧 " + hourData.precipprob + "%";

	 // Append the elements to the container
	 itemContainer.appendChild(hourlyTime);
	 itemContainer.appendChild(hourlyIcon);
	 itemContainer.appendChild(hourlyTemp);
	 itemContainer.appendChild(hourlyPrecip);

	 // Append the item container to the holder
	 hourlyHolder.appendChild(itemContainer);
}

function createEightDaysElement(eightData){

	let itemContainer = document.createElement('div');
	itemContainer.className = 'next-8-days__row';
	itemContainer.style = 'cursor: pointer;'

	let id = document.createElement('input');
	id.className = 'dayValue';
	id.type = 'hidden';
	id.value = eightData.id;

	let date = document.createElement("div");
	date.className = 'next-8-days__date';
	date.innerHTML = eightData.date.toLocaleDateString('en-us',{ weekday: 'short'}) + `<div class="next-8-days__label date">${eightData.datetime.slice(5,7) + "/" + eightData.datetime.slice(8,10)}</div>`;

	let icon = document.createElement("div");
	icon.className = 'next-8-days__icon';
	icon.innerHTML = `<img src="https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/3rd%20Set%20-%20Color/${eightData.icon}.png"/>`;

	let high = document.createElement("div");
	high.className = 'next-8-days__high';
	high.innerHTML = Math.round(eightData.high) + "°F"  + `<div class="next-8-days__label">High</div>`;

	let low = document.createElement("div");
	low.className = 'next-8-days__low';
	low.innerHTML = Math.round(eightData.low) + "°F" + `<div class="next-8-days__label">Low</div>`;

	let precipProb = document.createElement("div");
	precipProb.className = 'next-8-days__precipitation';
	precipProb.innerHTML = Math.round(eightData.precipprob) +`&percnt; <div class="next-8-days__label">Precipitation</div>`;

	let wind = document.createElement("div");
	wind.className = 'next-8-days__wind';
	wind.innerHTML = Math.round(eightData.wind) + " mph " + eightData.direction + `<div class="next-8-days__label">Wind</div>`;


	itemContainer.appendChild(id);
	itemContainer.appendChild(date);
	itemContainer.appendChild(icon);
	itemContainer.appendChild(high);
	itemContainer.appendChild(low);
	itemContainer.appendChild(precipProb);
	itemContainer.appendChild(wind);

	itemContainer.addEventListener("click", function(event){
		let path = event.target;
		if (path.className !== "next-8-days__row"){
			while (path.className != "next-8-days__row") {
				path = path.parentElement;
			}
		}
		hourlyData(eightData.data,parseInt(path.children[0].value));
		setTimeout(() =>{ // Still doesn't work when selecting 0 index item.
			hourlyHolder.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
		},0);
	}, false);

	holder.appendChild(itemContainer);
}

function userLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success, error);
	}
	else{
		window.alert("Your browser doesn't support geolocations. Please feel free to still use the search field for weather information.")
	}
}

function success(position) {
	fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${position.coords.latitude}%2C${position.coords.longitude}/next7days?key=${API}`) //uses latitude and longitude
        .then((response) => {
          return response.json();
        })
        .then((data) => {
			todayData(data);
          	eightDays(data);
			hourlyData(data);
			getCityName(data.latitude, data.longitude);
        });
}

function error() {
	window.alert("You may have your location disabled. You can enable it or feel free to use the search city field.");
}

function scrollToItem(index){
	const items = document.querySelectorAll('.weather-by-hour__item');
	if (index >= 0 && index < items.length){
		console.log(items[index]);
		items[index].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
	}
}

function findClosestNumber(nums) {
	var closestNumber = 0;
	var minDistance = Number.MAX_SAFE_INTEGER;
	var index = 0
	var desiredIndex = 0;
	for (var number of nums) {
		var absValue = Math.abs(number);
		if (absValue < minDistance || (absValue == minDistance && number > closestNumber)) {
			closestNumber = number;
			minDistance = absValue;
			desiredIndex = index;
		}
		index++;
	}
	return desiredIndex;
}

function highlightItem(index) {
	const items = document.querySelectorAll('.weather-by-hour__item');
	if (index >= 0 && index < items.length) {
	  items[index].classList.add('highlighted');
	  if (highlightTimeout) {
		clearTimeout(highlightTimeout);
	  }
	  highlightTimeout = setTimeout(() => {
		items[index].classList.remove('highlighted');
	  }, 1500);
	}
}

  function getCardinalDirection(direction){
	direction = direction % 360
	if (direction < 0) {
		direction += 360;
	}

	let index = Math.floor((direction + DEGREES / 2) / DEGREES)
	return CARDINAL[index];
}

// Google Geocoding

function getCityName(lat,long){
	const geocoder = new google.maps.Geocoder();
	const latlng = { lat: parseFloat(lat), lng: parseFloat(long) };

	geocoder.geocode({location: latlng}, (results, status) => {
		if (status === 'OK') {
            if (results[0]) {
                console.log("Logging Google API data:");
                console.log(results);

                let location = null;
                for (let component of results[0].address_components) {
                    if (component.types.includes('locality')) {
                        location = component.long_name;
                    } else if (component.types.includes('administrative_area_level_1')) {
                        location += ", " + component.short_name;
                    } else if (component.types.includes('country')) {
                        location += ", " + component.long_name;
                    }
                }
                if (location) {
                    loc.textContent = location;
                }
            } else {
                console.log('No results found');
            }
        } else {
            console.log('Geocoder failed due to: ' + status);
        }
	});
}