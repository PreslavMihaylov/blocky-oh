function showMyDeck() {
    validatePlayerRegistered('#my-deck', displayDeck);
}

function displayDeck(myAddress) {
    contract.getCardsOf.call(myAddress, function(err, result) {
        if (err) return showError("Smart contract call failed: " + err);

        for (let i = 0; i < result.length; i++) {
            let cardId = result[i].toNumber();

            // used to preserve player card id in callback
            showMyCard(i, cardId);
            function showMyCard(playerCardId, cardId) {
                contract.definedCards.call(cardId, function(err, result) {
                    if (err) return showError("Smart contract call failed");
                    let card = {
                        name: result[0].toString(),
                        attack: result[1].toNumber(),
                        health: result[2].toNumber(),
                        rarity: parseRarity(result[3].toNumber()),
                        playerCardId: playerCardId
                    };

                    let owner = web3.eth.accounts[0];
                    contract.getCardSaleOfCard(owner, playerCardId, function(err, result) {
                        if (err) return showError("Smart contract call failed");
                        card['saleId'] = result.toNumber();
                        let templateLoc;

                        if (card['saleId'] == 0) {
                            templateLoc = 'templates/myCardNotSellingTemplate.html';
                        } else {
                            templateLoc = 'templates/myCardSellingTemplate.html';
                        }

                        $.get(templateLoc, function(template) {
                            var html = Mustache.to_html(template, card);
                            $('#my-deck').append(html);
                        });
                    });
                });
            }
        }
    });
}
