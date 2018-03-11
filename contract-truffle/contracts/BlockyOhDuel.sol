pragma solidity ^0.4.18;

import './BlockyOhMarket.sol';
import './SafeMath.sol';

contract BlockyOhDuel is BlockyOhMarket {
    using SafeMath for uint256;

    event NewChallenge(address challenger, address opponent);
    event DuelResult(address challenger, address opponent, bool hasWon);
    event NewCardWon(address owner, uint cardId);

    mapping(address => uint) personWinsCount;

    function challenge(address opponent) public bothPlayersRegistered(msg.sender, opponent) {
        require(msg.sender != opponent);

        NewChallenge(msg.sender, opponent);
    }

    function settleDuel(address challenger, address opponent, bool hasWon, uint wonCardId) public onlyDuelOracle {
        address winner;
        if (hasWon) {
            winner = challenger;
        } else {
            winner = opponent;
        }

        personWinsCount[winner] = personWinsCount[winner].add(1);
        if (wonCardId != 0) {
            playerCards[winner].push(wonCardId);

            NewCardWon(winner, wonCardId);
        }

        DuelResult(challenger, opponent, winner == challenger);
    }

    function winsCountOf(address player) public view returns (uint) {
        return personWinsCount[player];
    }
}

