// block-mixin.js — props/computed ร่วมของทุก block ใน InsightPage (node = config ของ block, ctx = context ของ page)
import { resolveFrameProps } from '../insight-page-helpers.js'

export default {
  props: {
    node: { type: Object, required: true },
    ctx: { type: Object, required: true },
    // เฉพาะ node ที่ opt-in collapsible — InsightBlockNode ส่ง { toggle } มา (กรอบนี้อยู่ในสถานะกางเสมอ ตอนพับ InsightBlockNode เรนเดอร์เฉพาะหัวกรอบแทน)
    collapse: { type: Object, default: null }
  },

  computed: {
    frame() {
      const base = resolveFrameProps(this.node, this.ctx, (key, params) => this.$t(key, params))
      return this.collapse ? { ...base, collapsible: true, collapsed: false, onToggle: this.collapse.toggle } : base
    }
  }
}
