import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-sans transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#cc785c]/30 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';
    
    const variants = {
      primary: 'bg-[#141413] text-[#faf9f5] hover:bg-[#252320] active:bg-[#0a0a09] shadow-xs font-semibold',
      terracotta: 'bg-[#cc785c] text-white hover:bg-[#b8674d] active:bg-[#a9583e] shadow-xs font-semibold',
      secondary: 'bg-white border border-[#e6dfd8] text-[#141413] hover:bg-[#efe9de]/60 shadow-2xs font-medium',
      outline: 'border border-[#e6dfd8] bg-transparent hover:bg-[#efe9de]/50 text-[#141413] font-medium',
      ghost: 'bg-transparent hover:bg-[#efe9de]/60 text-[#141413] font-medium',
      danger: 'bg-[#c64545] text-white hover:bg-[#a83636] shadow-xs font-medium',
    };
    
    const sizes = {
      sm: 'h-8 px-3.5 text-xs',
      md: 'h-9 px-4 text-xs font-medium',
      lg: 'h-11 px-6 text-sm font-semibold',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
