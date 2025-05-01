import SpotifyWebApi from "spotify-web-api-node";

class SpotifyClient {
  private spotifyApi: SpotifyWebApi;
  private static instance: SpotifyClient;

  private constructor() {
    // Initialize with all credentials
    this.spotifyApi = new SpotifyWebApi({
      clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
      accessToken: import.meta.env.VITE_SPOTIFY_OAUTH_TOKEN,
      refreshToken: import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN,
    });
  }

  public static getInstance(): SpotifyClient {
    if (!SpotifyClient.instance) {
      SpotifyClient.instance = new SpotifyClient();
    }
    return SpotifyClient.instance;
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    try {
      // First try the current token
      await this.spotifyApi.getMe();
    } catch (error: any) {
      if (error.statusCode === 401) {
        try {
          // Get credentials using Authorization Code flow
          const response = await fetch(
            "https://accounts.spotify.com/api/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                  "Basic " +
                  btoa(
                    import.meta.env.VITE_SPOTIFY_CLIENT_ID +
                      ":" +
                      import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
                  ),
              },
              body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN,
              }),
            },
          );

          const data = await response.json();
          if (data.access_token) {
            this.spotifyApi.setAccessToken(data.access_token);
          } else {
            throw new Error("No access token received");
          }
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          throw refreshError;
        }
      } else {
        console.error("Error checking Spotify token:", error);
        throw error;
      }
    }
  }

  public async addToQueue(trackUrl: string): Promise<boolean> {
    try {
      await this.refreshTokenIfNeeded();
      const trackId = trackUrl.split("/").pop()?.split("?")[0];
      if (!trackId) throw new Error("Invalid Spotify URL");

      await this.spotifyApi.addToQueue(`spotify:track:${trackId}`);
      return true;
    } catch (error) {
      console.error("Error adding track to queue:", error);
      return false;
    }
  }

  public async getCurrentlyPlaying(): Promise<SpotifyApi.CurrentlyPlayingResponse | null> {
    try {
      await this.refreshTokenIfNeeded();
      const response = await this.spotifyApi.getMyCurrentPlayingTrack();
      return response.body;
    } catch (error) {
      console.error("Error getting currently playing track:", error);
      return null;
    }
  }

  public async addToPlaylist(trackUri: string): Promise<boolean> {
    try {
      await this.refreshTokenIfNeeded();
      const playlistId = import.meta.env.VITE_SPOTIFY_BANGER_PLAYLIST_URI.split(
        ":",
      ).pop();
      if (!playlistId) throw new Error("Invalid playlist URI");

      await this.spotifyApi.addTracksToPlaylist(playlistId, [trackUri]);
      return true;
    } catch (error) {
      console.error("Error adding track to playlist:", error);
      return false;
    }
  }
}

export const spotifyClient = SpotifyClient.getInstance();
