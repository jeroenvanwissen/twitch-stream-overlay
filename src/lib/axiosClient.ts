import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

export interface AxiosInstance<E> {
	request: <T = unknown>(config: AxiosRequestConfig) => Promise<AxiosResponse<T, E>>;
	get: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T, E>>;
	delete: <T = unknown, S = unknown>(url: string, data?: S, config?: AxiosRequestConfig) => Promise<AxiosResponse<T, E>>;
	head: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T, E>>;
	post: <T = unknown, S = unknown>(url: string, data?: S, config?: AxiosRequestConfig) => Promise<AxiosResponse<T, E>>;
	put: <T = unknown, S = unknown>(url: string, data: S, config?: AxiosRequestConfig) => Promise<AxiosResponse<T, E>>;
	patch: <T = unknown, S = unknown>(url: string, data: S, config?: AxiosRequestConfig) => Promise<AxiosResponse<T, E>>;
}

export default <T>(baseUrl: string, timeout?: number) => {
	const language
    = localStorage.getItem('NoMercy-displayLanguage')?.replace(/"/gu, '') || navigator.language.split('-')?.[0];

	const axiosInstance = axios.create({
		headers: {
			'Accept': 'application/json',
			'Accept-Language': language,
		},
		timeout,
		baseURL: baseUrl,
	});

	return axiosInstance as AxiosInstance<T>;
};
