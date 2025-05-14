import {
  spotifyAccessToken,
  spotifyClientId,
  spotifyClientSecret,
  spotifyExpiresIn,
  spotifyObtainmentTimestamp,
  spotifyRedirectUri,
  spotifyRefreshToken
} from '@/store/auth'
import SpotifyWebApi from 'spotify-web-api-node'

class SpotifyClient {
  private spotifyApi: SpotifyWebApi
  private static instance: SpotifyClient

  private constructor() {
    // Initialize with all credentials
    this.spotifyApi = new SpotifyWebApi({
      clientId: spotifyClientId,
      clientSecret: spotifyClientSecret,
      redirectUri: spotifyRedirectUri,
      accessToken: spotifyAccessToken.value,
      refreshToken: spotifyRefreshToken.value
    })
  }

  public static getInstance(): SpotifyClient {
    if (!SpotifyClient.instance) {
      SpotifyClient.instance = new SpotifyClient()
    }
    return SpotifyClient.instance
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    try {
      // First try the current token
      await this.spotifyApi.getMe()
    } catch (error: any) {
      if (error.statusCode === 401) {
        try {
          // Get credentials using Authorization Code flow
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

          const data = await response.json()
          if (data.access_token) {
            this.spotifyApi.setAccessToken(data.access_token)
            spotifyAccessToken.value = data.access_token
            if (data.refresh_token) {
              spotifyRefreshToken.value = data.refresh_token
            }
            spotifyExpiresIn.value = data.expires_in
            spotifyObtainmentTimestamp.value = Date.now()
          } else {
            throw new Error('No access token received')
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError)
          throw refreshError
        }
      } else {
        console.error('Error checking Spotify token:', error)
        throw error
      }
    }
  }

  public async addToQueue(trackUrl: string): Promise<boolean> {
    try {
      await this.refreshTokenIfNeeded()
      const trackId = trackUrl.split('/').pop()?.split('?')[0]
      if (!trackId) throw new Error('Invalid Spotify URL')

      await this.spotifyApi.addToQueue(`spotify:track:${trackId}`)
      return true
    } catch (error) {
      console.error('Error adding track to queue:', error)
      return false
    }
  }

  public async getQueue(): Promise<any> {
    try {
      await this.refreshTokenIfNeeded()
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
      console.error('Error getting queue:', error)
      return null
    }
  }

  public async getCurrentlyPlaying(): Promise<SpotifyApi.CurrentlyPlayingResponse | null> {
    try {
      await this.refreshTokenIfNeeded()
      const response = await this.spotifyApi.getMyCurrentPlayingTrack()
      return response.body
    } catch (error) {
      console.error('Error getting currently playing track:', error)
      return null
    }
  }

  public async addToPlaylist(trackUri: string): Promise<boolean> {
    try {
      await this.refreshTokenIfNeeded()
      const playlistId = import.meta.env.VITE_SPOTIFY_BANGER_PLAYLIST_URI.split(':').pop()
      if (!playlistId) throw new Error('Invalid playlist URI')

      await this.spotifyApi.addTracksToPlaylist(playlistId, [trackUri])
      return true
    } catch (error) {
      console.error('Error adding track to playlist:', error)
      return false
    }
  }
}

export const spotifyClient = SpotifyClient.getInstance()
