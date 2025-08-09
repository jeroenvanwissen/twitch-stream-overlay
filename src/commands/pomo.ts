import chatClient from '@/lib/twitch/chatClient'
import { usePomodoroStore } from '@/store/pomodoro'
import type { Command } from '@/types/chat'

const usage = `Usage: !pomo <start|stop|reset|next|sessions [count]|time [focus]/[break]|add [minutes]>`

const command: Command = {
  name: 'pomo',
  permission: 'broadcaster',
  type: 'command',
  storage: {},
  init: () => {},
  callback: async ({ channel, params, message }) => {
    const store = usePomodoroStore()
    const state = store.state.value
    const user = message?.userInfo.displayName ?? 'User'

    if (!params || params.length === 0) {
      const text = `@${user} ${usage}`;
      await chatClient.say(channel, text, {
        replyTo: message.id
      });
      return
    }

    const sub = params[0].toLowerCase()
    let text;
    switch (sub) {
      case 'start':
        store.start()
        text = `@${user} Pomodoro timer started with a ${state.focusLength}-minute focus session!`
        await chatClient.say(channel, text, {
          replyTo: message.id
        })
        break
      case 'stop':
        store.stop()
        text = `@${user} Pomodoro timer stopped!`
        await chatClient.say(channel, text, {
          replyTo: message.id
        })
        break
      case 'reset':
        store.reset()
        text = `@${user} Pomodoro timer reset!`
        await chatClient.say(channel, text, {
          replyTo: message.id
        })
        break
      case 'next':
        store.nextPomo()
        const newSession = store.state.value.isFocusMode ? 'focus' : 'break'
        text = `@${user} Pomodoro timer switched to the next ${newSession} session!`
        await chatClient.say(channel, text, {
          replyTo: message.id
        })
        break
      case 'sessions':
        {
          const count = params[1]
          if (!count || isNaN(Number(count)) || Number(count) <= 0) {
            text = `@${user} Please provide a valid number of pomodoros!`
            await chatClient.say(channel, text, {
              replyTo: message.id
            })
            return
          }
          store.setTotalPomos(Number(count))
          text = `@${user} Pomodoro timer total pomodoros set to ${count}!`
          await chatClient.say(channel, text, {
            replyTo: message.id
          })
        }
        break
      case 'time':
        {
          const timeArg = params[1]
          if (!timeArg) {
            text = `@${user} Please provide focus/break time in minutes! Example: !pomo time 50/8`;
            await chatClient.say(channel, text, {
              replyTo: message.id
            })
            return
          }
          const [focus, breakTime] = timeArg.split('/')
          const focusNum = Number(focus)
          const breakNum = breakTime !== undefined ? Number(breakTime) : undefined
          if (
            isNaN(focusNum) ||
            focusNum <= 0 ||
            (breakTime !== undefined && (isNaN(breakNum as number) || (breakNum as number) <= 0))
          ) {
            text = `@${user} Please provide valid focus/break times! Example: !pomo time 50/8`;
            await chatClient.say(channel, text, {
              replyTo: message.id
            })
            return
          }
          store.setFocusLength(focusNum)
          if (breakNum !== undefined) store.setBreakLength(breakNum)
          text = `@${user} Pomodoro timer focus time set to ${focusNum} minute(s)` +
            (breakNum !== undefined ? ` and break time set to ${breakNum} minute(s)!` : '!')
          await chatClient.say(channel, text, {
            replyTo: message.id
          })
        }
        break
      case 'add':
        {
          const minutes = params[1]
          if (!minutes || isNaN(Number(minutes)) || Number(minutes) <= 0) {
            text = `@${user} Please provide a valid number of minutes to add!`;
            await chatClient.say(channel, text, {
              replyTo: message.id
            })
            return
          }
          store.addTime(Number(minutes))
          text = `@${user} Added ${minutes} minute(s) to the Pomodoro timer!`;
          await chatClient.say(channel, text, {
            replyTo: message.id
          })
        }
        break
      default:
        text = `@${user} ${usage}`;
        await chatClient.say(channel, text, {
          replyTo: message.id
        })
    }
  }
}

export default command
