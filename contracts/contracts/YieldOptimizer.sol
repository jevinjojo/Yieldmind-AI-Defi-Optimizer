// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract YieldOptimizer is Ownable, ReentrancyGuard {
    struct Strategy {
        uint256 id;
        string name;
        address targetToken;
        uint256 expectedAPY;
        uint256 totalDeposited;
        bool isActive;
    }

    struct UserPosition {
        uint256 strategyId;
        uint256 amount;
        uint256 depositTime;
        uint256 lastClaimTime;
    }

    mapping(address => UserPosition[]) public userPositions;
    mapping(uint256 => Strategy) public strategies;
    uint256 public strategyCounter;

    // Uniswap V3 addresses (Sepolia)
    address public constant UNISWAP_V3_ROUTER =
        0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E;
    address public constant UNISWAP_V3_QUOTER =
        0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3;

    event StrategyCreated(
        uint256 indexed strategyId,
        string name,
        uint256 expectedAPY
    );
    event PositionOpened(
        address indexed user,
        uint256 indexed strategyId,
        uint256 amount
    );
    event PositionClosed(
        address indexed user,
        uint256 indexed strategyId,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {}

    function createAIStrategy(
        string memory _name,
        address _targetToken,
        uint256 _expectedAPY
    ) external onlyOwner returns (uint256) {
        strategyCounter++;

        strategies[strategyCounter] = Strategy({
            id: strategyCounter,
            name: _name,
            targetToken: _targetToken,
            expectedAPY: _expectedAPY,
            totalDeposited: 0,
            isActive: true
        });

        emit StrategyCreated(strategyCounter, _name, _expectedAPY);
        return strategyCounter;
    }

    function depositToStrategy(
        uint256 _strategyId
    ) external payable nonReentrant {
        require(strategies[_strategyId].isActive, "Strategy not active");
        require(msg.value > 0, "Must deposit something");

        userPositions[msg.sender].push(
            UserPosition({
                strategyId: _strategyId,
                amount: msg.value,
                depositTime: block.timestamp,
                lastClaimTime: block.timestamp
            })
        );

        strategies[_strategyId].totalDeposited += msg.value;

        emit PositionOpened(msg.sender, _strategyId, msg.value);
    }

    function getUserPositions(
        address user
    ) external view returns (UserPosition[] memory) {
        return userPositions[user];
    }

    function getActiveStrategies() external view returns (Strategy[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= strategyCounter; i++) {
            if (strategies[i].isActive) activeCount++;
        }

        Strategy[] memory activeStrategies = new Strategy[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= strategyCounter; i++) {
            if (strategies[i].isActive) {
                activeStrategies[index] = strategies[i];
                index++;
            }
        }
        return activeStrategies;
    }
}
