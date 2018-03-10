var BlockyOhDuel = artifacts.require("./BlockyOhDuel.sol");

contract('BlockyOhDuel', function(accounts) {
    let contract;
    let _owner = accounts[0];
    let _notOwner = accounts[1];
    let _oracle = accounts[2];

    describe("BlockyOhDuel", () => {
        beforeEach(async function() {
            contract = await BlockyOhDuel.new({
                from: _owner
            });
        });

        it("should not be able to challenge if neither of the players is registered", async function() {
            try {
                await contract.challenge(_notOwner, {from: _owner});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should not be able to challenge if player 1 is not registered", async function() {
            await contract.register({from: _notOwner});

            try {
                await contract.challenge(_notOwner, {from: _owner});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should not be able to challenge if player 2 is not registered", async function() {
            await contract.register({from: _owner});

            try {
                await contract.challenge(_notOwner, {from: _owner});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should not be able to challenge yourself", async function() {
            await contract.register({from: _owner});

            try {
                await contract.challenge(_owner, {from: _owner});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should be able to challenge successfully when conditions are met", async function() {
            await contract.register({from: _owner});
            await contract.register({from: _notOwner});

            await contract.challenge(_notOwner, {from: _owner});
            // no error is thrown
        });

        it("should successfully set duel oracle when owner", async function() {
            await contract.setDuelOracle(_oracle, {from: _owner});
            // no error is thrown
        });

        it("should not be able to set duel oracle when not owner", async function() {
            try {
                await contract.setDuelOracle(_oracle, {from: _notOwner});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should not be able to settle duel when oracle is not correct", async function() {
            try {
                await contract.settleDuel(_owner, _notOwner, true, 0);
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should increase challenger's wins count when he has won duel and not change opponent's wins count", async function() {
            let challenger = _owner;
            let opponent = _notOwner;

            let challengerWinsBeforeDuel = await contract.winsCountOf(challenger);
            let opponentWinsBeforeDuel = await contract.winsCountOf(opponent);

            await contract.setDuelOracle(_oracle, {from: _owner});
            await contract.settleDuel(challenger, opponent, true, 0, {from: _oracle});

            let challengerWinsAfterDuel = await contract.winsCountOf(challenger);
            let opponentWinsAfterDuel = await contract.winsCountOf(opponent);

            assert.equal(challengerWinsBeforeDuel.toNumber() + 1, challengerWinsAfterDuel.toNumber());
            assert.equal(opponentWinsBeforeDuel.toNumber(), opponentWinsAfterDuel.toNumber());
        });

        it("should increase opponent's wins count when he has won duel and not change challenger's wins count", async function() {
            let challenger = _owner;
            let opponent = _notOwner;

            let challengerWinsBeforeDuel = await contract.winsCountOf(challenger);
            let opponentWinsBeforeDuel = await contract.winsCountOf(opponent);

            await contract.setDuelOracle(_oracle, {from: _owner});
            await contract.settleDuel(challenger, opponent, false, 0, {from: _oracle});

            let challengerWinsAfterDuel = await contract.winsCountOf(challenger);
            let opponentWinsAfterDuel = await contract.winsCountOf(opponent);

            assert.equal(challengerWinsBeforeDuel.toNumber(), challengerWinsAfterDuel.toNumber());
            assert.equal(opponentWinsBeforeDuel.toNumber() + 1, opponentWinsAfterDuel.toNumber());
        });

        it("should not change player cards count when a new card is not won", async function() {
            let challenger = _owner;
            let opponent = _notOwner;

            let playerCardsBeforeDuel = await contract.getCardsOf(challenger);

            await contract.setDuelOracle(_oracle, {from: _owner});
            await contract.settleDuel(challenger, opponent, true, 0, {from: _oracle});

            let playerCardsAfterDuel = await contract.getCardsOf(challenger);

            assert.equal(playerCardsBeforeDuel.length, playerCardsAfterDuel.length);
        });

        it("should receive new card won from duel when challenger wins duel", async function() {
            let challenger = _owner;
            let opponent = _notOwner;
            let WON_CARD_ID = 1;

            let challengerCardsBeforeDuel = await contract.getCardsOf(challenger);
            let opponentCardsBeforeDuel = await contract.getCardsOf(opponent);

            await contract.setDuelOracle(_oracle, {from: _owner});
            await contract.settleDuel(challenger, opponent, true, WON_CARD_ID, {from: _oracle});

            let challengerCardsAfterDuel = await contract.getCardsOf(challenger);
            let opponentCardsAfterDuel = await contract.getCardsOf(opponent);

            let wonCardId = challengerCardsAfterDuel[challengerCardsAfterDuel.length - 1];

            assert.equal(challengerCardsBeforeDuel.length + 1, challengerCardsAfterDuel.length);
            assert.equal(wonCardId.toNumber(), WON_CARD_ID);

            assert.equal(opponentCardsBeforeDuel.length, opponentCardsAfterDuel.length);
        });

        it("should receive new card won from duel when opponent wins duel", async function() {
            let challenger = _owner;
            let opponent = _notOwner;
            let WON_CARD_ID = 1;

            let challengerCardsBeforeDuel = await contract.getCardsOf(challenger);
            let opponentCardsBeforeDuel = await contract.getCardsOf(opponent);

            await contract.setDuelOracle(_oracle, {from: _owner});
            await contract.settleDuel(challenger, opponent, false, WON_CARD_ID, {from: _oracle});

            let challengerCardsAfterDuel = await contract.getCardsOf(challenger);
            let opponentCardsAfterDuel = await contract.getCardsOf(opponent);

            let wonCardId = opponentCardsAfterDuel[opponentCardsAfterDuel.length - 1];

            assert.equal(challengerCardsBeforeDuel.length, challengerCardsAfterDuel.length);

            assert.equal(opponentCardsBeforeDuel.length + 1, opponentCardsAfterDuel.length);
            assert.equal(wonCardId.toNumber(), WON_CARD_ID);
        });
    });
});


