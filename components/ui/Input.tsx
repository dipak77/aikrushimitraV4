import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-slate-400 font-display tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-slate-500 flex items-center pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            id={id}
            type={type}
            ref={ref}
            className={clsx(
              'w-full h-11 bg-white/[0.03] hover:bg-white/[0.05] border rounded-xl text-sm font-medium text-slate-200 transition-all duration-200 outline-none focus:bg-black/40',
              // Padding based on icons
              leftIcon ? 'pl-10' : 'pl-4',
              rightIcon ? 'pr-10' : 'pr-4',
              // Error vs default state
              error
                ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-white/10 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 focus:shadow-glow',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-slate-500 flex items-center pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <span className="text-xs font-medium text-red-400">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-slate-400 font-display tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={id}
            ref={ref}
            className={clsx(
              'w-full h-11 bg-white/[0.03] hover:bg-white/[0.05] border rounded-xl text-sm font-medium text-slate-200 transition-all duration-200 outline-none focus:bg-black/40 appearance-none pr-10 pl-4',
              error
                ? 'border-red-500/50 focus:border-red-500'
                : 'border-white/10 focus:border-emerald-500/80 focus:shadow-glow',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-neutral-900 text-slate-200">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-slate-400 flex items-center">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {error && <span className="text-xs font-medium text-red-400">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
