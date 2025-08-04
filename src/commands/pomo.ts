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
      await chatClient.say(channel, `@${user} ${usage}`)
      return
    }

    const sub = params[0].toLowerCase()
    switch (sub) {
      case 'start':
        store.start()
        await chatClient.say(
          channel,
          `@${user} Pomodoro timer started with a ${state.focusLength}-minute focus session!`
        )
        break
      case 'stop':
        store.stop()
        await chatClient.say(channel, `@${user} Pomodoro timer stopped!`)
        break
      case 'reset':
        store.reset()
        await chatClient.say(channel, `@${user} Pomodoro timer reset!`)
        break
      case 'next':
        store.nextPomo()
        const newSession = store.state.value.isFocusMode ? 'focus' : 'break'
        await chatClient.say(channel, `@${user} Pomodoro timer switched to the next ${newSession} session!`)
        break
      case 'sessions':
        {
          const count = params[1]
          if (!count || isNaN(Number(count)) || Number(count) <= 0) {
            await chatClient.say(channel, `@${user} Please provide a valid number of pomodoros!`)
            return
          }
          store.setTotalPomos(Number(count))
          await chatClient.say(channel, `@${user} Pomodoro timer total pomodoros set to ${count}!`)
        }
        break
      case 'time':
        {
          const timeArg = params[1]
          if (!timeArg) {
            await chatClient.say(
              channel,
              `@${user} Please provide focus/break time in minutes! Example: !pomo time 50/8`
            )
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
            await chatClient.say(channel, `@${user} Please provide valid focus/break times! Example: !pomo time 50/8`)
            return
          }
          store.setFocusLength(focusNum)
          if (breakNum !== undefined) store.setBreakLength(breakNum)
          await chatClient.say(
            channel,
            `@${user} Pomodoro timer focus time set to ${focusNum} minute(s)` +
              (breakNum !== undefined ? ` and break time set to ${breakNum} minute(s)!` : '!')
          )
        }
        break
      case 'add':
        {
          const minutes = params[1]
          if (!minutes || isNaN(Number(minutes)) || Number(minutes) <= 0) {
            await chatClient.say(channel, `@${user} Please provide a valid number of minutes to add!`)
            return
          }
          store.addTime(Number(minutes))
          await chatClient.say(channel, `@${user} Added ${minutes} minute(s) to the Pomodoro timer!`)
        }
        break
      default:
        await chatClient.say(channel, `@${user} ${usage}`)
    }
  }
}

export default command
