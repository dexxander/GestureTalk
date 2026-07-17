import { useId, useCallback, type ChangeEvent } from 'react';

interface SliderProps {
  /** Current value */
  value: number;
  /** Called when the slider value changes */
  onChange: (value: number) => void;
  /** Minimum value (default 0) */
  min?: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Step increment (default 1) */
  step?: number;
  /** Accessible label */
  label?: string;
  /** Show min/max labels below the track */
  showMinMax?: boolean;
  /** Show the current value above the thumb */
  showValue?: boolean;
  /** Format the displayed value */
  formatValue?: (value: number) => string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A custom-styled range slider with colored fill, value display,
 * and min/max labels. The fill color is derived from the current position.
 */
export const Slider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showMinMax = false,
  showValue = true,
  formatValue = (v) => String(v),
  disabled = false,
  className = '',
}: SliderProps) => {
  const id = useId();
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label + value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={id}
              className="text-sm font-medium text-gray-300"
            >
              {label}
            </label>
          )}
          {showValue && (
            <span
              className="text-sm font-semibold text-purple-400 tabular-nums"
              aria-live="polite"
            >
              {formatValue(value)}
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div className="relative flex items-center h-6">
        {/* Background track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/[0.06]" />

        {/* Filled portion */}
        <div
          className="absolute left-0 h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-[width] duration-75"
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />

        {/* Native input */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={formatValue(value)}
          className={[
            'relative w-full h-1.5 appearance-none bg-transparent cursor-pointer z-10',
            /* Webkit thumb */
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-black/30',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-500',
            '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150',
            '[&::-webkit-slider-thumb]:hover:scale-125',
            /* Firefox thumb */
            '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2',
            '[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-purple-500',
            '[&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:shadow-black/30',
            /* Firefox track */
            '[&::-moz-range-track]:bg-transparent [&::-moz-range-track]:h-1.5',
            /* Focus */
            'focus-visible:outline-none',
            '[&::-webkit-slider-thumb]:focus-visible:ring-2 [&::-webkit-slider-thumb]:focus-visible:ring-purple-500/70',
            disabled ? 'opacity-50 pointer-events-none' : '',
          ].join(' ')}
        />
      </div>

      {/* Min / Max labels */}
      {showMinMax && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}
    </div>
  );
};
