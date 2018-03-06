$(document).ready(function() {
    showView("viewHome");
    $('#linkHome').click(function () {
        showView("viewHome");
    });

    $('#linkDuel').click(function () {
        showView("viewDuel");
        $('#duel').empty();
        showDuelSection();
    });

    $('#linkRegistry').click(function () {
        showView("viewRegistry");
        $('#cards').empty();
        showCardRegistry();
    });

    $('#linkMarketplace').click(function () {
        showView("viewMarketplace");
        $('#card-sales').empty();
        showMarketplace();
    });

    $('#linkMyDeck').click(function () {
        showView("viewMyDeck");
        $('#my-deck').empty();
        showMyDeck();
    });

    $(document).on({
        ajaxStart: function () {
            $("#loadingBox").show()
        },
        ajaxStop: function () {
            $("#loadingBox").hide()
        }
    });

    subscribeToBlockyOhEvents();
});

function showView(viewName) {
    // Hide all views and show the selected view only
    $('main > section').hide();
    $('#' + viewName).show();
}

function showInfo(message) {
    $('#infoBox>p').html(message);
    $('#infoBox').show();
    $('#infoBox>button').click(function () {
        $('#infoBox').hide();
    });
}

function showError(errorMsg) {
    $('#errorBox>p').html("Error: " + errorMsg);
    $('#errorBox').show();
    $('#errorBox>button').click(function () {
        $('#errorBox').hide();
    });
}

