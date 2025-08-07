<template>
  <div class="emote-explosion-container">
    <img
      v-for="emote in activeEmotes"
      :key="emote.id"
      class="emote"
      :src="emote.url"
      :alt="emote.name"
      :style="{
        left: emote.x + 'px',
        top: emote.y + 'px',
        opacity: emote.opacity,
        transform: `scale(${emote.scale}) rotate(${emote.rotation}deg)`
      }"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const activeEmotes = ref([])
const animationId = ref(null)
const containerWidth = ref(window.innerWidth)
const containerHeight = ref(window.innerHeight)

class Emote {
  constructor(x, y, emoteData) {
    this.id = Math.random().toString(36).substr(2, 9)
    
    // Use the provided emote data
    this.url = emoteData.url
    this.name = emoteData.name || 'emote'
    
    this.x = x
    this.y = y
    this.vx = (Math.random() - 0.5) * 20 // Random velocity X
    this.vy = (Math.random() - 0.5) * 20 // Random velocity Y
    this.opacity = 1
    this.scale = 3
    this.rotation = 0
    this.rotationSpeed = (Math.random() - 0.5) * 10
    this.gravity = 0.2
    this.bounce = 0.8
    this.fadeStart = Date.now() + 3000 // Start fading after 3 seconds
    this.lifetime = 10000 // Total lifetime 5 seconds
    this.birth = Date.now()
  }

  update() {
    // Apply gravity
    this.vy += this.gravity
    
    // Update position
    this.x += this.vx
    this.y += this.vy
    
    // Update rotation
    this.rotation += this.rotationSpeed
    
    // Bounce off edges
    if (this.x <= 0 || this.x >= containerWidth.value - 28) {
      this.vx *= -this.bounce
      this.x = Math.max(0, Math.min(containerWidth.value - 28, this.x))
    }
    
    if (this.y <= 0 || this.y >= containerHeight.value - 28) {
      this.vy *= -this.bounce
      this.y = Math.max(0, Math.min(containerHeight.value - 28, this.y))
    }
    
    // Handle fading
    const age = Date.now() - this.birth
    if (age > this.fadeStart) {
      const fadeProgress = (age - this.fadeStart) / (this.lifetime - 3000)
      this.opacity = Math.max(0, 1 - fadeProgress)
      this.scale = Math.max(0.1, 1 - fadeProgress * 0.5)
    }
    
    // Reduce velocity over time (air resistance)
    this.vx *= 0.995
    this.vy *= 0.995
  }

  isDead() {
    return Date.now() - this.birth > this.lifetime
  }
}

const triggerExplosion = (x = containerWidth.value / 2, y = containerHeight.value / 2, emotes = [], count = null) => {
  if (!emotes || emotes.length === 0) {
    console.warn('No emotes provided for explosion')
    return
  }

  // Use provided count or scale based on number of unique emotes (max 20)
  const explosionCount = count || Math.min(emotes.length * 3, 20)
  
  for (let i = 0; i < explosionCount; i++) {
    // Pick a random emote from the provided emotes
    const randomEmote = emotes[Math.floor(Math.random() * emotes.length)]
    activeEmotes.value.push(new Emote(x, y, randomEmote))
  }
}

const animate = () => {
  // Update all emotes
  activeEmotes.value.forEach(emote => emote.update())
  
  // Remove dead emotes
  activeEmotes.value = activeEmotes.value.filter(emote => !emote.isDead())
  
  animationId.value = requestAnimationFrame(animate)
}

const handleResize = () => {
  containerWidth.value = window.innerWidth
  containerHeight.value = window.innerHeight
}

// Listen for custom event
const handleEmoteExplosion = (event) => {
  const { x, y, emotes, count } = event.detail || {}
  triggerExplosion(x, y, emotes, count)
}

onMounted(() => {
  animate()
  window.addEventListener('resize', handleResize)
  window.addEventListener('EmoteExplosion', handleEmoteExplosion)
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('EmoteExplosion', handleEmoteExplosion)
})

// Expose trigger function for direct calls
defineExpose({
  triggerExplosion
})
</script>

<style scoped>
.emote-explosion-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.emote {
  position: absolute;
  width: 28px;
  height: 28px;
  user-select: none;
  pointer-events: none;
  will-change: transform, opacity;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}
</style>