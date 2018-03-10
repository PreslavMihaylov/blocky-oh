pragma solidity ^0.4.18;

import './Ownable.sol';

contract BlockyOhCardFactory is Ownable {
    enum Rarity { Common, Uncommon, Rare, Unique }
    struct Card {
        bytes32 name;
        uint8 attack;
        uint8 health;
        Rarity rarity;
    }

    Card[] public definedCards;
    mapping(address => uint[]) playerCards;

    function BlockyOhCardFactory() public {
        // genesis card
        definedCards.push(Card("", 0, 0, Rarity.Unique));

        // starting deck
        definedCards.push(Card("LameWarrior", 10, 1, Rarity.Common));
        definedCards.push(Card("SemiLameWarrior", 7, 3, Rarity.Common));
        definedCards.push(Card("AverageDestroyer", 14, 6, Rarity.Common));
        definedCards.push(Card("CoolDestroyer", 14, 10, Rarity.Common));
        definedCards.push(Card("TurtleGuy", 2, 15, Rarity.Common));
    }

    function getCardsOf(address owner) public view returns (uint[]) {
        return playerCards[owner];
    }

    function getPlayerCardOf(address owner, uint playerCard) public view returns (bytes32, uint8, uint8, Rarity) {
        Card storage card = definedCards[playerCards[owner][playerCard]];

        return (card.name, card.attack, card.health, card.rarity);
    }

    function totalCardsCount() public view returns (uint) {
        return definedCards.length;
    }

    function createCard(bytes32 name, uint8 attack, uint8 health, Rarity rarity) public onlyOwner {
        definedCards.push(Card(name, attack, health, rarity));
    }

    function setStartingDeck() internal {
        assert(playerCards[msg.sender].length == 0);

        playerCards[msg.sender].push(1);
        playerCards[msg.sender].push(2);
        playerCards[msg.sender].push(3);
        playerCards[msg.sender].push(4);
        playerCards[msg.sender].push(5);
    }
}
