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

    function totalCardsCount() public view returns (uint) {
        return definedCards.length;
    }

    function createCard(bytes32 name, uint8 attack, uint8 health, Rarity rarity) public onlyOwner {
        definedCards.push(Card(name, attack, health, rarity));
    }
}
