import { useLocalStorage } from '@vueuse/core'

export const pomodoroVisible = useLocalStorage<Boolean>('pomodoro-visibility', true)
export const tasksVisible = useLocalStorage<Boolean>('tasks-visibility', true)
export const spotifyVisible = useLocalStorage<Boolean>('spotify-visibility', true)

const visibilityMap = {
  pomodoro: pomodoroVisible,
  tasks: tasksVisible,
  spotify: spotifyVisible
} as const

export type ComponentKey = keyof typeof visibilityMap

export function setVisibility(component: ComponentKey, visible?: boolean): void {
  const storageRef = visibilityMap[component]
  // if `visible` is undefined, toggle; otherwise set to that value
  storageRef.value = visible ?? !storageRef.value
}
