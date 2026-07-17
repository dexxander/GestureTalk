/**
 * GestureTalk — Global Type Declarations
 *
 * Ambient type definitions for:
 *  - Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 *  - Vite client environment variables
 *  - Static asset module declarations
 *  - CSS module declarations
 */

/* ─── Vite Environment Variables ───────────────────────────────────────────── */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL */
  readonly VITE_SUPABASE_URL: string
  /** Supabase anonymous/public key */
  readonly VITE_SUPABASE_ANON_KEY: string
  /** Backend REST API base URL */
  readonly VITE_API_URL: string
  /** WebSocket endpoint for real-time streaming */
  readonly VITE_WS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/* ─── Web Speech API ───────────────────────────────────────────────────────── */

/**
 * SpeechRecognition result — a single recognized alternative.
 */
interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

/**
 * A single result from the recognizer, which can contain multiple alternatives.
 */
interface SpeechRecognitionResult {
  readonly length: number
  readonly isFinal: boolean
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

/**
 * The full list of results from a recognition session.
 */
interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

/**
 * Event fired when speech recognition produces results.
 */
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

/**
 * Event fired when a speech recognition error occurs.
 */
interface SpeechRecognitionErrorEvent extends Event {
  readonly error:
    | 'no-speech'
    | 'aborted'
    | 'audio-capture'
    | 'network'
    | 'not-allowed'
    | 'service-not-allowed'
    | 'bad-grammar'
    | 'language-not-supported'
  readonly message: string
}

/**
 * SpeechGrammar interface for grammar-based recognition.
 */
interface SpeechGrammar {
  src: string
  weight: number
}

/**
 * Ordered list of SpeechGrammar objects.
 */
interface SpeechGrammarList {
  readonly length: number
  item(index: number): SpeechGrammar
  [index: number]: SpeechGrammar
  addFromString(string: string, weight?: number): void
  addFromURI(src: string, weight?: number): void
}

/**
 * The SpeechRecognition interface — provides access to the
 * browser's speech recognition service.
 */
interface SpeechRecognition extends EventTarget {
  /** Grammar list for constrained recognition */
  grammars: SpeechGrammarList
  /** BCP 47 language tag (e.g. 'en-US') */
  lang: string
  /** Whether to return continuous results */
  continuous: boolean
  /** Whether to return interim (non-final) results */
  interimResults: boolean
  /** Maximum number of alternatives per result */
  maxAlternatives: number

  /** Start recognizing speech */
  start(): void
  /** Stop recognizing speech (finalize current result) */
  stop(): void
  /** Abort recognition immediately */
  abort(): void

  /* ── Event handlers ─────────────────────────────── */
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
}

/**
 * SpeechRecognition constructor type.
 */
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
  prototype: SpeechRecognition
}

/* ─── Augment the global Window interface ──────────────────────────────────── */

interface Window {
  /** Standard SpeechRecognition (Firefox, future browsers) */
  SpeechRecognition?: SpeechRecognitionConstructor
  /** WebKit-prefixed SpeechRecognition (Chrome, Edge, Safari) */
  webkitSpeechRecognition?: SpeechRecognitionConstructor
  /** Standard SpeechGrammarList */
  SpeechGrammarList?: { new (): SpeechGrammarList }
  /** WebKit-prefixed SpeechGrammarList */
  webkitSpeechGrammarList?: { new (): SpeechGrammarList }
}

/* ─── Static Asset Module Declarations ─────────────────────────────────────── */

declare module '*.svg' {
  import type { FC, SVGProps } from 'react'
  const ReactComponent: FC<SVGProps<SVGSVGElement>>
  const src: string
  export { ReactComponent }
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.mp4' {
  const src: string
  export default src
}

declare module '*.webm' {
  const src: string
  export default src
}

declare module '*.woff' {
  const src: string
  export default src
}

declare module '*.woff2' {
  const src: string
  export default src
}

/* ─── CSS Modules ──────────────────────────────────────────────────────────── */

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}
