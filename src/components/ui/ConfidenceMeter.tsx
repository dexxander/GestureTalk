import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface ConfidenceMeterProps {
  value: number // 0 to 1
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  showPercentage?: boolean
  className?: string
}

const SIZE_MAP = {
  sm: { radius: 28, strokeWidth: 4, textSize: 'text-xs' },
  md: { radius: 44, strokeWidth: 5, textSize: 'text-base' },
  lg: { radius: 60, strokeWidth: 6, textSize: 'text-xl' },
  xl: { radius: 80, strokeWidth: 8, textSize: 'text-3xl' }
}

export function ConfidenceMeter({
  value,
  size = 'md',
  label,
  showPercentage = true,
  className
}: ConfidenceMeterProps) {
  const { radius, strokeWidth, textSize } = SIZE_MAP[size]
  const normalizedValue = Math.max(0, Math.min(1, value))
  
  // Calculate SVG dimensions
  const diameter = radius * 2
  const center = radius
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2)
  const strokeDashoffset = circumference - normalizedValue * circumference

  // Determine color based on value
  const getColor = (val: number) => {
    if (val < 0.4) return 'var(--color-danger)'
    if (val < 0.7) return 'var(--color-warning)'
    return 'var(--color-success)'
  }

  const color = getColor(normalizedValue)

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div 
        className="relative flex items-center justify-center" 
        style={{ width: diameter, height: diameter }}
      >
        <svg
          width={diameter}
          height={diameter}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius - strokeWidth / 2}
            className="stroke-surface-active"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius - strokeWidth / 2}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center text */}
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={cn('font-display font-bold', textSize)} style={{ color }}>
              {Math.round(normalizedValue * 100)}<span className="text-[0.6em] opacity-80">%</span>
            </span>
          </div>
        )}
      </div>
      
      {/* Optional label */}
      {label && (
        <span className="mt-2 text-sm font-medium text-text-muted">
          {label}
        </span>
      )}
    </div>
  )
}
