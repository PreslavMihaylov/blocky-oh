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

