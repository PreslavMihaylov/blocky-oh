var BlockyOh = artifacts.require("./BlockyOhCore.sol");

contract('BlockyOhCore', function(accounts) {
    console.log(accounts);
    let blocky;
    let _owner = accounts[0];
    let _notOwner = accounts[1];

    describe("BlockyOhCore", () => {
        beforeEach(async function() {
            blocky = await BlockyOh.new({
                from: _owner
            });
        });
    
        it("should create card when the sender is the owner", async function() {
            await blocky.createCard(10, 5, 0, {from: _owner});
            let receipt = await blocky.definedCards(0);
            
            assert.equal(receipt[0].toNumber(), 10);
            assert.equal(receipt[1].toNumber(), 5);
        });

        it("should not be able to create cards if not owner", async function() {
            try {
                await blocky.createCard(10, 5, 0, {from: _notOwner});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
            }
        });
    });
});
