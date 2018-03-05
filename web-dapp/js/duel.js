function performDuel() {
    if (typeof web3 === 'undefined') {
        return showError("Please install MetaMask to access the Ethereum Web3 API from your browser.");
    }

    JSPrompt("Enter the address of your opponent", "Opponent name", function(opponent) {
        if (!opponent) return showError("Invalid opponent. Try again");

        contract.isPlayerRegistered(opponent, function(err, result) {
            if (err) return showError("Smart contract call failed: " + err);

            let isOpponentRegistered = result;
            if (!isOpponentRegistered) {
                return showError("Opponent is not registered in the Blocky Oh smart contract");
            }

            contract.challenge(opponent, function(err, result) {
                if (err) return showError("Smart contract call failed: " + err);
                // Result is read by consuming DuelResult event
            });
        });
    });
}

