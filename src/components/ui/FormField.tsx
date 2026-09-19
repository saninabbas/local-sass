import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ 
  label, 
  id, 
  type = 'text', 
  className = '', 
  error, 
  ...props 
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-xs font-mono uppercase tracking-wider text-[#6c6a64] mb-1.5 font-medium">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          type={inputType}
          className={`w-full px-3.5 py-2.5 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] text-sm font-sans placeholder-[#8e8b82] focus:outline-none focus:ring-1 focus:ring-[#cc785c] focus:border-[#cc785c] transition-all ${
            isPassword ? 'pr-11' : ''
          } ${error ? 'border-[#c64545]' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 p-1.5 text-[#6c6a64] hover:text-[#141413] transition-colors focus:outline-none rounded-md hover:bg-[#efe9de]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} className="text-[#cc785c]" /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-[11px] font-mono text-[#c64545]">{error}</p>
      )}
    </div>
  );
}
