<!--
  SectionCardGeneric — card section ตาม ui-layout skill §2
  ใช้ @include card-base จาก mixin.scss + override legacy global

  ตัวอย่างการใช้งาน (มี title):
  [SectionCardGeneric title="ข้อมูลลูกค้า"]
    [div class="form-row two-col"]
      [FormFieldGeneric label="ชื่อ" :required="true"]
        [InputTextGeneric v-model="form.name" /]
      [/FormFieldGeneric]
      [FormFieldGeneric label="เบอร์โทร"]
        [InputTextGeneric v-model="form.tel" type="tel" /]
      [/FormFieldGeneric]
    [/div]
  [/SectionCardGeneric]

  ตัวอย่างการใช้งาน (ไม่มี title):
  [SectionCardGeneric]
    [BaseDataTable :items="items" :columns="columns" /]
  [/SectionCardGeneric]

  Props:
    title — section title (optional); ถ้ามีจะแสดง pageTitle component
-->
<template>
  <div class="section-card">
    <pageTitle v-if="title" :title="title" :isShowBtnClose="false" />
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
</style>
