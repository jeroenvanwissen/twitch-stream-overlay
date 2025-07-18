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
  callback: async ({ channel }) => {
    if (!spotifyState.value.item) {
      await chatClient.say(channel, 'No song is currently playing!')
      return
    }

    await spotifyClient.nextTrack()

    const text = `I know right, Jeroen's song choices are always on point! Skipped to the next track.`
    await chatClient.say(channel, text)
  }
}

export default command
