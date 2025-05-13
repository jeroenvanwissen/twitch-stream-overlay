import { useLocalStorage } from '@vueuse/core'

export interface Pomodoro {
  isRunning: boolean
  isFocusMode: boolean
  focusLength: number
  breakLength: number
  totalPomos: number
  currentPomo: number
  timeRemaining: number
}

export const pomodoro = useLocalStorage<Pomodoro>('pomodoro', {
  isRunning: false,
  isFocusMode: true,
  focusLength: 50, // default 50 minutes
  breakLength: 10, // default 10 minutes
  totalPomos: 5,
  currentPomo: 1,
  timeRemaining: 50 * 60 // in seconds
})

export const usePomodoroStore = () => {
  const start = () => {
    pomodoro.value.isRunning = true
  }

  const stop = () => {
    pomodoro.value.isRunning = false
  }

  const reset = () => {
    pomodoro.value.isRunning = false
    pomodoro.value.isFocusMode = true
    pomodoro.value.timeRemaining = pomodoro.value.focusLength * 60
    pomodoro.value.currentPomo = 1
  }

  const setFocusLength = (minutes: number) => {
    pomodoro.value.focusLength = minutes
    if (pomodoro.value.isFocusMode) {
      pomodoro.value.timeRemaining = minutes * 60
    }
  }

  const setBreakLength = (minutes: number) => {
    pomodoro.value.breakLength = minutes
    if (!pomodoro.value.isFocusMode) {
      pomodoro.value.timeRemaining = minutes * 60
    }
  }

  const setTotalPomos = (count: number) => {
    pomodoro.value.totalPomos = count
  }

  const addTime = (minutes: number) => {
    pomodoro.value.timeRemaining += minutes * 60
  }

  const tick = () => {
    if (!pomodoro.value.isRunning || pomodoro.value.timeRemaining <= 0) return

    pomodoro.value.timeRemaining--

    if (pomodoro.value.timeRemaining <= 0) {
      if (pomodoro.value.isFocusMode) {
        // Going from focus to break
        pomodoro.value.isFocusMode = false
        pomodoro.value.timeRemaining = pomodoro.value.breakLength * 60
      } else {
        // Going from break to focus
        if (pomodoro.value.currentPomo < pomodoro.value.totalPomos) {
          pomodoro.value.currentPomo++
          pomodoro.value.isFocusMode = true
          pomodoro.value.timeRemaining = pomodoro.value.focusLength * 60
        } else {
          pomodoro.value.isRunning = false
        }
      }
    }
  }

  const formattedTime = (): string => {
    const minutes = Math.floor(pomodoro.value.timeRemaining / 60)
    const seconds = pomodoro.value.timeRemaining % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const nextPomo = () => {
    if (pomodoro.value.isFocusMode) {
      // Going from focus to break
      pomodoro.value.isFocusMode = false
      pomodoro.value.timeRemaining = pomodoro.value.breakLength * 60
    } else {
      // Going from break to focus
      if (pomodoro.value.currentPomo < pomodoro.value.totalPomos) {
        pomodoro.value.currentPomo++
      }
      pomodoro.value.isFocusMode = true
      pomodoro.value.timeRemaining = pomodoro.value.focusLength * 60
    }
  }

  return {
    state: pomodoro,
    start,
    stop,
    reset,
    setFocusLength,
    setBreakLength,
    setTotalPomos,
    addTime,
    tick,
    formattedTime,
    nextPomo
  }
}
