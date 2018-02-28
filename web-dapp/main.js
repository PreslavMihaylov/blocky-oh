const documentRegistryAddress = "0x9fbda871d559710256a2502a2517b794b482db40";
const documentRegistryContractABI =
[{"constant":true,"inputs":[{"name":"hash","type":"string"}],"name":"verify","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"hash","type":"string"}],"name":"add","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

$(document).ready(function() {

    showView("viewHome");
    $('#linkHome').click(function () {
        showView("viewHome")
    });

    $('#linkMarketplace').click(function () {
        showView("viewMarketplace")
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

