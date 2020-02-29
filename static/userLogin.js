$(document).ready(function() {
    $('#login-user').on('submit', (evt) => {
    
    $.ajax({
        data: {
            username: $('#username').val(),
            password: $('#password').val()
        },
        type: 'POST',
        url: '/login'
    })
    .done(function(data) {
        if (data.error){
            $('#errorAlert').text(data.error).show()
        }
    });

    evt.preventDefault();


    });
});


