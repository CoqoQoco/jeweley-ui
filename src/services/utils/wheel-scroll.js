// wheel-scroll.js — ตัวช่วยเลื่อนหน้าเองเมื่อ wheel ถูก preventDefault (เช่น number input ที่ focus อยู่ TK202610230003)

const LINE_HEIGHT_PX = 16

function isScrollable(el, getStyle) {
  const style = getStyle(el)
  const canScrollY = (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight
  const canScrollX = (style.overflowX === 'auto' || style.overflowX === 'scroll') && el.scrollWidth > el.clientWidth
  return canScrollY || canScrollX
}

// หา ancestor ที่เลื่อนได้ใกล้สุด (ไม่รวม body/html) — ไม่เจอคืน document.scrollingElement
export function findScrollContainer(start, doc = document, getStyle = (el) => window.getComputedStyle(el)) {
  let el = start?.parentElement
  while (el && el !== doc.body && el !== doc.documentElement) {
    if (isScrollable(el, getStyle)) return el
    el = el.parentElement
  }
  return doc.scrollingElement || doc.documentElement
}

// แปลง delta จาก wheel event เป็น px (deltaMode 0=pixel, 1=line, 2=page)
export function wheelDeltaToPixels(event, container) {
  const factor = event.deltaMode === 1 ? LINE_HEIGHT_PX : event.deltaMode === 2 ? container?.clientHeight || window.innerHeight : 1
  return { x: (event.deltaX || 0) * factor, y: (event.deltaY || 0) * factor }
}
