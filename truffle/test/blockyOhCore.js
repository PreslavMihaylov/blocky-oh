var BlockyOh = artifacts.require("./BlockyOhCore.sol");

contract('BlockyOhCore', function(accounts) {
    console.log(accounts);
    let blocky;
    let _owner = accounts[0];
    let _notOwner = accounts[1];

    describe("Creating BlockyOh contract", () => {
        beforeEach(async function() {
            blocky = await BlockyOh.new({
                from: _owner
            });
        });
    
        it("should not be able to create cards if not owner", async function() {
            try {
                await blocky.createCard(10, 5, 0, {from: accounts[1]});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
            }
        });
    });
});
