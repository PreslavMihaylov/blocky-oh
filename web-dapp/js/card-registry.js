function showCardRegistry() {
    if (typeof web3 === 'undefined') {
        return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
    }

    let myAddress = web3.eth.accounts[0];
    if (!myAddress) return showError("Please log in to MetaMask");

    contract.totalCardsCount(function(err, result) {
        if (err) return showError("Smart contract call failed: " + err);
        let cardsCnt = result.toNumber();

        for (var i = 1; i < cardsCnt; i++) {
            getCardData(i, function(cardData) {
                $.get('templates/cardTemplate.html', function(template) {
                    var html = Mustache.to_html(template, cardData);
                    $('#cards').append(html);
                });
            });
        }
    });
}

function getCardData(cardId, callback) {
    contract.definedCards(cardId, function(err, result) {
        if (err) return showError("Smart contract call failed: " + err);
        var cardData = {
            name: result[0].toString(),
            attack: result[1].toNumber(),
            health: result[2].toNumber(),
            rarity: parseRarity(result[3].toNumber())
        };

        callback(cardData);
    });
}
