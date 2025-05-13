import './styles/index.scss';

import {createApp} from 'vue';
import {exchangeCode} from "@twurple/auth";

import {
    accessToken, botAccessToken, botRefreshToken,
    clientId,
    clientSecret,
    expiresIn,
    obtainmentTimestamp,
    refreshToken, scopes,
    twitchAuthUrl
} from "@/store/auth";

import {getParameterByName} from "@/lib/stringArray";
import { RequestTokenData, TokenData } from './types/auth';
import axiosClient from './lib/axiosClient';

const code = getParameterByName<string>('code');
const error = getParameterByName<string>('error');
const error_description = getParameterByName<string>('error_description');

const requestBotToken = async () => {
    await axiosClient('https://id.twitch.tv')
        .post<TokenData,RequestTokenData>("oauth2/token", {
            grant_type: 'refresh_token',
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: botRefreshToken.value,
            scope: scopes.join(' ')
        }, {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            }
        })
        .then((response) => {
            botAccessToken.value = response.data.access_token;
            botRefreshToken.value = response.data.refresh_token;

            console.log('Bot token refreshed', response.data);
        })
        .catch((error) => console.error(error));
}

if (error && error_description) {
    document.body.innerHTML = error_description;
    throw new Error(error_description);
} else if (code) {
    requestBotToken().then(() => {
        exchangeCode(clientId, clientSecret, code, location.origin)
            .then(async (tokenData) => {
                accessToken.value = tokenData.accessToken;
                refreshToken.value = tokenData.refreshToken;
                expiresIn.value = tokenData.expiresIn;
                obtainmentTimestamp.value = tokenData.obtainmentTimestamp;

                import('./App.vue')
                    .then(({default: App}) => {
                        createApp(App)
                            .mount('#app');
                    });
            });
        });
} else if (!accessToken.value || !refreshToken.value) {
    const authParams = new URL(twitchAuthUrl);
    authParams.searchParams.append('response_type', 'code');
    authParams.searchParams.append('client_id', clientId);
    authParams.searchParams.append('client_secret', clientSecret);
    authParams.searchParams.append('redirect_uri', location.origin);
    authParams.searchParams.append('scope', scopes.join(' '));

    window.location.href = authParams.href;
} else {
    requestBotToken().then(() => {
        import('./App.vue')
            .then(({default: App}) => {
                createApp(App)
                    .mount('#app');
            });
    });
}
