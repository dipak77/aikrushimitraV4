import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'data' | 'feature' | 'elevated';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  hoverable = true,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-2xl transition-all duration-300 overflow-hidden',
        // Variants
        {
          'bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-md':
            variant === 'glass',
          'bg-neutral-900/60 border border-white/5':
            variant === 'data',
          'bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5':
            variant === 'feature',
          'bg-neutral-950 border border-white/10 shadow-xl':
            variant === 'elevated',
        },
        // Hover interactions
        {
          'hover:bg-white/[0.05] hover:border-emerald-500/30 hover:-translate-y-0.5 hover:shadow-glow':
            hoverable && variant === 'glass',
          'hover:border-emerald-500/20 hover:shadow-md':
            hoverable && variant === 'data',
          'hover:bg-white/[0.06] hover:border-emerald-500/40':
            hoverable && variant === 'feature',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
