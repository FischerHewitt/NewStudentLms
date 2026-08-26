import sanitizeHtmlLib from 'sanitize-html'

const ALLOWED_TAGS = [
  'a', 'b', 'blockquote', 'br', 'div', 'em', 'font',
  'h1', 'h2', 'h3', 'hr', 'i', 'li', 'ol', 'p', 'span',
  'strong', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul',
]

const ALLOWED_ATTR = ['href', 'style', 'data-math', 'data-editor-math', 'contenteditable']

/**
 * Allow-list HTML sanitizer for rich-text submission content. Pure-JS
 * (no DOM/jsdom dependency), so it behaves identically on the server
 * (before persisting) and on the client (before rendering via
 * dangerouslySetInnerHTML).
 */
export function sanitizeSubmissionHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      '*': ALLOWED_ATTR,
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
  })
}
