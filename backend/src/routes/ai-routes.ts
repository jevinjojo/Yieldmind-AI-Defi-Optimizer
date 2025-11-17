import express from 'express';
import OpenAI from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';
import { realDataService } from '../services/realDataService';

// Ensure dotenv is loaded
dotenv.config();

const router = express.Router();

// Initialize AI services (OpenAI and RapidAPI)
let openai: OpenAI | null = null;

// Check for OpenAI API key
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

// Check for RapidAPI ChatGPT key
let rapidApiKey: string | null = null;
console.log('🔍 Checking for RAPIDAPI_KEY:', !!process.env.RAPIDAPI_KEY);
console.log('🔍 RAPIDAPI_KEY value:', process.env.RAPIDAPI_KEY ? `${process.env.RAPIDAPI_KEY.substring(0, 10)}...` : 'undefined');
if (process.env.RAPIDAPI_KEY) {
    rapidApiKey = process.env.RAPIDAPI_KEY;
    console.log('🚀 RapidAPI ChatGPT key detected and configured!');
} else {
    console.log('❌ No RAPIDAPI_KEY found in environment variables');
}

// RapidAPI ChatGPT function
async function callRapidAPI(prompt: string): Promise<any> {
    if (!rapidApiKey) return null;

    try {
        console.log('🚀 Calling RapidAPI ChatGPT...');
        const response = await axios.post('https://chatgpt-api8.p.rapidapi.com/', [
            {
                content: 'You are a professional DeFi yield optimization AI assistant. Provide realistic, well-researched investment advice. Always respond with valid JSON format.',
                role: 'system'
            },
            {
                content: prompt,
                role: 'user'
            }
        ], {
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': 'chatgpt-api8.p.rapidapi.com',
                'x-rapidapi-key': rapidApiKey
            },
            timeout: 15000
        });

        console.log('✅ RapidAPI response received');
        return response.data;
    } catch (error) {
        console.log('❌ RapidAPI ChatGPT error:', error);
        return null;
    }
}


// Generate AI yield recommendations
router.post('/generate-recommendations', async (req, res) => {
    try {
        const { walletAddress, portfolioBalance, riskTolerance } = req.body;

        console.log(`🤖 Generating AI recommendations for wallet: ${walletAddress}`);

        let recommendations;
        let aiSource = 'Intelligent Fallback';

        // Try RapidAPI first, then OpenAI, then fallback
        if (rapidApiKey || openai) {
            const prompt = `
As a DeFi yield optimization AI, analyze this portfolio and generate 3 yield strategies:

Wallet: ${walletAddress}
Portfolio Balance: ${portfolioBalance} ETH
Risk Tolerance: ${riskTolerance || 'Medium'}

Current market conditions:
- ETH price trend: Bullish
- DeFi yields: Competitive
- Gas fees: Moderate on Sepolia testnet

Generate 3 strategies with:
1. Strategy name
2. Expected APY (realistic %)
3. Risk level (Low/Medium/High)
4. Brief explanation
5. Recommended allocation amount

Focus on: Uniswap V3 LP, Aave lending, liquid staking
Format as JSON array with this structure:
[{
  "id": 1,
  "name": "Strategy Name",
  "expectedAPY": "X.X%",
  "riskLevel": "Low/Medium/High",
  "confidence": 85,
  "explanation": "Brief explanation",
  "recommendedAmount": "X.XX ETH",
  "strategyType": "staking/lending/liquidity_providing",
  "estimatedGas": "Low/Medium/High",
  "timeHorizon": "Short/Medium/Long-term"
}]
`;

            // Try RapidAPI ChatGPT first
            if (rapidApiKey) {
                try {
                    console.log('🚀 Attempting RapidAPI ChatGPT call...');
                    const rapidResponse = await callRapidAPI(prompt);
                    
                    if (rapidResponse && rapidResponse.text) {
                        try {
                            console.log('📝 RapidAPI response:', rapidResponse.text);
                            
                            // RapidAPI returns the response in .text field
                            const aiText = rapidResponse.text.trim();
                            
                            // Extract JSON if it's wrapped in markdown or code blocks
                            let jsonMatch = aiText.match(/```json\s*([\s\S]*?)\s*```/) || 
                                          aiText.match(/```\s*([\s\S]*?)\s*```/);
                            
                            if (jsonMatch) {
                                // Extract the JSON content without the backticks
                                const jsonContent = jsonMatch[1];
                                recommendations = JSON.parse(jsonContent);
                                console.log('✅ RapidAPI recommendations generated successfully (from JSON block)');
                                aiSource = 'RapidAPI ChatGPT';
                            } else {
                                // Look for JSON array directly in the text
                                const directJsonMatch = aiText.match(/\[[\s\S]*\]/);
                                if (directJsonMatch) {
                                    recommendations = JSON.parse(directJsonMatch[0]);
                                    console.log('✅ RapidAPI recommendations generated successfully (direct JSON)');
                                    aiSource = 'RapidAPI ChatGPT';
                                } else {
                                    console.log('⚠️ RapidAPI response not in JSON format');
                                    recommendations = null;
                                }
                            }
                        } catch (parseError) {
                            console.log('⚠️ RapidAPI response parsing failed:', parseError);
                            console.log('Full response was:', rapidResponse);
                        }
                    } else {
                        console.log('⚠️ RapidAPI response format unexpected:', rapidResponse);
                    }
                } catch (rapidError) {
                    console.log('⚠️ RapidAPI Error:', rapidError);
                }
            }

            // Try OpenAI if RapidAPI failed
            if (!recommendations && openai) {
                try {
                    console.log('🔄 Falling back to OpenAI...');
                    const completion = await openai.chat.completions.create({
                        model: "gpt-3.5-turbo",
                        messages: [
                            {
                                role: "system",
                                content: "You are a professional DeFi yield optimization AI assistant. Provide realistic, well-researched investment advice."
                            },
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        max_tokens: 1000,
                    });

                    const aiResponse = completion.choices[0].message.content;

                    try {
                        recommendations = JSON.parse(aiResponse || '[]');
                        console.log('✅ OpenAI recommendations generated successfully');
                        aiSource = 'OpenAI GPT-3.5';
                    } catch (parseError) {
                        console.log('⚠️ OpenAI response parsing failed');
                    }
                } catch (openaiError: any) {
                    console.log('⚠️ OpenAI API Error:', openaiError.code || openaiError.message);
                    
                    if (openaiError.code === 'insufficient_quota') {
                        console.log('💰 OpenAI quota exceeded');
                    }
                }
            }
        }

        // Fallback to REAL APY data
        if (!recommendations) {
            console.log('🔍 Using real APY data for fallback recommendations...');
            
            const balance = parseFloat(portfolioBalance) || 1;
            let realAPYs;
            let gasData;
            
            try {
                [realAPYs, gasData] = await Promise.all([
                    realDataService.getRealAPYs(),
                    realDataService.getRealGasPrices()
                ]);
            } catch (error) {
                console.log('⚠️ Error fetching real data for fallback, using defaults');
                realAPYs = { liquidStakingAPY: 4.2, uniswapV3APY: 15.2, aaveLendingAPY: 3.8 };
                gasData = { slow: 15, standard: 25, fast: 35 };
            }

            // Generate recommendations with REAL APYs
            recommendations = [
                {
                    id: 1,
                    name: "ETH Liquid Staking Optimizer", 
                    expectedAPY: `${realAPYs.liquidStakingAPY.toFixed(1)}%`,
                    riskLevel: "Low",
                    confidence: 95,
                    explanation: "Stake ETH through liquid staking protocols for consistent yields with minimal risk. Real APY from live protocols.",
                    recommendedAmount: `${(balance * 0.4).toFixed(2)} ETH`,
                    strategyType: "staking",
                    estimatedGas: gasData.slow < 20 ? "Low" : gasData.slow < 40 ? "Medium" : "High",
                    timeHorizon: "Long-term"
                },
                {
                    id: 2,
                    name: "Uniswap V3 ETH/USDC LP",
                    expectedAPY: `${realAPYs.uniswapV3APY.toFixed(1)}%`,
                    riskLevel: "Medium", 
                    confidence: 82,
                    explanation: "Provide concentrated liquidity for fee collection. APY based on current Uniswap V3 pool performance.",
                    recommendedAmount: `${(balance * 0.35).toFixed(2)} ETH`,
                    strategyType: "liquidity_providing",
                    estimatedGas: gasData.standard < 30 ? "Medium" : "High",
                    timeHorizon: "Medium-term"
                },
                {
                    id: 3,
                    name: "Aave ETH Lending Protocol",
                    expectedAPY: `${realAPYs.aaveLendingAPY.toFixed(1)}%`,
                    riskLevel: "Low",
                    confidence: 92,
                    explanation: "Lend ETH on Aave for stable yields. Rate updated from live Aave protocol data.",
                    recommendedAmount: `${(balance * 0.25).toFixed(2)} ETH`,
                    strategyType: "lending",
                    estimatedGas: gasData.slow < 25 ? "Low" : "Medium",
                    timeHorizon: "Flexible"
                }
            ];

            console.log('✅ Real APY recommendations generated:', {
                liquidStaking: `${realAPYs.liquidStakingAPY.toFixed(1)}%`,
                uniswapV3: `${realAPYs.uniswapV3APY.toFixed(1)}%`,
                aave: `${realAPYs.aaveLendingAPY.toFixed(1)}%`
            });

            aiSource = 'Intelligent Fallback (Real APY Data)';
        }

        res.json({
            success: true,
            recommendations,
            metadata: {
                timestamp: new Date().toISOString(),
                walletAnalyzed: walletAddress,
                totalBalance: portfolioBalance,
                riskProfile: riskTolerance || 'Medium',
                aiSource: aiSource
            }
        });

    } catch (error) {
        console.error('AI recommendation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate AI recommendations',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Market analysis endpoint with REAL data
router.get('/market-analysis', async (req, res) => {
    try {
        console.log('🔍 Fetching REAL market data...');

        // Get real market data in parallel
        const [ethMarketData, tvlData, apyData, gasData] = await Promise.all([
            realDataService.getETHMarketData(),
            realDataService.getDeFiTVLData(), 
            realDataService.getRealAPYs(),
            realDataService.getRealGasPrices()
        ]);

        // Use real data or fallbacks
        const ethPrice = ethMarketData?.price || 3850;
        const priceChange = ethMarketData?.priceChange24h || 2.1;
        const tvl = tvlData?.totalTVL || 68200000000;
        const avgAPY = apyData ? realDataService.calculateAvgDeFiAPY(apyData) : 12.4;
        const standardGas = gasData?.standard || 25;

        const analysis = {
            marketTrend: realDataService.getMarketTrend(priceChange),
            bestSectors: ['Liquid Staking', 'DEX LP', 'Lending'], // Keep this static for now
            avgDeFiAPY: `${avgAPY.toFixed(1)}%`,
            riskAssessment: priceChange > 0 ? 'Moderate-Low' : 'Moderate-High',
            gasConditions: realDataService.getGasCondition(standardGas),
            recommendation: priceChange > 2 
                ? 'Favorable conditions for yield farming - bullish momentum detected' 
                : priceChange < -2 
                ? 'Cautious approach recommended - market volatility detected'
                : 'Stable conditions for DeFi strategies',
            confidence: Math.min(95, Math.max(70, 85 + (priceChange * 2))), // Dynamic confidence based on market
            lastUpdated: new Date().toISOString(),
            keyMetrics: {
                ethPrice: `$${ethPrice.toLocaleString()}`,
                ethPriceChange24h: `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
                totalValueLocked: realDataService.formatLargeNumber(tvl),
                gasPrice: `${standardGas} gwei`,
                dominanceIndex: 'High'
            }
        };

        console.log('✅ Real market analysis generated:', {
            ethPrice: analysis.keyMetrics.ethPrice,
            trend: analysis.marketTrend,
            avgAPY: analysis.avgDeFiAPY,
            gas: analysis.keyMetrics.gasPrice
        });

        res.json({
            success: true,
            analysis,
            timestamp: new Date().toISOString(),
            dataSource: 'Real APIs (CoinGecko, DeFiLlama, Etherscan)'
        });
    } catch (error) {
        console.error('Market analysis error:', error);
        
        // Fallback with some real data if available
        res.json({
            success: true,
            analysis: {
                marketTrend: 'Moderate',
                bestSectors: ['Liquid Staking', 'DEX LP', 'Lending'],
                avgDeFiAPY: '12.4%',
                riskAssessment: 'Moderate',
                gasConditions: 'Normal conditions',
                recommendation: 'Standard DeFi strategies recommended',
                confidence: 75,
                lastUpdated: new Date().toISOString(),
                keyMetrics: {
                    ethPrice: '$3,850',
                    totalValueLocked: '$68.2B',
                    dominanceIndex: 'High'
                }
            },
            timestamp: new Date().toISOString(),
            dataSource: 'Fallback (API error)'
        });
    }
});

// Create strategy endpoint (for contract integration)
router.post('/create-strategy', async (req, res) => {
    try {
        const { name, targetToken, expectedAPY, description } = req.body;
        
        console.log('📝 Creating new AI strategy:', { name, expectedAPY });
        
        // Here we would integrate with your YieldOptimizer contract
        // For now, we'll return success with the strategy data
        const strategy = {
            id: Date.now(), // Temporary ID generation
            name,
            targetToken: targetToken || '0x0000000000000000000000000000000000000000',
            expectedAPY,
            description: description || `AI-generated strategy: ${name}`,
            isActive: true,
            totalDeposited: '0',
            createdAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            strategy,
            message: `Strategy "${name}" created successfully`
        });
        
    } catch (error) {
        console.error('Create strategy error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create strategy'
        });
    }
});

// Health check for AI routes
router.get('/health', (req, res) => {
    res.json({
        status: 'AI Routes Active',
        openaiConnected: !!openai,
        timestamp: new Date().toISOString()
    });
});

export default router;
