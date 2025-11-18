# 🤖 AI-Powered DeFi Yield Optimizer

**An intelligent DeFi platform that uses real AI to analyze portfolios, generate personalized yield strategies, and execute them on-chain through smart contracts.**

## 🎯 **Project Overview**

This project combines artificial intelligence with decentralized finance to create an automated yield optimization platform. Users connect their wallets, receive AI-generated investment strategies based on real market data, and execute them with one-click blockchain transactions.

### **🏆 Key Features**
- **🧠 Real AI Analysis**: ChatGPT analyzes user portfolios with live market data
- **📊 Live Market Data**: Real-time prices, APYs, and gas data from multiple APIs
- **⚡ One-Click Execution**: Execute AI strategies with MetaMask transactions
- **📈 Real-Time Tracking**: Monitor portfolio performance and earnings
- **🔒 Smart Contracts**: Deployed and verified contracts on Sepolia testnet

---

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   AI Backend    │    │ Smart Contracts │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (Solidity)    │
│                 │    │                 │    │                 │
│ • React/TypeScript│   │ • OpenAI API    │    │ • YieldOptimizer│
│ • Wagmi/RainbowKit│   │ • Market APIs   │    │ • AIManager     │
│ • TailwindCSS   │    │ • Real Data     │    │ • Sepolia       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **🔗 Deployed Contracts (Sepolia)**
- **YieldOptimizer**: `0xd9EA4CC86FcCbb635B4b7558d251050E3B6da98f`
- **AIStrategyManager**: `0xAd83a598533CaED10C8A8D0794bcA8Af109F0245`

---

## 🚀 **Quick Start**

### **📋 Prerequisites**
- Node.js 18+ and npm/yarn
- MetaMask browser extension
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

### **⚡ Installation**

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-defi-yield-optimizer

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend/frontend
npm install
```

### **🔧 Environment Setup**

### **Create Backend Environment File**
Create `backend/.env` with:
```env
# Server Configuration
PORT=3001

# AI APIs (Get your own keys)
OPENAI_API_KEY=your_openai_api_key_here
RAPIDAPI_KEY=your_rapidapi_chatgpt_key_here

# Market Data APIs (Get your own keys)
COINGECKO_API_KEY=your_coingecko_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### **Create Frontend Environment File**
Create `frontend/.env.local` with:
```env
# AI Backend Configuration
NEXT_PUBLIC_AI_BACKEND_URL=http://localhost:3001/api/ai

# Contract Addresses
NEXT_PUBLIC_YIELD_OPTIMIZER_CONTRACT=0xd9EA4CC86FcCbb635B4b7558d251050E3B6da98f
NEXT_PUBLIC_AI_STRATEGY_MANAGER_CONTRACT=0xAd83a598533CaED10C8A8D0794bcA8Af109F0245

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key

# WalletConnect (Get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### **Create Contracts Environment File**
Create `contracts/.env` with:
```env
# Private key for contract deployment (NEVER commit this)
PRIVATE_KEY=your_wallet_private_key_here

# Alchemy API key for Sepolia
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

---

## 🔑 **API Keys Required**

### **🤖 AI Services**
1. **OpenAI API** - [Get key](https://platform.openai.com/api-keys)
2. **RapidAPI ChatGPT** - [Subscribe here](https://rapidapi.com/warriorwhocodes/api/chatgpt-api8/)

### **📊 Market Data**
3. **CoinGecko API** - [Get key](https://www.coingecko.com/en/api/pricing)
4. **Etherscan API** - [Get key](https://etherscan.io/apis)

### **🔗 Web3 Infrastructure**
5. **WalletConnect Project ID** - [Create project](https://cloud.walletconnect.com/)

### **💡 Free APIs (No Key Required)**
- DeFiLlama API (for real APY data)
- ETH Gas Station API (for gas prices)

---

## 🏃 **Running the Application**

### **1. Start the Backend**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

### **2. Start the Frontend**
```bash
cd frontend/frontend
npm run dev
# App runs on http://localhost:3000
```

### **3. Setup MetaMask**
- Add Sepolia testnet to MetaMask
- Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
- Connect wallet to the application

---

## 🎮 **Using the Application**

### **🔗 Connect Wallet**
1. Click "Connect Wallet" in the top right
2. Select MetaMask and approve connection
3. Ensure you're on Sepolia testnet

### **🤖 Generate AI Strategies**
1. Go to "AI Recommendations" tab
2. Click "✨ Generate New"
3. AI analyzes your wallet with real market data
4. View personalized strategies with confidence scores

### **⚡ Execute Strategies**
1. Review AI recommendation details
2. Click "Execute Strategy" 
3. Approve MetaMask transaction
4. Strategy is created and funded on-chain

### **📊 Track Performance**
1. Visit "My Portfolio" tab
2. View all active positions
3. Monitor real-time values and earnings
4. See total portfolio performance

---

## 🏗️ **Project Structure**

```
ai-defi-yield-optimizer/
│
├── backend/                     # Express.js API server
│   ├── src/
│   │   ├── routes/
│   │   │   └── ai-routes.ts     # AI and market data endpoints
│   │   ├── services/
│   │   │   └── realDataService.ts # Market data integration
│   │   └── server.ts            # Express server setup
│   ├── .env                     # Backend environment variables
│   └── package.json             # Backend dependencies
│
├── frontend/frontend/           # Next.js frontend application
│   ├── src/app/                 # Next.js 13+ app directory
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Main dashboard page
│   │   └── providers.tsx        # Web3 and query providers
│   ├── components/
│   │   └── yield-optimizer/     # Main application components
│   │       ├── YieldDashboard.tsx      # Main dashboard
│   │       ├── AIRecommendations.tsx   # AI strategy generator
│   │       ├── StrategiesGrid.tsx      # Active strategies
│   │       ├── UserPortfolio.tsx       # Portfolio tracking
│   │       └── MarketAnalysis.tsx      # Market data display
│   ├── lib/
│   │   ├── api/
│   │   │   └── aiService.ts     # API client for backend
│   │   ├── hooks/               # React hooks for Web3
│   │   └── contracts/           # Contract ABIs and addresses
│   ├── .env.local               # Frontend environment variables
│   └── package.json             # Frontend dependencies
│
└── contracts/                   # Smart contract source and deployment
    ├── contracts/
    │   ├── YieldOptimizer.sol   # Main yield strategy contract
    │   └── AIStrategyManager.sol # AI recommendation storage
    ├── ignition/
    │   └── deployments/         # Deployment artifacts
    └── package.json             # Contract dependencies
```

---

## 🔧 **Smart Contracts**

### **YieldOptimizer.sol**
Main contract handling strategy creation and user deposits.

**Key Functions:**
```solidity
function createAIStrategy(string memory _name, address _targetToken, uint256 _expectedAPY) 
function depositToStrategy(uint256 _strategyId) payable
function getUserPositions(address user) view returns (UserPosition[])
function getActiveStrategies() view returns (Strategy[])
```

### **AIStrategyManager.sol** 
Stores AI-generated recommendations on-chain.

**Key Functions:**
```solidity
function addAIRecommendation(address user, address targetToken, uint256 apy, string memory strategyType, bytes memory strategyData)
function getUserRecommendations(address user) view returns (AIRecommendation[])
```

---

## 📊 **API Endpoints**

### **AI & Market Data**
- `POST /api/ai/generate-recommendations` - Generate AI strategies
- `GET /api/ai/market-analysis` - Get real-time market data
- `POST /api/ai/create-strategy` - Create strategy in backend
- `GET /api/ai/health` - Backend health check

### **Request/Response Examples**

**Generate AI Recommendations:**
```bash
curl -X POST http://localhost:3001/api/ai/generate-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x...",
    "portfolioBalance": "2.5",
    "riskTolerance": "Medium"
  }'
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": 1,
      "name": "ETH Liquid Staking Optimizer",
      "expectedAPY": "4.2%",
      "riskLevel": "Low",
      "confidence": 95,
      "explanation": "Real APY from live protocols...",
      "recommendedAmount": "1.0 ETH",
      "strategyType": "staking"
    }
  ],
  "metadata": {
    "aiSource": "RapidAPI ChatGPT",
    "timestamp": "2024-11-17T10:30:00.000Z"
  }
}
```

---

## 🛠️ **Development**

### **Tech Stack**
- **Frontend**: Next.js 14, React 19, TypeScript, TailwindCSS
- **Web3**: Wagmi, RainbowKit, Viem
- **Backend**: Express.js, TypeScript, OpenAI API
- **Blockchain**: Solidity, Hardhat, Sepolia testnet
- **APIs**: CoinGecko, DeFiLlama, Etherscan, ChatGPT

### **Available Scripts**

**Backend:**
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm start       # Start production server
```

**Frontend:**
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm start       # Start production server
npm run lint    # Run ESLint
```

**Contracts:**
```bash
npx hardhat compile                    # Compile contracts
npx hardhat test                       # Run tests
npx hardhat ignition deploy ./ignition/modules/YieldOptimizer.ts --network sepolia
```

---

## 🔍 **Troubleshooting**

### **Common Issues**

**🚫 MetaMask Connection Issues**
- Ensure MetaMask is installed and unlocked
- Add Sepolia network manually if needed
- Clear browser cache and try again

**🚫 API Errors**
```bash
# Check if backend is running
curl http://localhost:3001/api/ai/health

# Verify API keys in .env files
# Check API key quotas (especially OpenAI)
```

**🚫 Contract Interaction Fails**
- Ensure you have Sepolia ETH for gas
- Check contract addresses in environment files
- Verify network in MetaMask matches Sepolia

**🚫 No AI Recommendations**
- Check OpenAI API key validity and quota
- Verify RapidAPI subscription is active
- Check backend logs for API errors

### **Debug Mode**
```bash
# Enable verbose logging
DEBUG=* npm run dev

# Check backend logs
tail -f backend/logs/app.log

# Check frontend console for errors
# Open browser DevTools → Console
```

---

## 🧪 **Testing**

### **Manual Testing Flow**
1. **Connect Wallet** → Verify balance display
2. **Generate AI Strategies** → Check for real recommendations  
3. **Execute Strategy** → Confirm MetaMask transaction
4. **Check Portfolio** → Verify new position appears
5. **Market Analysis** → Verify live data updates

### **API Testing**
```bash
# Test market analysis
curl http://localhost:3001/api/ai/market-analysis

# Test AI generation (replace with your wallet)
curl -X POST http://localhost:3001/api/ai/generate-recommendations \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x...","portfolioBalance":"1.0","riskTolerance":"Medium"}'
```

---

## 🚀 **Deployment**

### **Backend Deployment (Railway/Render)**
```bash
# Build the backend
cd backend
npm run build

# Set environment variables in your hosting platform
# Deploy the dist/ folder
```

### **Frontend Deployment (Vercel)**
```bash
# Build the frontend
cd frontend/frontend
npm run build

# Deploy to Vercel
vercel --prod
```

### **Smart Contract Deployment**
```bash
# Deploy to Sepolia
cd contracts
npx hardhat ignition deploy ./ignition/modules/YieldOptimizer.ts --network sepolia

# Verify contracts
npx hardhat verify --network sepolia <contract_address>
```

---

## 📈 **Features & Roadmap**

### **✅ Completed Features**
- [x] Real AI portfolio analysis with ChatGPT
- [x] Live market data integration (CoinGecko, DeFiLlama, Etherscan)
- [x] Smart contract-based strategy execution
- [x] Real-time portfolio tracking
- [x] Professional UI/UX with responsive design
- [x] MetaMask integration and transaction handling
- [x] Error handling and graceful fallbacks

### **🔮 Future Enhancements**

#### **🏦 Real DeFi Protocol Integration**
- [ ] **Direct Uniswap V3 Integration** - Connect strategies to real liquidity pools
- [ ] **Aave Lending Protocol** - Implement real lending and borrowing functionality
- [ ] **Compound Protocol** - Add money market integration for yield generation
- [ ] **Yearn Finance Vaults** - Integrate with yield aggregation protocols
- [ ] **Curve Finance** - Add stable coin yield farming strategies
---

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### **Development Guidelines**
- Write TypeScript for type safety
- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure all environment variables are documented

---

---

## **Acknowledgments**

- **OpenAI** for GPT models and API
- **CoinGecko** for comprehensive crypto market data
- **DeFiLlama** for DeFi protocol statistics
- **Etherscan** for Ethereum network data
- **Wagmi & RainbowKit** for excellent Web3 React hooks
- **Next.js & Vercel** for the amazing full-stack framework

---

### **Getting Help**
- 📖 Check this README for common issues
- 🐛 [Open an issue](../../issues) for bugs
- 💡 [Start a discussion](../../discussions) for questions
- 📧 Contact: jevinjojo1@gmail.com



**⭐ Star this repo if you found it helpful!**

**🚀 Built with ❤️ for the DeFi community**
