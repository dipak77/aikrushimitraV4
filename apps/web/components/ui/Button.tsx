import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'relative inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full select-none active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
        // Variants
        {
          'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow hover:shadow-glow-strong':
            variant === 'primary',
          'bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/10':
            variant === 'secondary',
          'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white':
            variant === 'ghost',
          'bg-red-500 hover:bg-red-400 text-white':
            variant === 'danger',
        },
        // Sizes
        {
          'text-xs px-3 py-1.5 h-8': size === 'sm',
          'text-sm px-4 py-2 h-10': size === 'md',
          'text-base px-6 py-2.5 h-12': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      <span className={clsx(isLoading && 'opacity-0')}>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  );
};
