import { useState, useEffect, useCallback } from 'react'

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const synth = window.speechSynthesis

  const loadVoices = useCallback(() => {
    const availableVoices = synth.getVoices()
    setVoices(availableVoices)
    // Try to find a good default English voice
    if (availableVoices.length > 0 && !selectedVoice) {
      const defaultVoice = 
        availableVoices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Daniel')) ||
        availableVoices.find(v => v.lang.startsWith('en')) || 
        availableVoices[0]
      setSelectedVoice(defaultVoice)
    }
  }, [synth, selectedVoice])

  useEffect(() => {
    loadVoices()
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices
    }
    return () => {
      synth.cancel()
    }
  }, [loadVoices, synth])

  const speak = useCallback((text: string) => {
    if (!synth) return
    if (synth.speaking) synth.cancel()

    if (!text.trim()) return

    const utterance = new SpeechSynthesisUtterance(text)
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    // We can add speed/pitch from settings later
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = (e) => {
      console.error('TTS Error:', e)
      setIsSpeaking(false)
    }

    synth.speak(utterance)
  }, [synth, selectedVoice])

  const stop = useCallback(() => {
    if (synth.speaking) {
      synth.cancel()
      setIsSpeaking(false)
    }
  }, [synth])

  return {
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice,
    speak,
    stop
  }
}
