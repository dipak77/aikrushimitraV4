import React from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  ...props
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center font-bold tracking-widest uppercase rounded-full select-none font-mono',
        // Variants
        {
          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20':
            variant === 'success',
          'bg-amber-500/10 text-amber-400 border border-amber-500/20':
            variant === 'warning',
          'bg-red-500/10 text-red-400 border border-red-500/20':
            variant === 'error',
          'bg-blue-500/10 text-blue-400 border border-blue-500/20':
            variant === 'info',
          'bg-white/5 text-slate-400 border border-white/5':
            variant === 'neutral',
        },
        // Sizes
        {
          'text-[10px] px-2 py-0.5': size === 'sm',
          'text-xs px-3 py-1': size === 'md',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
