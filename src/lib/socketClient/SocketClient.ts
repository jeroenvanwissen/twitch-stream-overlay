import { deviceInfo } from '@/lib/socketClient/device'
import { connect, onConnect, onDisconnect } from '@/lib/socketClient/events'

interface WebSocketWithDispatch extends WebSocket {
  on?: (event: string, callback: Function) => void
  off?: (event: string, callback: Function) => void
}

export class SocketClient {
  public connection: WebSocketWithDispatch | null = null
  private accessToken: string
  private baseUrl: string
  private deviceInfo: ReturnType<typeof deviceInfo> = deviceInfo()
  private keepAliveInterval: number = 10000
  private endpoint: string
  private reconnectTimeout: number | null = null
  private readonly reconnectInterval = 5000

  constructor(baseUrl: string, accessToken: string, endpoint: string = 'twitch-stream-overlay') {
    this.baseUrl = baseUrl
    this.accessToken = accessToken
    this.endpoint = endpoint

    this.connect()
  }

  dispose = async () => {
    if (!this.connection) return
    this.connection.close()
  }

  setup = async () => {
    if (!this.connection) return
    // Setup is now handled in connect()
  }

  private connect() {
    try {
      const urlString = this.urlBuilder()
      const wsUrl = `${this.baseUrl}/${this.endpoint}?access_token=${this.accessToken}${urlString}`
      this.connection = new WebSocket(wsUrl)
      this.setupEventListeners()
    } catch (error) {
      console.error('WebSocket connection error:', error)
      this.scheduleReconnect()
    }
  }

  private setupEventListeners() {
    if (!this.connection) return

    this.connection.addEventListener('open', () => {
      console.log('WebSocket connection established')
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout)
        this.reconnectTimeout = null
      }
      onConnect(this.connection)
      connect(this.connection)
    })

    this.connection.addEventListener('message', event => {
      try {
        const data = JSON.parse(event.data)
        // Handle incoming messages (the event handlers are set up in events.ts)
        if (this.connection) {
          const eventName = data.event || data.type
          const eventData = data.data || data
          this.connection.dispatchEvent(new CustomEvent(eventName, { detail: eventData }))
        }
      } catch (error) {
        console.error('Error processing message:', error)
      }
    })

    this.connection.addEventListener('close', () => {
      console.log('WebSocket connection closed, attempting to reconnect...')
      onDisconnect(this.connection)
      this.scheduleReconnect()
    })

    this.connection.addEventListener('error', error => {
      console.error('WebSocket error:', error)
      onDisconnect(this.connection)
    })

    // Set up keep-alive ping
    setInterval(() => {
      if (this.connection && this.connection.readyState === WebSocket.OPEN) {
        this.connection.send(JSON.stringify({ type: 'ping' }))
      }
    }, this.keepAliveInterval)
  }

  private scheduleReconnect() {
    if (!this.reconnectTimeout) {
      this.reconnectTimeout = window.setTimeout(() => {
        console.log('Attempting to reconnect...')
        this.connect()
      }, this.reconnectInterval)
    }
  }

  private urlBuilder() {
    const urlParams = new URLSearchParams([
      ['client_id', this.deviceInfo.id],
      ['client_name', this.deviceInfo.name],
      ['client_type', this.deviceInfo.type ?? 'web'],
      ['client_version', this.deviceInfo.version],
      ['client_os', this.deviceInfo.os],
      ['client_browser', this.deviceInfo.browser],
      ['client_device', this.deviceInfo.device]
    ])

    return `&${urlParams.toString()}`
  }
}

export default SocketClient
