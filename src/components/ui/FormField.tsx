import type { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FormField({ label, id, className = '', ...props }: FormFieldProps) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-semibold text-primary mb-2">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-primary text-base focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all ${className}`}
        {...props}
      />
    </div>
  );
}
