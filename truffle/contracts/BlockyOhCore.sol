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

    function register() public {
        require(playerCards[msg.sender].length == 0);

        playerCards[msg.sender] = getStartingDeck();
    }

    function getCardsOf(address owner) public view returns (uint[]) {
        return playerCards[owner];
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
    function challenge(address opponent) public bothPlayersRegistered(msg.sender, opponent) returns (bool) {
        uint result = rand(100);

        address winner;
        if (result < 50) {
            winner = msg.sender;
        } else {
            winner = opponent;
        }

        personWinsCount[winner]++;
        if (hasWonFiveTimes(winner)) {
            playerCards[winner].push(getRandomCard());
        }

        return winner == msg.sender;
    }

    function hasWonFiveTimes(address player) private view returns (bool) {
        return personWinsCount[player] % 5 == 0;
    }
}

contract BlockyOhMarket is BlockyOhDuel {
    uint constant SALE_PAGE_SIZE = 2;
    struct CardSale {
        address owner;
        uint cardId;
        uint price;
    }

    CardSale[] public sales;

    function BlockyOhMarket() public {
        // genesis sale
        sales.push(CardSale(0, 0, 0));
    }

    function setCardForSale(uint cardId, uint price) public returns (uint) {
        require(cardId != 0);
        require(playerCardCount(msg.sender, cardId) > countOfCardIdSoldByPlayer(msg.sender, cardId));

        sales.push(CardSale(msg.sender, cardId, price));

        return sales.length - 1;
    }

    function removeCardSale(uint saleId) public {
        require(saleId < sales.length);
        require(sales[saleId].owner == msg.sender);

        delete sales[saleId];
    }

    function buyTradedCard(uint saleId) public payable {
        require(saleId < sales.length);
        require(sales[saleId].owner != address(0));
        require(sales[saleId].owner != msg.sender);
        require(sales[saleId].price == msg.value);

        address saleOwner = sales[saleId].owner;
        uint boughtCard = sales[saleId].cardId;
        uint[] storage cards = playerCards[saleOwner];

        for (uint i = 0; i < cards.length; i++) {
            if (cards[i] == sales[saleId].cardId) {
                delete cards[i];
            }
        }

        playerCards[msg.sender].push(boughtCard);
        delete sales[saleId];

        saleOwner.transfer(msg.value);
    }

    function salesByPlayer(address player, uint page) public view returns (uint[SALE_PAGE_SIZE]) {
        uint[SALE_PAGE_SIZE] memory playerSales;
        uint salesCount = 0;
        uint playerSalesIndex = 0;

        for (uint saleIndex = 0; saleIndex < sales.length; saleIndex++) {
            if (sales[saleIndex].owner == player) {
                if (salesCount / 2 == page) {
                    playerSales[playerSalesIndex++] = saleIndex;
                }

                salesCount++;
            }

            if (playerSalesIndex == SALE_PAGE_SIZE) {
                break;
            }
        }

        return playerSales;
    }

    function countOfCardIdSoldByPlayer(address player, uint cardId) private view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < sales.length; i++) {
            if (sales[i].owner == player && sales[i].cardId == cardId) {
                count++;
            }
        }

        return count;
    }
}
