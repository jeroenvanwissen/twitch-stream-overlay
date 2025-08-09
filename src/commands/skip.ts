import { spotifyClient } from '@/lib/spotify/spotifyClient'
import chatClient from '@/lib/twitch/chatClient'
import { spotifyState } from '@/store/spotify'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'skip',
  permission: 'moderator',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, message }) => {
    if (!spotifyState.value.item) {
      const text = 'No song is currently playing!';
      await chatClient.say(channel, text, {
        replyTo: message.id
      });
      return;
    }

    await spotifyClient.nextTrack()

    const text = `I know right, Jeroen's song choices are always on point! Skipped to the next track.`
    await chatClient.say(channel, text, {
      replyTo: message.id
    });
  }
}

export default command
