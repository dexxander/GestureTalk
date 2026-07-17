import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRecognitionStore } from '@/stores/recognitionStore'
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter'
import { useTTS } from '@/features/audio/hooks/useTTS'
import { VolumeX, Delete, Keyboard, KeyboardOff, Send } from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'

export function TranslationPanel() {
  const isRecognizing = useRecognitionStore(state => state.isRecognizing)
  const currentSign = useRecognitionStore(state => state.currentSign)
  const currentConfidence = useRecognitionStore(state => state.currentConfidence)
  const currentSentence = useRecognitionStore(state => state.currentSentence)
  const setSentence = useRecognitionStore(state => state.setSentence)
  const clearSentence = useRecognitionStore(state => state.clearSentence)
  const completeSentence = useRecognitionStore(state => state.completeSentence)
  const undoLastWord = useRecognitionStore(state => state.undoLastWord)
  
  const { isSpeaking, speak, stop } = useTTS()
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when entering typing mode
  useEffect(() => {
    if (isTyping && textareaRef.current) {
      textareaRef.current.focus()
      // Move cursor to end
      textareaRef.current.selectionStart = textareaRef.current.value.length
      textareaRef.current.selectionEnd = textareaRef.current.value.length
    }
  }, [isTyping])

  return (
    <div className="flex flex-col h-full bg-surface-active rounded-2xl border border-border/30 overflow-hidden shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 glass-strong shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            {isRecognizing && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecognizing ? 'bg-success' : 'bg-text-muted'}`}></span>
          </div>
          <h2 className="font-display font-semibold text-text">Live Translation</h2>
        </div>
        
        {currentSentence && (
          <button 
            onClick={clearSentence}
            className="text-xs font-medium text-text-muted hover:text-text transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Main Translation Area */}
      <div className="flex-1 p-6 flex flex-col justify-end min-h-[200px] overflow-hidden relative">
        <AnimatePresence mode="popLayout">
          {isTyping ? (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 w-full"
            >
              <textarea
                ref={textareaRef}
                value={currentSentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder="Type here..."
                className="w-full h-full bg-transparent text-3xl md:text-4xl lg:text-5xl font-display font-medium text-text leading-tight tracking-tight resize-none focus:outline-none placeholder:text-text-muted/50"
              />
            </motion.div>
          ) : currentSentence ? (
            <motion.div
              key="sentence"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-medium text-text leading-tight tracking-tight break-words"
            >
              {currentSentence}
              <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block ml-1 w-3 h-8 md:h-10 bg-primary/50 align-middle rounded-full"
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-text-muted text-lg text-center flex-1 flex items-center justify-center"
            >
              Start signing or typing to see translation here
            </motion.div>
          )}
        </AnimatePresence>

        {/* Builder Toolbar */}
        <div className="flex items-center justify-between mt-4 border-t border-border/20 pt-4 shrink-0">
          <div className="flex gap-2">
            <Tooltip content={isTyping ? "Disable Typing" : "Enable Typing"}>
              <button
                onClick={() => setIsTyping(!isTyping)}
                className={cn(
                  "p-3 rounded-xl transition-colors",
                  isTyping ? "bg-primary/20 text-primary" : "bg-surface hover:bg-surface-hover text-text-secondary hover:text-text"
                )}
              >
                {isTyping ? <KeyboardOff className="w-5 h-5" /> : <Keyboard className="w-5 h-5" />}
              </button>
            </Tooltip>
            
            <Tooltip content="Undo Last Word">
              <button
                onClick={undoLastWord}
                disabled={!currentSentence}
                className="p-3 rounded-xl bg-surface hover:bg-surface-hover text-text-secondary hover:text-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Delete className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (isSpeaking) {
                  stop()
                } else {
                  speak(currentSentence)
                  completeSentence()
                }
              }}
              disabled={!currentSentence && !isSpeaking}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed",
                isSpeaking 
                  ? "bg-danger/20 text-danger hover:bg-danger/30" 
                  : "bg-primary text-white hover:bg-primary-hover shadow-sm"
              )}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-5 h-5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send & Speak</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer / Raw Prediction */}
      <div className="h-20 px-6 border-t border-border/30 bg-surface/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-text-muted uppercase tracking-wider">Current Sign</span>
          <AnimatePresence mode="wait">
            {currentSign && currentSign !== 'UNKNOWN' ? (
              <motion.div
                key={currentSign}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-display font-bold text-xl border border-primary/30 shadow-sm">
                  {currentSign}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-10 h-10 rounded-xl border border-dashed border-border flex items-center justify-center text-text-muted"
              >
                —
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
           <span className="text-xs font-medium text-text-muted">Confidence</span>
           <ConfidenceMeter 
             value={currentConfidence || 0} 
             size="sm" 
             showPercentage={false}
           />
        </div>
      </div>

    </div>
  )
}
