import { useState, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/** Tooltip placement relative to the trigger element. */
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** Text content shown in the tooltip */
  content: string;
  /** Placement relative to the trigger */
  position?: TooltipPosition;
  /** Delay before showing in milliseconds */
  delay?: number;
  /** The trigger element */
  children: ReactNode;
  /** Additional CSS classes for the wrapper */
  className?: string;
}

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent',
};

/** Initial slide direction per position. */
const motionOrigin: Record<TooltipPosition, { x: number; y: number }> = {
  top: { x: 0, y: 4 },
  bottom: { x: 0, y: -4 },
  left: { x: 4, y: 0 },
  right: { x: -4, y: 0 },
};

/**
 * A lightweight hover tooltip with smooth enter/exit animations,
 * configurable position, arrow indicator, and hover delay.
 */
export const Tooltip = ({
  content,
  position = 'top',
  delay = 300,
  children,
  className = '',
}: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, ...motionOrigin[position] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...motionOrigin[position] }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="tooltip"
            className={[
              'absolute z-50 pointer-events-none',
              'px-3 py-1.5 rounded-lg',
              'bg-gray-800 text-white text-xs font-medium',
              'shadow-xl shadow-black/30',
              'whitespace-nowrap',
              positionClasses[position],
            ].join(' ')}
          >
            {content}
            {/* Arrow */}
            <span
              className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
