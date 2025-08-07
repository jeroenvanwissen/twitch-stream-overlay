import chatClient from '@/lib/twitch/chatClient'
import type { Command } from '@/types/chat'

const command: Command = {
  name: 'emotes',
  permission: 'broadcaster',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async () => {
    const emotesToShow = [
      {
        name: `jeroen7Hey`,
        url: `https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_922a956c7a84498bb5367226b89e001f/default/dark/2.0`
      },
      {
        name: `jeroen7Hmm`,
        url: 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_c2572356442f445d8ec46c4184440e3c/default/dark/2.0'
      },
      {
        name: `jeroen7Logo`,
        url: 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_ed54dc10e40447bda20c2f5816fbf1ba/default/dark/2.0'
      },
      {
        name: `jeroen7Love`,
        url: 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_4ce9c385094c46e5895467f23a3b395e/default/dark/2.0'
      },
      {
        name: `jeroen7Money`,
        url: 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_451eaa31f54e4eb0949be66b5ec30580/default/dark/2.0'
      },
      {
        name: `jeroen7Ok`,
        url: 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_22b0e5bbc3f74396924975428d7436e1/default/dark/2.0'
      },
      {
        name: 'jeroen7Woohoo',
        url: 'https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_527b153e37534e68bf2592fd4f8a4a7a/default/dark/2.0'
      }
    ]
    window.dispatchEvent(
      new CustomEvent('EmoteExplosion', {
        detail: {
          x: Math.random() * (window.innerWidth - 200) + 100,
          y: Math.random() * (window.innerHeight - 200) + 100,
          emotes: emotesToShow
        }
      })
    )
  }
}

export default command
