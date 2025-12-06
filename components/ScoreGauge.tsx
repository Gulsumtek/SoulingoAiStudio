import React from 'react';

interface ScoreGaugeProps {
  score: number; // 0-100
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const radius = 60;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'text-red-500';
  if (score >= 60) colorClass = 'text-yellow-500';
  if (score >= 80) colorClass = 'text-green-500';
  if (score >= 90) colorClass = 'text-cyan-500';

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg]"
      >
        <circle
          stroke="#334155"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={colorClass}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${colorClass}`}>{score}</span>
        <span className="text-xs text-slate-400">SCORE</span>
      </div>
    </div>
  );
};