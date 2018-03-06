function subscribeToBlockyOhEvents() {
    let duelResult = contract.DuelResult();
    let newCardWon = contract.NewCardWon();
    let playerRegistered = contract.PlayerRegistered();
    let newCardSale = contract.NewCardSale();

    duelResult.watch(duelResultHandler);
    newCardWon.watch(newCardWonHandler);
    playerRegistered.watch(playerRegisteredHandler);
    newCardSale.watch(newCardSaleHandler);
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

    contract.definedCards(cardId, function(err, result) {
        if (err) return showError("Smart contract call failed: " + err);
        let card = {
            name: result[0].toString(),
            attack: result[1].toNumber(),
            health: result[2].toNumber(),
            rarity: parseRarity(result[3].toNumber())
        };

        $.get('templates/newCardWonTemplate.html', function(template) {
            $('#newCardWonModal').modal();
            var html = Mustache.to_html(template, card);
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
