import {Command} from "@/types/chat";
import chatClient from "@/lib/twitch/chatClient";
import {getUserIdFromName} from "@/lib/twitch/apiClient";
import {whitelistedUsers} from "@/store/chat";

const command: Command = {
    name: 'unwhitelist',
    permission: 'moderator',
    type: 'command',
    storage: {},
    init: () => {},
    callback: async ({channel, params, message}) => {

        if (params!.length == 0) {
            await chatClient.say(channel, `@${message.userInfo.displayName} You need to specify a user to shoutout!`);
            return;
        }

        const name = params.at(0)?.replace('@', '');
        const userId = await getUserIdFromName(name ?? message.userInfo.userName);

        if (userId) {
            whitelistedUsers.value = whitelistedUsers.value.filter(user => user.userName != message.userInfo.userName);
            const text = `@${message.userInfo.displayName} User ${params.at(0)} has been removed from the whitelist!`;
            await chatClient.say(channel, text);
        } else {
            const text = `@${message.userInfo.displayName} User ${params.at(0)} not found!`;
            await chatClient.say(channel, text);
        }
    },
}

export default command;