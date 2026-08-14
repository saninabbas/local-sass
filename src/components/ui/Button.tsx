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
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#cc785c]/30 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none';
    
    const variants = {
      primary: 'bg-[#cc785c] text-white hover:bg-[#a9583e] active:bg-[#a9583e] shadow-sm',
      secondary: 'bg-[#faf9f5] border border-[#e6dfd8] text-[#141413] hover:bg-[#efe9de] shadow-sm',
      outline: 'border border-[#e6dfd8] bg-transparent hover:bg-[#efe9de] text-[#141413]',
      ghost: 'bg-transparent hover:bg-[#efe9de] text-[#141413]',
      danger: 'bg-[#c64545] text-white hover:bg-[#a83636] shadow-sm',
    };
    
    const sizes = {
      sm: 'h-8 px-3.5 text-xs',
      md: 'h-10 px-5 text-sm',
      lg: 'h-12 px-7 text-base',
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
