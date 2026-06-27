import React from 'react';
import clsx from 'clsx';

interface PriceTagProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  trend?: 'up' | 'down' | 'stable';
  change?: string | number;
  unit?: string;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  value,
  trend = 'stable',
  change,
  unit = 'क्विंटल',
  className,
  ...props
}) => {
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <div className={clsx('inline-flex items-baseline gap-1.5 font-mono', className)} {...props}>
      <span className="text-xl font-black text-slate-100">{formattedPrice}</span>
      {unit && <span className="text-[10px] font-bold text-slate-400 font-display uppercase">/ {unit}</span>}
      {change && (
        <span
          className={clsx(
            'text-[10px] font-black flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded-md',
            {
              'bg-emerald-500/10 text-emerald-400': trend === 'up',
              'bg-red-500/10 text-red-400': trend === 'down',
              'bg-white/5 text-slate-400': trend === 'stable',
            }
          )}
        >
          {trend === 'up' && '▲'}
          {trend === 'down' && '▼'}
          {trend === 'stable' && '─'}
          {change}
        </span>
      )}
    </div>
  );
};
