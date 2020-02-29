'use strict';

const API_BASE = 'https://api.songkick.com/api/3.0';
const API_KEY = config.songkick_key;

window.onload = function() {
    setStartDate();
    setEndDate();
};

function initMap() {
    // create the map
    const basicMap = new google.maps.Map(document.querySelector('#map'), {
        center: {
            lat: 35.8228513,
            lng: -39.5868283,
        },
        zoom: 2,
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            {
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#242f3e' }],
            },
            {
                elementType: 'labels.text.fill',
                stylers: [{ color: '#746855' }],
            },
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{ color: '#263c3f' }],
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#6b9a76' }],
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#38414e' }],
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#212a37' }],
            },
            {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#9ca5b3' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#746855' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#1f2835' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#f3d19c' }],
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{ color: '#2f3948' }],
            },
            {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#17263c' }],
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#515c6d' }],
            },
            {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#17263c' }],
            },
        ],
    });
    const showInfo = new google.maps.InfoWindow();

    let mapMarkers = [];

    // convert to vanilla
    const form = document.getElementById('city_date_form');

    form.onsubmit = evt => {
        evt.preventDefault();

        const citySearchData = {
            query: $('#city_name').val(),
            apikey: API_KEY,
        };

        const dateSearchData = {
            min_date: document.getElementById('start').value,
            max_date: document.getElementById('end').value,
        };

        const citySearchUrl = API_BASE + '/search/locations.json?';

        // Call the `location` endpoint
        return promisifiedGet(citySearchUrl, citySearchData)
            .then(res => {
                const dateUrl = $.param(dateSearchData);
                const metroID =
                    res.resultsPage.results.location[0].metroArea.id;

                const loc_eventUrl =
                    API_BASE +
                    '/metro_areas/' +
                    metroID +
                    '/calendar.json?apikey=' +
                    API_KEY +
                    '&' +
                    dateUrl;
                // Call the `metro area/calendar` endpoint
                return promisifiedGet(loc_eventUrl);
            })
            .then(res => {
                const allEvents = res.resultsPage.results.event;

                const cityLat = res.resultsPage.results.event[5].location.lat;
                const cityLng = res.resultsPage.results.event[5].location.lng;
                const cityCoords = new google.maps.LatLng(cityLat, cityLng);
                basicMap.setCenter(cityCoords);
                basicMap.setZoom(12);

                console.log(allEvents);

                // clear google maps markers
                if (mapMarkers.length > 0) {
                    mapMarkers.forEach(function(marker) {
                        marker.setMap(null);
                    });

                    mapMarkers = [];
                }

                for (let event of allEvents) {
                    let venueLat = event.venue.lat;
                    let venueLng = event.venue.lng;

                    if (allEvents.length < 50) {
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
                    }
                    if (venueLat === null || venueLng === null) {
                        console.log(event);
                        venueLat = event.location.lat;
                        venueLng = event.location.lng;
                    }

                    const showMarker = new google.maps.Marker({
                        position: {
                            lat: venueLat,
                            lng: venueLng,
                        },
                    });

                    showMarker.addListener('mouseover', () => {
                        showInfo.close();
                        showInfo.setContent(showInfoContent);
                        showInfo.open(map, showMarker);
                    });

                    mapMarkers.push(showMarker);
                }

                if (mapMarkers.length > 0) {
                    mapMarkers.forEach(function(marker) {
                        marker.setMap(basicMap);
                    });
                }

                console.log('SUCCESS', res);
            })
            .catch(err => {
                console.log('ERROR', err);
            });
    };
}

function promisifiedGet(url, data) {
    return new Promise((resolve, reject) => {
        $.get(url, data, (res, err) => {
            resolve(res);
        }).fail(err => {
            reject(err);
        });
    });
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
