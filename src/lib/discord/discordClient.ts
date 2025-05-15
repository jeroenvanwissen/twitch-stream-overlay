import axios from 'axios';

import {
  discordClientId,
  discordClientSecret,
  discordAccessToken,
  discordExpiresIn,
  discordExpiresAt,
  spotifySocketAccessToken,
  spotifyUserId,
  discordSessionToken,
} from '@/store/auth';

export class DiscordClient {
  private static instance: DiscordClient;
  private API_ENDPOINT: string = 'https://discord.com/api/v9';
  private maxAttempts: number = 5;
  private attempts: number = 0;

  constructor() {}

  public static getInstance(): DiscordClient {
    if (!DiscordClient.instance) {
      DiscordClient.instance = new DiscordClient();
    }
    return DiscordClient.instance;
  }

  async getToken(): Promise<any> {
    if (this.attempts >= this.maxAttempts) return;

    // return if token will not expire within 5 minutes
    if (Date.now() <= discordExpiresAt.value - 300000) return;

    try {
      const response = await axios.post(
        `${this.API_ENDPOINT}/oauth2/token`,
        {
          client_id: discordClientId.value,
          client_secret: discordClientSecret.value,
          grant_type: 'client_credentials',
          scope: 'identify connections',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status}`);
      }

      discordAccessToken.value = response.data.access_token;
      discordExpiresIn.value = response.data.expires_in;
      discordExpiresAt.value = Date.now() + response.data.expires_in * 1000;

      return response.data;
    } catch (error) {
      this.attempts += 1;
      console.error('Error fetching token:', error);
      throw error;
    }
  }

  async getSpotifyToken(): Promise<any> {
    if (this.attempts >= this.maxAttempts) return;
    try {
      await this.getToken();

      const response = await axios.get(
        `${this.API_ENDPOINT}/users/@me/connections/spotify/${spotifyUserId.value}/access-token`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: discordSessionToken.value,
          },
        },
      );

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status}`);
      }

      spotifySocketAccessToken.value = response.data.access_token;

      return response.data;
    } catch (error) {
      this.attempts += 1;
      console.error('Error fetching token:', error);
      throw error;
    }
  }
}

export const discordClient = DiscordClient.getInstance();
