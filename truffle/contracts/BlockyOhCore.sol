pragma solidity ^0.4.18;

/**
 * taken from https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/ownership/Ownable.sol
 */
contract Ownable {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function Ownable() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

contract CardFactory is Ownable {
    enum Rarity { Common, Uncommon, Rare, Unique }
    struct Card {
        string name;
        uint8 attack;
        uint8 health;
        Rarity rarity;
    }

    Card[] public definedCards;
    mapping(address => uint[]) playerCards;
    mapping(address => uint) personWinsCount;

    modifier bothPlayersRegistered(address player1, address player2) {
        require(playerCards[player1].length > 0);
        require(playerCards[player2].length > 0);
        _;
    }

    modifier userIsRegistered(address player) {
        require(playerCards[player].length > 0);
        _;
    }

    modifier userIsNotRegistered(address player) {
        require(playerCards[player].length == 0);
        _;
    }

    function CardFactory() public {
        // genesis card
        definedCards.push(Card("", 0, 0, Rarity.Unique));

        // starting deck
        definedCards.push(Card("LameWarrior", 10, 1, Rarity.Common));
        definedCards.push(Card("SemiLameWarrior", 7, 3, Rarity.Common));
        definedCards.push(Card("AverageDestroyer", 14, 6, Rarity.Common));
        definedCards.push(Card("CoolDestroyer", 14, 10, Rarity.Common));
        definedCards.push(Card("TurtleGuy", 2, 15, Rarity.Common));
    }

    function register() public userIsNotRegistered(msg.sender) {
        playerCards[msg.sender] = getStartingDeck();
    }

    function isPlayerRegistered(address player) public view returns (bool) {
        return playerCards[player].length > 0;
    }

    function getCardsOf(address owner) public view returns (uint[]) {
        return playerCards[owner];
    }

    function getPlayerCardOf(address owner, uint playerCard) public view returns (string, uint8, uint8, Rarity) {
        Card memory card = definedCards[playerCards[owner][playerCard]];

        return (card.name, card.attack, card.health, card.rarity);
    }

    function totalCardsCount() public view returns (uint) {
        return definedCards.length;
    }

    function createCard(string name, uint8 attack, uint8 health, Rarity rarity) public onlyOwner returns (uint) {
        definedCards.push(Card(name, attack, health, rarity));
        uint cardId = definedCards.length - 1;

        return cardId;
    }

    function getRandomCard() internal view returns (uint) {
        return rand(definedCards.length - 1) + 1;
    }

    function rand(uint max) internal view returns (uint) {
        uint seed = uint256(block.blockhash(block.number)) + uint256(now);

        return uint(keccak256(seed)) % max;
    }

    function playerCardCount(address player, uint cardId) internal view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < playerCards[player].length; i++) {
            if (playerCards[player][i] == cardId) {
                count++;
            }
        }

        return count;
    }

    function getStartingDeck() private pure returns (uint[5]) {
        uint[5] memory startingDeck;
        for (uint i = 1; i < 6; i++) {
            startingDeck[i - 1] = i;
        }

        return startingDeck;
    }
}

contract BlockyOhDuel is CardFactory {
    event DuelResult(address challenger, address opponent, bool hasWon);
    event NewCardWon(address owner, uint cardId);

    function challenge(address opponent) public bothPlayersRegistered(msg.sender, opponent) {
        require(msg.sender != opponent);
        uint result = rand(100);

        address winner;
        if (result < 50) {
            winner = msg.sender;
        } else {
            winner = opponent;
        }

        personWinsCount[winner]++;
        if (hasWonFiveTimes(winner)) {
            uint wonCardId = getRandomCard();
            playerCards[winner].push(wonCardId);

            NewCardWon(msg.sender, wonCardId);
        }

        DuelResult(msg.sender, opponent, winner == msg.sender);
    }

    function hasWonFiveTimes(address player) private view returns (bool) {
        return personWinsCount[player] % 5 == 0;
    }
}

contract BlockyOhMarket is BlockyOhDuel {
    uint constant SALE_PAGE_SIZE = 2;
    struct CardSale {
        address owner;
        uint playerCardId;
        uint price;
    }

    CardSale[] public cardSales;
    mapping(address => uint[]) salesByPlayer;

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

    function getSalesByPlayer(address owner) public view returns (uint[]) {
        return salesByPlayer[owner];
    }

    function getCardSaleOfCard(address player, uint playerCardId) public view returns (uint) {
        for (uint i = 0; i < salesByPlayer[player].length; i++) {
            uint currentSale = salesByPlayer[player][i];
            if (cardSales[currentSale].owner == player &&
                cardSales[currentSale].playerCardId == playerCardId) {

                return currentSale;
            }
        }

        return 0;
    }

    function setCardForSale(uint playerCardId, uint price) public returns (uint) {
        require(playerCardId < playerCards[msg.sender].length);
        require(playerCards[msg.sender][playerCardId] != 0);
        require(getCardSaleOfCard(msg.sender, playerCardId) == 0);

        cardSales.push(CardSale(msg.sender, playerCardId, price));
        salesByPlayer[msg.sender].push(cardSales.length - 1);

        return cardSales.length - 1;
    }

    function removeCardSale(uint saleId) public {
        require(saleId < cardSales.length);
        require(cardSales[saleId].owner == msg.sender);

        delete cardSales[saleId];
        for (uint i = 0; i < salesByPlayer[msg.sender].length; i++) {
            if (salesByPlayer[msg.sender][i] == saleId) {
                delete salesByPlayer[msg.sender][i];
                break;
            }
        }
    }

    function buyTradedCard(uint saleId) public payable {
        require(saleId < cardSales.length);
        require(cardSales[saleId].owner != address(0));
        require(cardSales[saleId].owner != msg.sender);
        require(cardSales[saleId].price == msg.value);
        require(isPlayerRegistered(msg.sender));

        address saleOwner = cardSales[saleId].owner;
        uint ownerCardId = cardSales[saleId].playerCardId;

        playerCards[msg.sender].push(playerCards[saleOwner][ownerCardId]);
        delete playerCards[saleOwner][ownerCardId];

        // delete sale from sale owner's sales struct
        for (uint i = 0; i < salesByPlayer[saleOwner].length; i++) {
            if (salesByPlayer[saleOwner][i] == saleId) {
                delete salesByPlayer[saleOwner][i];
                break;
            }
        }

        delete cardSales[saleId];
        saleOwner.transfer(msg.value);
    }
}
