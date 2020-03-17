const myModal = document.getElementById('login-modal');
const loginModal = document.getElementById('modal-up');
const closeBtn = document.getElementById('close');

loginModal.onclick = function() {
    myModal.style.display = 'block';
};

closeBtn.onclick = function() {
    myModal.style.display = 'none';
};
