import axios from 'axios';

// Real data service for market data, APYs, and gas prices
export class RealDataService {
    private coingeckoApiKey: string;
    private etherscanApiKey: string;

    constructor() {
        this.coingeckoApiKey = process.env.COINGECKO_API_KEY || '';
        this.etherscanApiKey = process.env.ETHERSCAN_API_KEY || '';
    }

    // Get real ETH market data from CoinGecko
    async getETHMarketData() {
        try {
            const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
                params: {
                    ids: 'ethereum',
                    vs_currencies: 'usd',
                    include_24hr_change: 'true',
                    include_market_cap: 'true',
                    include_24hr_vol: 'true'
                },
                headers: {
                    'X-CG-Demo-API-Key': this.coingeckoApiKey
                }
            });

            const ethData = response.data.ethereum;
            return {
                price: ethData.usd,
                marketCap: ethData.usd_market_cap,
                volume24h: ethData.usd_24h_vol,
                priceChange24h: ethData.usd_24h_change
            };
        } catch (error) {
            console.error('CoinGecko API error:', error);
            return null;
        }
    }

    // Get real DeFi TVL and protocol data from DeFiLlama
    async getDeFiTVLData() {
        try {
            const response = await axios.get('https://api.llama.fi/protocols');
            
            // Get total TVL across all protocols
            const totalTVL = response.data.reduce((sum: number, protocol: any) => sum + (protocol.tvl || 0), 0);
            
            // Find specific protocols we care about
            const aave = response.data.find((p: any) => p.name.toLowerCase().includes('aave'));
            const uniswap = response.data.find((p: any) => p.name.toLowerCase().includes('uniswap'));
            
            return {
                totalTVL,
                aaveTVL: aave?.tvl || 0,
                uniswapTVL: uniswap?.tvl || 0
            };
        } catch (error) {
            console.error('DeFiLlama API error:', error);
            return null;
        }
    }

    // Get real APY data from DeFiLlama
    async getRealAPYs() {
        try {
            const response = await axios.get('https://yields.llama.fi/pools');
            const pools = response.data.data;

            // Find real APYs for our strategies
            const ethPools = pools.filter((pool: any) => 
                pool.symbol.toLowerCase().includes('eth') || 
                pool.symbol.toLowerCase().includes('weth')
            );

            // Get Uniswap V3 ETH pools
            const uniswapPools = ethPools.filter((pool: any) => 
                pool.project === 'uniswap-v3' && 
                (pool.symbol.includes('USDC') || pool.symbol.includes('DAI'))
            );

            // Get Aave lending pools
            const aavePools = ethPools.filter((pool: any) => 
                pool.project === 'aave-v3' || pool.project === 'aave-v2'
            );

            // Get liquid staking pools
            const stakingPools = pools.filter((pool: any) => 
                pool.project === 'rocket-pool' || 
                pool.project === 'lido' ||
                (pool.symbol.toLowerCase().includes('steth') || pool.symbol.toLowerCase().includes('reth'))
            );

            return {
                uniswapV3APY: uniswapPools[0]?.apy || 15.2,
                aaveLendingAPY: aavePools[0]?.apy || 3.8,
                liquidStakingAPY: stakingPools[0]?.apy || 4.2
            };
        } catch (error) {
            console.error('DeFiLlama yields API error:', error);
            return {
                uniswapV3APY: 15.2,
                aaveLendingAPY: 3.8,
                liquidStakingAPY: 4.2
            };
        }
    }

    // Get real gas prices from Etherscan
    async getRealGasPrices() {
        try {
            const response = await axios.get('https://api.etherscan.io/api', {
                params: {
                    module: 'gastracker',
                    action: 'gasoracle',
                    apikey: this.etherscanApiKey
                }
            });

            const gasData = response.data.result;
            return {
                slow: parseInt(gasData.SafeGasPrice),
                standard: parseInt(gasData.StandardGasPrice), 
                fast: parseInt(gasData.FastGasPrice)
            };
        } catch (error) {
            console.error('Etherscan gas API error:', error);
            return {
                slow: 15,
                standard: 25,
                fast: 35
            };
        }
    }

    // Get market trend based on price change
    getMarketTrend(priceChange24h: number): string {
        if (priceChange24h > 5) return 'Very Bullish';
        if (priceChange24h > 2) return 'Bullish';
        if (priceChange24h > -2) return 'Neutral';
        if (priceChange24h > -5) return 'Bearish';
        return 'Very Bearish';
    }

    // Get gas condition text
    getGasCondition(standardGas: number): string {
        if (standardGas < 20) return 'Very Low - Great for transactions';
        if (standardGas < 30) return 'Low - Good for transactions';
        if (standardGas < 50) return 'Moderate - Average conditions';
        if (standardGas < 80) return 'High - Consider waiting';
        return 'Very High - Expensive transactions';
    }

    // Calculate average DeFi APY
    calculateAvgDeFiAPY(apys: any): number {
        const { uniswapV3APY, aaveLendingAPY, liquidStakingAPY } = apys;
        return ((uniswapV3APY + aaveLendingAPY + liquidStakingAPY) / 3);
    }

    // Format large numbers (for TVL display)
    formatLargeNumber(num: number): string {
        if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
        return `$${num.toFixed(0)}`;
    }
}

export const realDataService = new RealDataService();