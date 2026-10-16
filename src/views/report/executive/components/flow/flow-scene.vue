<!--
  FlowScene — ฉากพื้นโรงงาน 3 มิติ (three.js โหลดแบบ lazy) + ป้ายตัวเลขที่ลอยตามสถานี
  - three.js อยู่ใน flow-scene-engine.js ซึ่งโหลดด้วย import() ตอน mount เท่านั้น (ไม่เข้า bundle หลัก)
  - ป้ายเป็น DOM ที่ component นี้เรนเดอร์ (ข้อความผ่าน Vue/i18n) engine ย้ายตำแหน่งตามกล้องเอง
  - active=false (แท็บถูกซ่อน) → หยุด requestAnimationFrame; ไม่มี WebGL/โหลด chunk ไม่ได้ → ซ่อน canvas ตารางยังใช้ได้
  Props: stations, zoneLabels, gates, selected, lens, active
  Emits: select (id จากการคลิก canvas หรือป้ายโซน)
-->
<template>
  <div ref="stage" class="flow-stage">
    <canvas v-show="!sceneFailed" ref="canvas" class="flow-stage__canvas" role="img" :aria-label="$t('view.executive.flow.scene.ariaLabel')"></canvas>

    <p v-if="sceneFailed" class="flow-stage__fallback">{{ $t('view.executive.flow.scene.fallback') }}</p>

    <template v-else>
      <div
        v-for="s in stations"
        v-show="s.visible && s.name"
        :key="s.id"
        :ref="(el) => setLabelEl(s.id, el)"
        class="flow-lbl"
        :class="stationClass(s)"
        :title="s.fullName || null"
        aria-hidden="true"
      >
        <span class="flow-lbl__name">{{ s.name }}<span v-if="labelOf(s).badge" class="flow-lbl__warn">!</span></span>
        <span class="flow-lbl__value">{{ labelOf(s).value }}</span>
      </div>

      <button
        v-for="z in zoneLabels"
        :key="z.id"
        :ref="(el) => setLabelEl(z.id, el)"
        type="button"
        class="flow-lbl flow-lbl--zone"
        :class="{ 'flow-lbl--sel': z.active }"
        @click="$emit('select', z.id)"
      >
        {{ z.text }}
      </button>

      <div v-for="g in gates" :key="g.id" :ref="(el) => setGateEl(g.id, el)" class="flow-lbl flow-lbl--gate" aria-hidden="true">
        <span class="flow-lbl__name">{{ g.name }}</span>
        <span class="flow-lbl__value">{{ g.value }}</span>
      </div>

      <p class="flow-stage__hint">{{ $t('view.executive.flow.scene.hint') }}</p>
    </template>
  </div>
</template>

<script>
import { GATES } from '../../flow-layout.js'
import { stationLabel, zoneOf } from '../../flow-helpers.js'

export default {
  name: 'FlowScene',

  props: {
    stations: { type: Array, default: () => [] },
    zoneLabels: { type: Array, default: () => [] },
    gates: { type: Array, default: () => [] },
    selected: { type: String, default: 'all' },
    lens: { type: String, default: 'default' },
    active: { type: Boolean, default: true }
  },

  emits: ['select'],

  data() {
    return {
      sceneFailed: false
    }
  },

  computed: {
    labelMap() {
      const map = {}
      this.stations.forEach((s) => {
        map[s.id] = stationLabel(s, this.lens, (key, params) => this.$t(key, params))
      })
      return map
    },

    engineModel() {
      return { stations: this.stations, selected: this.selected }
    }
  },

  watch: {
    engineModel() {
      this.pushModel()
    },

    selected(id) {
      if (this.engine) this.engine.flyTo(id)
    },

    active(on) {
      if (this.engine) this.engine.setActive(on)
    },

    gates() {
      this.$nextTick(() => this.syncLabels())
    }
  },

  created() {
    // ไม่ใส่ใน data(): engine/ป้ายเป็นวัตถุ three/DOM ห้ามให้ Vue ครอบด้วย reactive proxy
    this.engine = null
    this.labelEls = {}
    this.gateEls = {}
    this.unmounted = false
  },

  mounted() {
    this.initEngine()
  },

  beforeUnmount() {
    this.unmounted = true
    if (this.engine) {
      this.engine.dispose()
      this.engine = null
    }
  },

  methods: {
    // ต้อง try-catch จริง: เครื่องที่ไม่มี WebGL หรือโหลด chunk ไม่ได้ต้อง degrade เป็นตารางล้วน (ไม่ใช่ error ของ API)
    async initEngine() {
      try {
        const { createFlowEngine } = await import('../../flow-scene-engine.js')
        if (this.unmounted) return
        const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        this.engine = createFlowEngine({
          canvas: this.$refs.canvas,
          stage: this.$refs.stage,
          reducedMotion: reduce,
          onSelect: (id) => this.$emit('select', id)
        })
      } catch {
        this.sceneFailed = true
        return
      }
      this.engine.setActive(this.active)
      this.pushModel()
      this.syncLabels()
      if (this.selected !== 'all') this.engine.flyTo(this.selected, true)
    },

    pushModel() {
      if (this.engine) this.engine.update(this.engineModel)
    },

    syncLabels() {
      if (!this.engine) return
      this.engine.setLabels(
        this.labelEls,
        GATES.map((g) => ({ el: this.gateEls[g.id], pos: g.pos }))
      )
    },

    setLabelEl(id, el) {
      if (el) this.labelEls[id] = el
      else delete this.labelEls[id]
    },

    setGateEl(id, el) {
      if (el) this.gateEls[id] = el
      else delete this.gateEls[id]
    },

    labelOf(s) {
      return this.labelMap[s.id]
    },

    stationClass(s) {
      const l = this.labelOf(s)
      const inZone = this.selected !== 'all' && zoneOf(this.selected) === s.zone
      return {
        'flow-lbl--sel': this.selected === s.id,
        'flow-lbl--dim': l.dim,
        'flow-lbl--compact': !inZone,
        [`flow-lbl--t-${l.trustLevel}`]: true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.flow-stage {
  position: relative;
  height: clamp(420px, 56vw, 680px);
  overflow: hidden;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  &__canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
    cursor: grab;
  }

  &__fallback {
    margin: 0;
    padding: var(--sp-2xl);
    color: var(--base-sub-color);
  }

  &__hint {
    position: absolute;
    left: var(--sp-sm);
    bottom: var(--sp-sm);
    margin: 0;
    padding: var(--sp-xs) var(--sp-sm);
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
    background: var(--color-card-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);

    @media (max-width: 700px) {
      display: none;
    }
  }
}

.flow-lbl {
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  padding: var(--sp-xs) var(--sp-sm);
  font: inherit;
  font-size: var(--fs-sm);
  line-height: var(--lh-sm);
  text-align: center;
  white-space: nowrap;
  color: var(--base-sub-color);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  pointer-events: none;
  will-change: transform;

  &__name {
    font-weight: 700;
  }

  &__value {
    display: block;
    font-variant-numeric: tabular-nums;
  }

  &__warn {
    display: inline-block;
    width: var(--sp-lg);
    height: var(--sp-lg);
    margin-left: var(--sp-xs);
    font-size: var(--fs-sm);
    line-height: var(--sp-lg);
    text-align: center;
    color: var(--base-sub-color);
    background: var(--base-warning);
    border-radius: 50%;
  }

  &--sel {
    border-color: var(--base-font-color);
  }

  &--dim {
    opacity: 0.35;
  }

  &--compact {
    .flow-lbl__value {
      display: none;
    }

    @media (max-width: 700px) {
      display: none;
    }
  }

  &--sel.flow-lbl--compact {
    @media (max-width: 700px) {
      display: block;
    }
  }

  &--t-fail {
    background: var(--base-warning);
    border-color: var(--base-warning);
  }

  &--t-warn {
    border: 2px solid var(--base-warning);
  }

  &--t-info {
    border-style: dashed;
  }

  &--zone {
    pointer-events: auto;
    cursor: pointer;
    font-weight: 700;
    color: var(--on-inverse);
    background: var(--base-sub-color);
    border-color: var(--base-sub-color);

    &:focus-visible {
      outline: 2px solid var(--base-font-color);
      outline-offset: 2px;
    }

    &.flow-lbl--sel {
      outline: 2px solid var(--base-warning);
    }
  }

  &--gate {
    color: var(--on-inverse);
    background: var(--base-font-color);
    border-color: var(--base-font-color);
  }
}
</style>
