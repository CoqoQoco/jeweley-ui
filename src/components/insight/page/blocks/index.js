// blocks/index.js — registry ของ block type ที่ config ของ InsightPage ใช้ได้ (type: 'kpi' | 'trend' | 'table' | ...)
import KpiBlock from './KpiBlock.vue'
import TrendBlock from './TrendBlock.vue'
import TableBlock from './TableBlock.vue'
import PlanTableBlock from './PlanTableBlock.vue'
import ChartBlock from './ChartBlock.vue'
import DetailBlock from './DetailBlock.vue'
import SparkCardsBlock from './SparkCardsBlock.vue'
import NoteBlock from './NoteBlock.vue'
import DonutBlock from './DonutBlock.vue'
import BarBlock from './BarBlock.vue'

export const BLOCK_COMPONENTS = {
  kpi: KpiBlock,
  trend: TrendBlock,
  table: TableBlock,
  planTable: PlanTableBlock,
  chart: ChartBlock,
  detail: DetailBlock,
  sparkCards: SparkCardsBlock,
  note: NoteBlock,
  donut: DonutBlock,
  bar: BarBlock
}

export { BLOCK_TYPES } from './block-types.js'
