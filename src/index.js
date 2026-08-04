import "./styles.css";

// Contains all the data for the place that's going to be displayed
function Weather (city, temp, feelsLike, tempMax, tempMin, conditions) {
  this.city = city;
  this.temp = temp;
  this.feelsLike = feelsLike;
  this.tempMax = tempMax;
  this.tempMin = tempMin;
  this.conditions = conditions;
}

// Fetches data from the weather API and returns a new weather object
async function getWeather (string, fahrenheit) {
  let link;
  if (fahrenheit) {
    link = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${string}?unitGroup=us&include=current&key=ESWZSZ35KFPLFB8GACWD67XPN&contentType=json`;
  } else {
    link = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${string}?unitGroup=metric&include=current&key=ESWZSZ35KFPLFB8GACWD67XPN&contentType=json`;
  }
  const response = await fetch(link);
  const data = await response.json();
  return new Weather(formatCity(data.resolvedAddress), data.currentConditions.temp, data.currentConditions.feelslike, data.days[0].tempmax, data.days[0].tempmin, data.currentConditions.conditions);
}

// Depending on what value was entered for the link, the resolvedAddress can give different values
// "new york", or "New York, NY, US" for example
// So this formats the value by removing the state and country and capitalizing all the words.
function formatCity (string) {
  return string.split(',')[0]
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Controls form validation and also controls the how the data gets displayed
function screenController () {
  // div for the weather data
  const weatherBox = document.getElementById("weather-container");

  const form = document.querySelector("form");
  const placeInput = document.getElementById("place");

  // Radio value for fahrenheit
  // Since there's only two options for the radio it only checks if fahrenheit has been checked
  const unitRadio = document.getElementById("fahrenheit");


  const error = document.querySelector("span.error");

  // Listens when the form is submitted for any error in the place input.
  form.addEventListener("submit", (event) => {
    // prevent form submission
    event.preventDefault();
    if (!placeInput.validity.valid) {
      // display an appropriate error message
      showErrorCity();
    } else {
      error.textContent = "";   // Remove the message content
      error.className = "error";  // Remove active class
      if (unitRadio.checked) {
        getWeather(placeInput.value, true)
          .then(Weather => {
            displayWeather(Weather);
          }).catch(error => {
            console.error(error);
            showErrorInput();
          });
      } else {
        getWeather(placeInput.value, false)
          .then(Weather => {
            displayWeather(Weather);
          }).catch(error => {
            console.error(error);
            showErrorInput();
          });
      }
    }
  });

  // Shows error for if the input box is blank
  function showErrorCity () {
    error.textContent = "*You need to enter a place.";
    // Add the `active` class
    error.className = "error active";
  }

  // Shows error for if it can't find the place inputted.
  function showErrorInput () {
    error.textContent = "*Could not find place.";
    // Add the `active` class
    error.className = "error active";
  }

  // Creates all the html elements that get added to weatherBox and appends them to it
  function displayWeather (Weather) {
    weatherBox.replaceChildren();

    const cityHeader = document.createElement("p");
    const tempBox = document.createElement("div");
    const temp = document.createElement("p");
    const feelsTemp = document.createElement("p");
    const highLowBox = document.createElement("div");
    const highTemp = document.createElement("p");
    const lowTemp = document.createElement("p");
    const conditions = document.createElement("p");

    cityHeader.id = "city-header"
    cityHeader.textContent = `${Weather.city}`;

    tempBox.id = "temp-container";

    temp.id = "temp";
    temp.textContent = `${Weather.temp}°`;

    feelsTemp.className = "temp-extra";
    feelsTemp.textContent = `Feels like: ${Weather.feelsLike}°`;

    highLowBox.id = "high-low";

    highTemp.className = "temp-extra";
    highTemp.textContent = `High: ${Weather.tempMax}°`;

    lowTemp.className = "temp-extra";
    lowTemp.textContent = `Low: ${Weather.tempMin}°`;

    conditions.id = "conditions";
    conditions.textContent = `${Weather.conditions}`;

    tempBox.appendChild(temp);
    highLowBox.appendChild(highTemp);
    highLowBox.appendChild(lowTemp);

    weatherBox.appendChild(cityHeader);
    weatherBox.appendChild(tempBox);
    weatherBox.appendChild(feelsTemp);
    weatherBox.appendChild(highLowBox);
    weatherBox.appendChild(conditions);
  }
}

screenController();