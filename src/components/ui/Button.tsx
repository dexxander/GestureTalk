import { motion, type HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

/** Supported visual styles for the Button component. */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass' | 'outline';

/** Supported size presets for the Button component. */
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Shows a loading spinner and disables interaction */
  loading?: boolean;
  /** Optional icon rendered to the left of children */
  iconLeft?: ReactNode;
  /** Optional icon rendered to the right of children */
  iconRight?: ReactNode;
  /** Stretches the button to fill its parent width */
  fullWidth?: boolean;
  /** Button content */
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-purple-600 text-white shadow-lg shadow-purple-500/25 hover:bg-purple-500 active:bg-purple-700',
  secondary:
    'bg-white/[0.06] text-gray-200 border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.14]',
  ghost:
    'bg-transparent text-gray-300 hover:bg-white/[0.06] hover:text-white',
  danger:
    'bg-red-600/90 text-white shadow-lg shadow-red-500/25 hover:bg-red-500 active:bg-red-700',
  glass:
    'bg-white/[0.06] backdrop-blur-xl text-white border border-white/[0.1] hover:bg-white/[0.1] shadow-lg shadow-black/10',
  outline:
    'bg-transparent text-purple-400 border border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-400',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
};

/**
 * A premium animated button with multiple variants, sizes, loading state,
 * and icon support. Built on `motion.button` for smooth micro-interactions.
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...motionProps
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={[
        'relative inline-flex items-center justify-center font-medium',
        'transition-colors duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
        'disabled:pointer-events-none disabled:opacity-50',
        'cursor-pointer select-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...motionProps}
    >
      {loading && (
        <Loader2
          className={`animate-spin ${iconSizeClasses[size]}`}
          aria-hidden="true"
        />
      )}

      {!loading && iconLeft && (
        <span className={`flex-shrink-0 ${iconSizeClasses[size]}`} aria-hidden="true">
          {iconLeft}
        </span>
      )}

      <span className="truncate">{children}</span>

      {!loading && iconRight && (
        <span className={`flex-shrink-0 ${iconSizeClasses[size]}`} aria-hidden="true">
          {iconRight}
        </span>
      )}
    </motion.button>
  );
};
