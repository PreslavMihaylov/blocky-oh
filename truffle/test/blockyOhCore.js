var BlockyOh = artifacts.require("./BlockyOhCore.sol");

contract('BlockyOhCore', function(accounts) {
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
            assert.equal(receipt[2].toNumber(), 0);
        });

        it("should not be able to create cards if not owner", async function() {
            try {
                await blocky.createCard(10, 5, 0, {from: _notOwner});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }
            
            assert.fail("Expected error to occur but it didn't");
        });
        
        it("should add new card to common cards when rarity is common", async function() {
            await blocky.createCard(10, 5, 0, {from: _owner});
            let receipt = await blocky.commonCards(0);
            
            assert.equal(receipt.toNumber(), 0);
        });
        
        it("should add new card to uncommon cards when rarity is uncommon", async function() {
            await blocky.createCard(10, 5, 1, {from: _owner});
            let receipt = await blocky.uncommonCards(0);
            
            assert.equal(receipt.toNumber(), 0);
        });
        
        it("should add new card to rare cards when rarity is rare", async function() {
            await blocky.createCard(10, 5, 2, {from: _owner});
            let receipt = await blocky.rareCards(0);
            
            assert.equal(receipt.toNumber(), 0);
        });
        
        it("should add new card to unique cards when rarity is unique", async function() {
            await blocky.createCard(10, 5, 3, {from: _owner});
            let receipt = await blocky.uniqueCards(0);
            
            assert.equal(receipt.toNumber(), 0);
        });
        
        it("should revert transaction when rarity type is wrong", async function() {
            
            try {
                await blocky.createCard(10, 5, 4, {from: _owner});
            } catch(err) {
                assert.isTrue(err.message.search('invalid opcode') >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });
    });
});
