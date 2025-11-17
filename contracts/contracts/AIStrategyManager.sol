// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AIStrategyManager is Ownable {
    struct AIRecommendation {
        address targetToken;
        uint256 recommendedAPY;
        string strategyType; // "uniswap", "lending", "staking"
        bytes strategyData;
        uint256 timestamp;
    }

    mapping(address => AIRecommendation[]) public userRecommendations;

    event AIRecommendationGenerated(
        address indexed user,
        string strategyType,
        uint256 apy
    );

    constructor() Ownable(msg.sender) {}

    function addAIRecommendation(
        address user,
        address targetToken,
        uint256 apy,
        string memory strategyType,
        bytes memory strategyData
    ) external onlyOwner {
        userRecommendations[user].push(
            AIRecommendation({
                targetToken: targetToken,
                recommendedAPY: apy,
                strategyType: strategyType,
                strategyData: strategyData,
                timestamp: block.timestamp
            })
        );

        emit AIRecommendationGenerated(user, strategyType, apy);
    }

    function getUserRecommendations(
        address user
    ) external view returns (AIRecommendation[] memory) {
        return userRecommendations[user];
    }
}
