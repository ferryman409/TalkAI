import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-espresso mb-1.5">{label}</label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-2.5 bg-warm-white border border-tan rounded-xl
            text-espresso placeholder:text-mocha/50 resize-none
            focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber
            transition-all duration-200 ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-rose">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
