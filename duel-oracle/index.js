let newChallengeEvent = contract.NewChallenge();

newChallengeEvent.watch(function(err, result) {
    if (err) console.log("Smart contract error: " + err);

    let challenger = result.args['challenger'];
    let opponent = result.args['opponent'];
    console.log(challenger);
    console.log(opponent);
    let hasWon = parseInt(Math.random() * 100) < 50;

    // TODO: Remove hard coded winner. Here just for demo
    hasWon = true;

    let winner;
    if (hasWon) {
        winner = challenger;
    } else {
        winner = opponent;
    }

    contract.winsCountOf(winner, function(err, result) {
        if (err) console.log("Smart contract error: " + err);

        let winsCount = result.toNumber();
        console.log("Wins Count: " + winsCount);

        // TODO: Remove. Here just for demo
        // if (winsCount % 5 == 0 && winsCount != 0) {
        if (0 == 0) {
            contract.totalCardsCount(function(err, result) {
                if (err) console.log("Smart contract error: " + err);

                let cardsCnt = result.toNumber();
                let newCardId = (parseInt(Math.random() * 100) % (cardsCnt - 1)) + 1;
                contract.settleDuel(challenger, opponent, hasWon, newCardId, function(err, result) {
                    if (err) console.log("Smart contract error: " + err);

                    console.log("duel settled");
                });
            });
        } else {
            contract.settleDuel(challenger, opponent, hasWon, 0, function(err, result) {
                if (err) console.log("Smart contract error: " + err);

                console.log("duel settled");
            });
        }
    });
});
