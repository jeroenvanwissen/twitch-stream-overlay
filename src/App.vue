<script setup lang="ts">
import {ref} from "vue";
import {botUser, user} from "@/store/auth";
import '@/lib/twitch/authClient';

import logo from '@/assets/logo-wide.svg';
import splash from '@/assets/splash.png';
import screenshot from '@/assets/screenshot.png';

import Badge from "@/components/Badge.vue";
import Chat from "@/components/Chat.vue";

const chatWindow = ref<HTMLDivElement>();
const mainWindow = ref<HTMLDivElement>();

</script>

<template>
  <div class="w-screen h-auto max-h-screen aspect-video flex justify-between relative overflow-hidden p-6">
<!--    <img class="w-full h-auto absolute inset-0 aspect-video"-->
<!--         :src="splash"-->
<!--         alt="NoMercy Entertainment Logo"/>-->

    <Badge v-if="botUser" />

    <div ref="mainWindow" class="relative flex flex-col w-available h-available justify-center -ml-6 mr-[5%]">

<!--        <img class="w-full h-auto aspect-video"-->
<!--             :src="screenshot"-->
<!--             alt="screenshot"/>-->

    </div>

    <div ref="chatWindow" class="absolute top-0 right-0 flex flex-col w-1/4 h-available mb-16 mr-6 mt-6">
      <Chat v-if="user" />
    </div>

<!--    <img class="w-1/6 h-auto aspect-video absolute -bottom-6 right-4"-->
<!--         :src="logo"-->
<!--         alt="logo"/>-->
  </div>
</template>

<style scoped>
</style>