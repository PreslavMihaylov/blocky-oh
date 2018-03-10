pragma solidity ^0.4.18;

import './BlockyOhCardFactory.sol';

contract BlockyOhAccessControl is BlockyOhCardFactory {
    event PlayerRegistered(address player);

    mapping(address => uint[]) playerCards;
    address duelOracle = 0;

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

    modifier onlyDuelOracle() {
        require(msg.sender == duelOracle);
        _;
    }

    function isPlayerRegistered(address player) public view returns (bool) {
        return playerCards[player].length > 0;
    }

    function getCardsOf(address owner) public view returns (uint[]) {
        return playerCards[owner];
    }

    function getPlayerCardOf(address owner, uint playerCard) public view returns (bytes32, uint8, uint8, Rarity) {
        Card storage card = definedCards[playerCards[owner][playerCard]];

        return (card.name, card.attack, card.health, card.rarity);
    }

    function register() public userIsNotRegistered(msg.sender) {
        setStartingDeck();

        PlayerRegistered(msg.sender);
    }

    function setDuelOracle(address _duelOracle) public onlyOwner {
        duelOracle = _duelOracle;
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

