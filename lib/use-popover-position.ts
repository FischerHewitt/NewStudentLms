/**
 * usePopoverPosition — viewport-aware popover positioning hook.
 *
 * Given a trigger element ref and an estimated popover size, returns
 * absolute { top, left } pixel coordinates that keep the popover
 * fully within the visible viewport on all edges.
 *
 * Recalculates whenever `open` changes or the window is resized.
 *
 * Issue: #89
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type PopoverSize = {
  width: number
  height: number
}

export type PopoverPosition = {
  top: number
  left: number
}

const VIEWPORT_PADDING = 8 // px gap from viewport edge

/**
 * Compute a clamped absolute position for a popover.
 * Exported as a pure function so it can be unit-tested without a DOM.
 */
export function computePopoverPosition(
  triggerRect: DOMRect,
  popoverSize: PopoverSize,
  viewportWidth: number,
  viewportHeight: number,
): PopoverPosition {
  // Default: align right edge of popover with right edge of trigger,
  // positioned just above the trigger button.
  let left = triggerRect.right - popoverSize.width
  let top = triggerRect.top - popoverSize.height - 4

  // Clamp: never overflow left edge
  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING
  }

  // Clamp: never overflow right edge
  if (left + popoverSize.width > viewportWidth - VIEWPORT_PADDING) {
    left = viewportWidth - VIEWPORT_PADDING - popoverSize.width
  }

  // Clamp: never overflow top edge — flip below trigger if needed
  if (top < VIEWPORT_PADDING) {
    top = triggerRect.bottom + 4
  }

  // Clamp: never overflow bottom edge — flip above trigger if needed
  if (top + popoverSize.height > viewportHeight - VIEWPORT_PADDING) {
    top = triggerRect.top - popoverSize.height - 4
  }

  // Final safety clamp against top
  if (top < VIEWPORT_PADDING) {
    top = VIEWPORT_PADDING
  }

  return { top, left }
}

/**
 * React hook that returns a clamped position for a popover.
 *
 * @param triggerRef - ref attached to the trigger button element
 * @param popoverSize - estimated { width, height } of the popover
 * @param open - whether the popover is currently open
 */
export function usePopoverPosition(
  triggerRef: React.RefObject<HTMLElement | null>,
  popoverSize: PopoverSize,
  open: boolean,
): PopoverPosition {
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0 })

  const calculate = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const pos = computePopoverPosition(
      rect,
      popoverSize,
      window.innerWidth,
      window.innerHeight,
    )
    // Add scroll offset to convert from viewport-relative to document-relative
    setPosition({
      top: pos.top + window.scrollY,
      left: pos.left + window.scrollX,
    })
  }, [triggerRef, popoverSize])

  useEffect(() => {
    if (!open) return
    calculate()
    window.addEventListener('resize', calculate)
    return () => window.removeEventListener('resize', calculate)
  }, [open, calculate])

  return position
}
