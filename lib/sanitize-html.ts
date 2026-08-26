import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = [
  'a', 'b', 'blockquote', 'br', 'div', 'em', 'font',
  'h1', 'h2', 'h3', 'hr', 'i', 'li', 'ol', 'p', 'span',
  'strong', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul',
]

const ALLOWED_ATTR = ['href', 'style', 'data-math', 'data-editor-math', 'contenteditable']

/**
 * Allow-list HTML sanitizer for rich-text submission content. Safe to run
 * both server-side (before persisting) and client-side (before rendering
 * via dangerouslySetInnerHTML) — DOMPurify falls back to a jsdom-backed
 * implementation in Node.
 */
export function sanitizeSubmissionHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR })
}
