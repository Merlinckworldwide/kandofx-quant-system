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
  Volume2,
  LineChart,
  BarChart3,
  Gauge,
  AlertTriangle,
  DollarSign,
  Clock,
  Calendar,
  ChevronDown,
  Settings,
  Bell,
  User,
  LogOut,
  HelpCircle,
  Target,
  Award,
  Star,
} from 'lucide-react';

// Professional Color System with Theme Support
const getThemeColors = (isDark) => ({
  bg: {
    primary: isDark ? '#0A0C15' : '#F8FAFF',
    secondary: isDark ? '#111827' : '#FFFFFF',
    tertiary: isDark ? '#1F2937' : '#F3F4F6',
    card: isDark ? '#111827' : '#FFFFFF',
    hover: isDark ? '#1F2937' : '#F9FAFB',
  },
  text: {
    primary: isDark ? '#FFFFFF' : '#111827',
    secondary: isDark ? '#9CA3AF' : '#6B7280',
    tertiary: isDark ? '#6B7280' : '#9CA3AF',
  },
  accent: {
    profit: '#10B981',
    loss: '#EF4444',
    action: '#3B82F6',
    warning: '#F59E0B',
    highlight: '#8B5CF6',
    success: '#10B981',
  },
  border: isDark ? '#1F2937' : '#E5E7EB',
});

// Professional Metric Card
const MetricCard = ({ title, value, change, icon: Icon, color = 'blue', isDark }) => {
  const colors = getThemeColors(isDark);
  return (
    <div
      className="group rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
      style={{ backgroundColor: colors.bg.card, border: `1px solid ${colors.border}` }}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium" style={{ color: colors.text.secondary }}>
          {title}
        </span>
        <Icon size={20} style={{ color: colors.accent[color] }} />
      </div>
      <div
        className="text-2xl font-bold mb-2 transition-all duration-300"
        style={{ color: colors.text.primary }}
      >
        {value}
      </div>
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
};

// Professional Signal Badge
const SignalBadge = ({ type, strength, isDark }) => {
  const getColor = () => {
    switch (type) {
      case 'buy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'sell':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColor()} transition-all duration-300`}
    >
      {type.toUpperCase()} {strength && `• ${strength}%`}
    </div>
  );
};

// Advanced Responsive Chart Component
const AdvancedChart = ({
  data,
  width = 800,
  height = 450,
  showSMA = false,
  showEMA = false,
  showBollinger = false,
  onZoom,
  isDark = true,
}) => {
  const [hoverPrice, setHoverPrice] = useState(null);
  const [zoomStart, setZoomStart] = useState(null);
  const [zoomEnd, setZoomEnd] = useState(null);
  const [isZooming, setIsZooming] = useState(false);
  const chartRef = useRef(null);
  const colors = getThemeColors(isDark);

  if (!data || data.length === 0) return <div className="text-gray-400">Loading chart...</div>;

  // Calculations
  const calculateSMA = (period) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      sma.push({ index: i, value: sum / period });
    }
    return sma;
  };

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

  const candleWidth = Math.max((width - 80) / data.length, 2);
  const maxPrice = Math.max(
    ...data.map((d) => d.high),
    ...bollinger.map((b) => b.upper),
    data[0]?.high || 0
  );
  const minPrice = Math.min(
    ...data.map((d) => d.low),
    ...bollinger.map((b) => b.lower),
    data[0]?.low || 0
  );
  const priceRange = maxPrice - minPrice;
  const yScale = (price) => ((maxPrice - price) / priceRange) * (height - 80) + 40;

  const handleMouseDown = (e) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    setZoomStart(x);
    setIsZooming(true);
  };

  const handleMouseMove = (e) => {
    if (!isZooming) return;
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    setZoomEnd(x);
  };

  const handleMouseUp = () => {
    if (zoomStart && zoomEnd && Math.abs(zoomEnd - zoomStart) > 20 && onZoom) {
      const startIndex = Math.max(0, Math.floor((zoomStart - 40) / candleWidth));
      const endIndex = Math.min(data.length - 1, Math.floor((zoomEnd - 40) / candleWidth));
      if (startIndex < endIndex) {
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
        width={Math.max(width, 600)}
        height={height}
        className="rounded-xl cursor-crosshair transition-all"
        style={{ backgroundColor: colors.bg.secondary }}
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
                stroke={colors.border}
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              <text x="35" y={y} fill={colors.text.tertiary} fontSize="10" textAnchor="end">
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
                <circle
                  cx={x}
                  cy={yScale(band.upper)}
                  r="1.5"
                  fill={colors.accent.highlight}
                  opacity="0.5"
                />
                <circle
                  cx={x}
                  cy={yScale(band.lower)}
                  r="1.5"
                  fill={colors.accent.highlight}
                  opacity="0.5"
                />
              </g>
            );
          })}

        {/* Candles */}
        {data.map((candle, i) => {
          const x = 40 + i * candleWidth;
          const isGreen = candle.close >= candle.open;
          const bodyTop = yScale(Math.max(candle.open, candle.close));
          const bodyBottom = yScale(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(2, bodyBottom - bodyTop);
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
                stroke={isGreen ? colors.accent.profit : colors.accent.loss}
                strokeWidth="1.5"
              />
              <rect
                x={x + candleWidth * 0.2}
                y={bodyTop}
                width={candleWidth * 0.6}
                height={bodyHeight}
                fill={isGreen ? colors.accent.profit : colors.accent.loss}
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
                stroke={colors.accent.action}
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
                stroke={colors.accent.warning}
                strokeWidth="2"
              />
            );
          })}

        {/* Zoom selection */}
        {isZooming && zoomStart && zoomEnd && (
          <rect
            x={Math.min(zoomStart, zoomEnd)}
            y="40"
            width={Math.abs(zoomEnd - zoomStart)}
            height={height - 80}
            fill={colors.accent.action}
            fillOpacity="0.2"
            stroke={colors.accent.action}
            strokeWidth="2"
          />
        )}

        {/* Current price */}
        <text
          x={width - 15}
          y={30}
          fill={colors.accent.warning}
          fontSize="11"
          textAnchor="end"
          className="font-mono font-bold"
        >
          {data[data.length - 1]?.close.toFixed(5)}
        </text>
      </svg>

      {/* Tooltip */}
      {hoverPrice && (
        <div
          className="fixed bg-black/95 text-white p-3 rounded-lg text-xs border border-gray-700 shadow-2xl backdrop-blur-sm z-50 pointer-events-none"
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

// Volume Chart
const VolumeChart = ({ data, width = 800, height = 80, isDark = true }) => {
  const colors = getThemeColors(isDark);
  const maxVolume = Math.max(...data.map((d) => d.volume || 1000));
  const barWidth = Math.max((width - 80) / data.length, 2);

  return (
    <svg
      width={Math.max(width, 600)}
      height={height}
      className="rounded-xl"
      style={{ backgroundColor: colors.bg.secondary }}
    >
      {data.map((candle, i) => {
        const x = 40 + i * barWidth;
        const barHeight = ((candle.volume || 1000) / maxVolume) * (height - 30);
        const isGreen = candle.close >= candle.open;
        return (
          <rect
            key={i}
            x={x + barWidth * 0.2}
            y={height - barHeight - 15}
            width={barWidth * 0.6}
            height={Math.max(2, barHeight)}
            fill={isGreen ? colors.accent.profit : colors.accent.loss}
            fillOpacity="0.5"
          />
        );
      })}
    </svg>
  );
};

// Sentiment Gauge
const SentimentGauge = ({ sentiment = 65, isDark }) => {
  const colors = getThemeColors(isDark);
  const getColor = () => {
    if (sentiment > 70) return colors.accent.profit;
    if (sentiment > 50) return colors.accent.action;
    if (sentiment > 30) return colors.accent.warning;
    return colors.accent.loss;
  };

  return (
    <div
      className="rounded-2xl p-5 transition-all"
      style={{ backgroundColor: colors.bg.card, border: `1px solid ${colors.border}` }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium" style={{ color: colors.text.secondary }}>
          Market Sentiment
        </span>
        <Gauge size={20} style={{ color: colors.accent.action }} />
      </div>
      <div className="text-2xl font-bold mb-2" style={{ color: getColor() }}>
        {sentiment}%
      </div>
      <div className="text-xs mb-3" style={{ color: colors.text.tertiary }}>
        Bullish Bias
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: colors.bg.tertiary }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${sentiment}%`,
            background: `linear-gradient(90deg, ${colors.accent.loss}, ${colors.accent.warning}, ${colors.accent.profit})`,
          }}
        ></div>
      </div>
    </div>
  );
};

// Risk Meter
const RiskMeter = ({ risk = 35, isDark }) => {
  const colors = getThemeColors(isDark);
  const getRiskLevel = () => {
    if (risk < 30) return { text: 'Low Risk', color: colors.accent.profit };
    if (risk < 70) return { text: 'Medium Risk', color: colors.accent.warning };
    return { text: 'High Risk', color: colors.accent.loss };
  };

  const level = getRiskLevel();

  return (
    <div
      className="rounded-2xl p-5 transition-all"
      style={{ backgroundColor: colors.bg.card, border: `1px solid ${colors.border}` }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium" style={{ color: colors.text.secondary }}>
          Risk Meter
        </span>
        <AlertTriangle size={20} style={{ color: colors.accent.warning }} />
      </div>
      <div className="text-2xl font-bold mb-2" style={{ color: level.color }}>
        {risk}%
      </div>
      <div className="text-xs mb-3" style={{ color: colors.text.tertiary }}>
        {level.text}
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: colors.bg.tertiary }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${risk}%`,
            background: `linear-gradient(90deg, ${colors.accent.profit}, ${colors.accent.warning}, ${colors.accent.loss})`,
          }}
        ></div>
      </div>
    </div>
  );
};

// Live Signal Ticker
const SignalTicker = ({ isDark }) => {
  const colors = getThemeColors(isDark);
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
    <div
      className="rounded-xl p-3 transition-all animate-pulse"
      style={{
        background: `linear-gradient(135deg, ${colors.accent.action}20, ${colors.accent.highlight}20)`,
        border: `1px solid ${colors.accent.action}40`,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Zap size={16} style={{ color: colors.accent.warning }} />
          <span className="text-sm font-semibold" style={{ color: colors.text.primary }}>
            LIVE SIGNAL
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold" style={{ color: colors.text.primary }}>
            {signal.pair}
          </span>
          <SignalBadge
            type={signal.action.toLowerCase()}
            strength={signal.confidence}
            isDark={isDark}
          />
          <span className="text-xs" style={{ color: colors.text.tertiary }}>
            {signal.time}
          </span>
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
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const colors = getThemeColors(isDarkMode);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate chart data
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
        data.push({ open, high, low, close, volume });
        basePrice = close;
      }
      return data;
    };
    setChartData(generateData());
  }, [selectedPair, timeframe]);

  // Live price updates
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

  // Time updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Assistant response
  const sendMessage = (userMessage) => {
    if (!userMessage.trim()) return;

    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = {
        default: `🤔 **Analysis for ${selectedPair}**\n\n**Current:** ${currentPrice.toFixed(5)}\n**24H Change:** ${priceChange > 0 ? '+' : ''}${(priceChange * 100).toFixed(2)}%\n\n**Technical Outlook:**\n• Trend: ${priceChange > 0 ? 'Bullish momentum building' : 'Bearish pressure increasing'}\n• RSI: ${Math.floor(50 + priceChange * 1000)}\n• Support: ${(currentPrice - 0.003).toFixed(5)}\n• Resistance: ${(currentPrice + 0.003).toFixed(5)}`,
      };

      setChatHistory((prev) => [...prev, { role: 'assistant', content: responses.default }]);
      setIsTyping(false);
    }, 1000);
  };

  const quickQuestions = [
    'EUR/USD analysis',
    'Support/resistance',
    'Gold setup',
    'Market sentiment',
  ];
  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD'];
  const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D'];

  const handleZoom = (zoomedData) => {
    setZoomData(zoomedData);
    setTimeout(() => setZoomData(null), 3000);
  };

  const displayedData = zoomData || chartData;
  const chartWidth = Math.min(windowWidth - (windowWidth < 1024 ? 32 : 320), 1400);

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{ backgroundColor: colors.bg.primary }}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl shadow-lg transition-all"
        style={{ backgroundColor: colors.bg.card, color: colors.text.primary }}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="flex min-h-screen">
        {/* Sidebar - Responsive */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          style={{
            backgroundColor: colors.bg.secondary,
            borderRight: `1px solid ${colors.border}`,
          }}
        >
          <div className="p-5">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500">
                <Zap className="text-black" size={24} />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  KandoFX
                </span>
                <div className="text-xs" style={{ color: colors.text.tertiary }}>
                  Quant System
                </div>
              </div>
            </div>

            {/* Metrics */}
            <MetricCard
              title="Account Balance"
              value={`$${balance.toLocaleString()}`}
              change={pnl}
              icon={DollarSign}
              color="success"
              isDark={isDarkMode}
            />
            <div className="mt-4">
              <MetricCard
                title="Open Positions"
                value="3"
                change={127.5}
                icon={TrendingUp}
                color="action"
                isDark={isDarkMode}
              />
            </div>
            <div className="mt-4">
              <MetricCard
                title="Win Rate"
                value="68%"
                change={5.2}
                icon={Award}
                color="highlight"
                isDark={isDarkMode}
              />
            </div>

            {/* Sentiment & Risk */}
            <div className="mt-4">
              <SentimentGauge sentiment={65} isDark={isDarkMode} />
            </div>
            <div className="mt-4">
              <RiskMeter risk={35} isDark={isDarkMode} />
            </div>

            {/* Emergency Button */}
            <button
              className="w-full mt-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: `${colors.accent.loss}20`,
                border: `1px solid ${colors.accent.loss}50`,
                color: colors.accent.loss,
              }}
            >
              <Shield size={18} />
              Emergency Stop
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: colors.text.primary }}>
                Trading Assistant
              </h1>
              <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                AI-powered market analysis & signals
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl transition-all hover:scale-105"
                style={{ backgroundColor: colors.bg.card, color: colors.text.primary }}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl transition-all hover:scale-105 hidden lg:block"
                style={{ backgroundColor: colors.bg.card, color: colors.text.primary }}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <div
                className="px-3 py-1.5 rounded-full text-xs flex items-center gap-2"
                style={{
                  backgroundColor: `${colors.accent.success}20`,
                  color: colors.accent.success,
                }}
              >
                <Activity size={10} className="animate-pulse" />
                LIVE
              </div>
              <div className="text-xs" style={{ color: colors.text.tertiary }}>
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Signal Ticker */}
          <div className="mb-6">
            <SignalTicker isDark={isDarkMode} />
          </div>

          {/* Price Bar */}
          <div
            className="rounded-2xl p-5 mb-6 transition-all"
            style={{ backgroundColor: colors.bg.card, border: `1px solid ${colors.border}` }}
          >
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-2 flex-wrap">
                {pairs.map((pair) => (
                  <button
                    key={pair}
                    onClick={() => setSelectedPair(pair)}
                    className="px-3 lg:px-4 py-2 rounded-xl text-sm lg:text-base font-medium transition-all duration-300"
                    style={
                      selectedPair === pair
                        ? { backgroundColor: colors.accent.action, color: 'white' }
                        : { backgroundColor: colors.bg.tertiary, color: colors.text.secondary }
                    }
                  >
                    {pair}
                  </button>
                ))}
              </div>
              <div className="text-right">
                <div
                  className="text-2xl lg:text-4xl font-mono font-bold"
                  style={{ color: colors.text.primary }}
                >
                  {currentPrice.toFixed(5)}
                </div>
                <div
                  className={`flex items-center gap-1 justify-end mt-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {priceChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {priceChange >= 0 ? '+' : ''}
                  {(priceChange * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div
            className="rounded-2xl p-4 lg:p-5 mb-6 transition-all overflow-x-auto"
            style={{ backgroundColor: colors.bg.card, border: `1px solid ${colors.border}` }}
          >
            {/* Timeframes & Indicators */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <div className="flex gap-1 lg:gap-2 flex-wrap">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className="px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm transition-all"
                    style={
                      timeframe === tf
                        ? { backgroundColor: colors.accent.action, color: 'white' }
                        : { backgroundColor: colors.bg.tertiary, color: colors.text.secondary }
                    }
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 lg:gap-2 flex-wrap">
                <button
                  onClick={() => setShowSMA(!showSMA)}
                  className="px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm flex items-center gap-1 transition-all"
                  style={
                    showSMA
                      ? { backgroundColor: colors.accent.action, color: 'white' }
                      : { backgroundColor: colors.bg.tertiary, color: colors.text.secondary }
                  }
                >
                  <LineChart size={12} /> SMA
                </button>
                <button
                  onClick={() => setShowEMA(!showEMA)}
                  className="px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm flex items-center gap-1 transition-all"
                  style={
                    showEMA
                      ? { backgroundColor: colors.accent.action, color: 'white' }
                      : { backgroundColor: colors.bg.tertiary, color: colors.text.secondary }
                  }
                >
                  <TrendingUp size={12} /> EMA
                </button>
                <button
                  onClick={() => setShowBollinger(!showBollinger)}
                  className="px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm flex items-center gap-1 transition-all"
                  style={
                    showBollinger
                      ? { backgroundColor: colors.accent.action, color: 'white' }
                      : { backgroundColor: colors.bg.tertiary, color: colors.text.secondary }
                  }
                >
                  <BarChart3 size={12} /> BB
                </button>
              </div>
            </div>

            {/* Chart */}
            <AdvancedChart
              data={displayedData}
              width={chartWidth - 40}
              height={windowWidth < 768 ? 300 : 450}
              showSMA={showSMA}
              showEMA={showEMA}
              showBollinger={showBollinger}
              onZoom={handleZoom}
              isDark={isDarkMode}
            />

            {/* Volume */}
            <div className="mt-3">
              <VolumeChart
                data={displayedData}
                width={chartWidth - 40}
                height={60}
                isDark={isDarkMode}
              />
            </div>

            <div className="mt-3 text-center text-xs" style={{ color: colors.text.tertiary }}>
              💡 Click and drag on chart to zoom • Hover candles for details
            </div>
          </div>

          {/* Chat Section */}
          <div
            className="rounded-2xl transition-all"
            style={{ backgroundColor: colors.bg.card, border: `1px solid ${colors.border}` }}
          >
            <div className="p-4 lg:p-5 border-b" style={{ borderColor: colors.border }}>
              <h3
                className="font-semibold flex items-center gap-2 text-base lg:text-lg"
                style={{ color: colors.text.primary }}
              >
                <Zap size={18} className="text-yellow-500" />
                AI Trading Assistant
              </h3>
            </div>

            <div className="h-80 lg:h-96 overflow-y-auto p-4 lg:p-5 space-y-3">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[85%] p-3 lg:p-4 rounded-2xl transition-all`}
                    style={
                      msg.role === 'user'
                        ? { backgroundColor: colors.accent.action, color: 'white' }
                        : { backgroundColor: colors.bg.tertiary, color: colors.text.primary }
                    }
                  >
                    <p className="text-xs lg:text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl" style={{ backgroundColor: colors.bg.tertiary }}>
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: colors.text.tertiary }}
                      ></span>
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: colors.text.tertiary, animationDelay: '0.1s' }}
                      ></span>
                      <span
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: colors.text.tertiary, animationDelay: '0.2s' }}
                      ></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 lg:p-5 border-t" style={{ borderColor: colors.border }}>
              <div className="flex flex-wrap gap-2 mb-4">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                    style={{ backgroundColor: colors.bg.tertiary, color: colors.text.secondary }}
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
                  placeholder="Ask about technical analysis, trade setups..."
                  className="flex-1 rounded-xl px-4 py-2 lg:py-3 text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: colors.bg.primary,
                    border: `1px solid ${colors.border}`,
                    color: colors.text.primary,
                  }}
                />
                <button
                  onClick={() => sendMessage(message)}
                  className="px-4 lg:px-6 rounded-xl transition-all hover:scale-105 flex items-center gap-2 text-sm"
                  style={{ backgroundColor: colors.accent.action, color: 'white' }}
                >
                  <Send size={16} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
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
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }

        /* Smooth scrolling */
        * {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${colors.bg.tertiary};
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: ${colors.accent.action};
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${colors.accent.highlight};
        }
      `}</style>
    </div>
  );
}
