import type { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FormField({ label, id, className = '', ...props }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-xs font-mono uppercase tracking-wider text-[#6c6a64] mb-1">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-3.5 py-2 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#cc785c] focus:border-[#cc785c] transition-all ${className}`}
        {...props}
      />
    </div>
  );
}
