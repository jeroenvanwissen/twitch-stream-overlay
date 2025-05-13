
export interface AxiosResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request?: any;
}

export interface RequestTokenData {
    grant_type: string,
    client_id: string,
    client_secret: string,
    refresh_token: string,
    scope: string,
}

export interface TokenData {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
}