import { motion, AnimatePresence } from 'motion/react'
import { useRecognitionStore } from '@/stores/recognitionStore'
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter'

export function TranslationPanel() {
  const isRecognizing = useRecognitionStore(state => state.isRecognizing)
  const rawPrediction = useRecognitionStore(state => state.rawPrediction)
  const currentSentence = useRecognitionStore(state => state.currentSentence)
  const clearSentence = useRecognitionStore(state => state.clearSentence)

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
          {currentSentence ? (
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
              Start signing to see translation here
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Raw Prediction */}
      <div className="h-20 px-6 border-t border-border/30 bg-surface/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-text-muted uppercase tracking-wider">Current Sign</span>
          <AnimatePresence mode="wait">
            {rawPrediction && rawPrediction.sign !== 'UNKNOWN' ? (
              <motion.div
                key={rawPrediction.sign}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-display font-bold text-xl border border-primary/30 shadow-sm">
                  {rawPrediction.sign}
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
             value={rawPrediction?.confidence || 0} 
             size="sm" 
             showPercentage={false}
           />
        </div>
      </div>

    </div>
  )
}
