import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import YieldOptimizerABI from '../contracts/YieldOptimizer.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_YIELD_OPTIMIZER_CONTRACT as `0x${string}`;

export function useYieldOptimizer() {
    // Read active strategies
    const { data: strategies, refetch: refetchStrategies } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: YieldOptimizerABI.abi,
        functionName: 'getActiveStrategies',
    });

    // Write functions
    const { writeContract: depositToStrategy, data: depositHash } = useWriteContract();
    const { writeContract: createStrategy, data: createHash } = useWriteContract();

    // Wait for transactions
    const { isLoading: isDepositPending } = useWaitForTransactionReceipt({
        hash: depositHash,
    });

    // Deposit to strategy function
    const deposit = async (strategyId: number, amount: string) => {
        try {
            await depositToStrategy({
                address: CONTRACT_ADDRESS,
                abi: YieldOptimizerABI.abi,
                functionName: 'depositToStrategy',
                args: [BigInt(strategyId)],
                value: parseEther(amount),
            });
        } catch (error) {
            console.error('Deposit failed:', error);
            throw error;
        }
    };

    // Create AI strategy function (owner only)
    const createAIStrategy = async (name: string, targetToken: string, expectedAPY: number) => {
        try {
            await createStrategy({
                address: CONTRACT_ADDRESS,
                abi: YieldOptimizerABI.abi,
                functionName: 'createAIStrategy',
                args: [name, targetToken as `0x${string}`, BigInt(expectedAPY)],
            });
        } catch (error) {
            console.error('Create strategy failed:', error);
            throw error;
        }
    };

    return {
        strategies: (strategies as any[]) || [],
        deposit,
        createAIStrategy,
        isDepositPending,
        refetchStrategies,
    };
}
