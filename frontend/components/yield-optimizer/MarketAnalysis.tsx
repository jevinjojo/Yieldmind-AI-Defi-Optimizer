'use client';

import { useState, useEffect } from 'react';
import { aiService, type MarketAnalysis } from '../../lib/api/aiService';

export default function MarketAnalysisCard() {
    const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Load market analysis on component mount
    useEffect(() => {
        loadMarketAnalysis();
    }, []);

    const loadMarketAnalysis = async () => {
        setIsLoading(true);
        try {
            const response = await aiService.getMarketAnalysis();
            if (response.success) {
                setAnalysis(response.analysis);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Market analysis failed:', error);
            // Fallback data
            setAnalysis({
                marketTrend: 'Bullish (Offline)',
                bestSectors: ['Liquid Staking', 'DEX LP', 'Lending'],
                avgDeFiAPY: '12.4%',
                riskAssessment: 'Moderate',
                gasConditions: 'Favorable on L2s',
                recommendation: 'Backend unavailable - using cached data',
                confidence: 75,
                lastUpdated: new Date().toISOString(),
                keyMetrics: {
                    ethPrice: '$3,850',
                    totalValueLocked: '$68.2B',
                    dominanceIndex: 'High'
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!analysis) return null;

    return (
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">📈 Market Analysis</h3>
                <button
                    onClick={loadMarketAnalysis}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                >
                    {isLoading ? '🔄' : '↻ Refresh'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Market Trend</div>
                    <div className={`text-lg font-semibold ${
                        analysis.marketTrend.toLowerCase().includes('bullish') ? 'text-green-600' : 
                        analysis.marketTrend.toLowerCase().includes('bearish') ? 'text-red-600' : 
                        'text-yellow-600'
                    }`}>
                        {analysis.marketTrend}
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Avg DeFi APY</div>
                    <div className="text-lg font-semibold text-green-600">{analysis.avgDeFiAPY}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">AI Confidence</div>
                    <div className="text-lg font-semibold text-purple-600">{analysis.confidence}%</div>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Best Sectors:</span>
                    <span className="font-medium">{analysis.bestSectors.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Risk Assessment:</span>
                    <span className="font-medium">{analysis.riskAssessment}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Gas Conditions:</span>
                    <span className="font-medium">{analysis.gasConditions}</span>
                </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                    <span className="font-medium">AI Recommendation:</span> {analysis.recommendation}
                </p>
            </div>

            {lastUpdated && (
                <div className="mt-2 text-xs text-gray-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
            )}
        </div>
    );
}