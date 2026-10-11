// spark-cards-helpers.js — pure logic ของ SparkCardsBlock (การ์ด sparkline เลือกได้)
export function buildSparkCards(node, ctx, t) {
  return (node.items ? node.items(ctx, t) : []) || []
}

export function isCardSelected(node, ctx, card) {
  return ctx.state?.[node.selectedState] === card.key
}
