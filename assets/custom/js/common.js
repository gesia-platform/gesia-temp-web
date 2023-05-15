(function ($) {
    $(document).on('click', '[name="logoutBtn"]', function (e) {
        // $.ajax({
        //     type: 'POST',
        //     url: '/account/logout',
        //     success: function (response) {
        //         alert(response.data.message);
        //         window.location.replace(response.data.redirect);
        //     },
        //     error: function (error) {
        //         const errorCode = error.responseJSON.data && error.responseJSON.data.code ? error.responseJSON.data.code : error.responseJSON.code ? error.responseJSON.code : 'UNKNOWN';
        //         const message = error.responseJSON.dat && error.responseJSON.data.code ? error.responseJSON.data.message : error.responseJSON.message ? error.responseJSON.message : 'ERROR';
        //         alert(`[CODE - ${errorCode}]\n${message}`);
        //     },
        // });

        window.location.replace('/');
    });

    $(document).on('click', 'a[name="logoutModalBtn"]', function (e) {
        $('#logoutModal').modal('show');
    });

    $(document).on('click', 'a[name="imageModalBtn"]', function (e) {
        $('#imageModalContent').attr('src', $(this).data('src'));
        $('#imageModal').modal('show');
    });

    $('li[name="topmenu"]').each(function () {
        const me = $(this);
        const media = matchMedia('screen and (min-width: 960px)');

        if (me.data('type') === (topmenu ? topmenu : '')) me.addClass('active');
        if (me.data('type') !== (topmenu ? topmenu : '')) me.removeClass('active');

        if (media.matches && me.data('type') === (topmenu ? topmenu : '')) me.children('a').click();
    });

    $('a[name="submenu"]').each(function () {
        const me = $(this);

        if (me.data('type') === (submenu ? submenu : '')) me.addClass('active');
        if (me.data('type') !== (submenu ? submenu : '')) me.removeClass('active');
    });
})(jQuery);
