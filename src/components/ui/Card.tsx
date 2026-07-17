import { motion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';

/** Background style variants for the Card. */
type CardVariant = 'glass' | 'glass-strong' | 'solid';

/** Padding presets for the Card body. */
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLMotionProps<'div'> {
  /** Glass effect intensity */
  variant?: CardVariant;
  /** Padding preset */
  padding?: CardPadding;
  /** Enable animated gradient glow border */
  glow?: boolean;
  /** Enable hover lift/scale effect */
  hoverLift?: boolean;
  children: ReactNode;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<CardVariant, string> = {
  glass:
    'bg-white/[0.04] backdrop-blur-xl border border-white/[0.06]',
  'glass-strong':
    'bg-white/[0.08] backdrop-blur-2xl border border-white/[0.1]',
  solid:
    'bg-gray-900 border border-gray-800',
};

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

/**
 * A premium glassmorphism card with optional animated glow border
 * and hover lift. Compose with `CardHeader`, `CardBody`, and `CardFooter`.
 */
export const Card = ({
  variant = 'glass',
  padding = 'md',
  glow = false,
  hoverLift = false,
  children,
  className = '',
  ...motionProps
}: CardProps) => {
  return (
    <motion.div
      whileHover={hoverLift ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      {...motionProps}
    >
      {/* Animated glow border */}
      {glow && (
        <motion.div
          className="absolute -inset-px rounded-2xl z-0 pointer-events-none"
          style={{
            background:
              'conic-gradient(from var(--glow-angle, 0deg), transparent, rgba(168,85,247,0.4), rgba(59,130,246,0.3), transparent)',
          }}
          animate={{
            '--glow-angle': ['0deg', '360deg'],
          } as Record<string, string[]>}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
          aria-hidden="true"
        />
      )}

      {/* Card content */}
      <div
        className={[
          'relative z-10 rounded-2xl',
          variantClasses[variant],
          paddingClasses[padding],
        ].join(' ')}
      >
        {children}
      </div>
    </motion.div>
  );
};

/** Optional header slot for the Card component. */
export const CardHeader = ({ children, className = '' }: CardHeaderProps) => (
  <div
    className={`border-b border-white/[0.06] pb-4 mb-4 ${className}`}
  >
    {children}
  </div>
);

/** Optional body slot for the Card component. */
export const CardBody = ({ children, className = '' }: CardBodyProps) => (
  <div className={className}>{children}</div>
);

/** Optional footer slot for the Card component. */
export const CardFooter = ({ children, className = '' }: CardFooterProps) => (
  <div
    className={`border-t border-white/[0.06] pt-4 mt-4 ${className}`}
  >
    {children}
  </div>
);
