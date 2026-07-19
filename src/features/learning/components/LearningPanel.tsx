import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRecognitionStore } from '@/stores/recognitionStore'
import { useLearnerStore } from '@/stores/learnerStore'
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter'
import { SignIllustration } from './SignIllustration'
import { CheckCircle2, SkipForward, Trophy, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LearningPanel() {
  const isRecognizing = useRecognitionStore(state => state.isRecognizing)
  const currentSign = useRecognitionStore(state => state.currentSign)
  const currentConfidence = useRecognitionStore(state => state.currentConfidence)
  
  const targetWord = useLearnerStore(state => state.targetWord)
  const score = useLearnerStore(state => state.score)
  const streak = useLearnerStore(state => state.streak)
  const isSuccess = useLearnerStore(state => state.isSuccess)
  const checkPrediction = useLearnerStore(state => state.checkPrediction)
  const skipWord = useLearnerStore(state => state.skipWord)

  // Watch for matching predictions in real-time
  useEffect(() => {
    if (currentSign && currentConfidence) {
      checkPrediction(currentSign, currentConfidence)
    }
  }, [currentSign, currentConfidence, checkPrediction])

  return (
    <div className="flex flex-col h-full bg-surface-active rounded-2xl border border-border/30 overflow-hidden shadow-sm relative">
      
      {/* Success Overlay Animation */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-success/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ type: 'spring', duration: 0.6 }}
            >
              <CheckCircle2 className="w-32 h-32 text-white mb-4 shadow-xl rounded-full" />
            </motion.div>
            <h2 className="text-4xl font-display font-bold text-white drop-shadow-md">Correct!</h2>
            <p className="text-white/90 text-xl font-medium mt-2">+10 Points</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Score */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 glass-strong shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            {isRecognizing && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecognizing ? 'bg-primary' : 'bg-text-muted'}`}></span>
          </div>
          <h2 className="font-display font-semibold text-text">Practice Mode</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full font-bold">
            <Flame className="w-4 h-4" />
            <span>{streak}</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1 rounded-full font-bold">
            <Trophy className="w-4 h-4" />
            <span>{score}</span>
          </div>
        </div>
      </div>

      {/* Main Learning Area */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[300px] gap-6">
        
        {/* Target Word Display */}
        <div className="text-center">
          <p className="text-text-muted font-medium mb-2 tracking-wide uppercase text-sm">Sign this word</p>
          <AnimatePresence mode="popLayout">
            <motion.h1
              key={targetWord}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-5xl md:text-6xl font-display font-bold text-text tracking-tight capitalize"
            >
              {targetWord || 'Loading...'}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Example Illustration */}
        <div className="w-full max-w-sm flex-1 max-h-[300px]">
          {targetWord && (
            <SignIllustration word={targetWord} className="w-full h-full" />
          )}
        </div>

        {/* Skip Button */}
        <button
          onClick={skipWord}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-text-secondary hover:text-text transition-colors border border-border/50 font-medium"
        >
          <span>Skip Word</span>
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Footer / Live Feedback */}
      <div className="h-20 px-6 border-t border-border/30 bg-surface/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-text-muted uppercase tracking-wider">Model Sees</span>
          <AnimatePresence mode="wait">
            {currentSign && currentSign !== 'UNKNOWN' ? (
              <motion.div
                key={currentSign}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  "flex items-center justify-center px-4 h-10 rounded-xl font-display font-bold text-lg border shadow-sm transition-colors duration-300",
                  currentSign === targetWord 
                    ? "bg-success/20 text-success border-success/40"
                    : "bg-surface text-text border-border"
                )}
              >
                {currentSign}
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
