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
import axios from "axios";

const code = getParameterByName<string>('code');
const error = getParameterByName<string>('error');
const error_description = getParameterByName<string>('error_description');

const requestBotToken = async () => {
    await axios.post<any, {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        token_type: string;
        scope: string[];
    }>("https://id.twitch.tv/oauth2/token", {
            grant_type: 'refresh_token',
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: botRefreshToken.value,
            scope: scopes.join(' ')
        },
        {headers: {'content-type': 'application/x-www-form-urlencoded'}
    })
        .then((response) => {
            botAccessToken.value = response.access_token;
            botRefreshToken.value = response.refresh_token;
        })
        .catch((error) => console.error(error));
}

if (error && error_description) {
    document.body.innerHTML = error_description;
    throw new Error(error_description);
} else if (code) {
    exchangeCode(clientId, clientSecret, code, location.origin)
        .then(async (tokenData) => {
            accessToken.value = tokenData.accessToken;
            refreshToken.value = tokenData.refreshToken;
            expiresIn.value = tokenData.expiresIn;
            obtainmentTimestamp.value = tokenData.obtainmentTimestamp;

            requestBotToken().then(() => {
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
