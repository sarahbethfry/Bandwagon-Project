'use strict';

// document.getElementById('artist_form').addEventListener('submit', evt => {
//     evt.preventDefault();

//     const artistSearchUrl = API_BASE + '/search/artists.json?apikey=' + API_KEY;
//     const artistSearchData = {
//         query: document.getElementById('artist_name').value,
//     };

//     // Call the `search/artist` endpoint
//     return promisifiedGet(artistSearchUrl, artistSearchData)
//         .then(res => {
//             if (Object.keys(res.resultsPage.results).length === 0) {
//                 console.log('Insert Alert: We never heard of this band');
//             }

//             const artistOnTour = res.resultsPage.results.artist[0].onTourUntil;
//             if (artistOnTour === null) {
//                 console.log('Insert Alert: Band not on Tour');
//             }

function getSimilarArtists(artistId) {
    const similarArtists =
        API_BASE +
        '/artists' +
        artistId +
        '/similar_artists.json?apikey=' +
        API_KEY;

    document.getElementById('artist_form').addEventListener('submit', evt => {
        evt.preventDefault();

        // Call the 'similar_artist' endpoint
        return promisifiedGet(similarArtists);

        then(res => {
            console.log(res);

            console.log('SUCCESS', res);
        }).catch(err => {
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

getSimilarArtists(artistId);
