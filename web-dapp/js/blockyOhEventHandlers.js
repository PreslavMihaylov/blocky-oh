function subscribeToBlockyOhEvents() {
    let duelResultEvent = contract.DuelResult();
    let newCardWonEvent = contract.NewCardWon();
    let playerRegisteredEvent = contract.PlayerRegistered();
    let newCardSaleEvent = contract.NewCardSale();
    let cardSaleRemovedEvent = contract.CardSaleRemoved();
    let cardBoughtEvent = contract.CardBought();

    duelResultEvent.watch(duelResultHandler);
    newCardWonEvent.watch(newCardWonHandler);
    playerRegisteredEvent.watch(playerRegisteredHandler);
    newCardSaleEvent.watch(newCardSaleHandler);
    cardSaleRemovedEvent.watch(cardSaleRemovedHandler);
    cardBoughtEvent.watch(cardBoughtHandler);
}

function duelResultHandler(err, result) {
    if (err) return showError("Event consuming failed: " + err);

    console.log(result);
    let challenger = result.args['challenger'];
    let opponent = result.args['opponent'];
    let hasWon = result.args['hasWon'];
    if (challenger != web3.eth.accounts[0] && opponent != web3.eth.accounts[0]) {
        return;
    }

    let duelResult = {
        challenger: challenger == web3.eth.accounts[0] ? "You" : challenger,
        opponent: opponent == web3.eth.accounts[0] ? "You" : opponent,
        outcome: hasWon ? "You have won" : "You have lost"
    };

    $.get('templates/duelResultTemplate.html', function(template) {
        $('#duelResultModal').modal();
        var html = Mustache.to_html(template, duelResult);
        $('#duelResultModalBody').empty();
        $('#duelResultModalBody').append(html);

        if (hasWon) {
           $('#duelResultOutcome').removeClass('btn-danger');
           $('#duelResultOutcome').addClass('btn-success');
        } else {
           $('#duelResultOutcome').addClass('btn-danger');
           $('#duelResultOutcome').removeClass('btn-success');
        }
    });
}

function newCardWonHandler(err, result) {
    if (err) return showError("Event consuming failed: " + err);

    console.log(result);
    let owner = result.args['owner'];
    let cardId = result.args['cardId'];
    if (owner != web3.eth.accounts[0]) return;

    getCardData(cardId, function(cardData) {
        $.get('templates/newCardWonTemplate.html', function(template) {
            $('#newCardWonModal').modal();

            var html = Mustache.to_html(template, cardData);
            $('#newCardWonModalBody').empty();
            $('#newCardWonModalBody').append(html);
        });
    });
}

function playerRegisteredHandler(err, result) {
    if (err) return showError("Event consuming failed: " + err);

    console.log(result);
    let player = result.args['player'];
    if (player != web3.eth.accounts[0]) return;

    $.get('templates/registerSuccessfulTemplate.html', function(template) {
        $('#registerSuccessfulModal').modal();

        var html = Mustache.to_html(template, {});
        $('#registerSuccessfulModalBody').empty();
        $('#registerSuccessfulModalBody').append(html);
    });
}

function newCardSaleHandler(err, result) {
    if (err) return showError("Event consuming failed: " + err);

    console.log(result);
    let owner = result.args['owner'];
    let saleId = result.args['saleId'];
    if (owner != web3.eth.accounts[0]) return;

    getCardSaleData(saleId, function(cardSaleData) {
        $.get('templates/newCardSaleTemplate.html', function(template) {
            $('#newCardSaleModal').modal();

            var html = Mustache.to_html(template, cardSaleData);
            $('#newCardSaleModalBody').empty();
            $('#newCardSaleModalBody').append(html);
        });
    });
}

function cardSaleRemovedHandler(err, result) {
    if (err) return showError("Event consuming failed: " + err);

    console.log(result);
    let owner = result.args['owner'];
    let cardId = result.args['cardId'];
    if (owner != web3.eth.accounts[0]) return;

    getCardData(cardId, function(cardData) {
        $.get('templates/cardSaleRemovedTemplate.html', function(template) {
            $('#cardSaleRemovedModal').modal();

            var html = Mustache.to_html(template, cardData);
            $('#cardSaleRemovedModalBody').empty();
            $('#cardSaleRemovedModalBody').append(html);
        });
    });
}

function cardBoughtHandler(err, result) {
    if (err) return showError("Event consuming failed: " + err);

    console.log(result);
    let owner = result.args['owner'];
    let cardId = result.args['cardId'];
    if (owner != web3.eth.accounts[0]) return;

    getCardData(cardId, function(cardData) {
        $.get('templates/cardBoughtTemplate.html', function(template) {
            $('#cardBoughtModal').modal();

            var html = Mustache.to_html(template, cardData);
            $('#cardBoughtModalBody').empty();
            $('#cardBoughtModalBody').append(html);
        });
    });
}
