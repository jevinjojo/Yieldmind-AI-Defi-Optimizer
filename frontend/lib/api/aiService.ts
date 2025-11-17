import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'http://localhost:3001/api/ai';

export interface AIRecommendation {
    id: number;
    name: string;
    expectedAPY: string;
    riskLevel: string;
    confidence: number;
    explanation: string;
    recommendedAmount: string;
    strategyType: string;
    estimatedGas: string;
    timeHorizon: string;
}

export interface AIRecommendationResponse {
    success: boolean;
    recommendations: AIRecommendation[];
    metadata: {
        timestamp: string;
        walletAnalyzed: string;
        totalBalance: string;
        riskProfile: string;
        aiSource: string;
    };
}

export interface MarketAnalysis {
    marketTrend: string;
    bestSectors: string[];
    avgDeFiAPY: string;
    riskAssessment: string;
    gasConditions: string;
    recommendation: string;
    confidence: number;
    lastUpdated: string;
    keyMetrics: {
        ethPrice: string;
        totalValueLocked: string;
        dominanceIndex: string;
    };
}

export interface MarketAnalysisResponse {
    success: boolean;
    analysis: MarketAnalysis;
    timestamp: string;
}

class AIService {
    private async makeRequest<T>(endpoint: string, data?: any): Promise<T> {
        try {
            const config = {
                timeout: 30000, // 30 seconds timeout
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = data 
                ? await axios.post(`${API_BASE_URL}${endpoint}`, data, config)
                : await axios.get(`${API_BASE_URL}${endpoint}`, config);

            return response.data;
        } catch (error) {
            console.error(`AI Service Error (${endpoint}):`, error);
            
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.error || error.message;
                throw new Error(`AI Service: ${message}`);
            }
            
            throw new Error('AI Service: Unknown error occurred');
        }
    }

    async generateRecommendations(
        walletAddress: string,
        portfolioBalance: string,
        riskTolerance: 'Low' | 'Medium' | 'High' = 'Medium'
    ): Promise<AIRecommendationResponse> {
        return this.makeRequest<AIRecommendationResponse>('/generate-recommendations', {
            walletAddress,
            portfolioBalance,
            riskTolerance,
        });
    }

    async getMarketAnalysis(): Promise<MarketAnalysisResponse> {
        return this.makeRequest<MarketAnalysisResponse>('/market-analysis');
    }

    async checkHealth(): Promise<{ status: string; openaiConnected: boolean; timestamp: string }> {
        return this.makeRequest('/health');
    }
}

export const aiService = new AIService();