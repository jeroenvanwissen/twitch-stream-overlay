import { computed, ref, watch } from 'vue'

export interface Task {
  id: number
  text: string
  userId: string
  userName: string
  done: boolean
  focused: boolean
}

const tasks = ref<Task[]>([])
const nextId = ref(1)

// Load initial state from localStorage
try {
  const storedTasks = localStorage.getItem('tasks')
  const storedNextId = localStorage.getItem('tasksNextId')

  if (storedTasks) {
    tasks.value = JSON.parse(storedTasks)
  }
  if (storedNextId) {
    nextId.value = parseInt(storedNextId)
  }
} catch (e) {
  console.warn('Failed to load tasks from localStorage:', e)
}

// Watch for changes and save to localStorage
watch(
  [tasks, nextId],
  () => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks.value))
      localStorage.setItem('tasksNextId', nextId.value.toString())
    } catch (e) {
      console.warn('Failed to save tasks to localStorage:', e)
    }
  },
  { deep: true }
)

const tasksByUser = computed(() => {
  const grouped = new Map<string, Task[]>()
  tasks.value.forEach(task => {
    if (!grouped.has(task.userId)) {
      grouped.set(task.userId, [])
    }
    grouped.get(task.userId)?.push(task)
  })
  return grouped
})

function findTask(identifier: string | number): Task | undefined {
  if (typeof identifier === 'number') {
    return tasks.value.find(t => t.id === identifier)
  }
  // If it's a string, first try to parse it as a number
  const id = parseInt(identifier)
  if (!isNaN(id)) {
    return tasks.value.find(t => t.id === id)
  }
  // If not a number, search by text
  return tasks.value.find(t => t.text.toLowerCase() === identifier.toLowerCase())
}

function findTaskIndex(identifier: string | number): number {
  if (typeof identifier === 'number') {
    return tasks.value.findIndex(t => t.id === identifier)
  }
  // If it's a string, first try to parse it as a number
  const id = parseInt(identifier)
  if (!isNaN(id)) {
    return tasks.value.findIndex(t => t.id === id)
  }
  // If not a number, search by text
  return tasks.value.findIndex(t => t.text.toLowerCase() === identifier.toLowerCase())
}

export function useTasks() {
  function addTasks(userId: string, userName: string, taskTexts: string[]) {
    taskTexts.forEach(text => {
      tasks.value.push({
        id: nextId.value++,
        text,
        userId,
        userName,
        done: false,
        focused: false
      })
    })
  }

  function focusTask(taskIdentifier: string | number) {
    const task = findTask(taskIdentifier)
    if (task) {
      // Clear focus from all tasks
      tasks?.value?.forEach(t => (t.focused = false))
      task.focused = true
    }
  }

  function nextTask(taskIdentifier: string | number) {
    const currentFocused = tasks.value.find(t => t.focused)
    if (currentFocused) {
      currentFocused.done = true
      currentFocused.focused = false
    }
    focusTask(taskIdentifier)
  }

  function markDone(taskIdentifier: string | number) {
    const task = findTask(taskIdentifier)
    if (task) {
      task.done = true
      if (task.focused) {
        task.focused = false
      }
    }
  }

  function deleteTask(taskIdentifier: string | number) {
    const index = findTaskIndex(taskIdentifier)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
  }

  function clearTasks() {
    tasks.value = []
    nextId.value = 1
  }

  return {
    tasks,
    tasksByUser,
    addTasks,
    findTask,
    focusTask,
    nextTask,
    markDone,
    deleteTask,
    clearTasks
  }
}
