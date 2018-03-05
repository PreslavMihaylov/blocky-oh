const documentRegistryAddress = "0x345ca3e014aaf5dca488057592ee47305d9b3e10";
const documentRegistryContractABI =
[{"constant":true,"inputs":[{"name":"player","type":"address"},{"name":"playerCardId","type":"uint256"}],"name":"getCardSaleOfCard","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"cardSales","outputs":[{"name":"owner","type":"address"},{"name":"playerCardId","type":"uint256"},{"name":"price","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"definedCards","outputs":[{"name":"name","type":"string"},{"name":"attack","type":"uint8"},{"name":"health","type":"uint8"},{"name":"rarity","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"saleId","type":"uint256"}],"name":"getCardSale","outputs":[{"name":"","type":"uint256"},{"name":"","type":"address"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalCardSalesCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"getSalesByPlayer","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"playerCard","type":"uint256"}],"name":"getPlayerCardOf","outputs":[{"name":"","type":"string"},{"name":"","type":"uint8"},{"name":"","type":"uint8"},{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalCardsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"getCardsOf","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"player","type":"address"}],"name":"isPlayerRegistered","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"saleId","type":"uint256"}],"name":"buyTradedCard","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"playerCardId","type":"uint256"},{"name":"price","type":"uint256"}],"name":"setCardForSale","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"opponent","type":"address"}],"name":"challenge","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"name","type":"string"},{"name":"attack","type":"uint8"},{"name":"health","type":"uint8"},{"name":"rarity","type":"uint8"}],"name":"createCard","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"saleId","type":"uint256"}],"name":"removeCardSale","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"register","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];

let contract = web3.eth.contract(documentRegistryContractABI).at(documentRegistryAddress);

$(document).ready(function() {

    showView("viewHome");
    $('#linkHome').click(function () {
        showView("viewHome");
    });

    $('#linkRegistry').click(function () {
        showView("viewRegistry");
        $('#cards').empty();
        showAllCards();
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

function showAllCards() {
    if (typeof web3 === 'undefined') {
        return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
    }

    contract.totalCardsCount.call(function(err, result) {
        if (err) return showError("Smart contract call failed: " + err);
        let cardsCnt = result.toNumber();

        for (var i = 1; i < cardsCnt; i++) {
            contract.definedCards.call(i, function(err, result) {
                if (err) return showError("Smart contract call failed: " + err);
                var card = {
                    name: result[0].toString(),
                    attack: result[1].toNumber(),
                    health: result[2].toNumber(),
                    rarity: parseRarity(result[3].toNumber())
                };

                var template = $('#cardTemplate').html();
                var html = Mustache.to_html(template, card);
                $('#cards').append(html);
            });
        }
    });
}

function showMarketplace() {
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
            showAllCardSales(myAddress);
        } else {
            var registerData = {
                registerTitle:
                    "You aren't registered to Blocky-Oh yet. " +
                    "Register today to get your starting deck!"
            };

            template = $('#registerTemplate').html();
            var html = Mustache.to_html(template, registerData);
            $('#card-sales').append(html);
        }
    });
}

function showAllCardSales() {
    contract.totalCardSalesCount.call(function(err, result) {
        let cardSalesCnt = result.toNumber();

        for (var i = 1; i < cardSalesCnt; i++) {
            contract.getCardSale.call(i, function(err, result) {
                if (err) return showError("Smart contract call failed: " + err);
                var playerCardId = result[2].toNumber();
                var owner = result[1];
                if (owner == 0) return;

                var cardSale = {
                    owner: owner,
                    price: Number(weiToEth(result[3].toNumber())).toFixed(20).replace(/\.?0+$/,""),
                    saleId: result[0].toNumber()
                };

                if (owner == web3.eth.accounts[0]) {
                    cardSale['owner'] = "You";
                }

                contract.getPlayerCardOf.call(owner, playerCardId, function(err, result) {
                    if (err) return showError("Smart contract call failed: " + err);
                    cardSale['name'] = result[0].toString();
                    cardSale['attack'] = result[1].toNumber();
                    cardSale['health'] = result[2].toNumber();
                    cardSale['rarity'] = parseRarity(result[3].toNumber());

                    var template = $('#cardSaleTemplate').html();
                    var html = Mustache.to_html(template, cardSale);
                    $('#card-sales').append(html);
                });
            });
        }
    });
}

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

            template = $('#registerTemplate').html();
            var html = Mustache.to_html(template, registerData);
            $('#my-deck').append(html);
        }
    });
}

function registerPlayer() {
    if (typeof web3 === 'undefined') {
        return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
    }

    let myAddress = web3.eth.accounts[0];
    if (!myAddress) return showError("Please log in to MetaMask");

    contract.register(function(err, result) {
        if (err) return showError("Smart contract call failed: " + err);

        return showInfo("You have successfully registered to Blocky-Oh");
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
                        let template;

                        if (card['saleId'] == 0) {
                            template = $('#myCardNotSellingTemplate').html();
                        } else {
                            template = $('#myCardSellingTemplate').html();
                        }

                        var html = Mustache.to_html(template, card);
                        $('#my-deck').append(html);
                    });
                });
            }
        }
    });
}

function buyCard(saleId) {
    if (typeof web3 === 'undefined') {
        return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
    }

    contract.cardSales(saleId, function(err, result) {
        if (err) return showError("Smart contract call failed: " + err);
        console.log(result);
        if (result[0] == web3.eth.accounts[0]) {
            swal("You can't buy a card, which is put on sale by you");
            return;
        }

        contract.buyTradedCard(saleId, {value: 5}, function(err, result) {
             if (err) return showError("Smart contract call failed: " + err);
             showInfo("Successfully purchased Blocky Oh Card");
             //location.reload();
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

        contract.setCardForSale(playerCardId, ethToWei(price), function(err, result) {
            if (err) return showError("Smart contract call failed: " + err);
            showInfo("Card Sale publishing pending");
        });
    });
}

function removeCardSale(saleId) {
    if (typeof web3 === 'undefined') {
        return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
    }

    contract.removeCardSale(saleId, function(err, result) {
        if (err) showError("Call to smart contract failed: " + err);

        showInfo("Card successfully removed from sale");
    });
}

function JSPrompt(title, placeholder, callback) {
    swal({
        title: title,
        text: "",
        content: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: placeholder })
    .then(callback);
}

function parseRarity(rarity) {
    switch (rarity) {
        case 0:
            return "Common";
        case 1:
            return "Uncommon";
        case 2:
            return "Rare";
        case 3:
            return "Unique";
        default:
            return "Unknown";
    }
}

function weiToEth(wei) {
    return wei / 1000000000000000000;
}

function ethToWei(eth) {
    return eth * 1000000000000000000;
}

