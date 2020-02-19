"use strict"

const API_BASE = "https://api.songkick.com/api/3.0";
const API_KEY = config.songkick_key;

$("#artist_form").on('submit', (evt) => {
    evt.preventDefault();

    const artistSearchUrl = API_BASE + "/search/artists.json?apikey="+ API_KEY;
    const artistSearchData = {
        query: $("#artist_name").val()
    }; 

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
            
            for(let event of allEvents){
                $('#artistEvents').append(
                    `<li class="eventBoxes">${event.displayName}<br/>
                                            ${event.venue.lat}<br/>
                                            ${event.venue.lng}</li>`);
            };
            
            console.log("SUCCESS", res);
        }).catch((err) => {
            console.log("ERROR", err);
        })
});


function promisifiedGet(url, data) {
    return new Promise((resolve, reject) => {
        $.get(url, data, (res, err) => {                                
            resolve(res);
        }).fail(err => {
            reject(err);
        });    
    });
}
