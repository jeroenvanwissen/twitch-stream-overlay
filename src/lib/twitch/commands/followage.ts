import {Command} from "@/types/chat";
import {spotifyState} from "@/store/spotify";
import chatClient from "@/lib/twitch/chatClient";
import {getChannelFollowers} from "@/lib/twitch/apiClient";
import {secondsToDuration} from "@/lib/dateTime";

const command: Command = {
    name: 'followage',
    permission: 'everyone',
    type: 'command',
    storage: {},
    init: () => {
    },
    callback: async ({channel, broadcasterId, message}) => {

        getChannelFollowers(broadcasterId, message.userInfo.userId).then(async ({data: [follow]}) => {
            if (follow) {
                const currentTimestamp = Date.now();
                const followStartTimestamp = follow.followDate.getTime();
                const text = `@${message.userInfo.displayName} You have been following for ${secondsToDuration((currentTimestamp - followStartTimestamp) / 1000)}!`;
                await chatClient.say(channel, text);
            } else {
                const text = `@${message.userInfo.displayName} You are not following!`;
                await chatClient.say(channel, text);
            }
        });

        const text = `The current song is: ${spotifyState.value.item.name} by 
            ${spotifyState.value.item.artists.at(0)?.name} ${spotifyState.value.item.external_urls.spotify}`;

        await chatClient.say(channel, text);
    },
}

export default command;