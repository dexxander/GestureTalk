import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Check, CheckCheck } from 'lucide-react'

interface SpeechBubbleProps {
  text: string
  isSelf: boolean
  timestamp?: Date
  status?: 'sending' | 'sent' | 'read'
  className?: string
  isInterim?: boolean
}

export function SpeechBubble({ text, isSelf, timestamp, status, className, isInterim = false }: SpeechBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full mb-4",
        isSelf ? "justify-end" : "justify-start",
        className
      )}
    >
      <div className={cn(
        "max-w-[80%] flex flex-col gap-1",
        isSelf ? "items-end" : "items-start"
      )}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl relative",
            isInterim && "opacity-70 italic",
            isSelf 
              ? "bg-primary text-white rounded-br-sm" 
              : "bg-surface-active border border-border/50 text-text rounded-bl-sm"
          )}
        >
          <p className="text-base leading-relaxed whitespace-pre-wrap">{text}</p>
          {isInterim && (
            <motion.span 
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className={cn(
                "inline-block ml-1 w-2 h-4 align-middle rounded-full",
                isSelf ? "bg-white/70" : "bg-primary/50"
              )}
            />
          )}
        </div>
        
        {/* Metadata */}
        <div className="flex items-center gap-1.5 px-1 text-xs text-text-muted font-medium">
          {timestamp && (
            <span>
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {isSelf && status && (
            <span className={cn(status === 'read' ? "text-primary" : "")}>
              {status === 'sending' ? (
                <Check className="w-3.5 h-3.5 opacity-50" />
              ) : status === 'sent' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
