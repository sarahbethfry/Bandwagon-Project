const myModal = document.getElementById('login-modal');
const loginModal = document.getElementById('modal-up');
const span = document.getElementById('log-submit');

loginModal.onclick = function() {
    myModal.style.display = 'block';
};

span.onclick = function() {
    myModal.style.display = 'none';
};

window.onclick = function(evt) {
    if (evt.target == myModal) {
        myModal.style.display = 'none';
    }
};
