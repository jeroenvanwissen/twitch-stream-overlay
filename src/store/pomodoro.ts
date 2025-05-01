import { ref, watch } from "vue";

interface PomodoroState {
  isRunning: boolean;
  isFocusMode: boolean;
  focusLength: number;
  breakLength: number;
  totalPomos: number;
  currentPomo: number;
  timeRemaining: number;
}

const STORAGE_KEY = "pomodoro-state";

const defaultState: PomodoroState = {
  isRunning: false,
  isFocusMode: true,
  focusLength: 50, // default 50 minutes
  breakLength: 10, // default 10 minutes
  totalPomos: 1,
  currentPomo: 1,
  timeRemaining: 50 * 60, // in seconds
};

// Load initial state from localStorage or use default
const loadState = (): PomodoroState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : defaultState;
};

// Create reactive state
const state = ref<PomodoroState>(loadState());

// Save state changes to localStorage
watch(
  state,
  (newState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  },
  { deep: true },
);

export const usePomodoroStore = () => {
  const start = () => {
    state.value.isRunning = true;
  };

  const stop = () => {
    state.value.isRunning = false;
  };

  const reset = () => {
    state.value.isRunning = false;
    state.value.isFocusMode = true;
    state.value.timeRemaining = state.value.focusLength * 60;
    state.value.currentPomo = 1;
  };

  const setFocusLength = (minutes: number) => {
    state.value.focusLength = minutes;
    if (state.value.isFocusMode) {
      state.value.timeRemaining = minutes * 60;
    }
  };

  const setBreakLength = (minutes: number) => {
    state.value.breakLength = minutes;
    if (!state.value.isFocusMode) {
      state.value.timeRemaining = minutes * 60;
    }
  };

  const setTotalPomos = (count: number) => {
    state.value.totalPomos = count;
  };

  const addTime = (minutes: number) => {
    state.value.timeRemaining += minutes * 60;
  };

  const tick = () => {
    if (!state.value.isRunning || state.value.timeRemaining <= 0) return;

    state.value.timeRemaining--;

    if (state.value.timeRemaining <= 0) {
      if (state.value.isFocusMode) {
        // Going from focus to break
        state.value.isFocusMode = false;
        state.value.timeRemaining = state.value.breakLength * 60;
      } else {
        // Going from break to focus
        if (state.value.currentPomo < state.value.totalPomos) {
          state.value.currentPomo++;
          state.value.isFocusMode = true;
          state.value.timeRemaining = state.value.focusLength * 60;
        } else {
          state.value.isRunning = false;
        }
      }
    }
  };

  const formattedTime = (): string => {
    const minutes = Math.floor(state.value.timeRemaining / 60);
    const seconds = state.value.timeRemaining % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const nextPomo = () => {
    if (state.value.isFocusMode) {
      // Going from focus to break
      state.value.isFocusMode = false;
      state.value.timeRemaining = state.value.breakLength * 60;
    } else {
      // Going from break to focus
      if (state.value.currentPomo < state.value.totalPomos) {
        state.value.currentPomo++;
      }
      state.value.isFocusMode = true;
      state.value.timeRemaining = state.value.focusLength * 60;
    }
  };

  return {
    state,
    start,
    stop,
    reset,
    setFocusLength,
    setBreakLength,
    setTotalPomos,
    addTime,
    tick,
    formattedTime,
    nextPomo,
  };
};
