var BlockyOhCardFactory = artifacts.require("./BlockyOhCardFactory.sol");

contract('BlockyOhCardFactory', function(accounts) {
    let contract;
    let _owner = accounts[0];
    let _notOwner = accounts[1];
    let _oracle = accounts[2];

    let INITIAL_DECK_CNT = 6;

    describe("BlockyOhCardFactory", () => {
        beforeEach(async function() {
            contract = await BlockyOhCardFactory.new({
                from: _owner
            });
        });

        it("should create a genesis card when first created", async function() {
            let genesisCard = await contract.definedCards(0);

            assert.equal(web3.toAscii(genesisCard[0]).replace(/\0+/, ''), "");
            assert.equal(genesisCard[1].toNumber(), 0);
            assert.equal(genesisCard[2].toNumber(), 0);
            assert.equal(genesisCard[3].toNumber(), 3);
        });

        it("should create a starting deck when first created", async function() {
            let card1 = await contract.definedCards(1);
            let card2 = await contract.definedCards(2);
            let card3 = await contract.definedCards(3);
            let card4 = await contract.definedCards(4);
            let card5 = await contract.definedCards(5);

            assert.equal(web3.toAscii(card1[0]).replace(/\0+/, ''), "LameWarrior");
            assert.equal(web3.toAscii(card2[0]).replace(/\0+/, ''), "SemiLameWarrior");
            assert.equal(web3.toAscii(card3[0]).replace(/\0+/, ''), "AverageDestroyer");
            assert.equal(web3.toAscii(card4[0]).replace(/\0+/, ''), "CoolDestroyer");
            assert.equal(web3.toAscii(card5[0]).replace(/\0+/, ''), "TurtleGuy");
        });

        it("should return the corrent count of cards when contract is created", async function() {
            let result = await contract.totalCardsCount();
            assert.equal(result.toNumber(), 6);
        });

        it("should create card when the sender is the owner", async function() {
            let result = await contract.createCard("Card 1", 10, 5, 0, {from: _owner});
            let receipt = await contract.definedCards(INITIAL_DECK_CNT + 0);

            assert.equal(web3.toAscii(receipt[0]).replace(/\0+/, ''), "Card 1");
            assert.equal(receipt[1].toNumber(), 10);
            assert.equal(receipt[2].toNumber(), 5);
            assert.equal(receipt[3].toNumber(), 0);
        });

        it("should not be able to create cards if not owner", async function() {
            try {
                await contract.createCard("Card 2", 10, 5, 0, {from: _notOwner});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should revert transaction when rarity type is wrong", async function() {

            try {
                await contract.createCard("Card 1", 10, 5, 4, {from: _owner});
            } catch(err) {
                assert.isTrue(err.message.search('invalid opcode') >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });
    });
});
