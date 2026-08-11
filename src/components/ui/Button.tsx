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
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-accent focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-primary-accent text-white hover:bg-blue-700 shadow-sm',
      secondary: 'bg-primary text-white hover:bg-gray-800 shadow-sm',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-primary',
      ghost: 'bg-transparent hover:bg-gray-100 text-primary',
      danger: 'bg-danger text-white hover:bg-red-600 shadow-sm',
    };
    
    const sizes = {
      sm: 'h-10 px-4 text-sm',
      md: 'h-11 px-5 text-base',
      lg: 'h-14 px-8 text-lg',
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
