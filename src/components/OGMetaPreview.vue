<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
	url: string;
}>();

interface OGMetadata {
	title?: string;
	description?: string | null;
	image?: string | null;
	siteName?: string | null;
}

const metadata = ref<OGMetadata | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const expanded = ref(true);

function getDomainName(hostName: string): string {
	return new URL(hostName).hostname;
}

// Use a CORS proxy to fetch OG metadata from client-side
async function fetchOGMetadata(url: string) {
	// Using AllOrigins as a CORS proxy
	const proxyUrl = `https://api.nomercy.tv/cors?url=${encodeURIComponent(url)}`;
	const response = await fetch(proxyUrl);

	if (!response.ok)
		throw new Error('Failed to fetch metadata');

	const html = await response.text();
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	if (!doc || !doc.querySelector('head')) {
		throw new Error('Invalid HTML response');
	}

	if (doc.title == 'Just a moment...') {
		return {
			title: 'Cloudflare protected',
			description: null,
			image: null,
			siteName: getDomainName(url),
		};
	}

	return {
		title: getMetaContent(doc, 'og:title') || doc.title,
		description: getMetaContent(doc, 'og:description') || getMetaContent(doc, 'description'),
		image: getMetaContent(doc, 'og:image'),
		siteName: getMetaContent(doc, 'og:site_name'),
	};
}

function getMetaContent(doc: Document, name: string): string | null {
	const el = doc.querySelector(`meta[property="${name}"]`)
		|| doc.querySelector(`meta[name="${name}"]`);
	return el ? el.getAttribute('content') : null;
}

onMounted(async () => {
	try {
		metadata.value = await fetchOGMetadata(props.url);
	}
	catch (err) {
		console.error('Error fetching OG metadata:', err);
		error.value = err instanceof Error ? err.message : 'Unknown error';
	}
	finally {
		loading.value = false;
	}
});
</script>

<template>
	<template v-if="!loading && metadata && !error">
		<div class="og-preview"
			:class="{ expanded }"
		>
			<div class="og-preview-content">
				<div v-if="metadata.image" class="og-preview-image">
					<img :src="metadata.image" :alt="metadata.title || 'Link preview'">
				</div>
				<div class="og-preview-text">
					<h4>
						{{ metadata.title || 'No title' }}
					</h4>
					<p v-if="expanded && metadata.description">
						{{ metadata.description }}
					</p>
					<span v-if="metadata.siteName" class="og-preview-site">
						{{ metadata.siteName }}
					</span>
				</div>
			</div>
		</div>
	</template>
</template>

	<style scoped>
	.og-preview {
	margin-top: 4px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 4px;
	overflow: hidden;
	background: rgb(50 50 50);
	cursor: pointer;
}

.og-preview-content {
	display: flex;
	flex-direction: column;
}

.og-preview.expanded .og-preview-content {
	max-height: none;
}

.og-preview-image {
	width: 100%;
	overflow: hidden;
}

.og-preview-image img {
	width: 100%;
	height: 150px;
	object-fit: cover;
}

.og-preview-text {
	padding: 8px;
}

.og-preview-text h4 {
	margin: 0;
	font-size: 14px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.og-preview-text p {
	margin: 4px 0;
	font-size: 12px;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 4;
	-webkit-box-orient: vertical;
	line-height: normal;
}

.og-preview-site {
	font-size: 11px;
	color: rgba(255, 255, 255, 0.6);
}

.og-preview:not(.expanded) .og-preview-text p {
	display: none;
}
</style>
