import { WS_RECONNECT_DELAYS, WS_HEARTBEAT_INTERVAL } from './constants'

export type WSMessageHandler = (data: any) => void
export type WSStateHandler = (state: WSConnectionState) => void

export type WSConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'

interface WSClientOptions {
  url: string
  onMessage?: WSMessageHandler
  onStateChange?: WSStateHandler
  autoReconnect?: boolean
  maxRetries?: number
}

export class WSClient {
  private ws: WebSocket | null = null
  private options: Required<WSClientOptions>
  private retryCount = 0
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private state: WSConnectionState = 'disconnected'
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(options: WSClientOptions) {
    this.options = {
      autoReconnect: true,
      maxRetries: WS_RECONNECT_DELAYS.length,
      onMessage: () => {},
      onStateChange: () => {},
      ...options,
    }
  }

  connect(): void {
    if (this.state === 'connected' || this.state === 'connecting') return

    this.setState('connecting')
    
    try {
      this.ws = new WebSocket(this.options.url)

      this.ws.onopen = () => {
        this.setState('connected')
        this.retryCount = 0
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.options.onMessage(data)
        } catch (e) {
          console.error('[WSClient] Failed to parse message', e)
        }
      }

      this.ws.onclose = () => {
        this.handleDisconnect()
      }

      this.ws.onerror = (error) => {
        console.error('[WSClient] WebSocket error', error)
        // onerror is usually followed by onclose
      }
    } catch (error) {
      console.error('[WSClient] Connection failed', error)
      this.handleDisconnect()
    }
  }

  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  disconnect(): void {
    this.options.autoReconnect = false
    this.stopHeartbeat()
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.setState('disconnected')
  }

  getState(): WSConnectionState { 
    return this.state 
  }

  private handleDisconnect(): void {
    this.stopHeartbeat()
    this.ws = null
    
    if (this.options.autoReconnect && this.retryCount < this.options.maxRetries) {
      this.setState('reconnecting')
      const delay = WS_RECONNECT_DELAYS[this.retryCount] || WS_RECONNECT_DELAYS[WS_RECONNECT_DELAYS.length - 1]
      
      this.reconnectTimeout = setTimeout(() => {
        this.retryCount++
        this.connect()
      }, delay)
    } else {
      this.setState('disconnected')
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, WS_HEARTBEAT_INTERVAL)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private setState(newState: WSConnectionState): void {
    if (this.state !== newState) {
      this.state = newState
      this.options.onStateChange(this.state)
    }
  }
}
