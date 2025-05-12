import { ref, watch } from "vue";

const STORAGE_KEY = "component-visibility";

// Load initial state from localStorage
const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      return {
        pomodoro: state.pomodoro ?? true,
        tasks: state.tasks ?? true,
        spotify: state.spotify ?? true,
      };
    }
  } catch (error) {
    console.error("Error loading visibility state:", error);
  }
  return { pomodoro: true, tasks: true, spotify: true };
};

// Create reactive refs
export const pomodoroVisible = ref(loadState().pomodoro);
export const tasksVisible = ref(loadState().tasks);
export const spotifyVisible = ref(loadState().spotify);

// Save state changes to localStorage
const saveState = () => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        pomodoro: pomodoroVisible.value,
        tasks: tasksVisible.value,
        spotify: spotifyVisible.value,
      }),
    );
  } catch (error) {
    console.error("Error saving visibility state:", error);
  }
};

// Watch for changes and save to localStorage
watch(
  [pomodoroVisible, tasksVisible, spotifyVisible],
  () => {
    saveState();
  },
  { deep: true },
);


export const setVisibility = (component: string, visible?: boolean) => {
  switch (component) {
    case "pomodoro":
      if (visible === undefined) {
        pomodoroVisible.value = !pomodoroVisible.value;
      } else {
        pomodoroVisible.value = visible;
      }
      break;
    case "tasks":
      if (visible === undefined) {
        tasksVisible.value = !tasksVisible.value;
      } else {
        tasksVisible.value = visible;
      }
      break;
    case "spotify":
      if (visible === undefined) {
        spotifyVisible.value = !spotifyVisible.value;
      } else {
        spotifyVisible.value = visible;
      }
      break;
  }
};
