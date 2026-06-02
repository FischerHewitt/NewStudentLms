/**
 * Tests for renderContentBlocks — the pure block-to-JSX function shared by
 * StudentAssignmentView and the teacher-side Student Preview modal.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { renderContentBlocks } from '@/lib/content-block-renderer'
import type { ContentBlock } from '@/lib/content-blocks'

describe('renderContentBlocks', () => {
  it('renders a text block as an instructions section', () => {
    const blocks: ContentBlock[] = [
      { id: 'text-0', kind: 'text', label: 'Explain one cell organelle.' },
    ]

    const html = renderToStaticMarkup(renderContentBlocks(blocks))

    expect(html).toContain('Explain one cell organelle.')
  })

  it('renders a math block using KaTeX and includes katex markup', () => {
    const blocks: ContentBlock[] = [
      { id: 'math-0', kind: 'math', label: 'x^2 + 2x + 1 = 0' },
    ]

    const html = renderToStaticMarkup(renderContentBlocks(blocks))

    expect(html).toContain('katex')
  })

  it('shows a friendly error indicator for an unparseable math block without throwing', () => {
    const blocks: ContentBlock[] = [
      { id: 'math-0', kind: 'math', label: '\\invalidcommand{' },
    ]

    // Must not throw
    const html = renderToStaticMarkup(renderContentBlocks(blocks))

    expect(html).toMatch(/formula could not be rendered|⚠/i)
  })

  it('renders inline $...$ math inside a text block as KaTeX markup', () => {
    const blocks: ContentBlock[] = [
      { id: 'text-0', kind: 'text', label: 'Find the limit of $a_n = \\frac{3n - n^2}{n^2 + 4}$ as n → ∞.' },
    ]

    const html = renderToStaticMarkup(renderContentBlocks(blocks))

    expect(html).toContain('katex')
  })

  it('renders display $$...$$ math inside a text block centered', () => {
    const blocks: ContentBlock[] = [
      { id: 'text-0', kind: 'text', label: 'The quadratic formula: $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$' },
    ]

    const html = renderToStaticMarkup(renderContentBlocks(blocks))

    expect(html).toContain('katex')
  })

  it('renders **bold** markdown inside a text block', () => {
    const blocks: ContentBlock[] = [
      { id: 'text-0', kind: 'text', label: 'This word is **important**.' },
    ]

    const html = renderToStaticMarkup(renderContentBlocks(blocks))

    expect(html).toContain('<strong')
  })

  it('renders an unclosed $ delimiter as plain text without throwing', () => {
    const blocks: ContentBlock[] = [
      { id: 'text-0', kind: 'text', label: 'Price is $5 per unit.' },
    ]

    // Must not throw; the text should still appear
    expect(() => renderToStaticMarkup(renderContentBlocks(blocks))).not.toThrow()
    const html = renderToStaticMarkup(renderContentBlocks(blocks))
    expect(html).toContain('5')
  })

  it('renders a plain-text block with no delimiters unchanged', () => {
    const blocks: ContentBlock[] = [
      { id: 'text-0', kind: 'text', label: 'Write a one-page essay on osmosis.' },
    ]

    const html = renderToStaticMarkup(renderContentBlocks(blocks))

    expect(html).toContain('Write a one-page essay on osmosis.')
    expect(html).not.toContain('katex')
  })

  it('renders a math block with invalid LaTeX as a visible error indicator', () => {
    const blocks: ContentBlock[] = [
      { id: 'math-0', kind: 'math', label: '\\invalidcommand{' },
    ]

    const html = renderToStaticMarkup(renderContentBlocks(blocks))

    expect(html).toMatch(/formula could not be rendered|⚠/i)
  })

  it('renders blocks in the provided order', () => {
    const blocks: ContentBlock[] = [
      { id: 'text-0', kind: 'text', label: 'Read the formula below.' },
      { id: 'math-1', kind: 'math', label: 'E = mc^2' },
      { id: 'dl-2', kind: 'download', label: 'starter.py' },
    ]

    const html = renderToStaticMarkup(renderContentBlocks(blocks))

    const textPos = html.indexOf('Read the formula below.')
    const mathPos = html.indexOf('katex')
    const dlPos = html.indexOf('starter.py')

    expect(textPos).toBeGreaterThan(-1)
    expect(mathPos).toBeGreaterThan(textPos)
    expect(dlPos).toBeGreaterThan(mathPos)
  })
})
