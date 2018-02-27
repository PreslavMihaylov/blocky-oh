pragma solidity ^0.4.18;

contract BlockyOhCore {
    struct Card {
        uint8 attack;
        uint8 health;
    }
    
    enum Rarity { Common, Uncommon, Rare, Unique }

    address owner;
    Card[] public definedCards;

    uint[] public commonCards;
    uint[] public uncommonCards;
    uint[] public rareCards;
    uint[] public uniqueCards;

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    function BlockyOhCore() public {
        owner = msg.sender;   
    }

    function createCard(uint8 attack, uint8 health, Rarity rarity) public onlyOwner returns (uint) {
        definedCards.push(Card(attack, health));
        uint cardIndex = definedCards.length - 1;
        addCardByRarity(cardIndex, rarity);
        
        return cardIndex;
    }

    function addCardByRarity(uint cardIndex, Rarity rarity) private {
        if (rarity == Rarity.Common) {
            commonCards.push(cardIndex);
        } else if (rarity == Rarity.Uncommon) {
            uncommonCards.push(cardIndex);
        } else if (rarity == Rarity.Rare) {
            rareCards.push(cardIndex);
        } else if (rarity == Rarity.Unique) {
            uniqueCards.push(cardIndex);
        }
    }
}
