var BlockyOhAccessControl = artifacts.require("./BlockyOhAccessControl.sol");

contract('BlockyOhAccessControl', function(accounts) {
    let contract;
    let _owner = accounts[0];
    let _notOwner = accounts[1];

    let STARTING_DECK_CNT = 5;

    describe("BlockyOhAccessControl", () => {
        beforeEach(async function() {
            contract = await BlockyOhAccessControl.new({
                from: _owner
            });
        });

        it("should not register player implicitly", async function() {
            let isRegistered = await contract.isPlayerRegistered(_owner);

            assert.equal(isRegistered, false);
        });

        it("should return no player cards when player is not registered", async function() {
            let playerCards = await contract.getCardsOf(_owner);

            assert.equal(playerCards.length, 0);
        });

        it("should register player successfully when not registered previously", async function() {
            await contract.register({from: _owner});
            let isRegistered = await contract.isPlayerRegistered(_owner);
            let playerCards = await contract.getCardsOf(_owner);

            assert.equal(isRegistered, true);
            assert.equal(playerCards.length, STARTING_DECK_CNT);
        });

        it("should correctly select player card", async function() {
            await contract.register({from: _owner});
            let playerCards = await contract.getCardsOf(_owner);
            let expectedCard = await contract.definedCards(playerCards[0].toNumber());
            let actualCard = await contract.getPlayerCardOf(_owner, 0);

            assert.equal(web3.toAscii(expectedCard[0]), web3.toAscii(actualCard[1]));
        });

        it("should not register player twice", async function() {
            await contract.register({from: _owner});

            try {
                await contract.register({from: _owner});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });
    });
});

