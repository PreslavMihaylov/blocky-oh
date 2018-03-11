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

let lastDuelResultTxHash = 0;
function duelResultHandler(err, result) {
    if (err) return showError("Event consuming failed: ", err);
    console.log(result);

    let duelResultTxHash = result.transactionHash;
    if (duelResultTxHash == lastDuelResultTxHash) return;
    lastDuelResultTxHash = duelResultTxHash;

    let challenger = result.args['challenger'];
    let opponent = result.args['opponent'];
    let hasWon = result.args['hasWon'];
    if (challenger != web3.eth.accounts[0] && opponent != web3.eth.accounts[0]) {
        return;
    }

    let isWinner = (hasWon && challenger == web3.eth.accounts[0]) ||
                   (!hasWon && opponent == web3.eth.accounts[0]);

    let duelResult = {
        challenger: challenger == web3.eth.accounts[0] ? "You" : challenger,
        opponent: opponent == web3.eth.accounts[0] ? "You" : opponent,
        outcome: isWinner ? "You have won" : "You have lost"
    };

    $.get('templates/duelResultTemplate.html', function(template) {
        $('#duelResultModal').modal();
        var html = Mustache.to_html(template, duelResult);
        $('#duelResultModalBody').empty();
        $('#duelResultModalBody').append(html);

        if (isWinner) {
           $('#duelResultOutcome').removeClass('btn-danger');
           $('#duelResultOutcome').addClass('btn-success');
        } else {
           $('#duelResultOutcome').addClass('btn-danger');
           $('#duelResultOutcome').removeClass('btn-success');
        }
    });
}

let lastNewCardWonTxHash = 0;
function newCardWonHandler(err, result) {
    if (err) return showError("Event consuming failed: ", err);
    console.log(result);

    let newCardWonTxHash = result.transactionHash;
    if (newCardWonTxHash == lastNewCardWonTxHash) return;
    lastNewCardWonTxHash = newCardWonTxHash;

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

let lastPlayerRegisteredTxHash = 0;
function playerRegisteredHandler(err, result) {
    if (err) return showError("Event consuming failed: ", err);
    console.log(result);

    let playerRegisteredTxHash = result.transactionHash;
    if (playerRegisteredTxHash == lastPlayerRegisteredTxHash) return;
    lastPlayerRegisteredTxHash = playerRegisteredTxHash;

    let player = result.args['player'];
    if (player != web3.eth.accounts[0]) return;

    $.get('templates/registerSuccessfulTemplate.html', function(template) {
        $('#registerSuccessfulModal').modal();

        var html = Mustache.to_html(template, {});
        $('#registerSuccessfulModalBody').empty();
        $('#registerSuccessfulModalBody').append(html);
    });
}

let lastNewCardSaleTxHash = 0;
function newCardSaleHandler(err, result) {
    if (err) return showError("Event consuming failed: ", err);
    console.log(result);

    let newCardSaleTxHash = result.transactionHash;
    if (newCardSaleTxHash == lastNewCardSaleTxHash) return;
    lastNewCardSaleTxHash = newCardSaleTxHash;

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

let lastCardSaleRemovedTxHash = 0;
function cardSaleRemovedHandler(err, result) {
    if (err) return showError("Event consuming failed: ", err);
    console.log(result);

    let cardSaleRemovedTxHash = result.transactionHash;
    if (cardSaleRemovedTxHash == lastCardSaleRemovedTxHash) return;
    lastCardSaleRemovedTxHash = cardSaleRemovedTxHash;

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

let lastCardBoughtTxHash = 0;
function cardBoughtHandler(err, result) {
    if (err) return showError("Event consuming failed: ", err);
    console.log(result);

    let cardBoughtTxHash = result.transactionHash;
    if (cardBoughtTxHash == lastCardBoughtTxHash) return;
    lastCardBoughtTxHash = cardBoughtTxHash;

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
