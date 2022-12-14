
const openWeatherApiKey = '47f166773e351368285402b79068ea73';
const openWeatherCoordinatesUrl = 'https://api.openweathermap.org/data/2.5/weather?q=';
const oneCallUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat='
const userFormEL = $('#city-search');
const col2El = $('.col2');
let cityInputEl = $('#city');
const fiveDayEl = $('#five-day');
const searchHistoryEl = $('#search-history');
const currentDay = moment().format('DD/MM/YYYY');
const weatherIconUrl = 'http://openweathermap.org/img/wn/';
const searchHistoryArray = loadSearchHistory();

function titleCase(str) {
    const splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}

function loadSearchHistory() {
    let searchHistoryArray = JSON.parse(localStorage.getItem('search history'));

    if (!searchHistoryArray) {
        searchHistoryArray = {
            searchedCity: [],
        };
    } else {
        for (let i = 0; i < searchHistoryArray.searchedCity.length; i++) {
            searchHistory(searchHistoryArray.searchedCity[i]);
        }
    }

    return searchHistoryArray;
}

function saveSearchHistory() {
    localStorage.setItem('search history', JSON.stringify(searchHistoryArray));
};

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

    searchHistoryEl.append(searchHistoryBtn);
}

function getWeather(city) {
    const apiCoordinatesUrl = openWeatherCoordinatesUrl + city + '&appid=' + openWeatherApiKey;
    fetch(apiCoordinatesUrl)
        .then(function (coordinateResponse) {
            if (coordinateResponse.ok) {
                coordinateResponse.json().then(function (data) {
                    const cityLatitude = data.coord.lat;
                    const cityLongitude = data.coord.lon;
                    const apiOneCallUrl = oneCallUrl + cityLatitude + '&lon=' + cityLongitude + '&appid=' + openWeatherApiKey + '&units=metric';

                    fetch(apiOneCallUrl)
                        .then(function (weatherResponse) {
                            if (weatherResponse.ok) {
                                weatherResponse.json().then(function (weatherData) {

                                    const currentWeatherEl = $('<div>')
                                        .attr({
                                            id: 'current-weather'
                                        })

                                    const weatherIcon = weatherData.current.weather[0].icon;
                                    const cityCurrentWeatherIcon = weatherIconUrl + weatherIcon + '.png';

                                    const currentWeatherHeadingEl = $('<h2>')
                                        .text(city + ' (' + currentDay + ')');
                                    let iconImgEl = $('<img>')
                                        .attr({
                                            id: 'current-weather-icon',
                                            src: cityCurrentWeatherIcon,
                                            alt: 'Weather Icon'
                                        })
                                    const currWeatherListEl = $('<ul>')

                                    const currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' ??C', 'Wind: ' + weatherData.current.wind_speed + ' Kph', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi]

                                    for (let i = 0; i < currWeatherDetails.length; i++) {
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

                                        } else {
                                            const currWeatherListItem = $('<li>')
                                                .text(currWeatherDetails[i])
                                            currWeatherListEl.append(currWeatherListItem);
                                        }

                                    }
                                    $('#five-day').before(currentWeatherEl);
                                    currentWeatherEl.append(currentWeatherHeadingEl);
                                    //append icon to current weather header
                                    currentWeatherHeadingEl.append(iconImgEl);
                                    currentWeatherEl.append(currWeatherListEl);



                                    const fiveDayHeaderEl = $('<h2>')
                                        .text('5-Day Forecast:')
                                        .attr({
                                            id: 'five-day-header'
                                        })

                                    $('#current-weather').after(fiveDayHeaderEl)


                                    const fiveDayArray = [];

                                    for (let i = 0; i < 5; i++) {
                                        let forecastDate = moment().add(i + 1, 'days').format('DD/MM/YY');

                                        fiveDayArray.push(forecastDate);
                                    }

                                    for (let i = 0; i < fiveDayArray.length; i++) {
                                        const cardDivEl = $('<div>')
                                            .addClass('col3');

                                        const cardBodyDivEl = $('<div>')
                                            .addClass('card-body');

                                        const cardTitleEl = $('<h3>')
                                            .addClass('card-title')
                                            .text(fiveDayArray[i]);

                                        const forecastIcon = weatherData.daily[i].weather[0].icon;

                                        const forecastIconEl = $('<img>')
                                            .attr({
                                                src: weatherIconUrl + forecastIcon + '.png',
                                                alt: 'Weather Icon'
                                            });

                                        const currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' ??C', 'Wind: ' + weatherData.current.wind_speed + ' Kph', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi]
                                        const tempEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Temp: ' + weatherData.daily[i].temp.max + ' ??c')
                                        const windEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Wind: ' + weatherData.daily[i].wind_speed + ' Kph')
                                        const humidityEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Humidity: ' + weatherData.daily[i].humidity + '%')


                                        fiveDayEl.append(cardDivEl);
                                        cardDivEl.append(cardBodyDivEl);
                                        cardBodyDivEl.append(cardTitleEl);
                                        cardBodyDivEl.append(forecastIconEl);
                                        cardBodyDivEl.append(tempEL);
                                        cardBodyDivEl.append(windEL);
                                        cardBodyDivEl.append(humidityEL);
                                    }

                                })
                            }
                        })
                });
            } else {
                alert('Error: Open Weather could not find city')
            }
        })
        .catch(function (error) {
            alert('Unable to connect to Open Weather');
        });
}


function submitCitySearch(event) {
    event.preventDefault();

    let city = titleCase(cityInputEl.val().trim());

    if (searchHistoryArray.searchedCity.includes(city)) {
        alert(city + ' is included in history below. Click the ' + city + ' button to get weather.');
        cityInputEl.val('');
    } else if (city) {
        getWeather(city);
        searchHistory(city);
        searchHistoryArray.searchedCity.push(city);
        saveSearchHistory();
        cityInputEl.val('');
        
    } else {
        alert('Please enter a city');
    }
}

userFormEL.on('submit', submitCitySearch);

$('#search-btn').on('click', function () {
    $('#current-weather').remove();
    $('#five-day').empty();
    $('#five-day-header').remove();
})