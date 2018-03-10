var BlockyOhMarket = artifacts.require("./BlockyOhMarket.sol");

contract('BlockyOhMarket', function(accounts) {
    let contract;
    let _owner = accounts[0];
    let _notOwner = accounts[1];

    describe("BlockyOhMarket", () => {
        beforeEach(async function() {
            contract = await BlockyOhMarket.new({
                from: _owner
            });
        });

        it("should create a genesis sale when first created", async function() {
            let genesisSale = await contract.getCardSale(0);

            assert.equal(genesisSale[0].toNumber(), 0);
        });

        it("should not contain any sales for new players", async function() {
            await contract.register({from: _owner});
            let playerSales = await contract.getSalesByPlayer(_owner);

            assert.equal(playerSales.length, 0);
        });

        it("should successfully post a card for sale when conditions are OK", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;

            await contract.register({from: _owner});
            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});

            let result = await contract.getCardSale(SALE_ID);
            let saleId = result[0].toNumber();
            let owner = result[1];
            let playerCardId = result[2].toNumber();
            let price = result[3].toNumber();

            assert.equal(saleId, SALE_ID);
            assert.equal(owner, _owner);
            assert.equal(playerCardId, PLAYER_CARD_FOR_SALE);
            assert.equal(price, CARD_PRICE);
        });

        it("should add a player sale after creating a new card sale", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;

            await contract.register({from: _owner});
            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
            let playerSales = await contract.getSalesByPlayer(_owner);

            assert.equal(playerSales[0].toNumber(), SALE_ID);
        });

        it("should correctly get card sale of card", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;

            await contract.register({from: _owner});
            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
            let cardSaleOfCard = await contract.getCardSaleOfCard(_owner, PLAYER_CARD_FOR_SALE);

            assert.equal(cardSaleOfCard.toNumber(), SALE_ID);
        });

        it("should not post a new card sale when the player card does not exist", async function() {
            await contract.register({from: _owner});

            try {
                await contract.setCardForSale(99, 99, {from: _owner});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should not post a new card sale when the player card is already on sale", async function() {
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;

            await contract.register({from: _owner});

            try {
                await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
                await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should successfully remove a card sale when conditions are met", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;
            let INVALID_ADDRESS = 0;

            await contract.register({from: _owner});
            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
            await contract.removeCardSale(SALE_ID, {from: _owner});

            let result = await contract.getCardSale(SALE_ID);
            let owner = result[1];

            assert.equal(owner, INVALID_ADDRESS);
        });

        it("should successfully remove player sale when card sale is removed", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;
            let INVALID_SALE = 0;

            await contract.register({from: _owner});
            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
            await contract.removeCardSale(SALE_ID, {from: _owner});

            let playerSales = await contract.getSalesByPlayer(_owner);
            let firstSale = playerSales[0].toNumber();

            assert.equal(firstSale, INVALID_SALE);
        });

        it("card sale of card should not be set after removing the sale", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;
            let INVALID_SALE = 0;

            await contract.register({from: _owner});
            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
            await contract.removeCardSale(SALE_ID, {from: _owner});

            let cardSale = await contract.getCardSaleOfCard(_owner, PLAYER_CARD_FOR_SALE);

            assert.equal(cardSale, INVALID_SALE);
        });

        it("should not remove a card sale which does not exist", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;

            await contract.register({from: _owner});

            try {
                await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
                await contract.removeCardSale(SALE_ID + 1, {from: _owner});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should not remove a card sale which is not owned by you", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;

            await contract.register({from: _owner});
            await contract.register({from: _notOwner});

            try {
                await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
                await contract.removeCardSale(SALE_ID, {from: _notOwner});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should be able to post a card sale after removing the initial sale of the card", async function() {
            let SALE_ID = 1;
            let NEW_SALE_ID = 2;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;

            await contract.register({from: _owner});
            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
            await contract.removeCardSale(SALE_ID, {from: _owner});
            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});

            let result = await contract.getCardSale(NEW_SALE_ID);
            let saleId = result[0].toNumber();
            let owner = result[1];
            let playerCardId = result[2].toNumber();
            let price = result[3].toNumber();

            assert.equal(saleId, NEW_SALE_ID);
            assert.equal(owner, _owner);
            assert.equal(playerCardId, PLAYER_CARD_FOR_SALE);
            assert.equal(price, CARD_PRICE);
        });

        it("should successfully buy traded card when conditions are met", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;

            await contract.register({from: _owner});
            await contract.register({from: _notOwner});

            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
            let expectedCard = await contract.getPlayerCardOf(_owner, PLAYER_CARD_FOR_SALE);

            await contract.buyTradedCard(SALE_ID, {from: _notOwner, value: CARD_PRICE});

            let playerCards = await contract.getCardsOf(_notOwner);
            let cardId = playerCards[playerCards.length - 1].toNumber();
            let actualCard = await contract.definedCards(cardId);

            assert.equal(web3.toAscii(expectedCard[0]), web3.toAscii(actualCard[0]));
        });

        it("should delete player card after a card is bought", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;
            let INVALID_CARD_ID = 0;

            await contract.register({from: _owner});
            await contract.register({from: _notOwner});

            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
            await contract.buyTradedCard(SALE_ID, {from: _notOwner, value: CARD_PRICE});

            let playerCards = await contract.getCardsOf(_owner);
            let soldCardId = playerCards[PLAYER_CARD_FOR_SALE];

            assert.equal(soldCardId, INVALID_CARD_ID);
        });

        it("should delete card sale after a card is bought", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;
            let INVALID_ADDRESS = 0;

            await contract.register({from: _owner});
            await contract.register({from: _notOwner});

            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
            await contract.buyTradedCard(SALE_ID, {from: _notOwner, value: CARD_PRICE});

            let sale = await contract.getCardSale(SALE_ID);
            let owner = sale[1];

            assert.equal(owner, INVALID_ADDRESS);
        });

        it("should delete player sale after a card is bought", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;
            let INVALID_SALE_ID = 0;

            await contract.register({from: _owner});
            await contract.register({from: _notOwner});

            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
            await contract.buyTradedCard(SALE_ID, {from: _notOwner, value: CARD_PRICE});

            let playerSales = await contract.getSalesByPlayer(_owner);
            let boughtSale = playerSales[playerSales.length - 1].toNumber();

            assert.equal(boughtSale, INVALID_SALE_ID);
        });

        it("should not be able to buy a card when not registered", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;

            await contract.register({from: _owner});
            //await contract.register({from: _notOwner});

            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});

            try {
                await contract.buyTradedCard(SALE_ID, {from: _notOwner, value: CARD_PRICE});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should not be able to buy a card sale which doesn't exist", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;

            await contract.register({from: _owner});
            await contract.register({from: _notOwner});

            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});

            try {
                await contract.buyTradedCard(SALE_ID + 1, {from: _notOwner, value: CARD_PRICE});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should not be able to buy a card sale with wrong price", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;

            await contract.register({from: _owner});
            await contract.register({from: _notOwner});

            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});

            try {
                await contract.buyTradedCard(SALE_ID, {from: _notOwner, value: CARD_PRICE + 5});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should not be able to buy your own card", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;

            await contract.register({from: _owner});

            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});

            try {
                await contract.buyTradedCard(SALE_ID, {from: _owner, value: CARD_PRICE});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });

        it("should not be able to buy a card which is already sold", async function() {
            let SALE_ID = 1;
            let PLAYER_CARD_FOR_SALE = 0;
            let CARD_PRICE = 10;

            await contract.register({from: _owner});
            await contract.register({from: _notOwner});

            await contract.setCardForSale(PLAYER_CARD_FOR_SALE, CARD_PRICE, {from: _owner});
            await contract.buyTradedCard(SALE_ID, {from: _notOwner, value: CARD_PRICE});

            try {
                await contract.buyTradedCard(SALE_ID, {from: _notOwner, value: CARD_PRICE});
            } catch(err) {
                assert.isTrue(err.message.search("revert") >= 0);
                return;
            }

            assert.fail("Expected error to occur but it didn't");
        });
    });
});

