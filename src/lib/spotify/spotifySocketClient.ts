import {type SpotifyEvent, SpotifyEventType} from "@/types/spotify/shared";
import { isSpotifyConnectEvent } from "@/types/spotify/connect";
import { isSpotifyMessageEvent } from '@/types/spotify/state';

import { spotifyClient } from '@/lib/spotify/spotifyClient';
import { DiscordClient } from '@/lib/discord/discordClient';

import { spotifyAccessToken } from '@/store/auth';
import { setSpotifyState } from '@/store/spotify';
import {isSpotifyBroadcastEvent} from "@/types/spotify/broadcast";

class SpotifySocketClient {
  private socket: WebSocket | null = null;
  private static instance: SpotifySocketClient;
  private maxAttempts: number = 5;
  private attempts: number = 0;
  private pingInterval: NodeJS.Timeout | null = null;
  private discordClient: DiscordClient = DiscordClient.getInstance();
  private discordTokenResponse: any;

  public constructor() {
    this.init().then();
  }

  private async init(): Promise<void> {
    await this.discordClient.getToken();
    this.discordTokenResponse = await this.discordClient.getSpotifyToken();
    this.connect();
  }

  public static getInstance(): SpotifySocketClient {
    if (!SpotifySocketClient.instance) {
      SpotifySocketClient.instance = new SpotifySocketClient();
    }
    return SpotifySocketClient.instance;
  }

  private connect() {
    this.socket = new WebSocket(`wss://dealer.spotify.com/?access_token=${spotifyAccessToken.value}`);

    this.socket.onopen = () => {
      console.log('Spotify web socket connection opened');
      this.attempts = 0;

      this.pingInterval = setInterval(() => this.ping(), 30000);
    };

    this.socket.onmessage = async (event: MessageEvent) => {
      const data = JSON.parse(event.data) as SpotifyEvent;
      if (data.type !== 'message') return;

      if (isSpotifyConnectEvent(data)) {
        const connectionId = data.headers['Spotify-Connection-Id'];
        await spotifyClient.initializeConnection(connectionId, this.discordTokenResponse.access_token);
      }
      else if (isSpotifyBroadcastEvent(data)) {
        console.log(data);
      }
      else if (isSpotifyMessageEvent(data)) {
        for (const payload of data.payloads) {
          for (const event of payload.events) {
            if (event.type === SpotifyEventType.PLAYER_STATE_CHANGED) {
              setSpotifyState(event.event.state);
            }
          }
        }
      }
    };

    this.socket.onclose = () => {
      console.log('Spotify web socket connection closed');

      if (this.attempts < this.maxAttempts) {
        setTimeout(() => this.connect(), 1000); // try to reconnect after 1 second
      }

      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
    };
  }

  private ping() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'ping' }));
    } else {
      console.error('Spotify web socket is not open. Ping not sent.');
    }
  }

  public sendMessage(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error('Spotify web socket is not open. Message not sent:', message);
    }
  }

  public close() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export const spotifySocketClient = SpotifySocketClient.getInstance();
