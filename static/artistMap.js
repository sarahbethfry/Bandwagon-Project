'use strict';

const API_BASE = 'https://api.songkick.com/api/3.0';
const API_KEY = config.songkick_key;

const b64 = btoa(
    '9a0bf7f525fe4874a0650c32dcc94526:cc8ccd2d48e14b1bb81377c225c17e3c'
);

const spotifyBase = 'https://accounts.spotify.com/api/token';

window.onload = function() {
    getAccessToken().then(accessToken => {
        init(accessToken);
    });
};
function plotAllEvents(allEvents, mapMarkers, polyline) {
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
                    <span><button><a target="_blank" href=${event.uri}>Get more info!</a></button></span>
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
            showInfo.open(map, showMarker, polyline);
        });

        mapMarkers.push(showMarker);
    }
}
function init(spotifyAccessToken) {
    // Create info window object that will hold all show info.

    console.log(spotifyAccessToken);
    // Holds coordinates for all events
    // Needed to clear and repopulate with each search
    let mapMarkers = [];
    let polyline;

    document.getElementById('artist_form').addEventListener('submit', evt => {
        evt.preventDefault();

        const artistSearchUrl =
            API_BASE +
            '/search/artists.json?apikey=' +
            API_KEY +
            '&' +
            'query=' +
            encodeURI(document.getElementById('artist_name').value);

        const spotifyArtistUrl =
            'https://api.spotify.com/v1/search?q=' +
            encodeURI(document.getElementById('artist_name').value) +
            '&type=artist';

        // Call the `search/artist` endpoint
        return Promise.all([
            fetchJSON(artistSearchUrl),
            fetchJSON(spotifyArtistUrl, {
                headers: { Authorization: `Bearer ${spotifyAccessToken}` },
            }),
        ])
            .then(res => {
                if (Object.keys(res[0].resultsPage.results).length === 0) {
                    console.log('Insert Alert: We never heard of this band');
                }

                const artistOnTour =
                    res[0].resultsPage.results.artist[0].onTourUntil;
                if (artistOnTour === null) {
                    console.log('Insert Alert: Band not on Tour');
                }
                console.log(res[1]);
                const artistImageUrl = res[1].artists.items[0].images[0].url;

                document.getElementById(
                    'artist_image'
                ).innerHTML = `<img width="200" height="200" src="${artistImageUrl}"/>`;

                let artistId = res[0].resultsPage.results.artist[0].id;
                const similarArtists =
                    API_BASE +
                    '/artists/' +
                    artistId +
                    '/similar_artists.json?apikey=' +
                    API_KEY;

                let eventUrl =
                    API_BASE +
                    '/artists/' +
                    artistId +
                    '/calendar.json?apikey=' +
                    API_KEY;

                return Promise.all([
                    fetchJSON(eventUrl),
                    fetchJSON(similarArtists),
                ]);
            })
            .then(res => {
                const allSimilarArtists = res[1].resultsPage.results.artist;

                console.log(allSimilarArtists);

                function getSimilarArtistCalendar(simArtistId) {
                    let eventUrl =
                        API_BASE +
                        '/artists/' +
                        simArtistId +
                        '/calendar.json?apikey=' +
                        API_KEY;

                    fetch(eventUrl).then(res => {
                        console.log('called getSimilarArtistCalendar');
                        console.log(res);
                        console.log(res.json());
                        return res.json();
                    });
                }

                document.getElementById(
                    'sm_artist_list'
                ).innerHTML = `<li></li>`;

                for (let simArt of allSimilarArtists) {
                    if (!!simArt.onTourUntil) {
                        const li = document.createElement('li');

                        const button = document.createElement('input');
                        button.setAttribute('type', 'button');
                        button.setAttribute('class', 'simArtButton');
                        button.addEventListener('click', () => {
                            getSimilarArtistCalendar(simArt.id);
                        });

                        const artistNameSpan = document.createElement('span');
                        artistNameSpan.innerText = simArt.displayName;

                        li.append(button);
                        li.append(artistNameSpan);

                        document.getElementById('sm_artist_list').append(li);
                    }
                }

                const allEvents = res[0].resultsPage.results.event;
                console.log(allEvents);
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
                plotAllEvents(allEvents, mapMarkers);

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

function getAccessToken() {
    return fetchJSON(spotifyBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${b64}`,
        },
        body: 'grant_type=client_credentials',
    }).then(res => {
        return res.access_token;
    });
}

function fetchJSON(url, options = {}) {
    return fetch(url, options).then(res => res.json());
}
// document.getElementById(
//     'sm_artist_list'
// ).innerHTML = `<li></li>`;

// for (let smA of allSimilarArtists) {

//     if (!!smA.onTourUntil) {
//         document.getElementById('sm_artist_list').innerHTML +=
//             '<li>' +
//             '<a target="artist_form" href=' +
//             fetchJSON(eventUrl) +
//             '/>' +
//             smA.displayName +
//             '</li>';
//     }
// }
