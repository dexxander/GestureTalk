import { useId, type ChangeEvent, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

/** A single option in the Select dropdown. */
interface SelectOption {
  /** The value submitted with the form */
  value: string;
  /** Human-readable label */
  label: string;
  /** Disable this specific option */
  disabled?: boolean;
}

interface SelectProps {
  /** Currently selected value */
  value: string;
  /** Called when a new option is selected */
  onChange: (value: string) => void;
  /** List of available options */
  options: SelectOption[];
  /** Placeholder shown when no value is selected */
  placeholder?: string;
  /** Accessible label */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Optional icon rendered to the left */
  icon?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A styled native `<select>` that visually matches the dark theme
 * while retaining full keyboard navigation and accessibility.
 */
export const Select = ({
  value,
  onChange,
  options,
  placeholder,
  label,
  disabled = false,
  icon,
  className = '',
}: SelectProps) => {
  const id = useId();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Leading icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}

        <select
          id={id}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-label={label}
          className={[
            'w-full appearance-none rounded-xl',
            'bg-white/[0.04] text-gray-200 text-sm',
            'border border-white/[0.08]',
            'h-10',
            icon ? 'pl-9 pr-10' : 'pl-4 pr-10',
            'transition-colors duration-200',
            'hover:bg-white/[0.06] hover:border-white/[0.14]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
            'disabled:opacity-50 disabled:pointer-events-none',
            'cursor-pointer',
            /* Style the placeholder option */
            value === '' ? 'text-gray-500' : '',
          ].join(' ')}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              className="bg-gray-900 text-gray-200"
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron indicator */}
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
