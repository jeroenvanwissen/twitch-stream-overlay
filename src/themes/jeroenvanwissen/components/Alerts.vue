<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import alertSound from '@/themes/jeroenvanwissen/assets/sounds/alert.mp3';
import woohooImg from '@/themes/jeroenvanwissen/assets/images/woohoo.png';

type AlertType = 'raid' | 'bits' | 'follow' | 'sub';
type OverlayAlertDetail = {
    type: AlertType;
    userName?: string;
    amount?: number; // bits
    raiders?: number; // raid viewer count
    tier?: string; // sub tier or info
    message?: string; // custom
};

type AlertItem = {
    id: string;
    type: AlertType;
    title: string;
    body?: string;
    icon?: string;
    durationMs: number;
};

const alerts = ref<AlertItem[]>([]);
const maxConcurrent = 1;
const defaultDuration = 7000;
const alertAudio = ref<HTMLAudioElement | null>(null);

function playAlertSound() {
    if (alertAudio.value) {
        const node = alertAudio.value.cloneNode(true) as HTMLAudioElement; // allow overlap
        node.volume = 0.8;
        node.play().catch(() => {});
    }
    else {
        const audio = new Audio(alertSound);
        audio.volume = 0.8;
        audio.play().catch(() => {});
    }
}

function toTitle(detail: OverlayAlertDetail): { title: string; body?: string } {
    switch (detail.type) {
        case 'raid':
            return { title: `${detail.userName ?? 'Someone'} is raiding with ${detail.raiders ?? 0}!`, body: 'Welcome raiders!' };
        case 'bits':
            return { title: `${detail.userName ?? 'Someone'} cheered ${detail.amount ?? 0} bits!` };
        case 'follow':
            return { title: `${detail.userName ?? 'Someone'} just followed!`, body: 'Welcome!' };
        case 'sub':
            return { title: `${detail.userName ?? 'Someone'} subscribed${detail.tier ? ` (${detail.tier})` : ''}!` };
    }
}

function explosionCount(detail: OverlayAlertDetail): number {
    if (detail.type === 'raid')
        return Math.min(30, Math.max(10, (detail.raiders ?? 0)));
    if (detail.type === 'bits')
        return Math.min(24, Math.max(8, Math.floor((detail.amount ?? 0) / 100) + 8));
    return 12; // follow/sub
}

function triggerExplosion(detail: OverlayAlertDetail) {
    window.dispatchEvent(new CustomEvent('EmoteExplosion', {
        detail: {
            x: window.innerWidth / 2,
            y: window.innerHeight * 0.3,
            emotes: [{ url: woohooImg, name: 'Jeroen7Woohoo' }],
            count: explosionCount(detail),
        },
    }));
}

function handleOverlayAlert(e: Event) {
    const detail = (e as CustomEvent<OverlayAlertDetail>).detail;
    if (!detail)
        return;

    const { title, body } = toTitle(detail);
    const item: AlertItem = {
        id: crypto.randomUUID(),
        type: detail.type,
        title,
        body,
        icon: woohooImg,
        durationMs: defaultDuration,
    };

    alerts.value.push(item);
    playAlertSound();
    triggerExplosion(detail);

    setTimeout(() => {
        alerts.value = alerts.value.filter(a => a.id !== item.id);
    }, item.durationMs);
}

onMounted(() => {
    window.addEventListener('OverlayAlert', handleOverlayAlert as EventListener);
    alertAudio.value = new Audio(alertSound);
    alertAudio.value.preload = 'auto';
});

onUnmounted(() => {
    window.removeEventListener('OverlayAlert', handleOverlayAlert as EventListener);
    alertAudio.value?.pause();
    alertAudio.value = null;
});
</script>

<template>
    <div class="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none p-6">
        <Transition name="alert" mode="out-in">
            <div v-if="alerts.length" :key="alerts[0].id" class="pointer-events-auto">
                <div class="card rounded-xl overflow-hidden">
                    <div class="relative flex flex-col items-center px-6 py-6">
                        <img :src="woohooImg" alt="Alert" class="w-[350px] max-w-[90vw] h-auto mb-3">
                        <div class="text-theme-100 font-extrabold text-4xl text-center text-outline">
                            {{ alerts[0].title }}
                        </div>
                        <div v-if="alerts[0].body" class="text-theme-200 font-bold text-3xl text-center mt-1 text-outline">
                            {{ alerts[0].body }}
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
/* 2px border/outline around the text */
.text-outline {
    -webkit-text-stroke: 4px rgba(0, 0, 0, 0.9);
    paint-order: stroke fill;
}

.alert-enter-active,
.alert-leave-active {
    transition: all 250ms ease;
}
.alert-enter-from,
.alert-leave-to {
    opacity: 0;
    transform: scale(0.98);
}
</style>