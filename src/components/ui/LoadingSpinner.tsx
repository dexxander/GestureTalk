import { motion } from 'motion/react';

/** Size presets for the LoadingSpinner. */
type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  /** Size preset */
  size?: SpinnerSize;
  /** Optional text displayed below the spinner */
  text?: string;
  /** Render as a full-page centered overlay */
  overlay?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const sizeConfig: Record<SpinnerSize, { ring: string; border: string; textSize: string }> = {
  sm: { ring: 'size-5', border: 'border-2', textSize: 'text-xs' },
  md: { ring: 'size-8', border: 'border-[3px]', textSize: 'text-sm' },
  lg: { ring: 'size-12', border: 'border-4', textSize: 'text-base' },
};

/**
 * An animated loading spinner with optional text and full-page overlay mode.
 * Uses `motion.div` for a smooth spin animation.
 */
export const LoadingSpinner = ({
  size = 'md',
  text,
  overlay = false,
  className = '',
}: LoadingSpinnerProps) => {
  const { ring, border, textSize } = sizeConfig[size];

  const spinner = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-label={text ?? 'Loading'}
    >
      <motion.div
        className={[
          ring,
          border,
          'rounded-full',
          'border-white/[0.1]',
          'border-t-purple-500',
        ].join(' ')}
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'linear',
        }}
        aria-hidden="true"
      />

      {text && (
        <p className={`text-gray-400 font-medium ${textSize}`}>
          {text}
        </p>
      )}

      {/* Screen-reader fallback */}
      <span className="sr-only">{text ?? 'Loading'}</span>
    </div>
  );

  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm"
      >
        {spinner}
      </motion.div>
    );
  }

  return spinner;
};
