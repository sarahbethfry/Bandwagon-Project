//accounts.spotify.com/en/authorize?client_id=9a0bf7f525fe4874a0650c32dcc94526&redirect_uri=bandwagon-rocks-login:%2F%2Fcallback&scope=user-read-private%20user-read-email&response_type=token

https: const b64 = btoa(
    '9a0bf7f525fe4874a0650c32dcc94526:cc8ccd2d48e14b1bb81377c225c17e3c'
);

function makeFormEncoder(hash) {
    return function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(hash[key]);
    };
}

function getAccessToken() {
    let bodyParams = {
        grant_type: 'client_credentials',
    };
    let headers = {
        'content-Type': 'application/x-www-form-urlencoded',
        Authorization: b64,
    };
}
