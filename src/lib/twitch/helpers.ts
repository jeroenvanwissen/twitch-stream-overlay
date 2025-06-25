import type {Message} from "@/types/chat";

export const levels = ['broadcaster', 'moderator', 'vip', 'subscriber', 'everyone'];

export const hasMinLevel = (userInfo: Message['userInfo'], minLevel: string) => {
    if (userInfo.isBroadcaster) return true;
    if (minLevel == 'moderator' && userInfo.isMod) return true;
    if (minLevel == 'vip' && (userInfo.isMod || userInfo.isVip)) return true;
    if (minLevel == 'subscriber' && (userInfo.isSubscriber || userInfo.isMod || userInfo.isVip)) return true;
    return true;
};

export const useLocalStorage = <T>(key: string, initialValue: T[] = []) => {
    const items: T[] = initialValue;

    const init = () => {
        const itemsString = localStorage.getItem(key);
        if (itemsString) {

            const arr = JSON.parse(itemsString);
            if (Array.isArray(arr)) {

                items.push(...arr);
            }
        }
    }

    const save = () => {
        localStorage.setItem(key, JSON.stringify(items));
    }

    const clear = () => {
        localStorage.removeItem(key);
    }

    const get = () => {
        return items;
    }

    return {
        init,
        save,
        clear,
        get,
    }
}