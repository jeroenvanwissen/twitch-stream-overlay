import { useLocalStorage } from '@vueuse/core'
import { ref, watch } from 'vue'

export interface Task {
  id: number
  userId: string
  userName: string
  text: string
  done: boolean
  timestamp: number
  focused: boolean
}

export const tasks = useLocalStorage<Task[]>('tasks', [])

// Create a Map of tasks by user
export const tasksByUser = ref(new Map<string, Task[]>())

// Update tasksByUser when tasks change
watch(
  tasks,
  newTasks => {
    const userTaskMap = new Map<string, Task[]>()
    newTasks.forEach(task => {
      const userTasks = userTaskMap.get(task.userId) || []
      userTasks.push(task)
      userTaskMap.set(task.userId, userTasks)
    })
    tasksByUser.value = userTaskMap
  },
  { immediate: true, deep: true }
)

// Task management functions
export const addTask = (userId: string, userName: string, text: string) => {
  // Get all tasks for this specific user
  const userTasks = tasks.value.filter(t => t.userName === userName)

  // Find the next available ID for this user
  let id = 1
  if (userTasks.length > 0) {
    const maxId = Math.max(...userTasks.map(t => t.id))
    id = maxId + 1
  }

  tasks.value.push({
    id,
    userId,
    userName,
    text,
    done: false,
    timestamp: Date.now(),
    focused: false
  })
}

export const addTasks = (userId: string, userName: string, textArray: string[]) => {
  textArray.forEach(text => addTask(userId, userName, text))
}

export const toggleTask = (taskId: number, userName: string) => {
  const task = tasks.value.find(t => t.id === taskId && t.userName === userName)
  if (task) {
    task.done = !task.done
  }
}

export const deleteTask = (taskId: number, userName: string) => {
  const index = tasks.value.findIndex(t => t.id === taskId && t.userName === userName)
  if (index !== -1) {
    tasks.value.splice(index, 1)
  }
}

export const clearTasks = () => {
  tasks.value = []
}

export const clearDoneTasks = () => {
  const initialCount = tasks.value.length
  tasks.value = tasks.value.filter(task => !task.done)
  return initialCount - tasks.value.length
}

export const findTask = (id: string | number, userName: string) => {
  const numId = typeof id === 'string' ? parseInt(id) : id
  return tasks.value.find(t => t.id === numId && t.userName === userName)
}

export const focusTask = (id: string | number, userName: string) => {
  const numId = typeof id === 'string' ? parseInt(id) : id
  const task = findTask(numId, userName)
  if (task) {
    // Only reset focus for tasks belonging to the same user
    tasks.value.forEach(t => {
      if (t.userName === userName) {
        t.focused = false
      }
    })
    task.focused = true
  }
}

export const nextTask = (id: string | number, userName: string) => {
  const numId = typeof id === 'string' ? parseInt(id) : id
  const index = tasks.value.findIndex(t => t.id === numId && t.userName === userName)
  if (index !== -1 && index < tasks.value.length - 1) {
    const nextTask = tasks.value[index + 1]
    focusTask(nextTask.id, userName)
  }
}

export const markDone = (id: string | number, userName: string) => {
  const numId = typeof id === 'string' ? parseInt(id) : id
  const task = findTask(numId, userName)
  if (task) {
    task.done = true
  }
}

export const markUndone = (id: string | number, userName: string) => {
  const numId = typeof id === 'string' ? parseInt(id) : id
  const task = findTask(numId, userName)
  if (task) {
    task.done = false
  }
}

export const getUserIncompleteTasks = (userName: string) => {
  const userTasks = tasks.value.filter(t => t.userName === userName && !t.done)

  // Sort tasks: focused task first, then by ID
  return userTasks.sort((a, b) => {
    if (a.focused && !b.focused) return -1
    if (!a.focused && b.focused) return 1
    return a.id - b.id
  })
}
