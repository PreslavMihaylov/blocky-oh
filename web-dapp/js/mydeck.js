function showMyDeck() {
    if (typeof web3 === 'undefined') {
        return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
    }

    let myAddress = web3.eth.accounts[0];
    if (!myAddress) return showError("Please log in to MetaMask");

    contract.isPlayerRegistered(myAddress, function(err, result) {
        if (err) return showError("Smart contract call failed: " + err);

        let isRegistered = result;
        console.log(isRegistered);
        if (isRegistered) {
            displayDeck(myAddress);
        } else {
            var registerData = {
                registerTitle:
                    "You aren't registered to Blocky-Oh yet. " +
                    "Register today to get your starting deck!"
            };

            $.get('templates/registerTemplate.html', function(template) {
                var html = Mustache.to_html(template, registerData);
                $('#my-deck').append(html);
            });
        }
    });
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
