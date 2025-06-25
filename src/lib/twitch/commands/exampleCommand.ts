import {Command} from "@/types/chat";
import chatClient from "@/lib/twitch/chatClient";

const command: Command = {
    name: 'example',
    permission: 'everyone',
    type: 'command',
    storage: {},
    init: () => {},
    callback: async ({channel, broadcasterId, commandName, params, message}) => {

        const text = `@${message.userInfo.displayName} This is an example command! You used: ${commandName} with params: ${params.join(' ')}`;

        await chatClient.say(channel, text);
    },
}

export default command;