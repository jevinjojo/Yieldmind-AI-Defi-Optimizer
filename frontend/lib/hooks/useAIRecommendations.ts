import { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { aiService, type AIRecommendation } from '../api/aiService';

export function useAIRecommendations() {
    const { address } = useAccount();
    const { data: ethBalance } = useBalance({ address });
    
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateRecommendations = async (riskTolerance: 'Low' | 'Medium' | 'High' = 'Medium') => {
        if (!address || !ethBalance) {
            throw new Error('Wallet not connected');
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await aiService.generateRecommendations(
                address,
                ethBalance.formatted,
                riskTolerance
            );

            if (response.success) {
                setRecommendations(response.recommendations);
                return response;
            } else {
                throw new Error('Failed to generate recommendations');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            
            // Fallback recommendations
            const fallbackRec: AIRecommendation = {
                id: 1,
                name: 'ETH Liquid Staking (Fallback)',
                expectedAPY: '11.2%',
                confidence: 85,
                explanation: 'Backend unavailable. This is a fallback recommendation for liquid staking.',
                recommendedAmount: ethBalance ? `${(parseFloat(ethBalance.formatted) * 0.5).toFixed(2)} ETH` : '1 ETH',
                strategyType: 'staking',
                riskLevel: 'Low',
                estimatedGas: 'Low',
                timeHorizon: 'Long-term'
            };
            
            setRecommendations([fallbackRec]);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const clearRecommendations = () => {
        setRecommendations([]);
        setError(null);
    };

    return {
        recommendations,
        isLoading,
        error,
        generateRecommendations,
        clearRecommendations,
    };
}