import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'amber' | 'rose' | 'sage';
  onRemove?: () => void;
}

const variantClasses: Record<string, string> = {
  default: 'bg-golden text-espresso',
  amber: 'bg-amber/15 text-amber',
  rose: 'bg-rose-light text-rose',
  sage: 'bg-sage/20 text-sage',
};

export function Badge({ children, variant = 'default', onRemove }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${variantClasses[variant]}`}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 cursor-pointer"
        >
          ×
        </button>
      )}
    </span>
  );
}
