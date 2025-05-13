<script setup lang="ts">
import { badge, extension, span } from '@/store/config'

import Logo from '@/components/Logo.vue'
</script>

<template>
  <div
    ref="badge"
    class="absolute will-change-auto flex flex-col gap-4 flex-1 top-6 left-8 origin-top-left z-10 items-center justify-center bg-theme-700 rounded-[20px] w-[117.78px] h-[106px] ml-1.5 mt-1 p-[3px] text-center transform -skew-x-[8deg] card scale-75"
  >
    <div
      class="flex items-center justify-center bg-theme-900 rounded-2xl h-[108px] w-[108px] m-0.5 p-[3px] relative -z-10 card2"
    >
      <Logo
        class="transform -skew-x-[-8deg] w-20 h-20"
        style="--color-logo-back: var(--color-600); --color-logo-front: var(--color-200)"
      />
    </div>
    <div
      ref="extension"
      class="flex items-center justify-end bg-theme-800 rounded-[20px] text-theme-300 text-[50px] font-extrabold h-[92%] absolute left-1/2 pr-5 overflow-hidden origin-right transform -translate-y-1/2 top-1/2 -z-20 transition-[width] ease-out w-0 extension"
    >
      <span ref="span" class="pb-[5px] whitespace-pre" />
    </div>
  </div>
</template>

<style scoped>
/* Only keep what can't be done with Tailwind */
.card::before {
  --card-width: 0;
  content: '';
  background-image: linear-gradient(var(--rotate, 1deg), var(--color-200), var(--color-600) 23%, var(--color-900));
  @apply absolute rounded-[20px] h-[104%] w-[102%] -left-[1%] -top-[3%] -z-10;
}

.card.active::before {
  animation: spin 14s;
}

.extension {
  background-image: linear-gradient(45deg, var(--color-500), var(--color-700) 23%, var(--color-900));
}

.extension::after {
  content: '';
  @apply absolute inset-0 w-full h-full;
  transform: translateX(-100%);
}

.extension.active {
  width: calc(var(--card-width) + 96px);
  @apply pl-[60px];
}

.extension.active::after {
  animation: slide 10s forwards;
  animation-iteration-count: 1;
  background: linear-gradient(
    -65deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0) 35%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(128, 186, 232, 0) 65%,
    rgba(128, 186, 232, 0) 99%,
    rgba(125, 185, 232, 0) 100%
  );
}

@keyframes spin {
  0%,
  100% {
    --rotate: 1deg;
  }
  10%,
  95% {
    --rotate: 359deg;
  }
}

@keyframes slide {
  10% {
    transform: translateX(-100%);
  }
  30%,
  100% {
    transform: translateX(100%);
  }
}
</style>
