export const APP_NAME = 'GestureTalk'
export const APP_VERSION = '1.0.0'

// MediaPipe
export const MEDIAPIPE_CDN_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
export const MODEL_PATHS = {
  hand: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  pose: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
  face: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
} as const

// Recognition
export const DEFAULT_CONFIDENCE_THRESHOLD = 0.65
export const DEFAULT_FPS_TARGET = 30
export const SEQUENCE_BUFFER_SIZE = 30
export const STABILITY_FRAMES = 5
export const PREDICTION_HISTORY_MAX = 50

// WebSocket
export const WS_RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000] as const
export const WS_HEARTBEAT_INTERVAL = 30000

// API
export const API_ENDPOINTS = {
  health: '/api/v1/health',
  recognize: '/api/v1/recognition/ws',
  conversations: '/api/v1/conversations',
  favorites: '/api/v1/favorites',
  stats: '/api/v1/stats',
  profile: '/api/v1/auth/profile',
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  CONVERSATION: '/conversation',
  DASHBOARD: '/dashboard',
  HISTORY: '/history',
  FAVORITES: '/favorites',
  EMERGENCY: '/emergency',
  SETTINGS: '/settings',
  LOGIN: '/auth/login',
  AUTH_CALLBACK: '/auth/callback',
  PROFILE: '/profile',
} as const

// Emergency
export const EMERGENCY_PHRASES = [
  { id: 'police', label: 'Call Police', message: 'PLEASE CALL THE POLICE. I NEED HELP.', icon: 'Shield', color: '#3b82f6' },
  { id: 'ambulance', label: 'Call Ambulance', message: 'PLEASE CALL AN AMBULANCE. MEDICAL EMERGENCY.', icon: 'Ambulance', color: '#ef4444' },
  { id: 'medical', label: 'Medical Emergency', message: 'I AM HAVING A MEDICAL EMERGENCY. PLEASE HELP ME.', icon: 'Heart', color: '#f43f5e' },
  { id: 'interpreter', label: 'Need Interpreter', message: 'I AM DEAF. I NEED A SIGN LANGUAGE INTERPRETER.', icon: 'Languages', color: '#8b5cf6' },
  { id: 'help', label: 'Need Help', message: 'I NEED HELP. PLEASE ASSIST ME.', icon: 'HandHelping', color: '#f59e0b' },
] as const

// Default Favorites
export const DEFAULT_FAVORITES = [
  'Hello',
  'Thank you',
  'Please',
  'Yes',
  'No',
  'I need help',
  'My name is...',
  'Nice to meet you',
  'Excuse me',
  'Sorry',
  'Where is the bathroom?',
  'Where is the hospital?',
  'Please wait',
  'I don\'t understand',
  'Can you repeat that?',
] as const

// Sentence Builder
export const WORD_BOUNDARY_PAUSE_MS = 1500
export const SENTENCE_BOUNDARY_PAUSE_MS = 3000
