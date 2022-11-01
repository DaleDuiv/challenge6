// const openWeatherAPIKey = "c83ba1cdc4309f5ff56fe14f4ce6994e"

const openWeatherApiKey = '47f166773e351368285402b79068ea73';
const openWeatherCoordinatesUrl = 'https://api.openweathermap.org/data/2.5/weather?q=';
const oneCallUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat='
const userFormEL = $('#city-search');
const col2El = document.querySelector('.col2');
const cityInputEl = document.getElementById('#city');
const fiveDayEl = $('#five-day');
const searchHistoryEl = $('#search-history');
const currentDay = moment().format('DD/MM/YYYY');
const weatherIconUrl = 'http://openweathermap.org/img/wn/';
const searchHistoryArray = loadSearchHistory();

function titleCase(str) {
    const splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}

//load cities from local storage and recreate history buttons
function loadSearchHistory() {
    const searchHistoryArray = JSON.parse(localStorage.getItem('search history'));

    // if nothing in localStorage, create a new object to track all user info
    if (!searchHistoryArray) {
        searchHistoryArray = {
            searchedCity: [],
        };
    } else {
        //add search history buttons to page
        for (let i = 0; i < searchHistoryArray.searchedCity.length; i++) {
            searchHistory(searchHistoryArray.searchedCity[i]);
        }
    }

    return searchHistoryArray;
}

//save to local storage
function saveSearchHistory() {
    localStorage.setItem('search history', JSON.stringify(searchHistoryArray));
};

//funciton to create history buttons
function searchHistory(city) {
    const searchHistoryBtn = $('<button>')
        .addClass('btn')
        .text(city)
        .on('click', function () {
            $('#current-weather').remove();
            $('#five-day').empty();
            $('#five-day-header').remove();
            getWeather(city);
        })
        .attr({
            type: 'button'
        });

    // append btn to search history div
    searchHistoryEl.append(searchHistoryBtn);
}

//function to get weather data from apiUrl
function getWeather(city) {
    // apiUrl for coordinates
    const apiCoordinatesUrl = openWeatherCoordinatesUrl + city + '&appid=' + openWeatherApiKey;
    // fetch the coordinates for parameter city
    fetch(apiCoordinatesUrl)
        .then(function (coordinateResponse) {
            if (coordinateResponse.ok) {
                coordinateResponse.json().then(function (data) {
                    const cityLatitude = data.coord.lat;
                    const cityLongitude = data.coord.lon;
                    // fetch weather information
                    const apiOneCallUrl = oneCallUrl + cityLatitude + '&lon=' + cityLongitude + '&appid=' + openWeatherApiKey + '&units=metric';

                    fetch(apiOneCallUrl)
                        .then(function (weatherResponse) {
                            if (weatherResponse.ok) {
                                weatherResponse.json().then(function (weatherData) {

                                    // ** START CURRENT DAY DISPLAY ** //

                                    //add div to hold current day details
                                    const currentWeatherEl = $('<div>')
                                        .attr({
                                            id: 'current-weather'
                                        })

                                    // get the weather icon from city
                                    const weatherIcon = weatherData.current.weather[0].icon;
                                    const cityCurrentWeatherIcon = weatherIconUrl + weatherIcon + '.png';

                                    // create h2 to display city + current day + current weather icon
                                    const currentWeatherHeadingEl = $('<h2>')
                                        .text(city + ' (' + currentDay + ')');
                                    // create img element to display icon
                                    let iconImgEl = $('<img>')
                                        .attr({
                                            id: 'current-weather-icon',
                                            src: cityCurrentWeatherIcon,
                                            alt: 'Weather Icon'
                                        })
                                    //create list of current weather details
                                    const currWeatherListEl = $('<ul>')

                                    const currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' °C', 'Wind: ' + weatherData.current.wind_speed + ' Kph', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi]

                                    for (let i = 0; i < currWeatherDetails.length; i++) {
                                        //create an indiviual list item and append to ul

                                        // run conditional to assign background color to UV index depending how high it is
                                        if (currWeatherDetails[i] === 'UV Index: ' + weatherData.current.uvi) {

                                            const currWeatherListItem = $('<li>')
                                                .text('UV Index: ')

                                            currWeatherListEl.append(currWeatherListItem);

                                            const uviItem = $('<span>')
                                                .text(weatherData.current.uvi);

                                            if (uviItem.text() <= 2) {
                                                uviItem.addClass('favorable');
                                            } else if (uviItem.text() > 2 && uviItem.text() <= 7) {
                                                uviItem.addClass('moderate');
                                            } else {
                                                uviItem.addClass('severe');
                                            }

                                            currWeatherListItem.append(uviItem);

                                            //create every list item that isn't uvIndex
                                        } else {
                                            const currWeatherListItem = $('<li>')
                                                .text(currWeatherDetails[i])
                                            //append to ul
                                            currWeatherListEl.append(currWeatherListItem);
                                        }

                                    }

                                    //append curr weather div to col2 before #five-day
                                    $('#five-day').before(currentWeatherEl);
                                    //append current weather heading to current weather div
                                    currentWeatherEl.append(currentWeatherHeadingEl);
                                    //append icon to current weather header
                                    currentWeatherHeadingEl.append(iconImgEl);
                                    //append ul to current weather
                                    currentWeatherEl.append(currWeatherListEl);

                                    // ** END CURRENT DAY DISPLAY ** //

                                    // ** START 5-DAY FORECAST DISPLAY ** //

                                    //create h2 header for 5-day forecast
                                    const fiveDayHeaderEl = $('<h2>')
                                        .text('5-Day Forecast:')
                                        .attr({
                                            id: 'five-day-header'
                                        })

                                    //append 5 day forecast header to col2 after current weather div
                                    $('#current-weather').after(fiveDayHeaderEl)

                                    // create array for the dates for the next 5 days

                                    const fiveDayArray = [];

                                    for (let i = 0; i < 5; i++) {
                                        let forecastDate = moment().add(i + 1, 'days').format('DD/MM/YY');

                                        fiveDayArray.push(forecastDate);
                                    }

                                    // for each date in the array create a card displaying temp, wind and humidity
                                    for (let i = 0; i < fiveDayArray.length; i++) {
                                        // create a div for each card
                                        const cardDivEl = $('<div>')
                                            .addClass('col3');

                                        // create div for the card body
                                        const cardBodyDivEl = $('<div>')
                                            .addClass('card-body');

                                        // create the card-title
                                        const cardTitleEl = $('<h3>')
                                            .addClass('card-title')
                                            .text(fiveDayArray[i]);

                                        // create the icon for current day weather
                                        const forecastIcon = weatherData.daily[i].weather[0].icon;

                                        const forecastIconEl = $('<img>')
                                            .attr({
                                                src: weatherIconUrl + forecastIcon + '.png',
                                                alt: 'Weather Icon'
                                            });

                                        // create card text displaying weather details
                                        const currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' °C', 'Wind: ' + weatherData.current.wind_speed + ' Kph', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi]
                                        //create temp
                                        const tempEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Temp: ' + weatherData.daily[i].temp.max + ' °c')
                                        //create wind
                                        const windEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Wind: ' + weatherData.daily[i].wind_speed + ' Kph')
                                        // create humidity
                                        const humidityEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Humidity: ' + weatherData.daily[i].humidity + '%')


                                        //append cardDivEl to the #five-day container
                                        fiveDayEl.append(cardDivEl);
                                        //append cardBodyDivEL to cardDivEl
                                        cardDivEl.append(cardBodyDivEl);
                                        //append card title to card body
                                        cardBodyDivEl.append(cardTitleEl);
                                        //append icon to card body
                                        cardBodyDivEl.append(forecastIconEl);
                                        //append temp details to card body
                                        cardBodyDivEl.append(tempEL);
                                        //append wind details to card body
                                        cardBodyDivEl.append(windEL);
                                        //append humidity details to card body
                                        cardBodyDivEl.append(humidityEL);
                                    }

                                    // ** END 5-DAY FORECAST DISPLAY ** //
                                })
                            }
                        })
                });
                // if fetch goes through but Open Weather can't find details for city
            } else {
                alert('Error: Open Weather could not find city')
            }
        })
        // if fetch fails
        .catch(function (error) {
            alert('Unable to connect to Open Weather');
        });
}

//function to push button elements to 

function submitCitySearch(event) {
    event.preventDefault();

    //get value from user input
    const city = titleCase(cityInputEl.val().trim());

    //prevent them from searching for cities stored in local storage
    if (searchHistoryArray.searchedCity.includes(city)) {
        alert(city + ' is included in history below. Click the ' + city + ' button to get weather.');
        cityInputEl.val('');
    } else if (city) {
        getWeather(city);
        searchHistory(city);
        searchHistoryArray.searchedCity.push(city);
        saveSearchHistory();
        //empty the form text area
        cityInputEl.val('');
        
        //if user doesn't type in a city
    } else {
        alert('Please enter a city');
    }
}

// on submission of user data get user input for city and fetch api data
userFormEL.on('submit', submitCitySearch);

// on click of search button - empty the current weather and 5-day forecast info
$('#search-btn').on('click', function () {
    $('#current-weather').remove();
    $('#five-day').empty();
    $('#five-day-header').remove();
})