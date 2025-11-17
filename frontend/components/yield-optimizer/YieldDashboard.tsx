'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import StrategiesGrid from './StrategiesGrid';
import AIRecommendations from './AIRecommendations';
import UserPortfolio from './UserPortfolio';
import MarketAnalysisCard from './MarketAnalysis';

export default function YieldDashboard() {
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState<'strategies' | 'portfolio' | 'ai'>(
        'strategies'
    );

    if (!isConnected) {
        return (
            <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Connect Your Wallet
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Connect your wallet to start optimizing your DeFi yields with
                        AI-powered strategies.
                    </p>
                    <div className="bg-white rounded-xl p-8 shadow-lg">
                        <div className="text-6xl mb-4">🚀</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Get Started
                        </h3>
                        <p className="text-gray-600">
                            Click &quot;Connect Wallet&quot; in the top right to begin your AI yield optimization journey.

                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome to AI Yield Optimization! 👋
                </h2>
                <p className="text-gray-600">
                    Connected: <span className="font-mono text-sm">{address}</span>
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-4">
                {[
                    { key: 'strategies', label: '📊 Active Strategies' },
                    { key: 'ai', label: '🤖 AI Recommendations' },
                    { key: 'portfolio', label: '💰 My Portfolio' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === tab.key
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Market Analysis - Show on AI tab */}
            {activeTab === 'ai' && <MarketAnalysisCard />}

            {/* Tab Content */}
            <div className="min-h-96">
                {activeTab === 'strategies' && <StrategiesGrid />}
                {activeTab === 'ai' && <AIRecommendations />}
                {activeTab === 'portfolio' && <UserPortfolio />}
            </div>
        </div>
    );
}
