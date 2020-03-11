'use strict';

const API_BASE = 'https://api.songkick.com/api/3.0';
const API_KEY = config.songkick_key;

// spotify client Id base 64 encoded
const spotifyB64 = btoa(config.spotify_key);
const spotifyBase = 'https://accounts.spotify.com/api/token';

// automatically runs to get spotify access token in the background,
// then pushes it to main fnx.
window.onload = function() {
    getAccessToken().then(async accessToken => {
        init(accessToken);
    });
};

let mapMarkers = [];
let polyline;

async function init(accessToken) {
    // Holds coordinates for all events
    // Needed to clear and repopulate with each search

    // Grab the artist that the user inputs in the artist form.
    // Add event when user pushes submit but prevent it as default.
    document
        .getElementById('artist_form')
        .addEventListener('submit', async evt => {
            evt.preventDefault();

            const searchValue = getInputValue();

            // Songkick address that returns artist info when search name as a query.
            const artistId = await searchArtistId(searchValue);
            const allEvents = await getArtistCalendar(artistId);

            clearMap(mapMarkers, polyline);

            const centerCoords = getCenterCoords(allEvents);

            mapMarkers = createMapMarkers(allEvents);
            polyline = createPolyline(mapMarkers);

            plotAllEvents(centerCoords, mapMarkers, polyline);

            const artistImageUrl = await spotifyArtistImage(
                accessToken,
                searchValue
            );
            document.getElementById('artist_info').style.left = '20px';
            console.log(document.getElementById('artist_info'));
            document.getElementById(
                'artist_image'
            ).innerHTML = `<img width="200" height="200" src="${artistImageUrl}"/>`;

            const allSimilar = await getSimilarArtistsOnTour(artistId);
            for (let eachArtist of allSimilar) {
                if (!!eachArtist.onTourUntil) {
                    document.getElementById('sm_artist_list').innerHTML +=
                        '<li>' + eachArtist.displayName + '</li>';
                }
            }
        });
}

function fetchJSON(url, options = {}) {
    return fetch(url, options).then(res => res.json());
}

function getAccessToken() {
    return fetchJSON(spotifyBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${spotifyB64}`,
        },
        body: 'grant_type=client_credentials',
    }).then(res => {
        return res.access_token;
    });
}

function getInputValue() {
    return document.getElementById('artist_name').value;
}

async function searchArtistId(value) {
    const result = await fetchJSON(
        `${API_BASE}/search/artists.json?apikey=${API_KEY}&query=${encodeURI(
            value
        )}`
    );
    return result.resultsPage.results.artist[0].id;
}

async function spotifyArtistImage(spotifyAccessToken, value) {
    const spotifyArtistUrl = `https://api.spotify.com/v1/search?q=${encodeURI(
        value
    )}&type=artist`;
    const spotifyArtistResults = await fetchJSON(spotifyArtistUrl, {
        headers: { Authorization: `Bearer ${spotifyAccessToken}` },
    });
    return spotifyArtistResults.artists.items[0].images[0].url;
}

async function getSimilarArtistsOnTour(artistId) {
    const result = await fetchJSON(
        `${API_BASE}/artists/${artistId}/similar_artists.json?apikey=${API_KEY}`
    );
    // const simArtDict = {};
    return result.resultsPage.results.artist;
}

async function getArtistCalendar(artistId) {
    const result = await fetchJSON(
        `${API_BASE}/artists/${artistId}/calendar.json?apikey=${API_KEY}`
    );
    return result.resultsPage.results.event;
}

function getCenterCoords(allEvents) {
    // grab the venue lat and lng for each event
    return new google.maps.LatLng(
        allEvents[0].venue.lat,
        allEvents[0].venue.lng
    );
}

function createPolyline(mapMarkers) {
    const coordList = mapMarkers.map(function(marker) {
        return {
            lat: marker.position.lat(),
            lng: marker.position.lng(),
        };
    });
    const dashedLine = {
        path: 'M 0,-1 0,1',
        strokeOpacity: 1,
        scale: 4,
        strokeColor: '#4b2b31',
    };

    return new google.maps.Polyline({
        path: coordList,
        geodesic: true,
        strokeOpacity: 0,
        icons: [
            {
                icon: dashedLine,
                offset: '0',
                repeat: '20px',
            },
        ],
    });
}

function createMapMarkers(allEvents) {
    const mapMarkers = [];

    for (let event of allEvents) {
        let venueLat = event.venue.lat;
        let venueLng = event.venue.lng;
        // the text inside every infowindow

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
                    <span><button><a target="_blank" href=${event.uri}>Get more info!</a></button></span>
                    <form action="/userevents" method="POST">
                        <input type="hidden" name="event_name" value="${event.displayName}"/>
                        <input type="hidden" name="event_date" value="${event.start.date}"/>
                        <input type="hidden" name="event_venue" value="${event.venue.displayName}"/>
                        <input type="hidden" name="event_url" value="${event.uri}" />
                    <button id="add_user_events" type="submit">Add to your shows!</button>
                    </form>
                  `;
        // for the events that dont play at a veune (festivals)
        // change the marker lat and lng to the city lat and lng.
        if (venueLat === null || venueLng === null) {
            venueLat = event.location.lat;
            venueLng = event.location.lng;
        }

        const showInfo = new google.maps.InfoWindow();
        // set each lat and lng in a marker
        const showMarker = new google.maps.Marker({
            position: {
                animation: google.maps.Animation.DROP,
                lat: venueLat,
                lng: venueLng,
            },
            icon: {
                url: '/static/images/vw minibus or camper_5287679.png',
                scaledSize: new google.maps.Size(55, 55),
            },
        });

        // add above text to info windows and add info windows to markers
        // show infowindows when you mouseover markers
        showMarker.setAnimation(google.maps.Animation.DROP);
        showMarker.addListener('mouseover', () => {
            showInfo.setContent(showInfoContent);
            showInfo.open(basicMap, showMarker);
        });

        showMarker.addListener('mouseout', () => {
            showInfo.close();
        });
        //  put all marker coordinates in an array
        mapMarkers.push(showMarker);
    }

    return mapMarkers;
}

function plotAllEvents(centerCoords, mapMarkers, polyline) {
    basicMap.setCenter(centerCoords);
    basicMap.setZoom(4);

    for (let i = 0; i < mapMarkers.length; i++) {
        mapMarkers[i].setMap(basicMap);
    }

    polyline.setMap(basicMap);
}

function clearMap(mapMarkers, polyline) {
    for (let i = 0; i < mapMarkers.length; i++) {
        mapMarkers[i].setMap(null);
    }

    mapMarkers = [];

    if (polyline !== undefined) {
        polyline.setMap(null);
    }
}
