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

    function register() public {
        playerCards[msg.sender] = getStartingDeck();
    }

    function getCardsOf(address owner) public view returns (uint[]) {
        return playerCards[owner];
    }

    function createCard(string name, uint8 attack, uint8 health, Rarity rarity) public onlyOwner returns (uint) {
        definedCards.push(Card(name, attack, health, rarity));
        uint cardIndex = definedCards.length - 1;

        return cardIndex;
    }

    function getRandomCard() internal view returns (uint) {
        return rand(definedCards.length);
    }

    function rand(uint max) internal view returns (uint) {
        uint seed = uint256(block.blockhash(block.number)) + uint256(now);

        return uint(keccak256(seed)) % max;
    }

    function getStartingDeck() private pure returns (uint[5]) {
        uint[5] memory startingDeck;
        for (uint i = 0; i < 5; i++) {
            startingDeck[i] = i;
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
