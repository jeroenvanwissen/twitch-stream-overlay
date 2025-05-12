import { ref, watch } from "vue";

interface Task {
  id: number;
  userId: string;
  userName: string;
  text: string;
  done: boolean;
  timestamp: number;
}

const STORAGE_KEY = "tasks-state";

// Load initial state from localStorage
const loadTasks = (): Task[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
  return [];
};

// Create reactive tasks array
export const tasks = ref<Task[]>(loadTasks());

// Watch for changes and save to localStorage
watch(
  tasks,
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  },
  { deep: true },
);

// Create a Map of tasks by user
export const tasksByUser = ref(new Map<string, Task[]>());

// Update tasksByUser when tasks change
watch(
  tasks,
  (newTasks) => {
    const userTaskMap = new Map<string, Task[]>();
    newTasks.forEach((task) => {
      const userTasks = userTaskMap.get(task.userId) || [];
      userTasks.push(task);
      userTaskMap.set(task.userId, userTasks);
    });
    tasksByUser.value = userTaskMap;
  },
  { immediate: true, deep: true },
);

// Task management functions
export const addTask = (userId: string, userName: string, text: string) => {
  const id = tasks.value.length
    ? Math.max(...tasks.value.map((t) => t.id)) + 1
    : 1;
  tasks.value.push({
    id,
    userId,
    userName,
    text,
    done: false,
    timestamp: Date.now(),
  });
};

export const addTasks = (
  userId: string,
  userName: string,
  textArray: string[],
) => {
  textArray.forEach((text) => addTask(userId, userName, text));
};

export const toggleTask = (taskId: number) => {
  const task = tasks.value.find((t) => t.id === taskId);
  if (task) {
    task.done = !task.done;
  }
};

export const deleteTask = (taskId: number) => {
  const index = tasks.value.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks.value.splice(index, 1);
  }
};

export const clearTasks = () => {
  tasks.value = [];
};

export const findTask = (id: string | number) => {
  const numId = typeof id === "string" ? parseInt(id) : id;
  return tasks.value.find((t) => t.id === numId);
};

export const focusTask = (id: string | number) => {
  const numId = typeof id === "string" ? parseInt(id) : id;
  const task = findTask(numId);
  if (task) {
    tasks.value.forEach((t) => delete (t as any).focused);
    (task as any).focused = true;
  }
};

export const nextTask = (id: string | number) => {
  const numId = typeof id === "string" ? parseInt(id) : id;
  const index = tasks.value.findIndex((t) => t.id === numId);
  if (index !== -1 && index < tasks.value.length - 1) {
    const nextTask = tasks.value[index + 1];
    focusTask(nextTask.id);
  }
};

export const markDone = (id: string | number) => {
  const numId = typeof id === "string" ? parseInt(id) : id;
  const task = findTask(numId);
  if (task) {
    task.done = true;
  }
};
