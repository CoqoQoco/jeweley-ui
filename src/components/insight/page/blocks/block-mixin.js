// block-mixin.js — props/computed ร่วมของทุก block ใน InsightPage (node = config ของ block, ctx = context ของ page)
import { resolveFrameProps } from '../insight-page-helpers.js'

export default {
  props: {
    node: { type: Object, required: true },
    ctx: { type: Object, required: true }
  },

  computed: {
    frame() {
      return resolveFrameProps(this.node, this.ctx, (key, params) => this.$t(key, params))
    }
  }
}
