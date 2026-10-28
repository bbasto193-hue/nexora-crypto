import React, { useState, useMemo } from 'react';
import { useCrypto } from '../../context/CryptoContext';

interface InteractiveChartProps {
  baseValue: number;
  timeRange: string;
  onTimeRangeChange?: (range: string) => void;
  title?: string;
  isPositive?: boolean;
  assetSymbol?: string;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  baseValue,
  timeRange,
  onTimeRangeChange,
  title = 'Portfolio Performance',
  assetSymbol
}) => {
  const { formatCurrency } = useCrypto();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Generate realistic historical curve based on timeRange and baseValue
  const chartData = useMemo(() => {
    let count = 24;
    let volatility = 0.015;
    let trend = 0.002;
    let labelPrefix = 'Hour';

    if (timeRange === '24H') {
      count = 24;
      volatility = 0.008;
      trend = 0.001;
      labelPrefix = 'h';
    } else if (timeRange === '7D') {
      count = 28;
      volatility = 0.018;
      trend = 0.003;
      labelPrefix = 'd';
    } else if (timeRange === '1M') {
      count = 30;
      volatility = 0.025;
      trend = 0.005;
      labelPrefix = 'Day';
    } else if (timeRange === '1Y') {
      count = 36;
      volatility = 0.04;
      trend = 0.012;
      labelPrefix = 'M';
    } else {
      // ALL
      count = 40;
      volatility = 0.05;
      trend = 0.018;
      labelPrefix = 'Q';
    }

    // Seeded random walk ending precisely at baseValue
    const rawPoints: number[] = [baseValue * 0.92];
    for (let i = 1; i < count; i++) {
      const prev = rawPoints[i - 1];
      const delta = (Math.sin(i * 1.3) * 0.6 + (Math.cos(i * 0.7) * 0.4) + trend) * volatility * prev;
      rawPoints.push(Math.max(10, prev + delta));
    }

    // Normalize so the last point equals current baseValue
    const last = rawPoints[rawPoints.length - 1];
    const factor = baseValue / (last || 1);
    const normalized = rawPoints.map((v) => +(v * factor).toFixed(2));

    const startVal = normalized[0];
    const endVal = normalized[normalized.length - 1];
    const diff = endVal - startVal;
    const diffPct = (diff / (startVal || 1)) * 100;

    return {
      points: normalized,
      startVal,
      endVal,
      diff,
      diffPct,
      min: Math.min(...normalized),
      max: Math.max(...normalized),
      count,
      labelPrefix
    };
  }, [baseValue, timeRange]);

  const activeIndex = hoverIndex !== null ? hoverIndex : chartData.points.length - 1;
  const activeValue = chartData.points[activeIndex] || baseValue;
  const activeDiff = activeValue - chartData.startVal;
  const activeDiffPct = (activeDiff / (chartData.startVal || 1)) * 100;
  const isPositive = activeDiff >= 0;

  // SVG Geometry
  const width = 800;
  const height = 280;
  const paddingX = 20;
  const paddingY = 30;
  const rangeY = chartData.max - chartData.min || 1;

  const coordinates = chartData.points.map((val, idx) => {
    const x = paddingX + (idx / (chartData.points.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((val - chartData.min) / rangeY) * (height - paddingY * 2);
    return { x, y, val };
  });

  const pathD = `M ${coordinates.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' L ')}`;
  const areaD = `${pathD} L ${coordinates[coordinates.length - 1].x.toFixed(1)},${height - 10} L ${coordinates[0].x.toFixed(1)},${height - 10} Z`;

  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const glowColor = isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';

  return (
    <div className="flex flex-col w-full">
      {/* Header with Title and Range Picker */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">{title}</div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
              {formatCurrency(activeValue)}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(activeDiff)} ({isPositive ? '+' : ''}
              {activeDiffPct.toFixed(2)}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {hoverIndex !== null ? (
              <span className="text-cyan-400 font-mono">
                Simulated {timeRange} checkpoint ({chartData.labelPrefix} #{hoverIndex + 1})
              </span>
            ) : (
              <span>Simulated market valuation</span>
            )}
          </div>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex items-center bg-[#0e1420] p-1 rounded-xl border border-white/10 shadow-inner">
          {['24H', '7D', '1M', '1Y', 'ALL'].map((range) => {
            const isActive = timeRange === range;
            return (
              <button
                key={range}
                onClick={() => onTimeRangeChange?.(range)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Chart Canvas / SVG */}
      <div className="relative w-full pt-4 select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 sm:h-64 overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
              <stop offset="60%" stopColor={strokeColor} stopOpacity="0.06" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
            {/* Grid Line Pattern */}
            <pattern id="grid" width="80" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="80" y2="0" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Subtle baseline */}
          <line
            x1={paddingX}
            y1={height - 10}
            x2={width - paddingX}
            y2={height - 10}
            stroke="rgba(255,255,255,0.06)"
          />

          {/* Area Fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 2px 8px ${glowColor})` }}
          />

          {/* Interactive Crosshair & Indicator Point */}
          {coordinates.map((pt, idx) => {
            const isHovered = activeIndex === idx;
            return (
              <g key={idx}>
                {/* Hit testing column */}
                <rect
                  x={pt.x - (width / chartData.points.length) / 2}
                  y={0}
                  width={width / chartData.points.length}
                  height={height}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIndex(idx)}
                />

                {isHovered && (
                  <>
                    {/* Vertical dashed guide line */}
                    <line
                      x1={pt.x}
                      y1={paddingY - 10}
                      x2={pt.x}
                      y2={height - 10}
                      stroke="rgba(255, 255, 255, 0.25)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />

                    {/* Outer Glow Halo */}
                    <circle cx={pt.x} cy={pt.y} r="8" fill={strokeColor} opacity="0.3" />
                    {/* Inner Solid Marker */}
                    <circle cx={pt.x} cy={pt.y} r="4.5" fill="#ffffff" stroke={strokeColor} strokeWidth="2.5" />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic High/Low Stats Footer */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">SIMULATED RANGE:</span>
            <span className="text-rose-400/90 font-semibold">Low {formatCurrency(chartData.min)}</span>
            <span>—</span>
            <span className="text-emerald-400/90 font-semibold">High {formatCurrency(chartData.max)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Real-Time Simulation Feed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
