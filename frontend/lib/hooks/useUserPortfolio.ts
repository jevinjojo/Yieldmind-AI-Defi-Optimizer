import { useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import YieldOptimizerABI from '../contracts/YieldOptimizer.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_YIELD_OPTIMIZER_CONTRACT as `0x${string}`;

export function useUserPortfolio() {
    const { address } = useAccount();

    // Get user positions
    const { data: positions, refetch: refetchPositions } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: YieldOptimizerABI.abi,
        functionName: 'getUserPositions',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    // Format positions data
    const formattedPositions = positions
        ? (positions as any[]).map((position, index) => ({
            id: index,
            strategyId: Number(position.strategyId),
            amount: formatEther(position.amount),
            depositTime: new Date(Number(position.depositTime) * 1000),
            lastClaimTime: new Date(Number(position.lastClaimTime) * 1000),
        }))
        : [];

    return {
        positions: formattedPositions,
        refetchPositions,
    };
}
