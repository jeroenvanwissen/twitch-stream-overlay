/// <reference types="vite/client" />
import type Cast from '@types/chromecast-caf-receiver';

declare global {
    interface Window {
        cast: Cast;
        playerManager: Cast.PlayerManager;
    }
}