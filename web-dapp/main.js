const documentRegistryAddress = "0x163b6a0e038aa3ccde5b617c5a6b968f21594c03";
const documentRegistryContractABI =
[{"constant":true,"inputs":[],"name":"totalCardsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"getCardsOf","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"definedCards","outputs":[{"name":"name","type":"string"},{"name":"attack","type":"uint8"},{"name":"health","type":"uint8"},{"name":"rarity","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"constant":false,"inputs":[{"name":"opponent","type":"address"}],"name":"challenge","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"name","type":"string"},{"name":"attack","type":"uint8"},{"name":"health","type":"uint8"},{"name":"rarity","type":"uint8"}],"name":"createCard","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"register","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];

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

    let contract = web3.eth.contract(documentRegistryContractABI).at(documentRegistryAddress);

    contract.totalCardsCount.call(function(err, result) {
        let cardsCnt = result.toNumber();

        for (var i = 1; i < cardsCnt; i++) {
            contract.definedCards.call(i, function(err, result) {
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
    });

    /*
    contract.definedCards.call(0, function(err, result) {
        var card = {
            attack: result[0].toNumber(),
            health: result[1].toNumber(),
            rarity: result[2].toNumber()
        };
        var template = $('#cardTemplate').html();
        var html = Mustache.to_html(template, card);
        $('#cards').append(html);

        console.log(result);
    });

    contract.definedCards.call(1, function(err, result) {
        var card = {
            attack: result[0].toNumber(),
            health: result[1].toNumber(),
            rarity: result[2].toNumber()
        };
        var template = $('#cardTemplate').html();
        var html = Mustache.to_html(template, card);
        $('#cards').append(html);

        console.log(result);
    });*/
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

