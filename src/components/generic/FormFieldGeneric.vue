<!--
  FormFieldGeneric — label + required marker + error message + slot
  ตาม ui-layout skill §3 .form-field pattern

  ตัวอย่างการใช้งาน:
  <FormFieldGeneric label="ชื่อลูกค้า" :required="true" :error="errors.name">
    <InputTextGeneric v-model="form.name" placeholder="กรอกชื่อ" />
  </FormFieldGeneric>

  <FormFieldGeneric label="ประเภท">
    <DropdownGeneric v-model="form.type" :options="typeOptions" />
  </FormFieldGeneric>

  ตัวอย่างผูก label กับ input (a11y — <label for>):
  <FormFieldGeneric label="ชื่อ" inputId="customer-name">
    <InputTextGeneric id="customer-name" v-model="form.name" />
  </FormFieldGeneric>

  Props:
    label    — label text (i18n caller ส่ง $t(...) มา)
    required — shows red asterisk after label
    error    — error message string (shows below slot)
    inputId  — optional; เมื่อส่งมา render <label :for="inputId"> แทน <span> (ต้องส่ง id ตรงกันให้ input ลูกด้วย)
    tip      — String ('') — คำอธิบายเสริมข้างหัว label (เรนเดอร์ `InfoTipGeneric` ต่อท้าย label — ไม่นับ
               เป็น label ซ้ำ เพราะเป็นแค่ไอคอนเสริม ไม่ใช่ข้อความ label เอง — ยังคง Core Principle #3
               "label แหล่งเดียว" เพราะข้อความ label หลักยังมาจาก prop `label` ที่เดียว)
-->
<template>
  <div class="form-field">
    <label v-if="inputId" :for="inputId" class="title-text">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
      <InfoTipGeneric v-if="tip" :text="tip" />
    </label>
    <span v-else class="title-text">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
      <InfoTipGeneric v-if="tip" :text="tip" />
    </span>
    <slot />
    <small v-if="error" class="text-danger d-block">{{ error }}</small>
  </div>
</template>

<script>
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'

export default {
  name: 'FormFieldGeneric',

  components: {
    InfoTipGeneric
  },

  props: {
    label: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    inputId: {
      type: String,
      default: ''
    },
    tip: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.form-field {
  width: 100%;

  .title-text {
    display: block;
    margin-bottom: 6px;
  }
}
</style>
