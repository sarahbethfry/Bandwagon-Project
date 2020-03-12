'use strict';

const API_BASE = 'https://api.songkick.com/api/3.0';
const API_KEY = config.songkick_key;

window.onload = function() {
    setStartDate();
    setEndDate();
    init();
};

let mapMarkers = [];

async function init() {
    const form = document.getElementById('city_date_form');
    form.onsubmit = async evt => {
        evt.preventDefault();

        const searchValue = getInputValue();
        const searchMinDate = getMinDateValue();
        const searchMaxDate = getMaxDateValue();
        const metroId = await citySearch(searchValue);

        const totalPages = await dateSearch(
            metroId,
            searchMinDate,
            searchMaxDate
        );
        const allEvents = await paginateEvents(totalPages, metroId);
        console.log(allEvents);
        clearMap(mapMarkers);
        const centerCoords = getCenterCoords(allEvents);
        mapMarkers = createMapMarkers(allEvents);

        plotAllEvents(centerCoords, mapMarkers);
    };
}

async function citySearch(value) {
    const result = await fetchJSON(
        `${API_BASE}/search/locations.json?&query=${value}&apikey=${API_KEY}`
    );
    console.log(result);
    return result.resultsPage.results.location[0].metroArea.id;
}
async function dateSearch(metroId, minDate, maxDate) {
    const result = await fetchJSON(
        `${API_BASE}/metro_areas/${metroId}/calendar.json?apikey=${API_KEY}&min_date=${encodeURI(
            minDate
        )}&max_date=${encodeURI(maxDate)}`
    );
    const totalNumber = result.resultsPage.totalEntries;
    console.log(totalNumber);

    if (totalNumber > 50) {
        return ~~(totalNumber / 50) + 1;
    }

    return 1;
}

async function paginateEvents(totalPages, metroId) {
    const totalEvents = [];
    const pageURLs = [];

    for (let i = 1; i <= totalPages; i++) {
        pageURLs.push(
            `${API_BASE}/metro_areas/${metroId}/calendar.json?apikey=${API_KEY}&min_date=${encodeURI(
                document.getElementById('start').value
            )}&max_date=${encodeURI(
                document.getElementById('end').value
            )}&page=${i}`
        );
    }

    for await (let url of pageURLs) {
        const result = await fetchJSON(url);
        const allEvents = result.resultsPage.results.event;
        totalEvents.push(...allEvents);
    }

    return totalEvents;
}

function getCenterCoords(allEvents) {
    const cityLat = allEvents[0].location.lat;
    const cityLng = allEvents[0].location.lng;
    return new google.maps.LatLng(cityLat, cityLng);
}

function createMapMarkers(allEvents) {
    const mapMarkers = [];
    let venueObj = {};

    for (let event of allEvents) {
        if (venueObj[event.venue.id] !== undefined) {
            venueObj[event.venue.id].events.push(event);
        } else {
            venueObj[event.venue.id] = { venue: {}, events: [] };
            venueObj[event.venue.id].venue = event.venue;
            venueObj[event.venue.id].events.push(event);
        }
    }

    for (let venue in venueObj) {
        const currentVenue = venueObj[venue];

        let venueLat = currentVenue.venue.lat;
        let venueLng = currentVenue.venue.lng;

        if (venueLat === null || venueLng === null) {
            venueLat = currentVenue.events[0].location.lat;
            venueLng = currentVenue.events[0].location.lng;
        }

        const venueList = currentVenue.events.map(function(event) {
            return `<li>
               <span> 
                <a target="_blank"href=${
                    event.uri
                }>${moment(event.start.date).format('ddd MMM D')}</a> 
                    ${event.displayName}
                <form action="/userevents" method="POST">
                        <input type="hidden" name="event_name" value="${
                            event.displayName
                        }"/>
                        <input type="hidden" name="event_date" value="${
                            event.start.date
                        }"/>
                        <input type="hidden" name="event_venue" value="${
                            event.venue.displayName
                        }"/>
                        <input type="hidden" name="event_url" value="${
                            event.uri
                        }" />
                    <button id="add_user_events" type="submit">Add to your shows!</button>
                    </form>
            </li>`;
        });

        const showInfoContent = `
                    <div class="window-content"> 
                    <div class="window-header">
                    <h1>${currentVenue.venue.displayName}</h1>

                    <div class="window-subtitle"> Shows </div> 
                    <ul>${venueList.toString()}
                    </ul>
                    
                    </div>
                    `;

        const showInfo = new google.maps.InfoWindow();
        const showMarker = new google.maps.Marker({
            position: {
                animation: google.maps.Animation.DROP,
                lat: venueLat,
                lng: venueLng,
            },
            icon: {
                url: '/static/images/music_hover.png',
                scaledSize: new google.maps.Size(60, 85),
            },
        });

        showMarker.setAnimation(google.maps.Animation.DROP);

        showMarker.addListener('click', () => {
            showInfo.close();
            showInfo.setContent(showInfoContent);
            showInfo.open(basicMap, showMarker);
        });

        mapMarkers.push(showMarker);
    }
    return mapMarkers;
}

function plotAllEvents(cityCoords, mapMarkers) {
    basicMap.setCenter(cityCoords);
    basicMap.setZoom(12);

    for (let i = 0; i < mapMarkers.length; i++) {
        mapMarkers[i].setMap(basicMap);
    }
}

function clearMap(mapMarkers) {
    for (let i = 0; i < mapMarkers.length; i++) {
        mapMarkers[i].setMap(null);
    }

    mapMarkers.length = [];
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

function getMinDateValue() {
    return document.getElementById('start').value;
}
function getMaxDateValue() {
    return document.getElementById('end').value;
}
