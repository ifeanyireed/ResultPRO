// Risk Level Badge Component
import React from 'react';
import { AlertTriangle, AlertCircle, Info } from '@/lib/hugeicons-compat';

interface RiskLevelBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score?: number;
}

export const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({ level, score }) => {
  const colorMap: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    LOW: {
      bg: 'bg-green-500/10 border-green-500/20',
      text: 'text-green-400',
      icon: <Info className="w-3 h-3" />,
    },
    MEDIUM: {
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-400',
      icon: <AlertCircle className="w-3 h-3" />,
    },
    HIGH: {
      bg: 'bg-orange-500/10 border-orange-500/20',
      text: 'text-orange-400',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    CRITICAL: {
      bg: 'bg-red-500/10 border-red-500/20',
      text: 'text-red-400',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
  };

  const style = colorMap[level];

  return (
    <div className={`${style.bg} border rounded-full px-3 py-1 inline-flex items-center gap-2`}>
      <div className={style.text}>{style.icon}</div>
      <span className={`${style.text} text-xs font-medium`}>
        {level}{score !== undefined && ` (${score})`}
      </span>
    </div>
  );
};

// Performance Tier Progress Bar
interface PerformanceBarProps {
  value?: number;
  maxValue?: number;
  percentage?: number;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
  showLabel?: boolean;
}

export const PerformanceBar: React.FC<PerformanceBarProps> = ({
  value,
  maxValue,
  percentage,
  color = 'blue',
  showLabel = true,
}) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  // Support both value/maxValue and percentage
  const perc = percentage !== undefined ? percentage : (value && maxValue ? (value / maxValue) * 100 : 0);

  return (
    <div className="w-full">
      {showLabel && value !== undefined && maxValue !== undefined && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-gray-300">{value}</span>
          <span className="text-xs text-gray-500">{maxValue}</span>
        </div>
      )}
      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
        <div
          className={`${colorMap[color]} h-full rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

// Distribution Gauge (Circular progress)
interface DistributionGaugeProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

export const DistributionGauge: React.FC<DistributionGaugeProps> = ({
  label,
  value,
  maxValue,
  color,
}) => {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="text-center">
      <div className="mb-2">
        <div className="w-16 h-16 mx-auto rounded-full border-4 border-white/10 flex items-center justify-center"
          style={{
            background: `conic-gradient(${color} ${percentage}%, transparent 0)`,
            opacity: 0.3,
          }}>
          <div className="w-14 h-14 rounded-full bg-[rgba(15,23,42,0.8)] flex items-center justify-center">
            <span className="text-lg font-bold text-white">{value}</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-white">{percentage.toFixed(0)}%</p>
    </div>
  );
};
