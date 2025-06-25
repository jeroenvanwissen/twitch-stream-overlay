import {Command} from "@/types/chat";

import followage from './followage';
import shoutout from './shoutout';
import song from './song';
import unwhitelist from './unwhitelist';
import whitelist from './whitelist';
import commands from "./commands";
import command from "./command";

const cmds: Command[] = [
    command,
    commands,
    followage,
    shoutout,
    song,
    unwhitelist,
    whitelist,
];

cmds.forEach(command => {
    command.init();
});

export const allCommands = cmds;

export const broadcasterCommands = cmds.filter(command => command.permission === 'broadcaster');
export const moderatorCommands = cmds.filter(command => command.permission === 'moderator');
export const vipCommands = cmds.filter(command => command.permission === 'vip');
export const subscriberCommands = cmds.filter(command => command.permission === 'subscriber');
export const everyoneCommands = cmds.filter(command => command.permission === 'everyone');