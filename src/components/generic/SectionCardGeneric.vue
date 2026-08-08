<!--
  SectionCardGeneric — card section ตาม ui-layout skill §2
  ใช้ @include card-base จาก mixin.scss + override legacy global

  ตัวอย่างการใช้งาน (มี title, default underline style):
  [SectionCardGeneric title="ข้อมูลลูกค้า"]
    [div class="form-row two-col"]
      [FormFieldGeneric label="ชื่อ" :required="true"]
        [InputTextGeneric v-model="form.name" /]
      [/FormFieldGeneric]
    [/div]
  [/SectionCardGeneric]

  ตัวอย่างการใช้งาน (legend style — title คร่อมเส้น border บน):
  [SectionCardGeneric title="น้ำหนักเบิก" icon="bi-box-arrow-up" accent="main" headerStyle="legend"]
    slot content
  [/SectionCardGeneric]

  ตัวอย่างการใช้งาน (filled style — แถบสีแดงเต็มความกว้าง + icon box, reuse page-title.vue filled mode):
  [SectionCardGeneric title="รายการขาย" description="คำอธิบายสั้นๆ" icon="bi-gem" headerStyle="filled"]
    [template #header-actions]
      [span]3 รายการ[/span]
    [/template]
    slot content
  [/SectionCardGeneric]

  ตัวอย่างการใช้งาน (ไม่มี title):
  [SectionCardGeneric]
    [BaseDataTable :items="items" :columns="columns" /]
  [/SectionCardGeneric]

  Props:
    title       — section title (optional)
    description — section description (optional, filled mode เท่านั้น)
    icon        — Bootstrap icon class เช่น 'bi-box-arrow-up' (legend / filled mode เท่านั้น)
    accent      — 'main' | 'green' (สีของ legend text+icon, default 'main' — legend mode เท่านั้น)
    headerStyle — 'underline' | 'legend' | 'filled' (default 'underline' = ใช้ pageTitle เดิม)

  Slots:
    default         — เนื้อหาหลักของ card
    #header-actions — ปุ่ม/badge มุมขวาบนใน filled header (filled mode เท่านั้น — forward ไป pageTitle rightSlot)
-->
<template>
  <div :class="['section-card', { 'section-card--legend': isLegendMode, 'section-card--filled': isFilledMode }]">
    <pageTitle
      v-if="isFilledMode"
      :title="title"
      :description="description"
      :icon="icon"
      :filled="true"
      :isShowBtnClose="false"
      :isShowRightSlot="!!$slots['header-actions']"
    >
      <template #rightSlot><slot name="header-actions" /></template>
    </pageTitle>
    <pageTitle v-else-if="title && !isLegendMode" :title="title" :isShowBtnClose="false" />
    <span
      v-else-if="title && isLegendMode"
      :class="['section-legend', `section-legend--${accent}`]"
    >
      <i v-if="icon" :class="['bi', icon]"></i>
      {{ title }}
    </span>

    <div v-if="isFilledMode" class="section-card-body">
      <slot />
    </div>
    <slot v-else />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

export default {
  name: 'SectionCardGeneric',

  components: {
    pageTitle
  },

  props: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    accent: {
      type: String,
      default: 'main',
      validator: (v) => ['main', 'green'].includes(v)
    },
    headerStyle: {
      type: String,
      default: 'underline',
      validator: (v) => ['underline', 'legend', 'filled'].includes(v)
    }
  },

  computed: {
    isLegendMode() {
      return this.headerStyle === 'legend'
    },

    isFilledMode() {
      return this.headerStyle === 'filled'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

.section-card {
  @include card-base;
  background: #ffffff !important;

  :deep(h6) {
    background: transparent !important;
  }

}

.section-legend {
  position: absolute;
  top: 0;
  left: var(--sp-lg);
  transform: translateY(-50%);
  background: var(--color-card-bg);
  padding: var(--sp-xs) var(--sp-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--fs-lg);
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  line-height: 1;

  i {
    font-size: var(--fs-xl);
  }

  &--main {
    color: var(--base-font-color);
  }

  &--green {
    color: var(--base-green);
  }
}

.section-card--legend {
  position: relative;
  margin-top: var(--sp-2xl); /* clearance for the legend chip that straddles the top border */
}

.section-card--filled {
  padding: 0;
  overflow: hidden; /* clip filled header's top radius to the card's own radius */
}

.section-card-body {
  padding: var(--sp-xl);
}
</style>
