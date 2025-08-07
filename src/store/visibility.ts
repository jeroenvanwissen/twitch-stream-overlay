import { useLocalStorage } from '@vueuse/core'

const components = ['pomodoro', 'tasks', 'spotify', 'deaths', 'emotes'] as const

const visibilityMap = components.reduce((acc, component) => {
  acc[component] = useLocalStorage<Boolean>(`${component}-visibility`, true)
  return acc
}, {} as Record<typeof components[number], ReturnType<typeof useLocalStorage<Boolean>>>)

export type ComponentKey = keyof typeof visibilityMap

export function setVisibility(component: ComponentKey, visible?: boolean): void {
  const storageRef = visibilityMap[component]
  // if `visible` is undefined, toggle; otherwise set to that value
  storageRef.value = visible ?? !storageRef.value
}

export function isVisible(component: ComponentKey): Boolean {
  return visibilityMap[component].value
}
