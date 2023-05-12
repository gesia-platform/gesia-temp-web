(function ($) {
    $(document).on('click', '[name="logoutButton"]', function (e) {
        $.ajax({
            type: 'POST',
            url: '/account/logout',
            success: function (response) {
                alert(response.data.message);
                window.location.replace(response.data.redirect);
            },
            error: function (error) {
                const errorCode = error.responseJSON.data && error.responseJSON.data.code ? error.responseJSON.data.code : error.responseJSON.code ? error.responseJSON.code : 'UNKNOWN';
                const message = error.responseJSON.dat && error.responseJSON.data.code ? error.responseJSON.data.message : error.responseJSON.message ? error.responseJSON.message : 'ERROR';
                alert(`[CODE - ${errorCode}]\n${message}`);
            },
        });
    });
})(jQuery);
