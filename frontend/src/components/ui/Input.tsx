import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-espresso mb-1.5">{label}</label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 bg-warm-white border border-tan rounded-xl
            text-espresso placeholder:text-mocha/50
            focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber
            transition-all duration-200 ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-rose">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
