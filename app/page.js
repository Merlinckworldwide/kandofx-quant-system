'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Zap, Shield, Send, Menu, X, Activity } from 'lucide-react';

// Simple candlestick chart component
const CandlestickChart = ({ data, width = 800, height = 400 }) => {
  const [hoverPrice, setHoverPrice] = useState(null);

  if (!data || data.length === 0) return <div className="text-gray-400">Loading chart...</div>;

  const candleWidth = (width - 60) / data.length;
  const maxPrice = Math.max(...data.map((d) => d.high));
  const minPrice = Math.min(...data.map((d) => d.low));
  const priceRange = maxPrice - minPrice;
  const yScale = (price) => ((maxPrice - price) / priceRange) * (height - 60) + 30;

  return (
    <div className="relative w-full overflow-x-auto">
      <svg width={width} height={height} className="bg-gray-900 rounded-lg">
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => {
          const y = 30 + (i * (height - 60)) / 4;
          const price = maxPrice - (i * priceRange) / 4;
          return (
            <g key={i}>
              <line x1="40" y1={y} x2={width - 20} y2={y} stroke="#2d2d2d" strokeWidth="1" />
              <text x="35" y={y} fill="#9ca3af" fontSize="10" textAnchor="end">
                {price.toFixed(5)}
              </text>
            </g>
          );
        })}

        {/* Candles */}
        {data.map((candle, i) => {
          const x = 40 + i * candleWidth;
          const isGreen = candle.close >= candle.open;
          const bodyTop = yScale(Math.max(candle.open, candle.close));
          const bodyBottom = yScale(Math.min(candle.open, candle.close));
          const bodyHeight = bodyBottom - bodyTop;
          const wickTop = yScale(candle.high);
          const wickBottom = yScale(candle.low);

          return (
            <g
              key={i}
              onMouseEnter={() => setHoverPrice(candle)}
              onMouseLeave={() => setHoverPrice(null)}
            >
              <line
                x1={x + candleWidth / 2}
                y1={wickTop}
                y2={x + candleWidth / 2}
                y2={wickBottom}
                stroke={isGreen ? '#10b981' : '#ef4444'}
                strokeWidth="1"
              />
              <rect
                x={x + candleWidth * 0.2}
                y={bodyTop}
                width={candleWidth * 0.6}
                height={Math.max(1, bodyHeight)}
                fill={isGreen ? '#10b981' : '#ef4444'}
                opacity="0.8"
              />
            </g>
          );
        })}

        {/* Current price label */}
        <text x={width - 15} y={30} fill="#fbbf24" fontSize="12" textAnchor="end">
          {data[data.length - 1]?.close.toFixed(5)}
        </text>
      </svg>

      {/* Hover tooltip */}
      {hoverPrice && (
        <div
          className="absolute bg-black/90 text-white p-2 rounded text-xs border border-gray-700"
          style={{ left: '50%', top: '10px', transform: 'translateX(-50%)' }}
        >
          O: {hoverPrice.open.toFixed(5)} | H: {hoverPrice.high.toFixed(5)} | L:{' '}
          {hoverPrice.low.toFixed(5)} | C: {hoverPrice.close.toFixed(5)}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [currentPrice, setCurrentPrice] = useState(1.09234);
  const [priceChange, setPriceChange] = useState(0);
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content:
        "👋 Hey! I'm KandoFX, your trading assistant. Ask me about any pair, technical analysis, or market conditions!",
    },
    {
      role: 'assistant',
      content:
        '💡 Quick tip: Try clicking the suggestion buttons below or ask me about support/resistance levels!',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Sample candlestick data
  const [chartData, setChartData] = useState(() => {
    const data = [];
    let basePrice = 1.09234;
    for (let i = 0; i < 50; i++) {
      const open = basePrice + (Math.random() - 0.5) * 0.002;
      const close = open + (Math.random() - 0.5) * 0.003;
      const high = Math.max(open, close) + Math.random() * 0.001;
      const low = Math.min(open, close) - Math.random() * 0.001;
      data.push({ open, high, low, close, time: new Date(Date.now() - (49 - i) * 60000) });
      basePrice = close;
    }
    return data;
  });

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const change = (Math.random() - 0.5) * 0.0005;
        setPriceChange(change);
        return prev + change;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate assistant response
  const sendMessage = (userMessage) => {
    if (!userMessage.trim()) return;

    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsTyping(true);

    setTimeout(() => {
      let response = '';
      const lowerMsg = userMessage.toLowerCase();

      if (lowerMsg.includes('eur') || lowerMsg.includes('usd')) {
        response = `📊 **EUR/USD Analysis**\n\nCurrent: ${currentPrice.toFixed(5)} (${priceChange > 0 ? '▲' : '▼'} ${Math.abs(priceChange).toFixed(5)})\n\n**Technical View:**\n• Price is trading above the 50 EMA — bullish bias\n• RSI at 58 — neutral momentum\n• Key resistance at 1.0950, support at 1.0880\n\n**Recommendation:** Wait for pullback to 1.0890 for long entries. Stop loss at 1.0860.`;
      } else if (lowerMsg.includes('gbp')) {
        response = `💷 **GBP/USD Analysis**\n\nCurrent: 1.26450\n\n**Key Levels:**\n• Resistance: 1.2680, 1.2720\n• Support: 1.2600, 1.2560\n\n**Outlook:** Consolidation before BOE news. Range trading expected.`;
      } else if (lowerMsg.includes('gold') || lowerMsg.includes('xau')) {
        response = `🥇 **XAU/USD (Gold) Analysis**\n\nCurrent: $2,315.40\n\n**Technical:**\n• Bullish flag formation on 4H\n• MACD showing bullish crossover\n\n**Ideal Entry:** $2,305 support retest\n**Target:** $2,340`;
      } else if (lowerMsg.includes('resistance') || lowerMsg.includes('support')) {
        response = `🎯 **Support & Resistance Levels for ${selectedPair}:**\n\n**Resistance Zones:**\n• R1: ${(currentPrice + 0.003).toFixed(5)}\n• R2: ${(currentPrice + 0.005).toFixed(5)}\n\n**Support Zones:**\n• S1: ${(currentPrice - 0.003).toFixed(5)}\n• S2: ${(currentPrice - 0.005).toFixed(5)}\n\nStronger levels marked by volume profile.`;
      } else {
        response = `🤔 I'm analyzing ${selectedPair} for you right now.\n\nQuick stats:\n• Current: ${currentPrice.toFixed(5)}\n• 24H Change: ${priceChange > 0 ? '+' : ''}${(priceChange * 100).toFixed(2)}%\n• Volatility: Moderate\n\nWhat specific information would help? Try asking about support/resistance, technical indicators, or market sentiment!`;
      }

      setChatHistory((prev) => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  const quickQuestions = [
    "What's the trend on EUR/USD?",
    'Show me support/resistance',
    'Gold analysis?',
    'Trade setup for today',
  ];

  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-lg"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900/95 backdrop-blur-lg border-r border-gray-800 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <Zap className="text-yellow-500" size={28} />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                KandoFX
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400">Account Balance</div>
                <div className="text-2xl font-bold">$12,450.32</div>
                <div className="text-green-400 text-sm">+$342.20 (2.8%)</div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400">Open Positions</div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-yellow-400 text-sm">Total P&L: +$127.50</div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400">Win Rate</div>
                <div className="text-2xl font-bold">68%</div>
                <div className="text-gray-400 text-sm">Last 30 trades</div>
              </div>
            </div>

            <button className="w-full mt-6 bg-red-600/20 border border-red-500/50 text-red-400 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600/30 transition">
              <Shield size={16} />
              Emergency Stop
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">Trading Assistant</h1>
              <p className="text-gray-400 text-sm">AI-powered market analysis</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 px-3 py-1 rounded-full text-green-400 text-sm flex items-center gap-1">
                <Activity size={12} />
                Live
              </div>
              <div className="text-gray-400 text-sm">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Price Bar & Pair Selector */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-2 flex-wrap">
                {pairs.map((pair) => (
                  <button
                    key={pair}
                    onClick={() => setSelectedPair(pair)}
                    className={`px-4 py-2 rounded-lg transition ${selectedPair === pair ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {pair}
                  </button>
                ))}
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold">{currentPrice.toFixed(5)}</div>
                <div
                  className={`flex items-center gap-1 justify-end ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {priceChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {priceChange >= 0 ? '+' : ''}
                  {(priceChange * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="bg-gray-800/30 rounded-lg p-4 mb-6 overflow-x-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">{selectedPair} - 1H Chart</h3>
              <div className="flex gap-2 text-sm text-gray-400">
                <button className="px-2 py-1 hover:bg-gray-700 rounded">1m</button>
                <button className="px-2 py-1 hover:bg-gray-700 rounded">5m</button>
                <button className="px-2 py-1 bg-gray-700 rounded">1H</button>
                <button className="px-2 py-1 hover:bg-gray-700 rounded">4H</button>
                <button className="px-2 py-1 hover:bg-gray-700 rounded">1D</button>
              </div>
            </div>
            <CandlestickChart data={chartData} width={900} height={400} />
          </div>

          {/* Chat Assistant */}
          <div className="bg-gray-800/30 rounded-lg">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold flex items-center gap-2">
                <Zap size={18} className="text-yellow-500" />
                AI Assistant
              </h3>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-100'}`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(message)}
                  placeholder="Ask me anything about the markets..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
                />
                <button
                  onClick={() => sendMessage(message)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 rounded-lg transition flex items-center gap-2"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
