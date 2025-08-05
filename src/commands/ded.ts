import type { Command } from '@/types/chat';
import chatClient from '@/lib/twitch/chatClient';
import { useLocalStorage } from '@vueuse/core';
import { messageNow } from '@/store/config';

interface DedStorage {
    count: ReturnType<typeof useLocalStorage<number>>;
}

const command: Command<DedStorage> = {
    name: 'ded',
    permission: 'everyone',
    type: 'command',
    storage: {
        count: useLocalStorage<number>('ded-count', 0),
    },
    init: () => {},
    callback: async ({ channel, params, message }) => {
        // Check if user is broadcaster for special commands
        if (message.userInfo.isBroadcaster && params.length > 0) {
            const param = params[0].toLowerCase();
            
            if (param === 'reset') {
                command.storage.count.value = 0;
                await chatClient.say(channel, `@${message.userInfo.displayName} Death counter has been reset to 0!`);
                return;
            }
            
            // Handle +/- operations
            if (param.startsWith('+') || param.startsWith('-')) {
                const value = parseInt(param, 10);
                if (!isNaN(value)) {
                    command.storage.count.value += value;
                    // Ensure count doesn't go below 0
                    if (command.storage.count.value < 0) {
                        command.storage.count.value = 0;
                    }
                    await chatClient.say(channel, `@${message.userInfo.displayName} Death counter ${value > 0 ? 'increased' : 'decreased'} to ${command.storage.count.value}!`);
                    return;
                }
            }
        }

        // Default behavior: increment by 1
        command.storage.count.value += 1;
        await chatClient.say(channel, `jeroen7Ded Jeroen died! Death count is now ${command.storage.count.value}!`);
        // Add badge message for death
        messageNow(`Jeroen died! Death count is now ${command.storage.count.value}!`);
    },
};

export default command;