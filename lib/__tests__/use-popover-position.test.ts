import { describe, expect, it } from 'vitest'
import { computePopoverPosition } from '@/lib/use-popover-position'

// ── Helpers ──────────────────────────────────────────────────────────────────

function rect(x: number, y: number, w = 28, h = 28): DOMRect {
  return {
    left: x,
    top: y,
    right: x + w,
    bottom: y + h,
    width: w,
    height: h,
    x,
    y,
    toJSON: () => ({}),
  }
}

const POPOVER = { width: 288, height: 420 }
const VIEWPORT = { w: 1280, h: 900 }
const PAD = 8

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('computePopoverPosition — no clamping needed', () => {
  it('places the popover above-right of a centrally positioned trigger', () => {
    const trigger = rect(640, 500)
    const pos = computePopoverPosition(trigger, POPOVER, VIEWPORT.w, VIEWPORT.h)

    // Should fit comfortably — no clamping
    expect(pos.left).toBeGreaterThanOrEqual(PAD)
    expect(pos.top).toBeGreaterThanOrEqual(PAD)
    expect(pos.left + POPOVER.width).toBeLessThanOrEqual(VIEWPORT.w - PAD)
    expect(pos.top + POPOVER.height).toBeLessThanOrEqual(VIEWPORT.h - PAD)
  })
})

describe('computePopoverPosition — right edge clamping', () => {
  it('shifts popover left when trigger is near the right edge', () => {
    const trigger = rect(VIEWPORT.w - 10, 500)
    const pos = computePopoverPosition(trigger, POPOVER, VIEWPORT.w, VIEWPORT.h)

    expect(pos.left + POPOVER.width).toBeLessThanOrEqual(VIEWPORT.w - PAD)
  })

  it('never places the popover left of the left edge', () => {
    const trigger = rect(VIEWPORT.w - 5, 500)
    const pos = computePopoverPosition(trigger, POPOVER, VIEWPORT.w, VIEWPORT.h)

    expect(pos.left).toBeGreaterThanOrEqual(PAD)
  })
})

describe('computePopoverPosition — bottom edge clamping', () => {
  it('flips the popover above the trigger when it would overflow the bottom', () => {
    // Trigger near the bottom — popover would overflow if placed below
    const trigger = rect(400, VIEWPORT.h - 30)
    const pos = computePopoverPosition(trigger, POPOVER, VIEWPORT.w, VIEWPORT.h)

    expect(pos.top + POPOVER.height).toBeLessThanOrEqual(VIEWPORT.h - PAD)
  })
})

describe('computePopoverPosition — top edge clamping', () => {
  it('clamps to top padding when trigger is near the top and popover would go off-screen above', () => {
    // Trigger very near the top — popover placed above would overflow
    const trigger = rect(400, 10)
    const pos = computePopoverPosition(trigger, POPOVER, VIEWPORT.w, VIEWPORT.h)

    expect(pos.top).toBeGreaterThanOrEqual(PAD)
  })
})

describe('computePopoverPosition — bottom-right corner', () => {
  it('clamps both axes when trigger is in the bottom-right corner', () => {
    const trigger = rect(VIEWPORT.w - 10, VIEWPORT.h - 10)
    const pos = computePopoverPosition(trigger, POPOVER, VIEWPORT.w, VIEWPORT.h)

    expect(pos.left).toBeGreaterThanOrEqual(PAD)
    expect(pos.top).toBeGreaterThanOrEqual(PAD)
    expect(pos.left + POPOVER.width).toBeLessThanOrEqual(VIEWPORT.w - PAD)
    expect(pos.top + POPOVER.height).toBeLessThanOrEqual(VIEWPORT.h - PAD)
  })
})

describe('computePopoverPosition — top-left corner', () => {
  it('clamps top and keeps left inside viewport for top-left trigger', () => {
    const trigger = rect(5, 5)
    const pos = computePopoverPosition(trigger, POPOVER, VIEWPORT.w, VIEWPORT.h)

    expect(pos.left).toBeGreaterThanOrEqual(PAD)
    expect(pos.top).toBeGreaterThanOrEqual(PAD)
  })
})

describe('computePopoverPosition — small viewport', () => {
  it('still keeps the popover within bounds on a narrow screen', () => {
    const narrowViewport = { w: 375, h: 667 }
    const trigger = rect(350, 600)
    const pos = computePopoverPosition(trigger, POPOVER, narrowViewport.w, narrowViewport.h)

    expect(pos.left).toBeGreaterThanOrEqual(PAD)
    expect(pos.top).toBeGreaterThanOrEqual(PAD)
    expect(pos.left + POPOVER.width).toBeLessThanOrEqual(narrowViewport.w - PAD)
  })
})
