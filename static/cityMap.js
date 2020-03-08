'use strict';

const API_BASE = 'https://api.songkick.com/api/3.0';
const API_KEY = config.songkick_key;

window.onload = function() {
    setStartDate();
    setEndDate();
    init();
};

async function init() {
    let mapMarkers = [];

    // convert to vanilla
    const form = document.getElementById('city_date_form');

    form.onsubmit = async evt => {
        evt.preventDefault();
        console.log('test');
        const searchValue = getInputValue();
        const metroId = await citySearch(searchValue);
        const locationEventsByDate = await dateSearch(metroId);
        console.log(locationEventsByDate);
        await plotAllEvents(locationEventsByDate, mapMarkers);
    };
}

async function citySearch(value) {
    const result = await fetchJSON(
        `${API_BASE}/search/locations.json?&query=${value}/apikey=${API_KEY}`
    );
    return result.resultsPage.results.location[0].metroArea.id;
}
async function dateSearch(metroId) {
    const result = await fethchJSON(
        `${API_BASE}/search/locations.json?&query=${encodeURI(
            value
        )}&apikey=${API_KEY}&min_date=${encodeURI(
            document.getElementById('start').value
        )}&max_date=${encodeURI(document.getElementById('end').value)}`
    );
    return resultsPage.results.event;
}

async function plotAllEvents(allEvents, mapMarkers) {
    await clearMap(mapMarkers);
    const cityLat = allEvents.resultsPage.results.event[5].location.lat;
    const cityLng = allEvents.resultsPage.results.event[5].location.lng;
    const cityCoords = new google.maps.LatLng(cityLat, cityLng);
    basicMap.setCenter(cityCoords);
    basicMap.setZoom(12);

    for (let event of allEvents) {
        let venueLat = event.venue.lat;
        let venueLng = event.venue.lng;

        // if (allEvents.length < 50) {
        const showInfoContent = `
                    <div class="window-content">
                    <p class="show-info">
                    <h1> <b>${event.performance[0].displayName}</b></h1>
                      <br> 
                      <p>${event.venue.displayName}</p>
                      <p>${event.location.city}</p>
                      <span>${event.start.date} ${event.start.time}</span>
                      <br>
                    </p>
                      <span><button id="songkick_link" type="submit">Get more info!</button></span>
                      <span><button id="user_events" type="submit">Add to your shows!</button></span>
                    </div>
                    `;
        // }

        if (venueLat === null || venueLng === null) {
            console.log(event);
            venueLat = event.location.lat;
            venueLng = event.location.lng;
        }
        const showInfo = new google.maps.InfoWindow();
        const showMarker = new google.maps.Marker({
            position: {
                animation: google.maps.Animation.DROP,
                lat: venueLat,
                lng: venueLng,
            },
        });

        showMarker.setAnimation(google.maps.Animation.DROP);
        showMarker.addListener('mouseover', () => {
            showInfo.close();
            showInfo.setContent(showInfoContent);
            showInfo.open(map, showMarker);
        });

        mapMarkers.push(showMarker);
    }
    for (let i = 0; i < mapMarkers.length; i++) {
        mapMarkers[i].setMap(basicMap);
    }
}

async function clearMap(mapMarkers, polyline) {
    for (let i = 0; i < mapMarkers.length; i++) {
        mapMarkers[i].setMap(null);
    }

    mapMarkers.length = 0;
}

function fetchJSON(url, options = {}) {
    return fetch(url, options).then(res => res.json());
}

function getToday() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    return (today = yyyy + '-' + mm + '-' + dd);
}
function getTomorrow() {
    let tomorrow = new Date();
    let dd = tomorrow.getDate() + 1;
    let mm = tomorrow.getMonth() + 1;
    let yyyy = tomorrow.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }
    return (tomorrow = yyyy + '-' + mm + '-' + dd);
}

function setStartDate() {
    document.getElementById('start').value = getToday();
}

function setEndDate() {
    document.getElementById('end').value = getTomorrow();
}

function getInputValue() {
    return document.getElementById('city_name').value;
}
