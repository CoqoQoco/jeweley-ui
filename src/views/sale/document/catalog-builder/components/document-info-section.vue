<template>
  <div class="section-card">
    <h6>ข้อมูลเอกสาร</h6>

    <div class="form-row two-col">
      <div class="form-field">
        <span class="title-text">หัวเรื่อง (Header) <span class="text-danger">*</span></span>
        <input
          class="form-control"
          type="text"
          :value="form.headerLabel"
          @input="update('headerLabel', $event.target.value)"
          placeholder="เช่น 18K RING"
        />
      </div>
      <div class="form-field">
        <span class="title-text">Collection Title</span>
        <input
          class="form-control"
          type="text"
          :value="form.collectionTitle"
          @input="update('collectionTitle', $event.target.value)"
          placeholder="เช่น NEW COLLECTION 2025"
        />
      </div>
    </div>

    <div class="form-row four-col">
      <div class="form-field">
        <span class="title-text">เดือน <span class="text-danger">*</span></span>
        <DropdownGeneric
          :modelValue="form.documentMonth"
          :options="MONTHS"
          optionLabel="label"
          optionValue="value"
          placeholder="เลือกเดือน"
          @update:modelValue="update('documentMonth', $event)"
        />
      </div>
      <div class="form-field">
        <span class="title-text">ปี <span class="text-danger">*</span></span>
        <DropdownGeneric
          :modelValue="form.documentYear"
          :options="yearOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="เลือกปี"
          @update:modelValue="update('documentYear', $event)"
        />
      </div>
      <div class="form-field">
        <span class="title-text">สถานะ</span>
        <DropdownGeneric
          :modelValue="form.status"
          :options="STATUS_OPTIONS"
          optionLabel="label"
          optionValue="value"
          placeholder="เลือกสถานะ"
          @update:modelValue="update('status', $event)"
        />
      </div>
      <div class="form-field">
        <span class="title-text">Tags</span>
        <input
          class="form-control"
          type="text"
          :value="form.tags"
          @input="update('tags', $event.target.value)"
          placeholder="เช่น approved, Q1 (คั่นด้วยลูกน้ำ)"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-field">
        <span class="title-text">หมายเหตุ</span>
        <textarea
          class="form-control"
          rows="2"
          :value="form.remark"
          @input="update('remark', $event.target.value)"
          placeholder="หมายเหตุ (ถ้ามี)"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const MONTHS = [
  { value: 1, label: 'มกราคม' }, { value: 2, label: 'กุมภาพันธ์' },
  { value: 3, label: 'มีนาคม' }, { value: 4, label: 'เมษายน' },
  { value: 5, label: 'พฤษภาคม' }, { value: 6, label: 'มิถุนายน' },
  { value: 7, label: 'กรกฎาคม' }, { value: 8, label: 'สิงหาคม' },
  { value: 9, label: 'กันยายน' }, { value: 10, label: 'ตุลาคม' },
  { value: 11, label: 'พฤศจิกายน' }, { value: 12, label: 'ธันวาคม' }
]

const STATUS_OPTIONS = [
  { value: 0, label: 'ร่าง (Draft)' },
  { value: 1, label: 'Final' }
]

export default {
  name: 'DocumentInfoSection',

  components: { DropdownGeneric },

  props: {
    form: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['update:form'],

  data() {
    const currentYear = new Date().getFullYear()
    const yearOptions = Array.from({ length: 5 }, (_, i) => {
      const y = currentYear - 1 + i
      return { value: y, label: String(y) }
    })
    return {
      MONTHS,
      STATUS_OPTIONS,
      yearOptions
    }
  },

  methods: {
    update(field, value) {
      this.$emit('update:form', { ...this.form, [field]: value })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.section-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  padding: 20px;
  background: #ffffff !important;
  margin-bottom: 16px;

  h6 {
    color: var(--base-font-color);
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
    background: transparent !important;
    margin-bottom: 16px;
  }
}

.form-row {
  margin-bottom: 16px;

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  &.four-col {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  @media (max-width: 1024px) {
    &.two-col { grid-template-columns: 1fr; }
    &.four-col { grid-template-columns: 1fr 1fr; }
  }
}

.form-field {
  width: 100%;
}

input.form-control,
textarea.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.4;

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }
}

textarea.form-control {
  resize: vertical;
}
</style>
