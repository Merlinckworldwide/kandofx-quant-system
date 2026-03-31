'use client';

import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Send,
  Menu,
  X,
  Activity,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Move,
  Volume2,
  TrendingUp as SMAIcon,
  LineChart,
  BarChart3,
  Gauge,
  AlertTriangle,
} from 'lucide-react';

// Professional Color System
const colors = {
  bg: {
    primary: '#0B0F19',
    secondary: '#111827',
    tertiary: '#1F2937',
  },
  accent: {
    profit: '#10b981',
    loss: '#ef4444',
    action: '#3b82f6',
    warning: '#f59e0b',
    highlight: '#8b5cf6',
  },
  text: {
    primary: '#f3f4f6',
    secondary: '#9ca3af',
    tertiary: '#6b7280',
  },
};

// Reusable Metric Card Component
const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
  <div className="group bg-[#111827] rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10">
    <div className="flex justify-between items-start mb-3">
      <div className="text-gray-400 text-sm font-medium">{title}</div>
      <Icon size={20} className={`text-${color}-500`} />
    </div>
    <div className="text-2xl font-bold text-white mb-2">{value}</div>
    {change && (
      <div
        className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}
      >
        {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {Math.abs(change)}%
      </div>
    )}
  </div>
);

// Signal Badge Component
const SignalBadge = ({ type, strength }) => {
  const colors = {
    buy: 'bg-green-500/20 text-green-400 border-green-500/30',
    sell: 'bg-red-500/20 text-red-400 border-red-500/30',
    neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[type]} animate-pulse`}
    >
      {type.toUpperCase()} {strength && `• ${strength}%`}
    </div>
  );
};

// Advanced Candlestick Chart with Indicators
const AdvancedChart = ({
  data,
  width = 1000,
  height = 500,
  showSMA = false,
  showEMA = false,
  showBollinger = false,
  zoomLevel = 1,
  onZoom,
  isFullscreen = false,
}) => {
  const [hoverPrice, setHoverPrice] = useState(null);
  const [zoomStart, setZoomStart] = useState(null);
  const [zoomEnd, setZoomEnd] = useState(null);
  const [isZooming, setIsZooming] = useState(false);
  const chartRef = useRef(null);

  if (!data || data.length === 0) return <div className="text-gray-400">Loading chart...</div>;

  // Calculate SMA
  const calculateSMA = (period) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      sma.push({ index: i, value: sum / period });
    }
    return sma;
  };

  // Calculate EMA
  const calculateEMA = (period) => {
    const multiplier = 2 / (period + 1);
    const ema = [];
    let prevEMA = data[0].close;
    ema.push({ index: 0, value: prevEMA });
    for (let i = 1; i < data.length; i++) {
      const currentEMA = (data[i].close - prevEMA) * multiplier + prevEMA;
      ema.push({ index: i, value: currentEMA });
      prevEMA = currentEMA;
    }
    return ema;
  };

  // Calculate Bollinger Bands
  const calculateBollinger = (period = 20, stdDev = 2) => {
    const bands = [];
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = slice.reduce((sum, d) => sum + d.close, 0) / period;
      const variance = slice.reduce((sum, d) => sum + Math.pow(d.close - mean, 2), 0) / period;
      const std = Math.sqrt(variance);
      bands.push({
        index: i,
        upper: mean + stdDev * std,
        middle: mean,
        lower: mean - stdDev * std,
      });
    }
    return bands;
  };

  const sma20 = showSMA ? calculateSMA(20) : [];
  const ema12 = showEMA ? calculateEMA(12) : [];
  const bollinger = showBollinger ? calculateBollinger() : [];

  const candleWidth = (width - 80) / data.length;
  const maxPrice = Math.max(...data.map((d) => d.high), ...bollinger.map((b) => b.upper));
  const minPrice = Math.min(...data.map((d) => d.low), ...bollinger.map((b) => b.lower));
  const priceRange = maxPrice - minPrice;
  const yScale = (price) => ((maxPrice - price) / priceRange) * (height - 80) + 40;

  const handleMouseDown = (e) => {
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setZoomStart(x);
    setIsZooming(true);
  };

  const handleMouseMove = (e) => {
    if (!isZooming) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setZoomEnd(x);
  };

  const handleMouseUp = () => {
    if (zoomStart && zoomEnd && Math.abs(zoomEnd - zoomStart) > 20) {
      const startIndex = Math.floor((zoomStart - 40) / candleWidth);
      const endIndex = Math.floor((zoomEnd - 40) / candleWidth);
      if (onZoom && startIndex >= 0 && endIndex < data.length && startIndex < endIndex) {
        onZoom(data.slice(startIndex, endIndex + 1));
      }
    }
    setIsZooming(false);
    setZoomStart(null);
    setZoomEnd(null);
  };

  return (
    <div className="relative w-full overflow-x-auto" ref={chartRef}>
      <svg
        width={width}
        height={height}
        className="bg-[#0B0F19] rounded-xl cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Grid lines */}
        {[...Array(8)].map((_, i) => {
          const y = 40 + (i * (height - 80)) / 7;
          const price = maxPrice - (i * priceRange) / 7;
          return (
            <g key={i}>
              <line
                x1="40"
                y1={y}
                x2={width - 20}
                y2={y}
                stroke="#1F2937"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              <text x="35" y={y} fill="#6b7280" fontSize="11" textAnchor="end">
                {price.toFixed(5)}
              </text>
            </g>
          );
        })}

        {/* Bollinger Bands */}
        {showBollinger &&
          bollinger.map((band, i) => {
            const x = 40 + band.index * candleWidth + candleWidth / 2;
            return (
              <g key={`bb-${i}`}>
                <circle cx={x} cy={yScale(band.upper)} r="2" fill="#8b5cf6" opacity="0.5" />
                <circle cx={x} cy={yScale(band.lower)} r="2" fill="#8b5cf6" opacity="0.5" />
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
                x2={x + candleWidth / 2}
                y2={wickBottom}
                stroke={isGreen ? '#10b981' : '#ef4444'}
                strokeWidth="1.5"
              />
              <rect
                x={x + candleWidth * 0.2}
                y={bodyTop}
                width={candleWidth * 0.6}
                height={Math.max(2, bodyHeight)}
                fill={isGreen ? '#10b981' : '#ef4444'}
                fillOpacity="0.8"
                className="transition-all duration-200"
              />
            </g>
          );
        })}

        {/* SMA Line */}
        {showSMA &&
          sma20.map((point, i) => {
            const x = 40 + point.index * candleWidth + candleWidth / 2;
            const y = yScale(point.value);
            if (i === 0) return null;
            const prevX = 40 + sma20[i - 1].index * candleWidth + candleWidth / 2;
            const prevY = yScale(sma20[i - 1].value);
            return (
              <line
                key={`sma-${i}`}
                x1={prevX}
                y1={prevY}
                x2={x}
                y2={y}
                stroke="#3b82f6"
                strokeWidth="2"
              />
            );
          })}

        {/* EMA Line */}
        {showEMA &&
          ema12.map((point, i) => {
            const x = 40 + point.index * candleWidth + candleWidth / 2;
            const y = yScale(point.value);
            if (i === 0) return null;
            const prevX = 40 + ema12[i - 1].index * candleWidth + candleWidth / 2;
            const prevY = yScale(ema12[i - 1].value);
            return (
              <line
                key={`ema-${i}`}
                x1={prevX}
                y1={prevY}
                x2={x}
                y2={y}
                stroke="#f59e0b"
                strokeWidth="2"
              />
            );
          })}

        {/* Zoom selection area */}
        {isZooming && zoomStart && zoomEnd && (
          <rect
            x={Math.min(zoomStart, zoomEnd)}
            y="40"
            width={Math.abs(zoomEnd - zoomStart)}
            height={height - 80}
            fill="#3b82f6"
            fillOpacity="0.2"
            stroke="#3b82f6"
            strokeWidth="2"
          />
        )}

        {/* Current price label */}
        <text
          x={width - 15}
          y={30}
          fill="#fbbf24"
          fontSize="12"
          textAnchor="end"
          className="font-mono font-bold"
        >
          {data[data.length - 1]?.close.toFixed(5)}
        </text>
      </svg>

      {/* Hover tooltip */}
      {hoverPrice && (
        <div
          className="absolute bg-black/95 text-white p-3 rounded-lg text-xs border border-gray-700 shadow-2xl backdrop-blur-sm z-10"
          style={{ left: '50%', top: '10px', transform: 'translateX(-50%)' }}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>Open:</div>
            <div className="font-mono">{hoverPrice.open.toFixed(5)}</div>
            <div>High:</div>
            <div className="font-mono text-green-400">{hoverPrice.high.toFixed(5)}</div>
            <div>Low:</div>
            <div className="font-mono text-red-400">{hoverPrice.low.toFixed(5)}</div>
            <div>Close:</div>
            <div className="font-mono font-bold">{hoverPrice.close.toFixed(5)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Volume Bar Chart Component
const VolumeChart = ({ data, width = 1000, height = 100 }) => {
  const maxVolume = Math.max(...data.map((d) => d.volume || 1000));
  const barWidth = (width - 80) / data.length;

  return (
    <svg width={width} height={height} className="bg-[#0B0F19] rounded-xl">
      {data.map((candle, i) => {
        const x = 40 + i * barWidth;
        const barHeight = ((candle.volume || 1000) / maxVolume) * (height - 40);
        const isGreen = candle.close >= candle.open;
        return (
          <rect
            key={i}
            x={x + barWidth * 0.2}
            y={height - barHeight - 20}
            width={barWidth * 0.6}
            height={barHeight}
            fill={isGreen ? '#10b981' : '#ef4444'}
            fillOpacity="0.5"
          />
        );
      })}
    </svg>
  );
};

// Market Sentiment Gauge
const SentimentGauge = ({ sentiment = 65 }) => {
  const getColor = () => {
    if (sentiment > 70) return 'text-green-400';
    if (sentiment > 50) return 'text-blue-400';
    if (sentiment > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-[#111827] rounded-xl p-4 border border-gray-800">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-gray-400">Market Sentiment</div>
        <Gauge size={20} className="text-blue-400" />
      </div>
      <div className={`text-2xl font-bold ${getColor()}`}>{sentiment}%</div>
      <div className="text-xs text-gray-500 mt-2">Bullish Bias</div>
      <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
          style={{ width: `${sentiment}%` }}
        ></div>
      </div>
    </div>
  );
};

// Risk Meter
const RiskMeter = ({ risk = 35 }) => {
  const getRiskLevel = () => {
    if (risk < 30) return { text: 'Low', color: 'text-green-400' };
    if (risk < 70) return { text: 'Medium', color: 'text-yellow-400' };
    return { text: 'High', color: 'text-red-400' };
  };

  const level = getRiskLevel();

  return (
    <div className="bg-[#111827] rounded-xl p-4 border border-gray-800">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-gray-400">Risk Meter</div>
        <AlertTriangle size={20} className="text-yellow-400" />
      </div>
      <div className={`text-2xl font-bold ${level.color}`}>{risk}%</div>
      <div className="text-xs text-gray-500 mt-2">{level.text} Risk Level</div>
      <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
          style={{ width: `${risk}%` }}
        ></div>
      </div>
    </div>
  );
};

// Live Signal Ticker
const SignalTicker = () => {
  const [currentSignal, setCurrentSignal] = useState(0);
  const signals = [
    { pair: 'EUR/USD', action: 'BUY', confidence: 78, time: 'Just now' },
    { pair: 'GBP/USD', action: 'SELL', confidence: 65, time: '2m ago' },
    { pair: 'XAU/USD', action: 'BUY', confidence: 82, time: '5m ago' },
    { pair: 'USD/JPY', action: 'NEUTRAL', confidence: 45, time: '8m ago' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSignal((prev) => (prev + 1) % signals.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const signal = signals[currentSignal];

  return (
    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-3 border border-blue-500/30 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-sm font-medium">LIVE SIGNAL</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold">{signal.pair}</span>
          <SignalBadge type={signal.action.toLowerCase()} strength={signal.confidence} />
          <span className="text-xs text-gray-400">{signal.time}</span>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [currentPrice, setCurrentPrice] = useState(1.09234);
  const [priceChange, setPriceChange] = useState(0);
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('1H');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content:
        "👋 Welcome to KandoFX Quant System! I'm your AI trading assistant. Ask me about technical analysis, market trends, or trading setups!",
    },
    {
      role: 'assistant',
      content: '💡 Pro tip: Click and drag on the chart to zoom in on specific time periods!',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [zoomData, setZoomData] = useState(null);
  const [balance] = useState(12450.32);
  const [pnl] = useState(342.2);

  // Generate candlestick data
  useEffect(() => {
    const generateData = () => {
      const data = [];
      let basePrice = 1.09234;
      for (let i = 0; i < 100; i++) {
        const open = basePrice + (Math.random() - 0.5) * 0.002;
        const close = open + (Math.random() - 0.5) * 0.003;
        const high = Math.max(open, close) + Math.random() * 0.001;
        const low = Math.min(open, close) - Math.random() * 0.001;
        const volume = Math.floor(1000 + Math.random() * 5000);
        data.push({
          open,
          high,
          low,
          close,
          volume,
          time: new Date(Date.now() - (99 - i) * 60000),
        });
        basePrice = close;
      }
      return data;
    };
    setChartData(generateData());
  }, [selectedPair, timeframe]);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const change = (Math.random() - 0.5) * 0.0005;
        setPriceChange(change);
        const newPrice = prev + change;

        // Update chart with new candle
        setChartData((prevData) => {
          const newData = [...prevData];
          const lastCandle = { ...newData[newData.length - 1] };
          lastCandle.close = newPrice;
          lastCandle.high = Math.max(lastCandle.high, newPrice);
          lastCandle.low = Math.min(lastCandle.low, newPrice);
          newData[newData.length - 1] = lastCandle;
          return newData;
        });

        return newPrice;
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
        response = `📊 **EUR/USD Technical Analysis**\n\n**Current:** ${currentPrice.toFixed(5)} (${priceChange > 0 ? '▲' : '▼'} ${Math.abs(priceChange).toFixed(5)})\n\n**Indicators:**\n• RSI: 58.2 (Neutral)\n• MACD: Bullish crossover\n• 50 EMA: Trading above → Bullish bias\n\n**Key Levels:**\n• Resistance: 1.0950, 1.0980\n• Support: 1.0880, 1.0850\n\n**Recommendation:** Wait for pullback to 1.0890 for long entries. Set SL at 1.0860, TP at 1.0940.\n\n**Risk/Reward:** 1:2.5`;
      } else if (lowerMsg.includes('gbp')) {
        response = `💷 **GBP/USD Analysis**\n\n**Current:** 1.26450\n\n**Technical View:**\n• Consolidation pattern on 4H\n• Bollinger Bands squeezing → Breakout imminent\n• RSI at 52 (Neutral)\n\n**Key Levels:**\n• Resistance: 1.2680, 1.2720\n• Support: 1.2600, 1.2560\n\n**Setup:** Range trading until BOE news. Wait for breakout confirmation.`;
      } else if (lowerMsg.includes('gold') || lowerMsg.includes('xau')) {
        response = `🥇 **XAU/USD (Gold) Analysis**\n\n**Current:** $2,315.40\n\n**Technical:**\n• Bullish flag formation on 4H chart\n• MACD showing bullish crossover\n• RSI at 64 (Bullish momentum)\n\n**Setup:**\n• Entry: $2,305 (support retest)\n• Target 1: $2,330\n• Target 2: $2,340\n• Stop Loss: $2,295\n\n**Risk/Reward:** 1:2.5`;
      } else if (lowerMsg.includes('sentiment')) {
        response = `📈 **Market Sentiment Analysis**\n\n**Overall:** Bullish (65%)\n\n**By Asset:**\n• EUR/USD: 72% bullish\n• GBP/USD: 58% bullish\n• Gold: 81% bullish\n• USD/JPY: 45% bullish\n\n**Institutional Flow:** Net long positions increasing across major pairs.\n\n**Fear & Greed Index:** 62 (Greed)`;
      } else {
        response = `🤔 **Analysis for ${selectedPair}**\n\n**Current Price:** ${currentPrice.toFixed(5)}\n**24H Change:** ${priceChange > 0 ? '+' : ''}${(priceChange * 100).toFixed(2)}%\n**Volatility:** Moderate\n\n**Technical Overview:**\n• Trend: ${priceChange > 0 ? 'Bullish' : 'Bearish'} momentum\n• Volume: Above average\n• Support/Resistance: Clear levels identified\n\nWhat specific aspect would you like me to analyze? Try asking about:\n• Technical indicators (RSI, MACD, etc.)\n• Support/resistance levels\n• Market sentiment\n• Trade setups`;
      }

      setChatHistory((prev) => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  const quickQuestions = [
    'EUR/USD technical analysis?',
    'Show support/resistance',
    'Gold trade setup',
    'Market sentiment',
    'Risk assessment',
  ];

  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD'];
  const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D'];

  const handleZoom = (zoomedData) => {
    setZoomData(zoomedData);
    setTimeout(() => setZoomData(null), 2000);
  };

  const displayedData = zoomData || chartData;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0B0F19]' : 'bg-gray-100'}`}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#111827] p-2 rounded-xl shadow-lg"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#111827] border-r border-gray-800 transform transition-transform duration-300 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                <Zap className="text-black" size={24} />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  KandoFX
                </span>
                <div className="text-xs text-gray-500">Quant System</div>
              </div>
            </div>

            <MetricCard
              title="Account Balance"
              value={`$${balance.toLocaleString()}`}
              change={pnl}
              icon={Activity}
              color="green"
            />

            <div className="mt-4">
              <MetricCard
                title="Open Positions"
                value="3"
                change={127.5}
                icon={TrendingUp}
                color="blue"
              />
            </div>

            <div className="mt-4">
              <MetricCard
                title="Win Rate"
                value="68%"
                change={5.2}
                icon={BarChart3}
                color="purple"
              />
            </div>

            <SentimentGauge sentiment={65} />

            <div className="mt-4">
              <RiskMeter risk={35} />
            </div>

            <button className="w-full mt-6 bg-red-600/20 border border-red-500/50 text-red-400 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-600/30 transition-all duration-300 hover:scale-[1.02]">
              <Shield size={18} />
              Emergency Stop
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-auto">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Trading Assistant
              </h1>
              <p className="text-gray-500 text-sm mt-1">AI-powered market analysis & signals</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="bg-[#111827] p-2 rounded-xl hover:scale-105 transition-transform"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="bg-[#111827] p-2 rounded-xl hover:scale-105 transition-transform"
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <div className="bg-green-500/20 px-3 py-1.5 rounded-full text-green-400 text-sm flex items-center gap-2">
                <Activity size={12} className="animate-pulse" />
                LIVE
              </div>
              <div className="text-gray-500 text-sm">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Live Signal Ticker */}
          <div className="mb-6">
            <SignalTicker />
          </div>

          {/* Price Bar & Controls */}
          <div className="bg-[#111827] rounded-xl p-5 mb-6 border border-gray-800">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-2 flex-wrap">
                {pairs.map((pair) => (
                  <button
                    key={pair}
                    onClick={() => setSelectedPair(pair)}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium ${selectedPair === pair ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  >
                    {pair}
                  </button>
                ))}
              </div>
              <div className="text-right">
                <div className="text-4xl font-mono font-bold text-white">
                  {currentPrice.toFixed(5)}
                </div>
                <div
                  className={`flex items-center gap-1 justify-end mt-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {priceChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {priceChange >= 0 ? '+' : ''}
                  {(priceChange * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area with Indicators */}
          <div className="bg-[#111827] rounded-xl p-5 mb-6 border border-gray-800">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
              <div className="flex gap-2 flex-wrap">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${timeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowSMA(!showSMA)}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-all ${showSMA ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  <SMAIcon size={14} /> SMA
                </button>
                <button
                  onClick={() => setShowEMA(!showEMA)}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-all ${showEMA ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  <LineChart size={14} /> EMA
                </button>
                <button
                  onClick={() => setShowBollinger(!showBollinger)}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-all ${showBollinger ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  <TrendingUp size={14} /> Bollinger
                </button>
                <button className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all">
                  <Volume2 size={14} /> Volume
                </button>
              </div>
            </div>

            <AdvancedChart
              data={displayedData}
              width={isFullscreen ? 1400 : 1000}
              height={isFullscreen ? 700 : 500}
              showSMA={showSMA}
              showEMA={showEMA}
              showBollinger={showBollinger}
              onZoom={handleZoom}
              isFullscreen={isFullscreen}
            />

            {/* Volume Chart */}
            <div className="mt-4">
              <VolumeChart data={displayedData} width={isFullscreen ? 1400 : 1000} height={80} />
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              💡 Tip: Click and drag on chart to zoom in • Hover over candles for details
            </div>
          </div>

          {/* Chat Assistant */}
          <div className="bg-[#111827] rounded-xl border border-gray-800">
            <div className="p-5 border-b border-gray-800">
              <h3 className="font-semibold flex items-center gap-2 text-lg">
                <Zap size={20} className="text-yellow-500" />
                AI Trading Assistant
              </h3>
            </div>

            <div className="h-96 overflow-y-auto p-5 space-y-4">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl transition-all ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'}`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-gray-800 p-4 rounded-2xl">
                    <div className="flex gap-1.5">
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
            <div className="p-5 border-t border-gray-800">
              <div className="flex flex-wrap gap-2 mb-4">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(message)}
                  placeholder="Ask about technical analysis, trade setups, market sentiment..."
                  className="flex-1 bg-[#0B0F19] border border-gray-700 rounded-xl px-5 py-3 focus:outline-none focus:border-blue-500 transition-all"
                />
                <button
                  onClick={() => sendMessage(message)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Send size={18} />
                  Send
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
