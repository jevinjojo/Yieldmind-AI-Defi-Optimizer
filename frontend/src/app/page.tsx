import { ConnectButton } from '@rainbow-me/rainbowkit';
import YieldDashboard from '../../components/yield-optimizer/YieldDashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="p-6 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🤖 AI Yield Optimizer
            </h1>
            <p className="text-gray-600">AI-Powered DeFi Strategy Platform</p>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <YieldDashboard />
      </main>
    </div>
  );
}
