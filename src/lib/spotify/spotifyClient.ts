import {
  spotifyAccessToken,
  spotifyClientId,
  spotifyClientSecret,
  spotifyExpiresAt,
  spotifyExpiresIn,
  spotifyRedirectUri,
  spotifyRefreshToken
} from '@/store/auth'
import SpotifyWebApi from 'spotify-web-api-node'

class SpotifyClient {
  private spotifyApi: SpotifyWebApi
  private static instance: SpotifyClient
  private maxAttempts: number = 5
  private attempts: number = 0
  private refreshTimeout: NodeJS.Timeout | null = null

  private constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: spotifyClientId,
      clientSecret: spotifyClientSecret,
      redirectUri: spotifyRedirectUri,
      accessToken: spotifyAccessToken.value,
      refreshToken: spotifyRefreshToken.value
    })

    this.refreshToken().then()
  }

  public static getInstance(): SpotifyClient {
    if (!SpotifyClient.instance) {
      SpotifyClient.instance = new SpotifyClient()
    }
    return SpotifyClient.instance
  }

  private async refreshToken() {
    if (this.attempts >= this.maxAttempts) return false // prevent infinite loop

    // return if will not expire within 5 minutes
    if (Date.now() <= spotifyExpiresAt.value - 300000) return

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + btoa(spotifyClientId + ':' + spotifyClientSecret)
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: spotifyRefreshToken.value
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      spotifyAccessToken.value = data.access_token
      spotifyRefreshToken.value = data.refresh_token
      spotifyExpiresIn.value = data.expires_in
      spotifyExpiresAt.value = Date.now() + data.expires_in * 1000

      this.spotifyApi.setAccessToken(data.access_token)
    } catch (error) {
      this.attempts += 1
      console.error('Error refreshing token:', error)
      throw error
    }
  }

  public async addToQueue(trackUrl: string): Promise<boolean> {
    if (this.attempts >= this.maxAttempts) return false
    try {
      await this.refreshToken()

      const trackId = trackUrl.split('/').pop()?.split('?')[0]
      if (!trackId) throw new Error('Invalid Spotify URL')

      await this.spotifyApi.addToQueue(`spotify:track:${trackId}`)
      return true
    } catch (error) {
      this.attempts += 1
      console.error('Error adding track to queue:', error)
      return false
    }
  }

  public async getQueue(): Promise<any> {
    if (this.attempts >= this.maxAttempts) return
    try {
      await this.refreshToken()

      const response = await fetch('https://api.spotify.com/v1/me/player/queue', {
        headers: {
          Authorization: `Bearer ${this.spotifyApi.getAccessToken()}`
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      this.attempts += 1
      console.error('Error getting queue:', error)
      return null
    }
  }

  public async getCurrentlyPlaying(): Promise<SpotifyApi.CurrentlyPlayingResponse | null> {
    if (this.attempts >= this.maxAttempts) return null
    try {
      await this.refreshToken()

      const response = await this.spotifyApi.getMyCurrentPlayingTrack()
      return response.body
    } catch (error) {
      this.attempts += 1
      console.error('Error getting currently playing track:', error)
      return null
    }
  }

  public async addToPlaylist(trackUri: string): Promise<boolean> {
    if (this.attempts >= this.maxAttempts) return false
    try {
      await this.refreshToken()

      const playlistId = import.meta.env.VITE_SPOTIFY_BANGER_PLAYLIST_URI.split(':').pop()
      if (!playlistId) throw new Error('Invalid playlist URI')

      await this.spotifyApi.addTracksToPlaylist(playlistId, [trackUri])
      return true
    } catch (error) {
      this.attempts += 1
      console.error('Error adding track to playlist:', error)
      return false
    }
  }
}

export const spotifyClient = SpotifyClient.getInstance()
