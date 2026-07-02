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

  ตัวอย่างการใช้งาน (ไม่มี title):
  [SectionCardGeneric]
    [BaseDataTable :items="items" :columns="columns" /]
  [/SectionCardGeneric]

  Props:
    title       — section title (optional)
    icon        — Bootstrap icon class เช่น 'bi-box-arrow-up' (legend mode เท่านั้น)
    accent      — 'main' | 'green' (สีของ legend text+icon, default 'main')
    headerStyle — 'underline' | 'legend' (default 'underline' = ใช้ pageTitle เดิม)
-->
<template>
  <div :class="['section-card', { 'section-card--legend': isLegendMode }]">
    <pageTitle v-if="title && !isLegendMode" :title="title" :isShowBtnClose="false" />
    <span
      v-if="title && isLegendMode"
      :class="['section-legend', `section-legend--${accent}`]"
    >
      <i v-if="icon" :class="['bi', icon]"></i>
      {{ title }}
    </span>
    <slot />
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
      validator: (v) => ['underline', 'legend'].includes(v)
    }
  },

  computed: {
    isLegendMode() {
      return this.headerStyle === 'legend'
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
</style>
