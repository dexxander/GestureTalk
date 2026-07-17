import { useEffect, useCallback, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

/** Size presets controlling modal max-width. */
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  /** Controls modal visibility */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Modal heading */
  title?: string;
  /** Supplementary description shown below the title */
  description?: string;
  /** Size preset */
  size?: ModalSize;
  /** Modal body content */
  children: ReactNode;
  /** Additional classes for the modal panel */
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

/**
 * A premium animated modal rendered via a portal. Supports backdrop blur,
 * Escape-to-close, backdrop-click-to-close, and smooth enter/exit transitions.
 */
export const Modal = ({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  className = '',
}: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  /** Close on Escape key. */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  /** Focus trap: focus the panel on open. */
  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-desc' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            variants={panelVariants}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={[
              'relative z-10 w-full rounded-2xl',
              'bg-gray-900/95 backdrop-blur-2xl',
              'border border-white/[0.08]',
              'shadow-2xl shadow-black/40',
              'outline-none',
              sizeClasses[size],
              className,
            ].join(' ')}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 p-6 pb-0">
                <div className="space-y-1">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-lg font-semibold text-white leading-tight"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="modal-desc"
                      className="text-sm text-gray-400 leading-relaxed"
                    >
                      {description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-shrink-0 rounded-lg p-1.5 text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="size-5" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
