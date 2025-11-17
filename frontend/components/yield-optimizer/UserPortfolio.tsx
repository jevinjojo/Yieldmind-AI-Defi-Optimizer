'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useUserPortfolio } from '../../lib/hooks/useUserPortfolio';
import { useYieldOptimizer } from '../../lib/hooks/useYieldOptimizer';

export default function UserPortfolio() {
    const { address } = useAccount();
    const { data: ethBalance } = useBalance({ address });
    const { positions, refetchPositions } = useUserPortfolio();
    const { strategies } = useYieldOptimizer();
    
    const [ethPrice, setEthPrice] = useState(3850); // Will fetch real price
    const [formattedPositions, setFormattedPositions] = useState<any[]>([]);

    // Fetch real ETH price for portfolio valuation
    useEffect(() => {
        const fetchEthPrice = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/ai/market-analysis');
                const data = await response.json();
                if (data.success && data.analysis.keyMetrics.ethPrice) {
                    const priceStr = data.analysis.keyMetrics.ethPrice.replace(/[$,]/g, '');
                    setEthPrice(parseFloat(priceStr));
                }
            } catch (error) {
                console.error('Failed to fetch ETH price:', error);
            }
        };
        
        fetchEthPrice();
        const interval = setInterval(fetchEthPrice, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Format positions with strategy names and values
    useEffect(() => {
        if (positions.length > 0 && strategies.length > 0) {
            const formatted = positions.map(position => {
                const strategy = strategies.find(s => s.id === position.strategyId);
                const ethAmount = parseFloat(position.amount);
                const currentValue = ethAmount * ethPrice;
                
                // Simple yield calculation (this would be more complex in real implementation)
                const daysSinceDeposit = Math.max(1, Math.floor((Date.now() - position.depositTime.getTime()) / (1000 * 60 * 60 * 24)));
                const apy = strategy ? (Number(strategy.expectedAPY) / 100) : 0.05;
                const dailyRate = apy / 365;
                const earnedAmount = ethAmount * dailyRate * daysSinceDeposit;
                const earnedValue = earnedAmount * ethPrice;

                return {
                    id: position.id,
                    strategy: strategy?.name || `Strategy #${position.strategyId}`,
                    amount: `${position.amount} ETH`,
                    value: `$${currentValue.toLocaleString()}`,
                    apy: strategy ? `${(Number(strategy.expectedAPY) / 100).toFixed(1)}%` : '5.0%',
                    earned: `+$${earnedValue.toFixed(0)}`,
                    status: 'Active',
                    strategyId: position.strategyId,
                    rawAmount: ethAmount,
                    rawValue: currentValue,
                    rawEarned: earnedValue
                };
            });
            setFormattedPositions(formatted);
        }
    }, [positions, strategies, ethPrice]);

    // Calculate portfolio totals from real positions
    const totalPortfolioValue = formattedPositions.length > 0 
        ? `$${formattedPositions.reduce((sum, pos) => sum + pos.rawValue + pos.rawEarned, 0).toLocaleString()}`
        : '$0';
    
    const totalEarned = formattedPositions.length > 0
        ? `+$${formattedPositions.reduce((sum, pos) => sum + pos.rawEarned, 0).toFixed(0)}`
        : '+$0';

    return (
        <div className="space-y-6">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm text-gray-600 mb-2">Total Portfolio Value</div>
                    <div className="text-3xl font-bold text-gray-900">{totalPortfolioValue}</div>
                    <div className="text-sm text-green-600 mt-1">{totalEarned} this week</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm text-gray-600 mb-2">Available Balance</div>
                    <div className="text-3xl font-bold text-gray-900">
                        {ethBalance ? `${parseFloat(ethBalance.formatted).toFixed(4)} ETH` : '0 ETH'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Ready to deploy</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="text-sm text-gray-600 mb-2">Active Positions</div>
                    <div className="text-3xl font-bold text-gray-900">{formattedPositions.length}</div>
                    <div className="text-sm text-green-600 mt-1">
                        {formattedPositions.length > 0 ? 'All performing' : 'No positions yet'}
                    </div>
                </div>
            </div>

            {/* Active Positions */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">💰 Active Positions</h3>

                <div className="space-y-4">
                    {formattedPositions.map((position) => (
                        <div
                            key={position.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{position.strategy}</h4>
                                <p className="text-sm text-gray-600">{position.amount}</p>
                            </div>

                            <div className="text-center mx-4">
                                <div className="text-lg font-bold text-gray-900">{position.value}</div>
                                <div className="text-sm text-gray-600">Current Value</div>
                            </div>

                            <div className="text-center mx-4">
                                <div className="text-lg font-bold text-green-600">{position.apy}</div>
                                <div className="text-sm text-gray-600">APY</div>
                            </div>

                            <div className="text-center mx-4">
                                <div className="text-lg font-bold text-green-600">{position.earned}</div>
                                <div className="text-sm text-gray-600">Earned</div>
                            </div>

                            <div className="flex space-x-2">
                                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                    Manage
                                </button>
                                <button className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors">
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {formattedPositions.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📈</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Positions</h3>
                        <p className="text-gray-600">Start by exploring our AI-recommended strategies!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
