import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

/** Visual style variants for the Badge. */
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

/** Size presets for the Badge. */
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  /** Visual style variant */
  variant?: BadgeVariant;
  /** Size preset */
  size?: BadgeSize;
  /** Show a colored dot indicator before the text */
  dot?: boolean;
  /** Animate the dot with a pulse effect */
  pulse?: boolean;
  /** Show a remove (X) button and fire this callback on click */
  onRemove?: () => void;
  /** Badge content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'bg-white/[0.08] text-gray-300 border border-white/[0.06]',
  success:
    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  warning:
    'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  danger:
    'bg-red-500/15 text-red-400 border border-red-500/20',
  info:
    'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  outline:
    'bg-transparent text-gray-400 border border-gray-600',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-blue-400',
  outline: 'bg-gray-400',
};

const pulseColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-400/40',
  success: 'bg-emerald-400/40',
  warning: 'bg-amber-400/40',
  danger: 'bg-red-400/40',
  info: 'bg-blue-400/40',
  outline: 'bg-gray-400/40',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1 rounded-md',
  md: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
};

/**
 * A small status indicator badge with optional dot, pulse animation,
 * and remove button. Enters and exits with smooth scaling.
 */
export const Badge = ({
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  onRemove,
  children,
  className = '',
}: BadgeProps) => {
  return (
    <AnimatePresence>
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className={[
          'inline-flex items-center font-medium leading-none select-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        role="status"
      >
        {/* Dot indicator */}
        {dot && (
          <span className="relative flex-shrink-0" aria-hidden="true">
            <span className={`block size-1.5 rounded-full ${dotColors[variant]}`} />
            {pulse && (
              <span
                className={`absolute inset-0 size-1.5 rounded-full animate-ping ${pulseColors[variant]}`}
              />
            )}
          </span>
        )}

        <span className="truncate">{children}</span>

        {/* Remove button */}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-0.5 -mr-0.5 flex-shrink-0 rounded-full p-0.5 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 cursor-pointer"
            aria-label="Remove"
          >
            <X className="size-3" />
          </button>
        )}
      </motion.span>
    </AnimatePresence>
  );
};
