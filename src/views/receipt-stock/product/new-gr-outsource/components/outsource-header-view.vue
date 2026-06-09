<template>
  <div class="section-card mb-3">
    <h6>ข้อมูลผู้ขาย / ร้านงานนอก</h6>
    <div class="form-row two-col">
      <div class="form-field">
        <span class="title-text">ผู้ขาย / ร้านงานนอก <span class="text-danger">*</span></span>
        <input
          class="form-control"
          type="text"
          v-model.trim="localVendor"
          placeholder="ชื่อผู้ขายหรือร้านงานนอก"
          @input="onVendorChange"
        />
      </div>
      <div class="form-field">
        <span class="title-text">เลขที่ PO</span>
        <input
          class="form-control"
          type="text"
          v-model.trim="localPoNumber"
          placeholder="เลขที่ใบสั่งซื้อ (ถ้ามี)"
          @input="onPoNumberChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'outsource-header-view',

  props: {
    vendor: {
      type: String,
      default: ''
    },
    poNumber: {
      type: String,
      default: ''
    }
  },

  emits: ['update:vendor', 'update:poNumber'],

  data() {
    return {
      localVendor: this.vendor,
      localPoNumber: this.poNumber
    }
  },

  watch: {
    vendor(val) {
      this.localVendor = val
    },
    poNumber(val) {
      this.localPoNumber = val
    }
  },

  methods: {
    onVendorChange() {
      this.$emit('update:vendor', this.localVendor)
    },
    onPoNumberChange() {
      this.$emit('update:poNumber', this.localPoNumber)
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

  @media (max-width: 1024px) {
    &.two-col {
      grid-template-columns: 1fr;
    }
  }
}

.form-field {
  width: 100%;
}

input.form-control {
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
</style>
