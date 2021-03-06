function showMarketplace() {
    validatePlayerRegistered('#card-sales', showAllCardSales);
}

function showAllCardSales() {
    contract.totalCardSalesCount.call(function(err, result) {
        let cardSalesCnt = result.toNumber();

        for (var i = 1; i < cardSalesCnt; i++) {
            getCardSaleData(i, function(cardSaleData) {
                $.get('templates/cardSaleTemplate.html', function(template) {
                    var html = Mustache.to_html(template, cardSaleData);
                    $('#card-sales').append(html);
                });
            });
        }
    });
}

function getCardSaleData(saleId, callback) {
    contract.getCardSale.call(saleId, function(err, result) {
        if (err) return showError("Smart contract call failed: ", err);

        var playerCardId = result[2].toNumber();
        var owner = result[1];
        if (owner == 0) return;

        var cardSale = {
            owner: owner,
            price: web3.fromWei(result[3].toNumber(), "ether"),
            saleId: result[0].toNumber()
        };

        if (owner == web3.eth.accounts[0]) {
            cardSale['owner'] = "You";
        }

        contract.getPlayerCardOf.call(owner, playerCardId, function(err, result) {
            if (err) return showError("Smart contract call failed: ", err);

            cardSale['cardId'] = result[0].toNumber();
            cardSale['name'] = web3.toAscii(result[1]);
            cardSale['attack'] = result[2].toNumber();
            cardSale['health'] = result[3].toNumber();
            cardSale['rarity'] = parseRarity(result[4].toNumber());

            callback(cardSale);
        });
    });
}

function removeCardSale(saleId) {
    if (typeof web3 === 'undefined') {
        return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
    }

    contract.removeCardSale(saleId, function(err, result) {
        if (err) showError("Call to smart contract failed: ", err);

        showInfo("Removing card from sale pending...");
    });
}

function buyCard(saleId) {
    if (typeof web3 === 'undefined') {
        return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
    }

    contract.cardSales(saleId, function(err, result) {
        if (err) return showError("Smart contract call failed: ", err);

        console.log(result);
        if (result[0] == web3.eth.accounts[0]) {
            swal("You can't buy a card, which is put on sale by you");
            return;
        }

        let cardPrice = result[2].toNumber();
        contract.buyTradedCard(saleId, {value: cardPrice}, function(err, result) {
             if (err) return showError("Smart contract call failed: ", err);
             showInfo("Card purchase pending...");
        });
    });
}

function sellCard(playerCardId) {
    if (typeof web3 === 'undefined') {
        return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
    }

    JSPrompt("Please enter a price in ETH", "The price for the card in ETH", function(price) {
        if (price === false) return false;
        if (price === "") return false;

        contract.setCardForSale(playerCardId, web3.toWei(price, "ether"), function(err, result) {
            if (err) return showError("Smart contract call failed: ", err);
            showInfo("Card Sale publishing pending...");
        });
    });
}

