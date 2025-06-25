import {Reward} from "@/types/chat";

const reward: Reward = {
    name: 'example reward',
    id: '',
    storage: {},
    init: () => {},
    callback: async ({channel, broadcasterId, message}) => {

    },
}

export default reward;