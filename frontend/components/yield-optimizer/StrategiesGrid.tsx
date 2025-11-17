'use client';

import { useState } from 'react';
import { useYieldOptimizer } from '../../lib/hooks/useYieldOptimizer';
import { formatEther } from 'viem';
import { toast } from 'react-hot-toast';

export default function StrategiesGrid() {
    const { strategies, deposit, isDepositPending } = useYieldOptimizer();
    const [depositAmounts, setDepositAmounts] = useState<{ [key: number]: string }>({});

    const handleDeposit = async (strategyId: number) => {
        const amount = depositAmounts[strategyId];
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            toast.loading('Processing deposit...', { id: 'deposit' });
            await deposit(strategyId, amount);
            toast.success('Deposit successful!', { id: 'deposit' });
            setDepositAmounts(prev => ({ ...prev, [strategyId]: '' }));
        } catch (error) {
            toast.error('Deposit failed. Please try again.', { id: 'deposit' });
            console.error('Deposit error:', error);
        }
    };

    const handleAmountChange = (strategyId: number, value: string) => {
        setDepositAmounts(prev => ({ ...prev, [strategyId]: value }));
    };

    return (
        <div className="space-y-6">
            {/* Create Strategy Button (for testing) */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    📊 Available Yield Strategies
                </h3>
                <p className="text-gray-600">
                    {strategies.length > 0
                        ? `${strategies.length} active strategies available for investment`
                        : 'No strategies available yet. Create your first strategy below!'}
                </p>
            </div>

            {/* Strategies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {strategies.length > 0
                    ? strategies.map((strategy: any, index: number) => (
                        <div
                            key={strategy.id || index}
                            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {strategy.name || `Strategy #${strategy.id}`}
                                </h3>
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                    Active
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Expected APY</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {(Number(strategy.expectedAPY) / 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Deposited</span>
                                    <span className="font-semibold">
                                        {formatEther(strategy.totalDeposited)} ETH
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Target Token</span>
                                    <span className="font-mono text-xs">
                                        {strategy.targetToken?.slice(0, 6)}...{strategy.targetToken?.slice(-4)}
                                    </span>
                                </div>
                            </div>

                            {/* Deposit Section */}
                            <div className="space-y-3">
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Amount (ETH)"
                                    value={depositAmounts[strategy.id] || ''}
                                    onChange={(e) => handleAmountChange(strategy.id, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    onClick={() => handleDeposit(strategy.id)}
                                    disabled={isDepositPending || !depositAmounts[strategy.id]}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDepositPending ? '⏳ Depositing...' : 'Deposit ETH'}
                                </button>
                            </div>
                        </div>
                    ))
                    : (
                        // Placeholder when no strategies exist
                        <div className="col-span-full bg-white rounded-xl p-12 shadow-lg text-center">
                            <div className="text-6xl mb-4">🚀</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                No Strategies Available Yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Be the first to create a yield optimization strategy!
                                As the contract owner, you can add new strategies for users to invest in.
                            </p>
                            <div className="text-sm text-gray-500">
                                Contract: {process.env.NEXT_PUBLIC_YIELD_OPTIMIZER_CONTRACT}
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}
