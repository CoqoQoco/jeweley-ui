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

  Props:
    label    — label text (i18n caller ส่ง $t(...) มา)
    required — shows red asterisk after label
    error    — error message string (shows below slot)
-->
<template>
  <div class="form-field">
    <span class="title-text">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </span>
    <slot />
    <small v-if="error" class="text-danger d-block">{{ error }}</small>
  </div>
</template>

<script>
export default {
  name: 'FormFieldGeneric',

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
