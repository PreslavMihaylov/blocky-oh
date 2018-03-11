function validatePlayerRegistered(templateDivId, callback) {
    if (typeof web3 === 'undefined') {
        return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
    }

    let myAddress = web3.eth.accounts[0];
    if (!myAddress) return showError("Please log in to MetaMask");

    contract.isPlayerRegistered(myAddress, function(err, result) {
        if (err) return showError("Smart contract call failed: ", err);

        let isRegistered = result;
        console.log(isRegistered);

        if (!isRegistered) {
            var registerData = {
                registerTitle:
                    "You aren't registered to Blocky-Oh yet. " +
                    "Register today to get your starting deck!"
            };

            $.get('templates/registerTemplate.html', function(template) {
                var html = Mustache.to_html(template, registerData);
                $(templateDivId).append(html);
            });

            return;
        }

        callback();
    });
}

function registerPlayer() {
    if (typeof web3 === 'undefined') {
        return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
    }

    let myAddress = web3.eth.accounts[0];
    if (!myAddress) return showError("Please log in to MetaMask");

    contract.register(function(err, result) {
        if (err) return showError("Smart contract call failed: ", err);

        return showInfo("Blocky-Oh registration pending");
    });
}

