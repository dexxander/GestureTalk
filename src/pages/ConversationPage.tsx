import { useState, useEffect, useRef } from 'react'
import { CameraView } from '@/features/camera/components/CameraView'
import { LandmarkOverlay } from '@/features/mediapipe/components/LandmarkOverlay'
import { TranslationPanel } from '@/features/recognition/components/TranslationPanel'
import { useMediaPipe } from '@/features/mediapipe/hooks/useMediaPipe'
import { useSTT } from '@/features/audio/hooks/useSTT'
import { SpeechBubble } from '@/features/conversation/components/SpeechBubble'
import { useRecognitionStore } from '@/stores/recognitionStore'
import { Mic, MicOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  text: string
  isSelf: boolean
  timestamp: Date
}

export function ConversationPage() {
  const { isReady: isMediaPipeReady, error: mpError } = useMediaPipe()
  const { isListening, transcript, interimTranscript, error: sttError, startListening, stopListening, clearTranscript } = useSTT()
  
  const [messages, setMessages] = useState<Message[]>([])
  const chatScrollRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, interimTranscript])

  // When STT transcript finalizes, add to messages
  useEffect(() => {
    if (transcript && !isListening) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: transcript,
        isSelf: false, // Hearing person speaking
        timestamp: new Date()
      }])
      clearTranscript()
    }
  }, [transcript, isListening, clearTranscript])

  // Sync from ASL completed sentences
  const completedSentences = useRecognitionStore(state => state.completedSentences)
  const prevCompletedCount = useRef(0)

  useEffect(() => {
    if (completedSentences.length > prevCompletedCount.current) {
      const newSentence = completedSentences[completedSentences.length - 1]
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: newSentence,
        isSelf: true, // Deaf user signing
        timestamp: new Date()
      }])
      prevCompletedCount.current = completedSentences.length
    }
  }, [completedSentences])

  return (
    <div className="flex flex-col h-full gap-6">
      <header>
        <h1 className="text-3xl font-display font-bold tracking-tight text-text mb-2">Conversation Mode</h1>
        <p className="text-text-secondary text-lg">Two-way real-time communication.</p>
      </header>

      {mpError && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger shrink-0">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">Failed to load MediaPipe models: {mpError}</p>
        </div>
      )}
      
      {sttError && (
        <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-center gap-3 text-warning shrink-0">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">Microphone Error: {sttError}</p>
        </div>
      )}

      <div className="flex-1 grid lg:grid-cols-2 gap-6 min-h-0">
        
        {/* Left Side - Deaf User (ASL & Typing) */}
        <div className="flex flex-col min-h-0 gap-6">
          <div className="flex-1 bg-surface rounded-3xl border border-border/50 shadow-elevated overflow-hidden p-2 min-h-[300px]">
            <CameraView 
              LandmarkOverlay={LandmarkOverlay}
              isMediaPipeReady={isMediaPipeReady}
              className="h-full w-full object-cover rounded-2xl" 
            />
          </div>
          <div className="h-[320px] shrink-0">
             <TranslationPanel />
          </div>
        </div>

        {/* Right Side - Hearing User (Speech & Chat) */}
        <div className="flex flex-col min-h-0 bg-surface-active rounded-3xl border border-border/50 shadow-elevated overflow-hidden">
          
          <div className="p-6 border-b border-border/30 glass-strong">
            <h2 className="font-display font-semibold text-text text-xl">Chat Transcript</h2>
          </div>

          <div 
            ref={chatScrollRef}
            className="flex-1 p-6 overflow-y-auto scroll-smooth"
          >
            {messages.length === 0 && !interimTranscript && (
              <div className="h-full flex items-center justify-center text-text-muted text-lg">
                Say something or start signing...
              </div>
            )}
            
            {messages.map(msg => (
              <SpeechBubble
                key={msg.id}
                text={msg.text}
                isSelf={msg.isSelf}
                timestamp={msg.timestamp}
                status="sent"
              />
            ))}
            
            {(transcript || interimTranscript) && (
              <SpeechBubble
                text={transcript + (transcript && interimTranscript ? ' ' : '') + interimTranscript}
                isSelf={false}
                isInterim={true}
              />
            )}
          </div>

          <div className="p-6 border-t border-border/30 bg-surface/50">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={isListening ? stopListening : startListening}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg",
                  isListening 
                    ? "bg-danger text-white hover:bg-danger-hover animate-pulse shadow-danger/20" 
                    : "bg-primary text-white hover:bg-primary-hover shadow-primary/20 hover:scale-105"
                )}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-6 h-6" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6" />
                    Hold to Speak
                  </>
                )}
              </button>
            </div>
            <p className="text-center text-text-muted text-sm mt-3">
              Hearing person can tap here to speak
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
