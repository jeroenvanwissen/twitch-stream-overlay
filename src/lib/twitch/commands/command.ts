import {Command, Message} from "@/types/chat";
import chatClient from "@/lib/twitch/chatClient";
import {allCommands} from "@/lib/twitch/commands/index";

const command: Command = {
    name: 'command',
    permission: 'moderator',
    type: 'command',
    storage: {
        commands: [] as Command[],
    },
    init() {
        this.load();

        console.log('Commands loaded:', this.storage.commands);
    },
    async callback({channel, broadcasterId, commandName, params, message}) {
        if (allCommands.some(cmd => cmd.name === params.at(1))) {
            const text = `@${message.userInfo.displayName} The command "${commandName}" can not be modified. Please choose a different name.`;
            await chatClient.say(channel, text);
            return;
        }

        if (params.length < 2) {
            const text = `@${message.userInfo.displayName} Please provide parameters for the command.`;
            await chatClient.say(channel, text);
            return;
        }

        if (params.at(0) === 'add') {
            await command.add(channel, broadcasterId, commandName, params, message);
        }
        else if (params.at(0) === 'remove') {
            await command.remove(channel, broadcasterId, commandName, params, message);
        }
        else if (params.at(0) === 'update') {
            await command.update(channel, broadcasterId, commandName, params, message);
        }
    },

    async add(channel: string, broadcasterId: string, commandName: string, params: string[], message: Message) {
        if(params.length < 3) {
            const text = `The command "${params[1]}" requires a message.`;
            await chatClient.say(channel, text);
            return;
        }
        if (this.storage.commands.some((cmd: Command) => cmd.name === params.at(1))) {
            const text = `@${message.userInfo.displayName} The command "${commandName}" is already exists. Use update or remove.`;
            await chatClient.say(channel, text);
            return;
        }

        const newCommand: Command = {
            name: params[1],
            permission: 'everyone',
            type: 'command',
            storage: {},
            init: () => {},
            callback: async ({channel, broadcasterId, params}) => {
                const text = params.slice(2).join(' ');
                await chatClient.say(channel, text);
            },
        };

        this.storage.commands.push(newCommand);
        this.save();

        const text = `The command "${params[1]}" has been added with value: ${params.slice(2).join(' ')}`;
        await chatClient.say(channel, text);
    },

    async remove(channel: string, broadcasterId: string, commandName: string, params: string[], message: Message) {
        if (!this.storage.commands.any((cmd: Command) => cmd.name === params.at(1))) {
            const text = `@${message.userInfo.displayName} The command "${params.at(1)}" does not exist.`;
            await chatClient.say(channel, text);
            return;
        }

        const text = `The command "${params[1]}" has been removed.`;
        await chatClient.say(channel, text);
    },

    async update(channel: string, broadcasterId: string, commandName: string, params: string[], message: Message) {
        if(params.length < 3) {
            const text = `The command "${params[1]}" requires a message.`;
            await chatClient.say(channel, text);
            return;
        }

        if (!this.storage.commands.any((cmd: Command) => cmd.name === params.at(1))) {
            const text = `@${message.userInfo.displayName} The command "${params.at(1)}" does not exist.`;
            await chatClient.say(channel, text);
            return;
        }

        const text = `The command "${params[1]}" has been updated with new value: ${params.slice(2).join(' ')}`;
        await chatClient.say(channel, text);
    },

    load() {
        const itemsString = localStorage.getItem(this.name);
        if (itemsString) {
            const arr = JSON.parse(itemsString);
            if (Array.isArray(arr)) {
                arr.forEach((item: Command) => {
                    for (const key in item) {
                        if (key === 'callback' || key === 'init') {
                            item[key] = new Function('return ' + item[key])();
                        }
                    }

                    this.storage.commands.push(item);
                });
            }
        }
    },

    save() {
        command.storage.commands.forEach((item: Command) => {
            for (const key in item) {
                if (typeof item[key] === 'function') {
                    item[key] = item[key].toString();
                }
            }

            return item;
        });
        localStorage.setItem(this.name, JSON.stringify(command.storage.commands));
    }
}

export default command;