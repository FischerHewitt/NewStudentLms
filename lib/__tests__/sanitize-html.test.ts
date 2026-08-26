import { describe, it, expect } from 'vitest'
import { sanitizeSubmissionHtml } from '@/lib/sanitize-html'

describe('sanitizeSubmissionHtml', () => {
  it('strips unquoted event-handler attributes (regex-sanitizer bypass)', () => {
    const result = sanitizeSubmissionHtml('<img src=x onerror=alert(document.cookie)>')
    expect(result).not.toContain('onerror')
  })

  it('strips unquoted onload on svg', () => {
    const result = sanitizeSubmissionHtml('<svg onload=alert(1)></svg>')
    expect(result).not.toContain('onload')
  })

  it('strips quoted event-handler attributes', () => {
    const result = sanitizeSubmissionHtml('<div onclick="alert(1)">hi</div>')
    expect(result).not.toContain('onclick')
  })

  it('strips script tags', () => {
    const result = sanitizeSubmissionHtml('<script>alert(1)</script><p>text</p>')
    expect(result).not.toContain('<script')
    expect(result).toContain('text')
  })

  it('neutralizes javascript: hrefs', () => {
    const result = sanitizeSubmissionHtml('<a href="javascript:alert(1)">click</a>')
    expect(result).not.toContain('javascript:')
  })

  it('preserves allowed formatting tags and safe attributes', () => {
    const result = sanitizeSubmissionHtml(
      '<p><strong>Bold</strong> and <a href="https://example.com">link</a></p>'
    )
    expect(result).toContain('<strong>Bold</strong>')
    expect(result).toContain('href="https://example.com"')
  })

  it('preserves math-editor data attributes', () => {
    const result = sanitizeSubmissionHtml('<span data-editor-math data-math="\\frac{1}{2}"></span>')
    expect(result).toContain('data-editor-math')
    expect(result).toContain('data-math')
  })
})
