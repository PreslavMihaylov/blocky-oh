const documentRegistryAddress = "0xd325bd3aaa6f1a1b1dd9976e8f810a3ef8650b43";
const documentRegistryContractABI =
[{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"getCardsOf","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalCardSalesCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"cardSales","outputs":[{"name":"owner","type":"address"},{"name":"cardId","type":"uint256"},{"name":"price","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"player","type":"address"},{"name":"page","type":"uint256"}],"name":"salesByPlayer","outputs":[{"name":"","type":"uint256[2]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"definedCards","outputs":[{"name":"name","type":"string"},{"name":"attack","type":"uint8"},{"name":"health","type":"uint8"},{"name":"rarity","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"saleId","type":"uint256"}],"name":"getCardSale","outputs":[{"name":"","type":"uint256"},{"name":"","type":"address"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalCardsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"saleId","type":"uint256"}],"name":"buyTradedCard","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"cardId","type":"uint256"},{"name":"price","type":"uint256"}],"name":"setCardForSale","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"opponent","type":"address"}],"name":"challenge","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"name","type":"string"},{"name":"attack","type":"uint8"},{"name":"health","type":"uint8"},{"name":"rarity","type":"uint8"}],"name":"createCard","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":false,"inputs":[{"name":"saleId","type":"uint256"}],"name":"removeCardSale","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"register","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];

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
        showAllCardSales();
    });

    $('#documentUploadButton').click(uploadDocument);
    $('#documentVerifyButton').click(verifyDocument);

    // Attach AJAX "loading" event listener
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

async function showAllCardSales() {
    if (typeof web3 === 'undefined') {
        return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
    }

    contract.totalCardSalesCount.call(async function(err, result) {
        let cardSalesCnt = result.toNumber();

        for (var i = 1; i < cardSalesCnt; i++) {
            contract.getCardSale.call(i, function(err, result) {
                if (err) return showError("Smart contract call failed: " + err);
                console.log(result);
                var cardId = result[2].toNumber();
                var cardSale = {
                    owner: result[1],
                    price: weiToEth(result[3].toNumber()),
                    saleId: result[0].toNumber()
                };

                contract.definedCards.call(cardId, function(err, result) {
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

function buyCard(saleId) {
    console.log(saleId);
    contract.buyTradedCard(saleId, {value: 5}, function(err, result) {
         if (err) return showError("Smart contract call failed: " + err);
         showInfo("Successfully purchased Blocky Oh Card");
         //location.reload();
    });
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

function uploadDocument() {
    if ($("#documentForUpload")[0].files.length == 0) {
        return showError("Please select a file to upload.");
    }

    let fileReader = new FileReader();
    fileReader.onload = function() {
        let documentHash = sha256(fileReader.result);
        if (typeof web3 === 'undefined') {
            return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
        }

        let contract = web3.eth.contract(documentRegistryContractABI).at(documentRegistryAddress);
        contract.add(documentHash, function(err, result, r1, r2, r3) {
             if (err) return showError("Smart contract call failed: " + err);
             showInfo(`Document ${documentHash} <b>successully added</b> to the registry.`);
        });
    }

    fileReader.readAsBinaryString($('#documentForUpload')[0].files[0]);
}

function verifyDocument() {
    if ($("#documentToVerify")[0].files.length == 0) {
        return showError("Please select a file to verify.");
    }

    let fileReader = new FileReader();
    fileReader.onload = function() {
        let documentHash = sha256(fileReader.result);
        if (typeof web3 === 'undefined') {
            return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
        }

        let contract = web3.eth.contract(documentRegistryContractABI).at(documentRegistryAddress);
        contract.verify(documentHash, function(err, result) {
             if (err) return showError("Smart contract call failed: " + err);
             let contractPublishDate = result.c;
             if (contractPublishDate > 0) {
                let displayDate = new Date(contractPublishDate * 1000).toLocaleString();
                showInfo(`Document ${documentHash} is <b>valid</b>, date published: ${displayDate}`);
             } else {
                showError(`Document ${documentHash} is <b>invalid</b>. Not found in registry`);
             }
        });
    }

    fileReader.readAsBinaryString($('#documentToVerify')[0].files[0]);
}

