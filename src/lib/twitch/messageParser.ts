import DOMPurify from 'dompurify';

import type { ChatPermissions, MessageNode } from '@/types/chat';

import { whitelistedUsers } from '@/store/chat';

const httpRegex = /^https?:\/\/(?:www\.)?[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-\w()@:%+.~#?&/=]*$/;

function parseHTML(html: string): DocumentFragment {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	return doc.createRange().createContextualFragment(html);
}

function elementToMessageNode(element: Element, messageId: string, index: number): MessageNode {
	if (element.nodeType === 3) {
		// Text node
		return {
			type: 'p',
			id: `${messageId}-text-${index}`,
			classes: ['message-text'],
			text: element.textContent || '',
		};
	}

	const node: MessageNode = {
		type: element.tagName.toLowerCase(),
		id: `${messageId}-${element.tagName.toLowerCase()}-${index}`,
		classes: ['message-custom'],
		attribs: {},
		children: [], // Initialize children array
	};

	// Copy allowed attributes
	Array.from(element.attributes).forEach((attr) => {
		if (node.attribs) {
			node.attribs[attr.name] = attr.value;
		}
	});

	// Process child nodes recursively
	element.childNodes.forEach((child, childIndex) => {
		if (child instanceof Element) {
			node.children?.push(elementToMessageNode(child, messageId, childIndex));
		}
		else if (child.nodeType === 3 && child.textContent?.trim()) {
			console.log({ child });
			// Text node
			node.children?.push({
				type: 'p',
				id: `${messageId}-text-${index}-${childIndex}`,
				classes: ['message-text'],
				text: child.textContent,
			});
		}
	});

	return node;
}

function createLinkNode(messageId: string, url: string, index: number): MessageNode {
	return {
		type: 'a',
		id: `${messageId}-link-${index}`,
		classes: ['message-link'],
		text: url,
		attribs: {
			'href': url,
			'target': '_blank',
			'rel': 'noopener noreferrer',
			'data-og-fetch': 'true', // Mark for OG metadata fetching
		},
		children: [],
	};
}

export default (username: string, messageId: string, message: string, emotes: Map<string, string[]>): MessageNode => {
	const permissions = whitelistedUsers.value.find(user => user.userName === username);
	if (permissions) {
		message = sanitize(message, permissions);
	}
	else {
		message = sanitizeStrict(message);
	}

	const nodes: MessageNode = {
		type: 'rootNode',
		id: messageId,
		classes: ['message'],
		children: [],
	};

	// Track found URLs
	const foundUrls: string[] = [];

	// Parse HTML elements first
	const fragment = parseHTML(message);
	let plainText = '';

	fragment.childNodes.forEach((node, index) => {
		if (node.nodeType === 3) {
			// Text node
			plainText += node.textContent;
		}
		else if (node instanceof Element) {
			// If we have accumulated text, process it first with link detection
			if (plainText) {
				const textNodes = processTextWithLinks(messageId, plainText, index, foundUrls);
				nodes.children?.push(...textNodes);
				plainText = '';
			}

			// Check if this element is an anchor with href
			if (node.tagName.toLowerCase() === 'a' && node.hasAttribute('href')) {
				const href = node.getAttribute('href');
				if (href && httpRegex.test(href)) {
					foundUrls.push(href);
				}
			}

			// Add the allowed element as a MessageNode
			nodes.children?.push(elementToMessageNode(node, messageId, index));
		}
		else {
			plainText += node.textContent;
		}
	});

	// Process any remaining text with links and emotes
	if (plainText) {
		if (emotes.size) {
			// First process emotes
			const emoteNodes = processEmotes(messageId, plainText, emotes);

			// Then check for links in each text node of the emote processing result
			const finalNodes: MessageNode[] = [];
			emoteNodes.children?.forEach((child, index) => {
				if (child.type === 'p' && child.text) {
					// Process text nodes for links
					finalNodes.push(...processTextWithLinks(messageId, child.text, index, foundUrls));
				}
				else {
					finalNodes.push(child);
				}
			});

			nodes.children?.push(...finalNodes);
		}
		else {
			// Just process for links
			const textNodes = processTextWithLinks(messageId, plainText, 0, foundUrls);
			nodes.children?.push(...textNodes);
		}
	}

	// Add OG preview nodes at the end for each found URL
	foundUrls.forEach((url, index) => {
		nodes.children?.push({
			type: 'og-preview',
			id: `${messageId}-og-preview-${index}`,
			classes: ['message-og-preview', 'w-full', 'empty:hidden'],
			attribs: {
				url,
			},
			children: [],
		});
	});

	return nodes;
};

// Update the processTextWithLinks function to track found URLs
function processTextWithLinks(messageId: string, text: string, index: number, foundUrls: string[]): MessageNode[] {
	const nodes: MessageNode[] = [];
	const words = text.split(' ');
	let currentText = '';

	words.forEach((word, wordIndex) => {
		if (httpRegex.test(word)) {
			// If we have accumulated text, add it first
			if (currentText) {
				nodes.push({
					type: 'p',
					id: `${messageId}-text-${index}-${wordIndex}`,
					classes: ['message-text'],
					text: currentText.trim(),
				});
				currentText = '';
			}

			// Add the link node
			nodes.push(createLinkNode(messageId, word, wordIndex));

			// Track the URL for OG metadata
			foundUrls.push(word);

			currentText = ' '; // Add space after link
		}
		else {
			currentText += (currentText ? ' ' : '') + word;
		}
	});

	// Add any remaining text
	if (currentText.trim()) {
		nodes.push({
			type: 'p',
			id: `${messageId}-text-${index}-final`,
			classes: ['message-text'],
			text: currentText.trim(),
		});
	}

	return nodes;
}

// Helper function to process emotes (extracted from original logic)
function processEmotes(messageId: string, text: string, emotes: Map<string, string[]>): MessageNode {
	const nodes: MessageNode = {
		type: 'rootNode',
		id: messageId,
		classes: ['message'],
		children: [],
	};

	const allPositions: Array<{ id: string; start: number; end: number }> = [];
	[...emotes.entries()].forEach(([id, positions]) => {
		positions.forEach((position) => {
			const [start, end] = position.split('-');
			allPositions.push({
				id,
				start: Number.parseInt(start, 10),
				end: Number.parseInt(end, 10),
			});
		});
	});

	allPositions.sort((a, b) => a.start - b.start);

	let lastIndex = 0;

	allPositions.forEach((position) => {
		if (position.start > lastIndex) {
			nodes.children?.push({
				type: 'p',
				id: `${messageId}-text-${lastIndex}`,
				classes: ['message-text'],
				text: text.substring(lastIndex, position.start),
			});
		}

		nodes.children?.push({
			type: 'emote',
			id: `${messageId}-image-${position.start}`,
			classes: ['message-emote'],
			text: '',
			attribs: {
				src: `https://static-cdn.jtvnw.net/emoticons/v2/${position.id}/default/dark/2.0`,
				alt: `emote ${position.id}`,
			},
		});

		lastIndex = position.end + 1;
	});

	if (lastIndex < text.length) {
		nodes.children?.push({
			type: 'p',
			id: `${messageId}-text-${lastIndex}`,
			classes: ['message-text'],
			text: text.substring(lastIndex),
		});
	}

	return nodes;
}

export const ALLOWED_TAGS = ['img', 'br', 'p', 'a', 'b', 'u', 'i', 'strong', 'small', 'marquee', 'div', 'span'];

export const ALLOWED_ATTR = ['src', 'href', 'width', 'style'];

export const FORBID_ATTR = ['onerror', 'onload', 'class', 'dir'];

export const FORBID_TAGS = ['script', 'style', 'iframe', 'form', 'input', 'button'];

export function sanitize(message: string, customFilter: ChatPermissions) {
	console.log({
		FORBID_ATTR: customFilter.FORBID_ATTR ?? FORBID_ATTR,
		FORBID_TAGS: customFilter.FORBID_TAGS ?? FORBID_TAGS,
		ALLOWED_TAGS: customFilter.ALLOWED_TAGS ?? ALLOWED_TAGS,
		ALLOWED_ATTR: customFilter.ALLOWED_ATTR ?? ALLOWED_ATTR,
		ADD_ATTR: ['target'],
		ALLOW_DATA_ATTR: false,
		ALLOW_UNKNOWN_PROTOCOLS: false,
		ADD_TAGS: [],
		USE_PROFILES: { html: true },
		CUSTOM_ELEMENT_HANDLING: {},
		ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
	});
	return DOMPurify.sanitize(message, {
		FORBID_ATTR: customFilter.FORBID_ATTR ?? FORBID_ATTR,
		FORBID_TAGS: customFilter.FORBID_TAGS ?? FORBID_TAGS,
		ALLOWED_TAGS: customFilter.ALLOWED_TAGS ?? ALLOWED_TAGS,
		ALLOWED_ATTR: customFilter.ALLOWED_ATTR ?? ALLOWED_ATTR,
		ADD_ATTR: ['target'],
		ALLOW_DATA_ATTR: false,
		ALLOW_UNKNOWN_PROTOCOLS: false,
		ADD_TAGS: [],
		USE_PROFILES: { html: true },
		CUSTOM_ELEMENT_HANDLING: {},
		ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
	});
}

export function sanitizeStrict(message: string) {
	return DOMPurify.sanitize(message?.replace(/</g, '&lt;')?.replace(/>/g, '&gt;'), {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: [],
	});
}
