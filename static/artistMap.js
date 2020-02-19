"use strict"

const API_BASE = "https://api.songkick.com/api/3.0";
const API_KEY = config.songkick_key;

function initMap() {
  // create the map
  const basicMap = new google.maps.Map(
    document.querySelector('#map'),
    { center: {
        lat: 39.8228513,
        lng: -98.5868283
      },
      zoom: 4,
        styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
  });
  const showInfo = new google.maps.InfoWindow();

  $("#artist_form").on('submit', (evt) => {
    evt.preventDefault();

    const artistSearchUrl = API_BASE + "/search/artists.json?apikey="+ API_KEY;
    const artistSearchData = {
        query: $("#artist_name").val()
    }; 
    console.log(artistSearchData)
   // Call the `search/artist` endpoint
    return promisifiedGet(artistSearchUrl, artistSearchData)
        .then((res) => {
            const artistId = res.resultsPage.results.artist[0].id;
            const eventUrl = API_BASE + "/artists/" + artistId + "/calendar.json?apikey=" + API_KEY;
              // Call the `artist/calendar` endpoint
            return promisifiedGet(eventUrl);        
        }).then((res) => {
            const allEvents = res.resultsPage.results.event
            console.log(allEvents)
            const coordList = [];
            for(let event of allEvents){
                const showInfoContent = (`
                  <div class="window-content">
                  <ul class="show-info">
                    <li><b>Show: </b>${event.displayName}</li>
                    <li><b>Venue: </b>${event.venue.displayName}</li>
                  </ul>
                  </div>
                  `);

                coordList.push({lat: event.venue.lat,
                                lng: event.venue.lng});

                const showMarker = new google.maps.Marker({
                  position: {
                    lat: event.venue.lat,
                    lng: event.venue.lng
                  },
                  map: basicMap
                });
                
                showMarker.addListener('mouseover', () => {
                  showInfo.close();
                  showInfo.setContent(showInfoContent);
                  showInfo.open(map, showMarker, polyline)

                });    
              } 
              const polyline = new google.maps.Polyline({
                    path: coordList,
                    geodesic: true,
                    strokeColor: '#ff0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 5
                });  
                polyline.setMap(basicMap);

          console.log("SUCCESS", res);
        }).catch((err) => {
          console.log("ERROR", err);
          })
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

