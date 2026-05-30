'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  /** Applied to the outer wrapper (controls size/layout). */
  className?: string
  disabled?: boolean
  autoFocus?: boolean
}

type FormatAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'h1'
  | 'h2'
  | 'paragraph'
  | 'ul'
  | 'ol'
  | 'quote'
  | 'link'
  | 'divider'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'clear'
  | 'math'
  | 'table'

const fonts = [
  { label: 'Sans', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Serif', value: 'Georgia, Times New Roman, serif' },
  { label: 'Mono', value: 'Menlo, Monaco, Consolas, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
]

const fontSizes = [
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '24', value: '24px' },
  { label: '32', value: '32px' },
]

const lineHeights = [
  { label: '1.0', value: '1' },
  { label: '1.25', value: '1.25' },
  { label: '1.5', value: '1.5' },
  { label: '2.0', value: '2' },
]

const allowedTags = new Set([
  'A',
  'B',
  'BLOCKQUOTE',
  'BR',
  'DIV',
  'EM',
  'FONT',
  'H1',
  'H2',
  'H3',
  'HR',
  'I',
  'LI',
  'OL',
  'P',
  'SPAN',
  'STRONG',
  'TABLE',
  'TBODY',
  'TD',
  'TH',
  'THEAD',
  'TR',
  'U',
  'UL',
])

const allowedStyles = new Set([
  'background-color',
  'color',
  'font-family',
  'font-size',
  'line-height',
  'text-align',
])

// ---------------------------------------------------------------------------
// Math function templates — Desmos-style
// ---------------------------------------------------------------------------

export type MathFnKey =
  | 'sqrt' | 'nthroot' | 'abs' | 'floor' | 'ceil' | 'round' | 'mod' | 'sign'
  | 'exp' | 'ln' | 'log' | 'log_a'
  | 'derivative' | 'integral' | 'sum' | 'product' | 'limit'
  | 'sin' | 'cos' | 'tan' | 'csc' | 'sec' | 'cot'
  | 'arcsin' | 'arccos' | 'arctan'
  | 'sinh' | 'cosh' | 'tanh' | 'csch' | 'sech' | 'coth'
  | 'mean' | 'median' | 'stdev' | 'variance' | 'nCr' | 'nPr' | 'factorial'
  | 'distance' | 'midpoint' | 'polygon'

const MATH_TEMPLATES: Record<MathFnKey, string> = {
  sqrt: '\\sqrt{□}', nthroot: '\\sqrt[□]{□}', abs: '|□|',
  floor: '\\lfloor □ \\rfloor', ceil: '\\lceil □ \\rceil',
  round: '\\text{round}(□)', mod: '□ \\mod □', sign: '\\text{sign}(□)',
  exp: 'e^{□}', ln: '\\ln(□)', log: '\\log(□)', log_a: '\\log_{□}(□)',
  derivative: '\\frac{d}{dx}(□)', integral: '\\int_{□}^{□} □ \\, d□',
  sum: '\\sum_{□}^{□} □', product: '\\prod_{□}^{□} □', limit: '\\lim_{□ \\to □} □',
  sin: '\\sin(□)', cos: '\\cos(□)', tan: '\\tan(□)',
  csc: '\\csc(□)', sec: '\\sec(□)', cot: '\\cot(□)',
  arcsin: '\\arcsin(□)', arccos: '\\arccos(□)', arctan: '\\arctan(□)',
  sinh: '\\sinh(□)', cosh: '\\cosh(□)', tanh: '\\tanh(□)',
  csch: '\\text{csch}(□)', sech: '\\text{sech}(□)', coth: '\\coth(□)',
  mean: '\\bar{□}', median: '\\tilde{□}', stdev: '\\sigma(□)',
  variance: '\\sigma^2(□)', nCr: '\\binom{□}{□}', nPr: 'P(□,□)', factorial: '□!',
  distance: '\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}',
  midpoint: '\\left(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2}\\right)',
  polygon: '\\text{polygon}(□)',
}

export function buildMathTemplate(key: MathFnKey | string): string {
  return MATH_TEMPLATES[key as MathFnKey] ?? `\\${key}(□)`
}

type MathCategory = { label: string; fns: { key: MathFnKey; display: string }[] }

const MATH_CATEGORIES: MathCategory[] = [
  { label: 'ARITHMETIC', fns: [
    { key: 'sqrt', display: '√x' }, { key: 'nthroot', display: 'ⁿ√x' },
    { key: 'abs', display: '|x|' }, { key: 'floor', display: '⌊x⌋' },
    { key: 'ceil', display: '⌈x⌉' }, { key: 'round', display: 'round' },
    { key: 'mod', display: 'mod' }, { key: 'sign', display: 'sign' },
  ]},
  { label: 'EXPONENTS & LOGS', fns: [
    { key: 'exp', display: 'eˣ' }, { key: 'ln', display: 'ln' },
    { key: 'log', display: 'log' }, { key: 'log_a', display: 'logₐ' },
  ]},
  { label: 'CALCULUS', fns: [
    { key: 'derivative', display: 'd/dx' }, { key: 'integral', display: '∫' },
    { key: 'sum', display: 'Σ' }, { key: 'product', display: 'Π' },
    { key: 'limit', display: 'lim' },
  ]},
  { label: 'TRIG FUNCTIONS', fns: [
    { key: 'sin', display: 'sin' }, { key: 'cos', display: 'cos' },
    { key: 'tan', display: 'tan' }, { key: 'csc', display: 'csc' },
    { key: 'sec', display: 'sec' }, { key: 'cot', display: 'cot' },
    { key: 'arcsin', display: 'arcsin' }, { key: 'arccos', display: 'arccos' },
    { key: 'arctan', display: 'arctan' },
  ]},
  { label: 'HYPERBOLIC TRIG', fns: [
    { key: 'sinh', display: 'sinh' }, { key: 'cosh', display: 'cosh' },
    { key: 'tanh', display: 'tanh' }, { key: 'csch', display: 'csch' },
    { key: 'sech', display: 'sech' }, { key: 'coth', display: 'coth' },
  ]},
  { label: 'STATISTICS', fns: [
    { key: 'mean', display: 'x̄' }, { key: 'median', display: 'x̃' },
    { key: 'stdev', display: 'σ' }, { key: 'variance', display: 'σ²' },
    { key: 'nCr', display: 'nCr' }, { key: 'nPr', display: 'nPr' },
    { key: 'factorial', display: 'n!' },
  ]},
  { label: 'GEOMETRY', fns: [
    { key: 'distance', display: 'dist' }, { key: 'midpoint', display: 'mid' },
    { key: 'polygon', display: 'poly' },
  ]},
]

// ---------------------------------------------------------------------------

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function inlineMarkdownToHtml(value: string) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

function markdownToEditorHtml(markdown: string) {
  const lines = markdown.split('\n')
  const html: string[] = []
  let list: 'ul' | 'ol' | null = null

  const closeList = () => {
    if (!list) return
    html.push(`</${list}>`)
    list = null
  }

  for (const line of lines) {
    if (!line.trim()) {
      closeList()
      html.push('<p><br></p>')
      continue
    }

    const bullet = line.match(/^- (.*)$/)
    if (bullet) {
      if (list !== 'ul') {
        closeList()
        html.push('<ul>')
        list = 'ul'
      }
      html.push(`<li>${inlineMarkdownToHtml(bullet[1])}</li>`)
      continue
    }

    const numbered = line.match(/^\d+\. (.*)$/)
    if (numbered) {
      if (list !== 'ol') {
        closeList()
        html.push('<ol>')
        list = 'ol'
      }
      html.push(`<li>${inlineMarkdownToHtml(numbered[1])}</li>`)
      continue
    }

    closeList()
    if (/^---+$/.test(line.trim())) {
      html.push('<hr>')
    } else if (line.startsWith('# ')) {
      html.push(`<h1>${inlineMarkdownToHtml(line.slice(2))}</h1>`)
    } else if (line.startsWith('## ')) {
      html.push(`<h2>${inlineMarkdownToHtml(line.slice(3))}</h2>`)
    } else if (line.startsWith('> ')) {
      html.push(`<blockquote>${inlineMarkdownToHtml(line.slice(2))}</blockquote>`)
    } else {
      html.push(`<p>${inlineMarkdownToHtml(line)}</p>`)
    }
  }

  closeList()
  return html.join('')
}

function sanitizeHtml(html: string) {
  const template = document.createElement('template')
  template.innerHTML = html

  const cleanNode = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove()
        continue
      }

      if (child.nodeType !== Node.ELEMENT_NODE) continue
      const element = child as HTMLElement

      if (!allowedTags.has(element.tagName)) {
        const text = document.createTextNode(element.textContent ?? '')
        element.replaceWith(text)
        continue
      }

      for (const attr of Array.from(element.attributes)) {
        const name = attr.name.toLowerCase()
        if (name === 'href' && element.tagName === 'A') {
          if (/^(https?:|mailto:|#)/i.test(attr.value)) continue
        }
        if (name === 'data-math' || name === 'data-editor-math') continue
        if (name === 'style') continue
        element.removeAttribute(attr.name)
      }

      const keptStyles: string[] = []
      for (const prop of Array.from(element.style)) {
        if (!allowedStyles.has(prop)) continue
        const value = element.style.getPropertyValue(prop)
        if (/url\s*\(/i.test(value)) continue
        keptStyles.push(`${prop}: ${value}`)
      }
      if (keptStyles.length > 0) {
        element.setAttribute('style', keptStyles.join('; '))
      } else {
        element.removeAttribute('style')
      }

      if (element.tagName === 'FONT') {
        const span = document.createElement('span')
        const color = element.getAttribute('color')
        const face = element.getAttribute('face')
        const size = element.getAttribute('size')
        if (color) span.style.color = color
        if (face) span.style.fontFamily = face
        if (size) span.style.fontSize = `${Number(size) * 4 + 4}px`
        span.innerHTML = element.innerHTML
        element.replaceWith(span)
        cleanNode(span)
        continue
      }

      cleanNode(element)
    }
  }

  cleanNode(template.content)
  return template.innerHTML
}

function editorValueToHtml(value: string) {
  if (!value.trim()) return ''
  return sanitizeHtml(looksLikeHtml(value) ? value : markdownToEditorHtml(value))
}

function closestBlock(node: Node | null, root: HTMLElement) {
  let current = node?.nodeType === Node.ELEMENT_NODE ? node as HTMLElement : node?.parentElement
  while (current && current !== root) {
    if (/^(P|DIV|H1|H2|H3|LI|BLOCKQUOTE|TD|TH)$/.test(current.tagName)) return current
    current = current.parentElement
  }
  return root
}

export function RichTextarea({
  value,
  onChange,
  placeholder,
  rows = 8,
  className = '',
  disabled,
  autoFocus,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const selectionRef = useRef<Range | null>(null)
  const initialValueRef = useRef(value)
  const initialAutoFocusRef = useRef(autoFocus)
  const lastEmittedValueRef = useRef(value)
  const [isEmpty, setIsEmpty] = useState(!value.trim())
  // Which popover is open
  const [openPanel, setOpenPanel] = useState<null | 'table' | 'math'>(null)
  const [tableHover, setTableHover] = useState<{ cols: number; rows: number } | null>(null)

  useEffect(() => {
    const editor = ref.current
    if (!editor || value === lastEmittedValueRef.current) return
    editor.innerHTML = editorValueToHtml(value)
    lastEmittedValueRef.current = value
    setIsEmpty(!editor.textContent?.trim() && editor.querySelectorAll('img, table, hr').length === 0)
  }, [value])

  useEffect(() => {
    const editor = ref.current
    if (!editor) return
    editor.innerHTML = editorValueToHtml(initialValueRef.current)
    setIsEmpty(!editor.textContent?.trim() && editor.querySelectorAll('img, table, hr').length === 0)
    if (initialAutoFocusRef.current) editor.focus()
  }, [])

  const saveSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const editor = ref.current
    const range = selection.getRangeAt(0)
    if (!editor || !editor.contains(range.commonAncestorContainer)) return
    selectionRef.current = range.cloneRange()
  }

  const restoreSelection = () => {
    const range = selectionRef.current
    if (!range) return
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  const emitChange = () => {
    const editor = ref.current
    if (!editor) return
    const nextValue = sanitizeHtml(editor.innerHTML)
    if (nextValue !== editor.innerHTML) editor.innerHTML = nextValue
    lastEmittedValueRef.current = nextValue
    setIsEmpty(!editor.textContent?.trim() && editor.querySelectorAll('img, table, hr').length === 0)
    onChange(nextValue)
  }

  const runCommand = (command: string, commandValue?: string) => {
    if (disabled) return
    const editor = ref.current
    if (!editor) return
    editor.focus()
    restoreSelection()
    document.execCommand(command, false, commandValue)
    emitChange()
    saveSelection()
  }

  const applyInlineStyle = (property: string, styleValue: string) => {
    if (disabled) return
    const editor = ref.current
    if (!editor) return
    editor.focus()
    restoreSelection()
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      const span = document.createElement('span')
      span.style.setProperty(property, styleValue)
      span.textContent = 'formatted text'
      const range = selection?.rangeCount ? selection.getRangeAt(0) : document.createRange()
      range.insertNode(span)
    } else {
      const range = selection.getRangeAt(0)
      const span = document.createElement('span')
      span.style.setProperty(property, styleValue)
      span.appendChild(range.extractContents())
      range.insertNode(span)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    emitChange()
    saveSelection()
  }

  const applyBlockStyle = (property: string, styleValue: string) => {
    if (disabled) return
    const editor = ref.current
    if (!editor) return
    editor.focus()
    restoreSelection()
    const selection = window.getSelection()
    const block = closestBlock(selection?.anchorNode ?? null, editor)
    block.style.setProperty(property, styleValue)
    emitChange()
    saveSelection()
  }

  const insertHtml = (html: string) => {
    if (disabled) return
    const editor = ref.current
    if (!editor) return
    editor.focus()
    restoreSelection()
    document.execCommand('insertHTML', false, html)
    emitChange()
    saveSelection()
  }

  const handleAction = (action: FormatAction) => {
    if (action === 'bold') runCommand('bold')
    else if (action === 'italic') runCommand('italic')
    else if (action === 'underline') runCommand('underline')
    else if (action === 'h1') runCommand('formatBlock', 'h1')
    else if (action === 'h2') runCommand('formatBlock', 'h2')
    else if (action === 'paragraph') runCommand('formatBlock', 'p')
    else if (action === 'ul') runCommand('insertUnorderedList')
    else if (action === 'ol') runCommand('insertOrderedList')
    else if (action === 'quote') runCommand('formatBlock', 'blockquote')
    else if (action === 'divider') runCommand('insertHorizontalRule')
    else if (action === 'alignLeft') runCommand('justifyLeft')
    else if (action === 'alignCenter') runCommand('justifyCenter')
    else if (action === 'alignRight') runCommand('justifyRight')
    else if (action === 'clear') {
      runCommand('removeFormat')
      runCommand('formatBlock', 'p')
    } else if (action === 'link') {
      const url = window.prompt('Link URL', 'https://')
      if (url) runCommand('createLink', url)
    } else if (action === 'math') {
      saveSelection()
      setOpenPanel('math')
    } else if (action === 'table') {
      saveSelection()
      setOpenPanel('table')
    }
  }

  const insertTable = useCallback((cols: number, rows: number) => {
    setOpenPanel(null)
    const cells = Array.from({ length: rows }, () =>
      `<tr>${Array.from({ length: cols }, () => '<td><p><br></p></td>').join('')}</tr>`,
    ).join('')
    insertHtml(`<table><tbody>${cells}</tbody></table><p><br></p>`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const insertMathFn = useCallback((key: MathFnKey) => {
    setOpenPanel(null)
    const template = buildMathTemplate(key)
    insertHtml(`<span data-editor-math="true" data-math="${escapeHtml(template)}" style="font-family: Menlo, Monaco, Consolas, monospace; background-color: #f8fafc;">${escapeHtml(template)}</span>`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
      if (e.key === 'b') { e.preventDefault(); handleAction('bold') }
      if (e.key === 'i') { e.preventDefault(); handleAction('italic') }
      if (e.key === 'u') { e.preventDefault(); handleAction('underline') }
    }
  }

  const minHeight = `${Math.max(rows, 4) * 1.5 + 1.5}rem`

  return (
    <div className={`overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 ${className}`}>
      <div className="relative flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <SelectControl title="Paragraph style" disabled={disabled} defaultValue="p" onChange={(next) => {
          if (next === 'h1') handleAction('h1')
          else if (next === 'h2') handleAction('h2')
          else handleAction('paragraph')
        }}>
          <option value="p">Paragraph</option>
          <option value="h1">Heading</option>
          <option value="h2">Subheading</option>
        </SelectControl>
        <SelectControl title="Font" disabled={disabled} defaultValue="" onChange={(next) => applyInlineStyle('font-family', next)}>
          <option value="" disabled>Font</option>
          {fonts.map((font) => <option key={font.label} value={font.value}>{font.label}</option>)}
        </SelectControl>
        <SelectControl title="Font size" disabled={disabled} defaultValue="" onChange={(next) => applyInlineStyle('font-size', next)}>
          <option value="" disabled>Size</option>
          {fontSizes.map((size) => <option key={size.value} value={size.value}>{size.label}</option>)}
        </SelectControl>
        <div className="mx-1 h-4 w-px bg-slate-300" />
        <Btn onActivate={() => handleAction('bold')} title="Bold (Cmd+B)" disabled={disabled}>
          <strong className="text-xs">B</strong>
        </Btn>
        <Btn onActivate={() => handleAction('italic')} title="Italic (Cmd+I)" disabled={disabled}>
          <em className="text-xs font-serif">I</em>
        </Btn>
        <Btn onActivate={() => handleAction('underline')} title="Underline (Cmd+U)" disabled={disabled}>
          <span className="text-xs underline">U</span>
        </Btn>
        <ColorControl title="Font color" icon="text" disabled={disabled} defaultValue="#1e293b" onChange={(next) => applyInlineStyle('color', next)} />
        <ColorControl title="Highlight color" icon="highlight" disabled={disabled} defaultValue="#fef08a" onChange={(next) => applyInlineStyle('background-color', next)} />
        <Btn onActivate={() => handleAction('clear')} title="Clear formatting" disabled={disabled}>
          <span className="text-xs">Tx</span>
        </Btn>
        <div className="mx-1 h-4 w-px bg-slate-300" />
        <Btn onActivate={() => handleAction('alignLeft')} title="Align left" disabled={disabled}>
          <AlignIcon align="left" />
        </Btn>
        <Btn onActivate={() => handleAction('alignCenter')} title="Align center" disabled={disabled}>
          <AlignIcon align="center" />
        </Btn>
        <Btn onActivate={() => handleAction('alignRight')} title="Align right" disabled={disabled}>
          <AlignIcon align="right" />
        </Btn>
        <SelectControl title="Line spacing" disabled={disabled} defaultValue="" onChange={(next) => applyBlockStyle('line-height', next)}>
          <option value="" disabled>Spacing</option>
          {lineHeights.map((height) => <option key={height.value} value={height.value}>{height.label}</option>)}
        </SelectControl>
        <div className="mx-1 h-4 w-px bg-slate-300" />
        <Btn onActivate={() => handleAction('link')} title="Link" disabled={disabled}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.8 9.2a3 3 0 0 0 4.2 0l1.5-1.5a3 3 0 0 0-4.2-4.2l-.6.6" />
            <path d="M9.2 6.8a3 3 0 0 0-4.2 0L3.5 8.3a3 3 0 0 0 4.2 4.2l.6-.6" />
          </svg>
        </Btn>
        <Btn onActivate={() => handleAction('ul')} title="Bullet list" disabled={disabled}>
          <ListIcon ordered={false} />
        </Btn>
        <Btn onActivate={() => handleAction('ol')} title="Numbered list" disabled={disabled}>
          <ListIcon ordered />
        </Btn>
        <Btn onActivate={() => handleAction('quote')} title="Quote" disabled={disabled}>
          <span className="text-sm leading-none">&ldquo;</span>
        </Btn>
        <Btn onActivate={() => handleAction('divider')} title="Divider" disabled={disabled}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 8h10" />
          </svg>
        </Btn>
        <Btn onActivate={() => handleAction('math')} title="Insert math" disabled={disabled}>
          <svg viewBox="0 0 16 14" width="15" height="13" fill="none" data-icon="math">
            <text x="0" y="11" fontSize="10" fontFamily="serif" fontStyle="italic" fill="currentColor">f</text>
            <text x="5.5" y="11" fontSize="8" fontFamily="serif" fill="currentColor">(x)</text>
          </svg>
        </Btn>
        <div className="relative">
          <Btn onActivate={() => { saveSelection(); setOpenPanel(p => p === 'table' ? null : 'table') }} title="Insert table" disabled={disabled}>
            <TableIcon />
          </Btn>
          {openPanel === 'table' && (
            <TablePicker
              hover={tableHover}
              onHover={setTableHover}
              onInsert={insertTable}
              onClose={() => setOpenPanel(null)}
            />
          )}
        </div>
        {openPanel === 'math' && (
          <MathPanel
            categories={MATH_CATEGORIES}
            onInsert={insertMathFn}
            onClose={() => setOpenPanel(null)}
          />
        )}
      </div>

      <div className="relative">
        {placeholder && isEmpty && (
          <div className="pointer-events-none absolute left-3 top-3 text-sm leading-relaxed text-slate-400">
            {placeholder}
          </div>
        )}
        <div
          ref={ref}
          contentEditable={!disabled}
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder ?? 'Rich text editor'}
          onInput={emitChange}
          onBlur={emitChange}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning
          style={{ minHeight }}
          className="w-full resize-y overflow-auto border-0 bg-white p-3 text-sm leading-relaxed text-slate-700 outline-none disabled:opacity-50 [&_a]:text-indigo-600 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_hr]:my-3 [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_span[data-editor-math]]:rounded [&_span[data-editor-math]]:border [&_span[data-editor-math]]:border-slate-200 [&_span[data-editor-math]]:px-1 [&_strong]:font-semibold [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:min-w-24 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-50 [&_th]:p-2 [&_u]:underline [&_ul]:list-disc"
        />
      </div>
    </div>
  )
}

function SelectControl({
  title,
  disabled,
  defaultValue,
  onChange,
  children,
}: {
  title: string
  disabled?: boolean
  defaultValue: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      title={title}
      disabled={disabled}
      defaultValue={defaultValue}
      onMouseDown={() => {
        const selection = window.getSelection()
        if (selection?.rangeCount) selection.getRangeAt(0).cloneRange()
      }}
      onChange={(e) => {
        onChange(e.target.value)
        e.currentTarget.value = defaultValue
      }}
      className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 outline-none transition hover:bg-slate-50 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </select>
  )
}

function ColorControl({
  title,
  icon = 'text',
  disabled,
  defaultValue,
  onChange,
}: {
  title: string
  icon?: 'text' | 'highlight'
  disabled?: boolean
  defaultValue: string
  onChange: (value: string) => void
}) {
  return (
    <label title={title} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-200">
      <span className="flex flex-col items-center gap-px" data-icon={icon === 'text' ? 'text-color' : 'highlight-color'}>
        {icon === 'text' ? (
          /* Bold "A" glyph */
          <svg viewBox="0 0 12 10" width="12" height="10" fill="currentColor">
            <text x="1" y="9" fontSize="9" fontFamily="serif" fontWeight="bold">A</text>
          </svg>
        ) : (
          /* Highlighter pen */
          <svg viewBox="0 0 12 10" width="12" height="10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="2" y="0.5" width="8" height="5" rx="1" fill="currentColor" opacity="0.15" />
            <path d="M4 5.5 L6 8.5 L8 5.5" fill="currentColor" opacity="0.45" stroke="none" />
            <line x1="3.5" y1="3" x2="8.5" y2="3" strokeWidth="1.5" opacity="0.7" />
          </svg>
        )}
        {/* Live color swatch underbar */}
        <span
          className="block h-1 w-full rounded-sm border border-slate-200"
          style={{ backgroundColor: defaultValue }}
        />
      </span>
      <input
        type="color"
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
    </label>
  )
}

function Btn({
  onActivate,
  title,
  disabled,
  children,
}: {
  onActivate: () => void
  title: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onActivate()
      }}
      disabled={disabled}
      title={title}
      className="flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function AlignIcon({ align }: { align: 'left' | 'center' | 'right' }) {
  const widths = align === 'center' ? ['8', '12', '8'] : align === 'right' ? ['8', '12', '10'] : ['12', '8', '10']
  const x = (width: string) => align === 'right' ? String(14 - Number(width)) : align === 'center' ? String((14 - Number(width)) / 2) : '2'
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      {widths.map((width, i) => <path key={i} d={`M${x(width)} ${4 + i * 4}h${width}`} />)}
    </svg>
  )
}

function ListIcon({ ordered }: { ordered: boolean }) {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="currentColor">
      {ordered ? (
        <>
          <text x="0" y="5" fontSize="4.5" fontFamily="monospace">1.</text>
          <text x="0" y="8.5" fontSize="4.5" fontFamily="monospace">2.</text>
          <text x="0" y="12" fontSize="4.5" fontFamily="monospace">3.</text>
          <rect x="5" y="2.7" width="8" height="1.7" rx="0.85" />
          <rect x="5" y="6.2" width="8" height="1.7" rx="0.85" />
          <rect x="5" y="9.7" width="8" height="1.7" rx="0.85" />
        </>
      ) : (
        <>
          <circle cx="1.5" cy="3.5" r="1.2" />
          <circle cx="1.5" cy="7" r="1.2" />
          <circle cx="1.5" cy="10.5" r="1.2" />
          <rect x="4" y="2.7" width="9" height="1.7" rx="0.85" />
          <rect x="4" y="6.2" width="9" height="1.7" rx="0.85" />
          <rect x="4" y="9.7" width="9" height="1.7" rx="0.85" />
        </>
      )}
    </svg>
  )
}

function TableIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2.5" y="3" width="11" height="10" rx="1" />
      <path d="M2.5 6.3h11M2.5 9.7h11M6.2 3v10M9.8 3v10" />
    </svg>
  )
}

// ── Table grid picker ─────────────────────────────────────────────────────

function TablePicker({
  hover,
  onHover,
  onInsert,
  onClose,
}: {
  hover: { cols: number; rows: number } | null
  onHover: (h: { cols: number; rows: number } | null) => void
  onInsert: (cols: number, rows: number) => void
  onClose: () => void
}) {
  const COLS = 10
  const ROWS = 8
  const hCols = hover?.cols ?? 0
  const hRows = hover?.rows ?? 0

  return (
    <div
      className="absolute right-0 top-full z-50 mt-1 rounded-lg border border-slate-200 bg-white p-3 shadow-xl"
      onMouseDown={(e) => e.preventDefault()}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1.25rem)` }}
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const c = (i % COLS) + 1
          const r = Math.floor(i / COLS) + 1
          const active = c <= hCols && r <= hRows
          return (
            <button
              key={i}
              type="button"
              className={`h-5 w-5 rounded-sm border transition-colors ${
                active
                  ? 'border-indigo-400 bg-indigo-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
              onMouseEnter={() => onHover({ cols: c, rows: r })}
              onClick={() => onInsert(c, r)}
            />
          )
        })}
      </div>
      <p className="mt-2 text-center text-xs font-medium text-slate-500">
        {hCols > 0 && hRows > 0 ? `${hCols} × ${hRows}` : 'Hover to select'}
      </p>
    </div>
  )
}

// ── Math / functions panel ────────────────────────────────────────────────

function MathPanel({
  categories,
  onInsert,
  onClose,
}: {
  categories: MathCategory[]
  onInsert: (key: MathFnKey) => void
  onClose: () => void
}) {
  return (
    <div
      className="absolute right-0 top-full z-50 mt-1 max-h-80 w-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl"
      onMouseDown={(e) => e.preventDefault()}
    >
      {categories.map((cat) => (
        <div key={cat.label} className="px-3 py-2">
          <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-slate-400">
            {cat.label}
          </p>
          <div className="grid grid-cols-3 gap-1">
            {cat.fns.map(({ key, display }) => (
              <button
                key={key}
                type="button"
                onClick={() => onInsert(key)}
                className="rounded border border-slate-200 bg-slate-50 px-1 py-1.5 text-center text-xs font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {display}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
