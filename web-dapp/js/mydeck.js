function showMyDeck() {
    validatePlayerRegistered('#my-deck', displayDeck);
}

function displayDeck() {
    let myAddress = web3.eth.accounts[0];
    contract.getCardsOf.call(myAddress, function(err, result) {
        if (err) return showError("Smart contract call failed: ", err);

        for (let i = 0; i < result.length; i++) {
            let cardId = result[i].toNumber();
            if (cardId == 0) continue;

            // used to preserve player card id in callback
            showMyCard(i, cardId);
        }
    });
}

function showMyCard(playerCardId, cardId) {
    getCardData(cardId, function(cardData) {
        let owner = web3.eth.accounts[0];
        contract.getCardSaleOfCard(owner, playerCardId, function(err, result) {
            if (err) return showError("Smart contract call failed: ", err);
            cardData['saleId'] = result.toNumber();
            cardData['playerCardId'] = playerCardId;
            let templateLoc;

            if (cardData['saleId'] == 0) {
                templateLoc = 'templates/myCardNotSellingTemplate.html';
            } else {
                templateLoc = 'templates/myCardSellingTemplate.html';
            }

            $.get(templateLoc, function(template) {
                var html = Mustache.to_html(template, cardData);
                $('#my-deck').append(html);
            });
        });
    });
}
