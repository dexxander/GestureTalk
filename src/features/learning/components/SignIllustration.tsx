import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ExternalLink, Hand } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignIllustrationProps {
  word: string
  className?: string
}

export function SignIllustration({ word, className }: SignIllustrationProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Reset loading state when word changes
  useEffect(() => {
    setIsLoading(true)
  }, [word])

  // signasl.org uses the path /sign/{word}
  const dictionaryUrl = `https://www.signasl.org/sign/${encodeURIComponent(word)}`

  return (
    <div className={cn("relative flex flex-col bg-surface/50 rounded-2xl border border-border/30 overflow-hidden shadow-inner", className)}>
      
      {/* Header toolbar for the external frame */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2 text-text-secondary">
          <Hand className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Reference Dictionary</span>
        </div>
        <a 
          href={dictionaryUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors bg-primary/10 px-2 py-1 rounded-md"
        >
          <span>Open in Browser</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* IFrame Container */}
      <div className="relative flex-1 w-full bg-white">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface text-text-muted"
            >
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium">Loading Dictionary...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <iframe 
          src={dictionaryUrl}
          title={`ASL sign for ${word}`}
          className="w-full h-full border-none"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  )
}
