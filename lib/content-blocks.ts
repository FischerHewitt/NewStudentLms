import type { ContentBlock, BlockKind } from '@/lib/schemas/course'

export type { ContentBlock, BlockKind }

type AssignmentLike = {
  instructions: string
  content_blocks?: ContentBlock[] | null
}

/**
 * Returns the ordered Content Blocks for an Assignment.
 *
 * When no blocks are stored, synthesizes a single `text` block carrying the
 * Assignment's instructions. This is both the post-generation synthesis path
 * (ADR: Content Blocks decision 1A) and the read-time backfill for Assignments
 * created before Content Blocks existed — one code path serves both.
 *
 * If the instructions contain a recognisable math expression (sequence notation,
 * fraction, limit, etc.) a `math` block is automatically appended so the
 * rendered equation appears beneath the instructions.
 */
export function getAssignmentBlocks(assignment: AssignmentLike): ContentBlock[] {
  if (assignment.content_blocks && assignment.content_blocks.length > 0) {
    return assignment.content_blocks
  }
  const textBlock: ContentBlock = { id: 'text-0', kind: 'text', label: assignment.instructions }
  const mathBlock = extractMathBlock(assignment.instructions)
  return mathBlock ? [textBlock, mathBlock] : [textBlock]
}

// ── Math auto-detection ──────────────────────────────────────────────────────

/**
 * Attempts to find and extract the first standalone mathematical expression
 * from free-form instruction text. Returns a ready-to-render `math` block
 * with the expression converted to LaTeX, or null if nothing was found.
 */
function extractMathBlock(instructions: string): ContentBlock | null {
  // Priority 1: subscript variable = fraction, e.g. "a_n = (3n - n^2) / (n^2 + 4)"
  const fractionEq = instructions.match(
    /([a-z]_[a-z0-9]\s*=\s*\([^()]+\)\s*\/\s*\([^()]+\))/i,
  )
  if (fractionEq) {
    return { id: 'math-auto', kind: 'math', label: asciiMathToLatex(fractionEq[1].trim()) }
  }

  // Priority 2: subscript variable = any expression, e.g. "a_n = 2^n / n!"
  const subscriptEq = instructions.match(/([a-z]_[a-z0-9]\s*=\s*[^\s,.;][^,.\n]{0,60})/i)
  if (subscriptEq) {
    return { id: 'math-auto', kind: 'math', label: asciiMathToLatex(subscriptEq[1].trim()) }
  }

  // Priority 3: f(x) or g(x) = expression
  const funcEq = instructions.match(/([a-z]\([^)]+\)\s*=\s*[^\s,.;][^,.\n]{0,60})/i)
  if (funcEq) {
    return { id: 'math-auto', kind: 'math', label: asciiMathToLatex(funcEq[1].trim()) }
  }

  return null
}

/**
 * Converts common ASCII math notation to LaTeX.
 * Handles fractions, superscripts, Greek letters, and limit notation.
 */
function asciiMathToLatex(expr: string): string {
  return expr
    // (numerator) / (denominator) → \frac{numerator}{denominator}
    .replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}')
    // plain a/b → \frac{a}{b} (single tokens only)
    .replace(/\b([A-Za-z0-9^_]+)\s*\/\s*([A-Za-z0-9^_]+)\b/g, '\\frac{$1}{$2}')
    // n! → n!
    // infinity symbols
    .replace(/→\s*∞/g, '\\to \\infty')
    .replace(/→/g, '\\to')
    .replace(/∞/g, '\\infty')
    .replace(/\binfinity\b/gi, '\\infty')
    // Greek letters
    .replace(/\btheta\b/gi, '\\theta')
    .replace(/\bpi\b/g, '\\pi')
    .replace(/\balpha\b/gi, '\\alpha')
    .replace(/\bbeta\b/gi, '\\beta')
    .replace(/\bsigma\b/gi, '\\sigma')
    // Trim trailing punctuation that bled in from the sentence
    .replace(/[\s,;:.]+$/, '')
}

/** Appends a new block of the given kind. Pure — returns a new array. */
export function addBlock(
  blocks: ContentBlock[],
  kind: BlockKind,
  label = '',
): ContentBlock[] {
  return [...blocks, { id: newBlockId(kind), kind, label }]
}

/** Removes the block with the given id. Pure — returns a new array. */
export function removeBlock(blocks: ContentBlock[], id: string): ContentBlock[] {
  return blocks.filter((b) => b.id !== id)
}

/**
 * Moves the block at `from` to position `to`. Pure — returns a new array.
 * No-op when either index is out of range.
 */
export function moveBlock(
  blocks: ContentBlock[],
  from: number,
  to: number,
): ContentBlock[] {
  if (from < 0 || from >= blocks.length || to < 0 || to >= blocks.length) {
    return blocks
  }
  const next = [...blocks]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

function newBlockId(kind: BlockKind): string {
  return `${kind}-${Math.random().toString(36).slice(2, 10)}`
}

export type LatexValidationResult =
  | { ok: true; html: string }
  | { ok: false; error: string }

/** Validates a LaTeX string by attempting to render it with KaTeX. */
export function validateLatex(latex: string): LatexValidationResult {
  if (!latex.trim()) {
    return { ok: false, error: 'Formula cannot be empty.' }
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const katex = require('katex') as typeof import('katex')
    const html = katex.renderToString(latex, { throwOnError: true, displayMode: true })
    return { ok: true, html }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid LaTeX.' }
  }
}

/**
 * Returns true when a file with the same name (case-insensitive) is already
 * present in the staged list. Prevents duplicate uploads per assignment tab.
 */
export function isDuplicateFile(stagedNames: string[], incomingName: string): boolean {
  const lower = incomingName.toLowerCase()
  return stagedNames.some((n) => n.toLowerCase() === lower)
}

/**
 * Updates the first text block's label to mirror new instructions text.
 * Pure — returns a new array. No-op if no text block exists.
 */
export function syncInstructionsToBlocks(
  blocks: ContentBlock[],
  instructions: string,
): ContentBlock[] {
  const firstTextIdx = blocks.findIndex((b) => b.kind === 'text')
  if (firstTextIdx === -1) return blocks
  const next = [...blocks]
  next[firstTextIdx] = { ...next[firstTextIdx], label: instructions }
  return next
}

/**
 * Extracts the instructions string from the first text block.
 * Returns '' when no text block is present.
 */
export function syncBlocksToInstructions(blocks: ContentBlock[]): string {
  return blocks.find((b) => b.kind === 'text')?.label ?? ''
}
