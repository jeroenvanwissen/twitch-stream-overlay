import { useLocalStorage } from '@vueuse/core'

// List of commands that are available to all users
export const PUBLIC_COMMANDS = ['task', 'add', 'focus', 'next', 'done', 'deltask', 'taskdel', 'banger', 'followage']

// Blacklist of commands that cannot be added as custom commands
export const COMMAND_BLACKLIST = [
  // Command management
  'cadd',
  'cdel',
  'cactivate',
  'cdeactivate',
  'cedit',

  // Task management
  'task',
  'add',
  'focus',
  'next',
  'done',
  'deltask',
  'taskdel',
  'cleartasks',

  // Social features
  'so',
  'banger',
  'followage',

  // Pomodoro
  'pstart',
  'pstop',
  'preset',
  'ptimeadd',
  'ppomos',
  'ppomotime',
  'pbreaktime',
  'pnext',

  // User management
  'whitelist',
  'unwhitelist'
]

export interface Command {
  name: string
  message: string
  isActive: boolean
  isTimed: boolean
}

export const commands = useLocalStorage<Command[]>('commands', [])

export const addCommand = (name: string, message: string): boolean => {
  // Check if command is blacklisted
  if (COMMAND_BLACKLIST.includes(name)) {
    return false
  }

  // Check if command already exists
  if (commands.value.some(cmd => cmd.name === name)) {
    return false
  }

  commands.value.push({
    name,
    message,
    isActive: true,
    isTimed: false
  })

  return true
}

export const deleteCommand = (name: string): boolean => {
  const initialLength = commands.value.length
  commands.value = commands.value.filter(cmd => cmd.name !== name)
  return commands.value.length !== initialLength
}

export const activateCommand = (name: string): boolean => {
  const command = commands.value.find(cmd => cmd.name === name)
  if (!command) {
    return false
  }

  command.isActive = true
  return true
}

export const deactivateCommand = (name: string): boolean => {
  const command = commands.value.find(cmd => cmd.name === name)
  if (!command) {
    return false
  }

  command.isActive = false
  return true
}

export const editCommand = (name: string, message: string): boolean => {
  const command = commands.value.find(cmd => cmd.name === name)
  if (!command) {
    return false
  }

  command.message = message
  return true
}

export const getCommand = (name: string): Command | undefined => {
  return commands.value.find(cmd => cmd.name === name)
}

export const formatCommandMessage = (message: string, userName: string): string => {
  return message.replace(/\$\(userName\)/g, `@${userName}`)
}
