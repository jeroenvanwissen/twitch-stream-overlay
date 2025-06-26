import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from '@/pages/AuthPage.vue';
import App from '@/App.vue';

const routes = [
	{
		path: '/',
		name: 'Overlay',
		component: App,
	},
	{
		path: '/auth',
		name: 'Auth',
		component: AuthPage,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
