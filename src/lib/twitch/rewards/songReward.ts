import {Reward} from "@/types/chat";
import chatClient from "@/lib/twitch/chatClient";
import {spotifyClient} from "@/lib/spotify/spotifyClient";

const reward: Reward = {
    name: 'song reward',
    id: 'e2135712-d108-4923-8e9f-f28e63622465',
    storage: {},
    init: () => {},
    callback: async ({channel, message}) => {
        if (!message.plainText.includes('spotify.com/track/') && !message.plainText.includes('spotify:track:')) {
            const text = `@${message.userInfo.displayName} Failed to add song to queue. Make sure you provided a valid Spotify track URL!`;
            await chatClient.say(channel, text);
            return;
        }

        const trackId = message.plainText.includes('spotify.com/track/')
            ? message.plainText.split('/').pop()?.split('?')[0]
            : message.plainText.split(':').pop();

        const queueResponse = await spotifyClient.addToQueue(trackId!);

        if (queueResponse && 'body' in queueResponse && queueResponse.statusCode == 200) {
            const text = `${queueResponse.body.name} by ${queueResponse.body.artists.at(0)?.name} has been added to the queue!`;
            await chatClient.say(channel, text);
        } else {
            const text = `@${message.userInfo.displayName} Failed to add song to queue. Make sure you provided a valid Spotify track URL!`;
            await chatClient.say(channel, text);
        }
    },
}

export default reward;