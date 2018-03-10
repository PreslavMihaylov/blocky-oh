pragma solidity ^0.4.18;

import './BlockyOhCardFactory.sol';

contract BlockyOhAccessControl is BlockyOhCardFactory {
    event PlayerRegistered(address player);

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

    function register() public userIsNotRegistered(msg.sender) {
        setStartingDeck();

        PlayerRegistered(msg.sender);
    }

    function setDuelOracle(address _duelOracle) public onlyOwner {
        duelOracle = _duelOracle;
    }
}

