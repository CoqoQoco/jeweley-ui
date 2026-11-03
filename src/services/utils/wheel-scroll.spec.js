import { describe, it, expect } from 'vitest'

import { findScrollContainer, wheelDeltaToPixels } from './wheel-scroll.js'

function makeTree() {
  const outer = document.createElement('div')
  const inner = document.createElement('div')
  const input = document.createElement('input')
  outer.appendChild(inner)
  inner.appendChild(input)
  document.body.appendChild(outer)
  return { outer, inner, input }
}

function styleOf(map) {
  return (el) => map.get(el) || { overflowY: 'visible', overflowX: 'visible' }
}

function setSize(el, props) {
  Object.entries(props).forEach(([k, v]) => Object.defineProperty(el, k, { value: v, configurable: true }))
}

describe('findScrollContainer', () => {
  it('returns nearest scrollable ancestor', () => {
    const { outer, inner, input } = makeTree()
    setSize(outer, { scrollHeight: 500, clientHeight: 100 })
    setSize(inner, { scrollHeight: 300, clientHeight: 100 })
    const map = new Map([
      [outer, { overflowY: 'auto', overflowX: 'visible' }],
      [inner, { overflowY: 'scroll', overflowX: 'visible' }]
    ])
    expect(findScrollContainer(input, document, styleOf(map))).toBe(inner)
    outer.remove()
  })

  it('skips overflow containers with no overflowing content', () => {
    const { outer, inner, input } = makeTree()
    setSize(outer, { scrollHeight: 500, clientHeight: 100 })
    setSize(inner, { scrollHeight: 100, clientHeight: 100 })
    const map = new Map([
      [outer, { overflowY: 'auto', overflowX: 'visible' }],
      [inner, { overflowY: 'auto', overflowX: 'visible' }]
    ])
    expect(findScrollContainer(input, document, styleOf(map))).toBe(outer)
    outer.remove()
  })

  it('falls back to document scrolling element', () => {
    const { outer, input } = makeTree()
    const result = findScrollContainer(input, document, styleOf(new Map()))
    expect(result).toBe(document.scrollingElement || document.documentElement)
    outer.remove()
  })
})

describe('wheelDeltaToPixels', () => {
  it('keeps pixel mode', () => {
    expect(wheelDeltaToPixels({ deltaMode: 0, deltaX: 3, deltaY: 40 })).toEqual({ x: 3, y: 40 })
  })

  it('converts line mode', () => {
    expect(wheelDeltaToPixels({ deltaMode: 1, deltaX: 0, deltaY: 3 })).toEqual({ x: 0, y: 48 })
  })

  it('converts page mode using container height', () => {
    expect(wheelDeltaToPixels({ deltaMode: 2, deltaX: 0, deltaY: 1 }, { clientHeight: 400 })).toEqual({ x: 0, y: 400 })
  })
})
