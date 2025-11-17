import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const YieldOptimizerModule = buildModule("YieldOptimizer", (m) => {
    const yieldOptimizer = m.contract("YieldOptimizer");
    const aiStrategyManager = m.contract("AIStrategyManager");

    return { yieldOptimizer, aiStrategyManager };
});

export default YieldOptimizerModule;
