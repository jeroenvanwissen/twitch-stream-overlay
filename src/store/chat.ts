import {ref, watch} from "vue";
import {HelixChatBadgeSet, type HelixChatBadgeVersion} from "@twurple/api";

import type {MessageNode} from "@/lib/twitch/messageParser";
import type {Pronoun} from "@/lib/twitch/getUserData";

import {chatAnimationDuration, chatShowDuration} from "@/store/config";

export interface Message {
    channelId: string;
    date: Date;
    id: string;
    emoteOffsets: Map<string, string[]>;
    isCheer: boolean;
    isFirst: boolean;
    isHighlight: boolean;
    isRedemption: boolean;
    isReply: boolean;
    isReturningChatter: boolean;
    message: MessageNode;
    parentMessageId: string|null;
    parentMessageText: string|null;
    rewardId: string|null;
    userInfo: {
        avatarUrl?: string;
        badgeInfo: Map<string, string>;
        badges: HelixChatBadgeVersion[];
        color: string;
        displayName: string;
        id: string;
        isArtist: boolean;
        isBroadcaster: boolean;
        isFounder: boolean;
        isMod: boolean;
        isSubscriber: boolean;
        isVip: boolean;
        userId: string;
        userName: string;
        userType?: string;
        pronoun?: Pronoun | null;
    };
    animationState?: 'entering' | 'active' | 'leaving';
}

export const chatBadges = ref<HelixChatBadgeSet[]>([]);
export const chatMessageQueue = ref<Message[]>([]);

export const MAX_MESSAGES = 4;

// Add message with automatic removal
export const addMessage = async (message: Message) => {
    // Set initial animation state
    message.animationState = 'entering';
    
    // Remove oldest message if we're at max capacity
    if (chatMessageQueue.value.length >= MAX_MESSAGES) {
        const oldestMessage = chatMessageQueue.value[0]; // Changed from length-1 to 0
        oldestMessage.animationState = 'leaving';
        
        // Wait for leave animation
        await new Promise(resolve => setTimeout(resolve, chatAnimationDuration.value * 1000));
        chatMessageQueue.value.shift(); // Changed from pop to shift
    }
    
    // Add new message at the end
    chatMessageQueue.value.push(message); // Changed from unshift to push

    // Wait for enter animation
    await new Promise(resolve => setTimeout(resolve, chatAnimationDuration.value * 1000));
    
    // Set active state
    const msgIndex = chatMessageQueue.value.findIndex(m => m.id === message.id);
    if (msgIndex !== -1) {
        chatMessageQueue.value[msgIndex].animationState = 'active';
    }

    // Schedule removal
    setTimeout(async () => {
        const index = chatMessageQueue.value.findIndex(m => m.id === message.id);
        if (index !== -1) {
            // Set leaving state
            chatMessageQueue.value[index].animationState = 'leaving';
            
            // Wait for leave animation
            await new Promise(resolve => setTimeout(resolve, chatAnimationDuration.value * 1000));
            
            // Remove message
            chatMessageQueue.value = chatMessageQueue.value.filter(m => m.id !== message.id);
        }
    }, chatShowDuration.value * 1000);
};

// Optional: Clean existing messages when duration changes
watch(chatShowDuration, (newDuration) => {
    // Remove all messages that are older than the new duration
    const now = Date.now();
    chatMessageQueue.value = chatMessageQueue.value.filter(message => {
        const messageAge = (now - message.date.getTime()) / 1000;
        return messageAge < newDuration;
    });
});
//
// watch(chatMessageQueue, (value) => {
//     console.log(value);
// });
