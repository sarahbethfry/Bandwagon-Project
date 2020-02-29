'use strict';

const API_BASE = 'https://api.songkick.com/api/3.0';
const API_KEY = config.songkick_key;

function initMap() {
    // create the map
    const basicMap = new google.maps.Map(document.querySelector('#map'), {
        center: {
            lat: 39.8228513,
            lng: -98.5868283,
        },
        zoom: 3,
        zoomControl: false,
        scaleControl: true,
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

    // Holds coordinates for all events
    // Needed to clear and repopulate with each search
    let mapMarkers = [];
    let polyline;

    document.getElementById('artist_form').addEventListener('submit', evt => {
        evt.preventDefault();

        const artistSearchUrl =
            API_BASE + '/search/artists.json?apikey=' + API_KEY;
        const artistSearchData = {
            query: document.getElementById('artist_name').value,
        };

        // Call the `search/artist` endpoint
        return promisifiedGet(artistSearchUrl, artistSearchData)
            .then(res => {
                if (Object.keys(res.resultsPage.results).length === 0) {
                    console.log('Insert Alert: We never heard of this band');
                }

                const artistOnTour =
                    res.resultsPage.results.artist[0].onTourUntil;
                if (artistOnTour === null) {
                    console.log('Insert Alert: Band not on Tour');
                }

                const artistId = res.resultsPage.results.artist[0].id;
                const similarArtists =
                    API_BASE +
                    '/artists/' +
                    artistId +
                    '/similar_artists.json?apikey=' +
                    API_KEY;

                const eventUrl =
                    API_BASE +
                    '/artists/' +
                    artistId +
                    '/calendar.json?apikey=' +
                    API_KEY;

                return [eventUrl, similarArtists];
            })
            .then(urls => {
                return Promise.all([
                    promisifiedGet(urls[0]),
                    promisifiedGet(urls[1]),
                ]);
            })
            .then(res => {
                const allEvents = res[0].resultsPage.results.event;
                const allSimilarArtists = res[1].resultsPage.results.artist;
                console.log(allEvents);
                console.log(allSimilarArtists);

                // let middleEvent = allEvents.length / 2;
                // let latMiddle = allEvents[middleEvent].venue.lat;
                // let lngMiddle = allEvents[middleEvent].venue.lng;

                const centerCoords = new google.maps.LatLng(
                    allEvents[0].venue.lat,
                    allEvents[0].venue.lng
                );
                basicMap.setCenter(centerCoords);
                basicMap.setZoom(4);

                // reset markers and polyline
                if (mapMarkers.length > 0) {
                    mapMarkers.forEach(function(marker) {
                        marker.setMap(null);
                    });

                    polyline.setMap(null);

                    mapMarkers = [];
                }

                for (let event of allEvents) {
                    let venueLat = event.venue.lat;
                    let venueLng = event.venue.lng;

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
                  </div>
                    <span><button><a style="text-decoration:none" href=${event.uri}>Get more info!</a></button></span>
                    <form action="/userevents" method="POST">
                        <input type="hidden" name="event_name" value="${event.displayName}"/>
                        <input type="hidden" name="event_date" value="${event.start.date}"/>
                        <input type="hidden" name="event_venue" value="${event.venue.displayName}"/>
                        <input type="hidden" name="event_url" value="${event.uri}" />
                    <button id="add_user_events" type="submit">Add to your shows!</button>
                    </form>   
                  `;

                    if (venueLat === null || venueLng === null) {
                        console.log(event);
                        venueLat = event.location.lat;
                        venueLng = event.location.lng;
                    }

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
                        showInfo.open(map, showMarker, polyline);
                    });

                    mapMarkers.push(showMarker);
                }

                for (let smA of allSimilarArtists) {
                    if (!!smA.onTourUntil) {
                        document.getElementById('sm_artist_list').innerHTML +=
                            '<li>' +
                            '<a href=' +
                            smA.uri +
                            '/>' +
                            smA.displayName +
                            '</li>';
                    }
                }

                if (mapMarkers.length > 0) {
                    const coordList = mapMarkers.map(function(marker) {
                        return {
                            lat: marker.position.lat(),
                            lng: marker.position.lng(),
                        };
                    });

                    polyline = new google.maps.Polyline({
                        path: coordList,
                        geodesic: true,
                        strokeColor: '#ff0000',
                        strokeOpacity: 1.0,
                        strokeWeight: 5,
                    });

                    polyline.setMap(basicMap);

                    mapMarkers.forEach(function(marker) {
                        marker.setMap(basicMap);
                    });
                }

                console.log('SUCCESS', res);
            })
            .catch(err => {
                console.log('ERROR', err);
            });
    });
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
