pragma solidity ^0.4.18;

import './BlockyOhAccessControl.sol';
import './SafeMath.sol';

contract BlockyOhMarket is BlockyOhAccessControl {
    using SafeMath for uint256;
    using SafeMath for uint32;
    using SafeMath for uint16;

    struct CardSale {
        address owner;
        uint playerCardId;
        uint price;
    }

    event NewCardSale(address owner, uint saleId);
    event CardSaleRemoved(address owner, uint cardId);
    event CardBought(address owner, uint cardId);

    CardSale[] public cardSales;
    mapping(address => uint[]) salesByPlayer;
    mapping(address => mapping(uint => bool)) playerCardsOnSale;
    mapping(uint => uint) cardSaleToPlayerSale;

    function BlockyOhMarket() public {
        // genesis sale
        cardSales.push(CardSale(0, 0, 0));
    }

    function totalCardSalesCount() public view returns (uint) {
        return cardSales.length;
    }

    function getCardSale(uint saleId) public view returns (uint, address, uint, uint) {
        return (saleId, cardSales[saleId].owner, cardSales[saleId].playerCardId, cardSales[saleId].price);
    }

    function getSalesByPlayer(address player) public view returns (uint[]) {
        return salesByPlayer[player];
    }

    function getCardSaleOfCard(address player, uint playerCardId) public view returns (uint) {
        for (uint i = 0; i < salesByPlayer[player].length; i = i.add(1)) {
            uint currentSale = salesByPlayer[player][i];
            if (cardSales[currentSale].owner == player &&
                cardSales[currentSale].playerCardId == playerCardId) {

                return currentSale;
            }
        }

        return 0;
    }

    function setCardForSale(uint playerCardId, uint price) public userIsRegistered(msg.sender) {
        require(playerCardId < playerCards[msg.sender].length);
        require(playerCards[msg.sender][playerCardId] != 0);
        require(playerCardsOnSale[msg.sender][playerCardId] == false);

        cardSales.push(CardSale(msg.sender, playerCardId, price));
        uint saleId = cardSales.length.sub(1);

        salesByPlayer[msg.sender].push(saleId);
        playerCardsOnSale[msg.sender][playerCardId] = true;
        cardSaleToPlayerSale[saleId] = salesByPlayer[msg.sender].length.sub(1);

        NewCardSale(msg.sender, cardSales.length.sub(1));
    }

    function removeCardSale(uint saleId) public userIsRegistered(msg.sender) {
        require(saleId < cardSales.length);
        require(cardSales[saleId].owner == msg.sender);

        uint playerCardId = cardSales[saleId].playerCardId;
        uint cardId = playerCards[msg.sender][playerCardId];

        delete cardSales[saleId];
        delete salesByPlayer[msg.sender][cardSaleToPlayerSale[saleId]];
        playerCardsOnSale[msg.sender][playerCardId] = false;

        CardSaleRemoved(msg.sender, cardId);
    }

    function buyTradedCard(uint saleId) public payable userIsRegistered(msg.sender) {
        require(saleId < cardSales.length);
        require(cardSales[saleId].owner != address(0));
        require(cardSales[saleId].owner != msg.sender);
        require(cardSales[saleId].price == msg.value);

        address saleOwner = cardSales[saleId].owner;
        uint ownerCardId = cardSales[saleId].playerCardId;

        uint boughtCardId = playerCards[saleOwner][ownerCardId];
        playerCards[msg.sender].push(boughtCardId);

        delete playerCards[saleOwner][ownerCardId];
        delete salesByPlayer[saleOwner][cardSaleToPlayerSale[saleId]];
        delete cardSales[saleId];

        saleOwner.transfer(msg.value);

        CardBought(msg.sender, boughtCardId);
    }
}
