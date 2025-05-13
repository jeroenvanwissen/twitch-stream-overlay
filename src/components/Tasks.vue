<template>
  <div class="w-[380px] h-[600px] fixed left-[40px] bottom-[40px] p-4 overflow-hidden bg-theme-900/90 rounded-lg">
    <div class="mb-4">
      <h2 class="text-theme-300 text-2xl font-bold mb-2">Tasks</h2>
      <p class="text-theme-100 text-lg">!task [text], !focus #, !next #, !done #</p>
    </div>
    <div class="h-[calc(100%-4.5rem)] relative overflow-hidden py-2">
      <div class="tasks-container" v-if="hasTasks" ref="containerRef">
        <div class="content-block" ref="firstBlockRef">
          <template v-for="[userId, userTasks] in tasksByUser" :key="`first-${userId}`">
            <div class="mb-4 p-4 bg-theme-900/50 rounded-lg">
              <h3 class="text-xl font-semibold text-theme-300 mb-2">
                {{ userTasks[0].userName }}
              </h3>
              <ul>
                <li
                  v-for="task in userTasks"
                  :key="task.id"
                  :class="['p-1 text-lg', task.done ? 'line-through' : '', task.focused ? 'text-theme-300' : '']"
                >
                  <div class="flex items-center justify-between">
                    <span class="task-number text-lg text-gray-300 mr-2">{{ task.id }}.</span>
                    <span class="task-text flex-grow">{{ task.text }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </template>
        </div>
        <!-- Clone of content for seamless scrolling -->
        <div class="content-block clone" ref="secondBlockRef">
          <template v-for="[userId, userTasks] in tasksByUser" :key="`second-${userId}`">
            <div class="mb-4 p-4 bg-theme-900/50 rounded-lg">
              <h3 class="text-xl font-semibold text-theme-300 mb-2">
                {{ userTasks[0].userName }}
              </h3>
              <ul>
                <li
                  v-for="task in userTasks"
                  :key="task.id"
                  :class="['p-1 text-lg', task.done ? 'line-through' : '', task.focused ? 'text-theme-300' : '']"
                >
                  <div class="flex items-center justify-between">
                    <span class="task-number text-lg text-gray-300 mr-2">{{ task.id }}.</span>
                    <span class="task-text flex-grow">{{ task.text }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { tasksByUser } from '../store/tasks'
const hasTasks = computed(() => tasksByUser.value.size > 0)
const containerRef = ref<HTMLDivElement>()
const firstBlockRef = ref<HTMLDivElement>()
const secondBlockRef = ref<HTMLDivElement>()
const isOverflowing = ref(false)

// Animation configuration
const configs = {
  animation: {
    scrollSpeed: 30 // pixels per second
  }
}

interface AnimationSet {
  first: Animation
  second: Animation
}

let currentAnimations: AnimationSet | null = null

const pauseAnimations = () => {
  if (currentAnimations) {
    currentAnimations.first.pause()
    currentAnimations.second.pause()
  }
}

const resumeAnimations = () => {
  if (currentAnimations) {
    currentAnimations.first.play()
    currentAnimations.second.play()
  }
}

const startScrollAnimation = () => {
  if (!containerRef.value || !firstBlockRef.value || !secondBlockRef.value) return

  // Add event listeners for pause/resume
  containerRef.value.addEventListener('mouseenter', pauseAnimations)
  containerRef.value.addEventListener('mouseleave', resumeAnimations)

  const firstBlock = firstBlockRef.value
  const secondBlock = secondBlockRef.value
  const blockHeight = firstBlock.offsetHeight

  // Position second block right after the first one
  secondBlock.style.transform = `translateY(${blockHeight}px)`

  const duration = (blockHeight / configs.animation.scrollSpeed) * 1000

  // Stop any existing animations
  if (currentAnimations) {
    currentAnimations.first.cancel()
    currentAnimations.second.cancel()
  }

  const scrollBlocks = () => {
    // Animate first block
    const firstAnim = firstBlock.animate(
      [{ transform: 'translateY(0)' }, { transform: `translateY(-${blockHeight}px)` }],
      {
        duration,
        iterations: 1,
        easing: 'linear',
        fill: 'forwards'
      }
    )

    // Animate second block
    const secondAnim = secondBlock.animate(
      [{ transform: `translateY(${blockHeight}px)` }, { transform: 'translateY(0)' }],
      {
        duration,
        iterations: 1,
        easing: 'linear',
        fill: 'forwards'
      }
    )

    currentAnimations = {
      first: firstAnim,
      second: secondAnim
    }

    secondAnim.onfinish = () => {
      // Reset positions and start over
      firstBlock.style.transform = 'translateY(0)'
      secondBlock.style.transform = `translateY(${blockHeight}px)`
      scrollBlocks()
    }
  }

  scrollBlocks()
}

const checkOverflow = () => {
  if (!containerRef.value || !firstBlockRef.value) return

  const container = containerRef.value
  const content = firstBlockRef.value

  isOverflowing.value = content.offsetHeight > container.offsetHeight

  if (isOverflowing.value) {
    startScrollAnimation()
  } else if (currentAnimations) {
    currentAnimations.first.cancel()
    currentAnimations.second.cancel()
  }
}

onMounted(() => {
  checkOverflow()

  // Check overflow when tasks change
  watch(
    () => tasksByUser.value.size,
    () => {
      nextTick(() => {
        checkOverflow()
      })
    }
  )

  // Initial check and periodic rechecks
  const observer = new ResizeObserver(() => {
    checkOverflow()
  })

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }
})
</script>

<style scoped>
.tasks-container {
  position: relative;
  height: 100%;
}

.content-block {
  position: absolute;
  width: 100%;
  transform: translateY(0);
  transition: transform 0.1s linear;
}

.content-block.clone {
  will-change: transform;
}
</style>
