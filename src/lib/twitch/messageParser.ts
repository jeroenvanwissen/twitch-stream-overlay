import { ChatPermissions, whitelistedUsers } from '@/store/chat'
import DOMPurify from 'dompurify'

export interface MessageNode {
  type: string
  id: string
  classes?: string[]
  children?: MessageNode[]
  text?: string
  attribs?: Record<string, string>
}

const parseHTML = (html: string): DocumentFragment => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return doc.createRange().createContextualFragment(html)
}

const elementToMessageNode = (element: Element, messageId: string, index: number): MessageNode => {
  if (element.nodeType === 3) {
    // Text node
    return {
      type: 'p',
      id: `${messageId}-text-${index}`,
      classes: ['message-text'],
      text: element.textContent || ''
    }
  }

  const node: MessageNode = {
    type: element.tagName.toLowerCase(),
    id: `${messageId}-${element.tagName.toLowerCase()}-${index}`,
    classes: ['message-custom'],
    attribs: {},
    children: [] // Initialize children array
  }

  // Copy allowed attributes
  Array.from(element.attributes).forEach(attr => {
    if (node.attribs) {
      node.attribs[attr.name] = attr.value
    }
  })

  // Process child nodes recursively
  element.childNodes.forEach((child, childIndex) => {
    if (child instanceof Element) {
      node.children?.push(elementToMessageNode(child, messageId, childIndex))
    } else if (child.nodeType === 3 && child.textContent?.trim()) {
      // Text node
      node.children?.push({
        type: 'p',
        id: `${messageId}-text-${index}-${childIndex}`,
        classes: ['message-text'],
        text: child.textContent
      })
    }
  })

  return node
}

export default (username: string, messageId: string, message: string, emotes: Map<string, string[]>): MessageNode => {
  const permissions = whitelistedUsers.value.find(user => user.userName === username)
  if (!!permissions) {
    message = sanitize(message, permissions)
  } else {
    message = sanitizeStrict(message)
  }

  const nodes: MessageNode = {
    type: 'rootNode',
    id: messageId,
    classes: ['message'],
    children: []
  }

  // Parse HTML elements first
  const fragment = parseHTML(message)
  let plainText = ''

  fragment.childNodes.forEach((node, index) => {
    if (node.nodeType === 3) {
      // Text node
      plainText += node.textContent
    } else if (node instanceof Element) {
      // If we have accumulated text, process it first
      if (plainText) {
        nodes.children?.push({
          type: 'p',
          id: `${messageId}-text-${index}`,
          classes: ['message-text'],
          text: plainText
        })
        plainText = ''
      }
      // Add the allowed element as a MessageNode
      nodes.children?.push(elementToMessageNode(node, messageId, index))
    } else {
      plainText += node.textContent
    }
  })

  // Process any remaining text with emotes
  if (plainText && emotes.size) {
    // Use existing emote processing logic for the plainText
    const emoteNodes = processEmotes(messageId, plainText, emotes)
    nodes.children?.push(...(emoteNodes.children || []))
  } else if (plainText) {
    nodes.children?.push({
      type: 'p',
      id: `${messageId}-text-final`,
      classes: ['message-text'],
      text: plainText
    })
  }

  return nodes
}

// Helper function to process emotes (extracted from original logic)
const processEmotes = (messageId: string, text: string, emotes: Map<string, string[]>): MessageNode => {
  const nodes: MessageNode = {
    type: 'rootNode',
    id: messageId,
    classes: ['message'],
    children: []
  }

  let allPositions: Array<{ id: string; start: number; end: number }> = []
  ;[...emotes.entries()].forEach(([id, positions]) => {
    positions.forEach(position => {
      const [start, end] = position.split('-')
      allPositions.push({
        id,
        start: parseInt(start, 10),
        end: parseInt(end, 10)
      })
    })
  })

  allPositions.sort((a, b) => a.start - b.start)

  let lastIndex = 0

  allPositions.forEach(position => {
    if (position.start > lastIndex) {
      nodes.children?.push({
        type: 'p',
        id: `${messageId}-text-${lastIndex}`,
        classes: ['message-text'],
        text: text.substring(lastIndex, position.start)
      })
    }

    nodes.children?.push({
      type: 'emote',
      id: `${messageId}-image-${position.start}`,
      classes: ['message-emote'],
      text: '',
      attribs: {
        src: `https://static-cdn.jtvnw.net/emoticons/v2/${position.id}/default/dark/2.0`,
        alt: `emote ${position.id}`
      }
    })

    lastIndex = position.end + 1
  })

  if (lastIndex < text.length) {
    nodes.children?.push({
      type: 'p',
      id: `${messageId}-text-${lastIndex}`,
      classes: ['message-text'],
      text: text.substring(lastIndex)
    })
  }

  return nodes
}

export const ALLOWED_TAGS = ['img', 'br', 'p', 'a', 'marquee', 'div', 'span']

export const ALLOWED_ATTR = ['src', 'href', 'width', 'style']

export const FORBID_ATTR = ['onerror', 'onload', 'class', 'dir']

export const FORBID_TAGS = ['script', 'style', 'iframe', 'form', 'input', 'button']

export const sanitize = (message: string, customFilter: ChatPermissions) => {
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
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  })
}

export const sanitizeStrict = (message: string) => {
  return DOMPurify.sanitize(message?.replace(/</g, '&lt;')?.replace(/>/g, '&gt;'), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}
