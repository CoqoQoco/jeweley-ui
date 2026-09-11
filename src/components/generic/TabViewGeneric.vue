<!--
  TabViewGeneric — wrap PrimeVue TabView/TabPanel + custom grouped nav bar

  ต่างจาก PrimeVue TabView เดิม 2 อย่าง:
  1. รองรับ "group divider" — แบ่งแท็บเป็นกลุ่มพร้อม label กำกับกลุ่ม (tabs[].group + groupLabel)
  2. lazy ที่แท้จริง — เนื้อหาแท็บ mount ครั้งแรกตอนเปิดเท่านั้น แล้ว "ค้างไว้" ไม่ unmount ซ้ำเมื่อสลับออก
     (PrimeVue lazy ปกติจะ unmount ทุกครั้งที่สลับแท็บออก ทำให้ filter/สถานะภายในแท็บหาย + ยิง fetch ซ้ำ)

  ตัวอย่างการใช้งาน:
  <TabViewGeneric
    v-model="activeTab"
    :tabs="[
      { value: 'overview', label: 'ภาพรวม' },
      { value: 'stage', label: 'แยกตาม Stage', group: 'plan', groupLabel: 'จากแผนผลิต (PLAN)' },
      { value: 'worker', label: 'ต่อช่าง', group: 'plan', groupLabel: 'จากแผนผลิต (PLAN)' },
      { value: 'slip-tang', label: 'ใบช่างแต่ง', group: 'slip', groupLabel: 'จากใบ (SLIP)' },
      { value: 'reconcile', label: 'กระทบยอด', group: 'both', groupLabel: 'รวม' }
    ]"
  >
    <template #overview><OverviewTabView /></template>
    <template #stage><StageTabView :filter="filter" /></template>
    ...
  </TabViewGeneric>

  Props:
    modelValue — v-model ของ tab value ที่กำลังเปิด (String)
    tabs       — array ของ { value, label, group?, groupLabel? } — group/groupLabel ใส่คู่กันเสมอ
    lazy       — true = mount เนื้อหาแท็บเมื่อเปิดครั้งแรกเท่านั้น (default true)

  Slots: 1 slot ต่อ 1 tab โดยใช้ tab.value เป็นชื่อ slot

  Emits: update:modelValue
-->
<template>
  <div class="tab-view-generic">
    <div class="tab-view-generic__nav" role="tablist">
      <template v-for="(tab, index) in tabs" :key="tab.value">
        <span v-if="isGroupStart(tab, index)" class="tab-view-generic__group-label">
          {{ tab.groupLabel }}
        </span>
        <button
          type="button"
          role="tab"
          class="tab-view-generic__tab"
          :class="{ 'tab-view-generic__tab--active': tab.value === modelValue }"
          :aria-selected="tab.value === modelValue"
          @click="selectTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </template>
    </div>

    <TabView :activeIndex="activeIndex" :lazy="false" class="tab-view-generic__panels">
      <TabPanel v-for="tab in tabs" :key="tab.value" :header="tab.label">
        <template v-if="shouldRender(tab.value)">
          <slot :name="tab.value" />
        </template>
      </TabPanel>
    </TabView>
  </div>
</template>

<script>
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

export default {
  name: 'TabViewGeneric',

  components: {
    TabView,
    TabPanel
  },

  props: {
    modelValue: {
      type: String,
      required: true
    },
    tabs: {
      type: Array,
      default: () => []
    },
    lazy: {
      type: Boolean,
      default: true
    }
  },

  emits: ['update:modelValue'],

  data() {
    return {
      visited: new Set(this.modelValue ? [this.modelValue] : [])
    }
  },

  computed: {
    activeIndex() {
      const index = this.tabs.findIndex((tab) => tab.value === this.modelValue)
      return index === -1 ? 0 : index
    }
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(value) {
        if (value) this.visited.add(value)
      }
    }
  },

  methods: {
    isGroupStart(tab, index) {
      if (!tab.group) return false
      const prevTab = this.tabs[index - 1]
      return !prevTab || prevTab.group !== tab.group
    },

    selectTab(value) {
      if (value === this.modelValue) return
      this.$emit('update:modelValue', value)
    },

    shouldRender(tabValue) {
      return !this.lazy || this.visited.has(tabValue)
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-view-generic {
  &__nav {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--sp-xs);
    background: var(--color-card-bg);
    border: 1px solid var(--color-border);
    border-bottom: none;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    padding: 0 var(--sp-sm);
  }

  &__group-label {
    font-size: var(--fs-sm);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--base-sub-color);
    padding-left: var(--sp-sm);
    margin-left: var(--sp-xs);
    border-left: 2px solid var(--color-border);
    white-space: nowrap;
  }

  &__tab {
    border: none;
    background: transparent;
    padding: var(--sp-md) var(--sp-lg);
    font-size: var(--fs-base);
    font-weight: 600;
    color: var(--base-sub-color);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
    transition: color 0.15s ease, border-color 0.15s ease;

    &:hover {
      color: var(--base-font-color);
    }

    &--active {
      color: var(--base-font-color);
      border-bottom-color: var(--base-font-color);
    }
  }

  &__panels {
    :deep(.p-tabview-nav-container) {
      display: none;
    }

    :deep(.p-tabview-panels) {
      background: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: 0 0 var(--radius-md) var(--radius-md);
      padding: var(--sp-xl);
    }
  }
}
</style>
