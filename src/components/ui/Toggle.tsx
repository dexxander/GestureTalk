import { motion } from 'motion/react';

/** Size presets for the Toggle. */
type ToggleSize = 'sm' | 'md';

interface ToggleProps {
  /** Whether the toggle is on */
  checked: boolean;
  /** Called when the toggle state changes */
  onChange: (checked: boolean) => void;
  /** Optional text label */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size preset */
  size?: ToggleSize;
  /** Additional CSS classes */
  className?: string;
}

const trackSizes: Record<ToggleSize, string> = {
  sm: 'w-8 h-[18px]',
  md: 'w-11 h-6',
};

const thumbSizes: Record<ToggleSize, { size: string; travel: number; diameter: number }> = {
  sm: { size: 'size-3.5', travel: 14, diameter: 14 },
  md: { size: 'size-5', travel: 20, diameter: 20 },
};

/**
 * A smooth animated toggle switch using `motion.div` for the thumb.
 * Renders as an accessible button with `role="switch"`.
 */
export const Toggle = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className = '',
}: ToggleProps) => {
  const { size: thumbSize, travel } = thumbSizes[size];

  return (
    <label
      className={[
        'inline-flex items-center gap-2.5 select-none',
        disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex items-center rounded-full p-0.5',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
          'cursor-pointer',
          trackSizes[size],
          checked
            ? 'bg-purple-600'
            : 'bg-white/[0.1]',
        ].join(' ')}
      >
        <motion.div
          className={[
            'rounded-full bg-white shadow-sm',
            thumbSize,
          ].join(' ')}
          initial={false}
          animate={{ x: checked ? travel : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          aria-hidden="true"
        />
      </button>

      {label && (
        <span className="text-sm text-gray-300">{label}</span>
      )}
    </label>
  );
};
