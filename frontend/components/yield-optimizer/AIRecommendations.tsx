'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { aiService, type AIRecommendation } from '../../lib/api/aiService';
import { useYieldOptimizer } from '../../lib/hooks/useYieldOptimizer';
import { toast } from 'react-hot-toast';

export default function AIRecommendations() {
    const { address, isConnected } = useAccount();
    const { data: ethBalance } = useBalance({ address });
    const { createAIStrategy, deposit, isDepositPending, strategies } = useYieldOptimizer();
    
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Load initial recommendations when component mounts
    useEffect(() => {
        if (isConnected && address && ethBalance && !hasLoaded) {
            generateRecommendations();
            setHasLoaded(true);
        }
    }, [isConnected, address, ethBalance, hasLoaded]);

    const generateRecommendations = async () => {
        if (!address || !ethBalance) {
            toast.error('Please connect your wallet first');
            return;
        }

        setIsGenerating(true);
        
        try {
            toast.loading('🤖 Generating AI recommendations...', { id: 'ai-gen' });
            
            const response = await aiService.generateRecommendations(
                address,
                ethBalance.formatted,
                'Medium' // You could make this configurable
            );

            if (response.success) {
                setRecommendations(response.recommendations);
                toast.success(
                    `✨ ${response.recommendations.length} AI strategies generated! Source: ${response.metadata.aiSource}`, 
                    { id: 'ai-gen', duration: 4000 }
                );
            } else {
                throw new Error('Failed to generate recommendations');
            }
        } catch (error) {
            console.error('AI Recommendation Error:', error);
            toast.error(
                error instanceof Error ? error.message : 'Failed to generate AI recommendations', 
                { id: 'ai-gen' }
            );
            
            // Fallback to basic mock data
            setRecommendations([
                {
                    id: 1,
                    name: 'ETH Liquid Staking (Fallback)',
                    expectedAPY: '11.2%',
                    confidence: 85,
                    explanation: 'Backend unavailable. This is a fallback recommendation.',
                    recommendedAmount: ethBalance ? `${(parseFloat(ethBalance.formatted) * 0.5).toFixed(2)} ETH` : '1 ETH',
                    strategyType: 'staking',
                    riskLevel: 'Low',
                    estimatedGas: 'Low',
                    timeHorizon: 'Long-term'
                }
            ]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExecuteStrategy = async (recommendation: AIRecommendation) => {
        if (!address || !ethBalance) {
            toast.error('Please connect your wallet first');
            return;
        }

        try {
            toast.loading('🚀 Executing AI strategy...', { id: 'execute-strategy' });

            // Extract ETH amount from recommendation (e.g., "0.33 ETH" → "0.33")
            const amountMatch = recommendation.recommendedAmount.match(/([0-9.]+)\s*ETH/);
            if (!amountMatch) {
                throw new Error('Invalid recommended amount format');
            }
            const ethAmount = amountMatch[1];

            // Check if user has enough balance
            const requiredAmount = parseFloat(ethAmount);
            const userBalance = parseFloat(ethBalance.formatted);
            
            if (requiredAmount > userBalance) {
                throw new Error(`Insufficient balance. Need ${ethAmount} ETH, have ${userBalance.toFixed(4)} ETH`);
            }

            // First, create the strategy in the contract (if it doesn't exist)
            console.log('📝 Creating AI strategy in contract...');
            
            // Create strategy with a target token (using a placeholder address for now)
            const targetToken = "0x0000000000000000000000000000000000000000"; // ETH placeholder
            const apyBasisPoints = Math.floor(parseFloat(recommendation.expectedAPY.replace('%', '')) * 100); // Convert 4.2% to 420 basis points
            
            // Create strategy in backend first
            const createResponse = await fetch('http://localhost:3001/api/ai/create-strategy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: recommendation.name,
                    targetToken,
                    expectedAPY: apyBasisPoints,
                    description: recommendation.explanation
                })
            });
            
            if (!createResponse.ok) {
                throw new Error('Failed to create strategy in backend');
            }
            
            // Now create in smart contract
            await createAIStrategy(
                recommendation.name,
                targetToken,
                apyBasisPoints
            );

            // Find the strategy ID (it will be the latest one)
            const strategyId = strategies.length > 0 ? Math.max(...strategies.map(s => s.id)) + 1 : 1;

            console.log('💰 Depositing to strategy...', { strategyId, amount: ethAmount });

            // Execute the deposit
            await deposit(strategyId, ethAmount);

            toast.success(
                `✅ Strategy executed! Deposited ${ethAmount} ETH to "${recommendation.name}"`, 
                { id: 'execute-strategy', duration: 5000 }
            );

            // Refresh recommendations to show updated data
            setTimeout(() => {
                generateRecommendations();
            }, 2000);

        } catch (error: any) {
            console.error('Strategy execution error:', error);
            
            let errorMessage = 'Failed to execute strategy';
            if (error.message.includes('insufficient')) {
                errorMessage = error.message;
            } else if (error.message.includes('rejected')) {
                errorMessage = 'Transaction rejected by user';
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error - please try again';
            }

            toast.error(errorMessage, { id: 'execute-strategy' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            🤖 AI-Powered Yield Recommendations
                        </h3>
                        <p className="text-gray-600">
                            Personalized strategies based on your portfolio and market analysis
                        </p>
                    </div>
                    <button
                        onClick={generateRecommendations}
                        disabled={isGenerating || !isConnected}
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50"
                    >
                        {isGenerating ? '🔄 Analyzing...' : '✨ Generate New'}
                    </button>
                </div>
            </div>

            {/* Recommendations Grid */}
            {recommendations.length === 0 && !isGenerating ? (
                <div className="bg-white rounded-xl p-12 shadow-lg text-center">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Ready to Generate AI Recommendations
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Connect your wallet and click "Generate New" to get personalized yield strategies powered by AI.
                    </p>
                    {!isConnected && (
                        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                            Please connect your wallet to continue
                        </p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {recommendations.map((rec) => (
                        <div
                            key={rec.id}
                            className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-400"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">
                                    {rec.name}
                                </h4>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-600">
                                        {rec.expectedAPY}
                                    </div>
                                    <div className="text-sm text-gray-600">Expected APY</div>
                                </div>
                            </div>

                            {/* Risk and Strategy Info */}
                            <div className="flex gap-2 mb-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    rec.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                                    rec.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {rec.riskLevel} Risk
                                </span>
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                    {rec.strategyType}
                                </span>
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                    {rec.timeHorizon}
                                </span>
                            </div>

                            {/* Confidence Score */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">AI Confidence</span>
                                    <span className="text-sm font-semibold">{rec.confidence}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-purple-400 to-indigo-500 h-2 rounded-full transition-all"
                                        style={{ width: `${rec.confidence}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* AI Analysis */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">AI Analysis:</span> {rec.explanation}
                                </p>
                            </div>

                            {/* Recommendation Details */}
                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Recommended Amount:</span>
                                    <span className="font-medium">{rec.recommendedAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Estimated Gas:</span>
                                    <span className="font-medium">{rec.estimatedGas}</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button 
                                onClick={() => handleExecuteStrategy(rec)}
                                disabled={isGenerating}
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Execute Strategy
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
