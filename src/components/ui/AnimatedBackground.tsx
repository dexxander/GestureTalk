import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface AnimatedBackgroundProps {
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}

export function AnimatedBackground({ className, intensity = 'medium' }: AnimatedBackgroundProps) {
  // Adjust opacity based on intensity
  const opacityMap = {
    low: 'opacity-[0.05]',
    medium: 'opacity-[0.15]',
    high: 'opacity-[0.25]'
  }

  const opacityClass = opacityMap[intensity]

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none z-0', className)}>
      <div className="absolute inset-0 bg-background mix-blend-multiply" />
      
      {/* Primary Blob */}
      <motion.div
        animate={{
          x: ['0%', '10%', '-10%', '0%'],
          y: ['0%', '-10%', '10%', '0%'],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className={cn(
          'absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full',
          'bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_70%)]',
          'blur-[100px] will-change-transform translate-z-0',
          opacityClass
        )}
      />

      {/* Accent Blob */}
      <motion.div
        animate={{
          x: ['0%', '-15%', '10%', '0%'],
          y: ['0%', '15%', '-5%', '0%'],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className={cn(
          'absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full',
          'bg-[radial-gradient(circle_at_center,var(--color-accent),transparent_70%)]',
          'blur-[120px] will-change-transform translate-z-0',
          opacityClass
        )}
      />

      {/* Tertiary Blob (Secondary Color) */}
      <motion.div
        animate={{
          x: ['0%', '20%', '-20%', '0%'],
          y: ['0%', '10%', '20%', '0%'],
          scale: [1, 1.3, 0.8, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className={cn(
          'absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full',
          'bg-[radial-gradient(circle_at_center,var(--color-secondary),transparent_70%)]',
          'blur-[90px] will-change-transform translate-z-0',
          opacityClass
        )}
      />

      {/* Static noise overlay for texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
    </div>
  )
}
