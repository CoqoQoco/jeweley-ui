<template>
  <div class="section-card">
    <h6>{{ $t('view.sale.document.docInfo') }}</h6>

    <div class="form-row two-col">
      <div class="form-field">
        <span class="title-text">{{ $t('view.sale.document.header') }} <span class="text-danger">*</span></span>
        <input
          class="form-control"
          type="text"
          :value="form.headerLabel"
          @input="update('headerLabel', $event.target.value)"
          :placeholder="$t('view.sale.document.placeholder.headerExample')"
        />
      </div>
      <div class="form-field">
        <span class="title-text">Collection Title</span>
        <input
          class="form-control"
          type="text"
          :value="form.collectionTitle"
          @input="update('collectionTitle', $event.target.value)"
          :placeholder="$t('view.sale.document.placeholder.collectionName')"
        />
      </div>
    </div>

    <div class="form-row four-col">
      <div class="form-field">
        <span class="title-text">{{ $t('view.sale.document.month') }} <span class="text-danger">*</span></span>
        <DropdownGeneric
          :modelValue="form.documentMonth"
          :options="monthOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('view.sale.document.selectMonth')"
          @update:modelValue="update('documentMonth', $event)"
        />
      </div>
      <div class="form-field">
        <span class="title-text">{{ $t('view.sale.document.year') }} <span class="text-danger">*</span></span>
        <DropdownGeneric
          :modelValue="form.documentYear"
          :options="yearOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('view.sale.document.selectYear')"
          @update:modelValue="update('documentYear', $event)"
        />
      </div>
      <div class="form-field">
        <span class="title-text">{{ $t('view.sale.document.status') }}</span>
        <DropdownGeneric
          :modelValue="form.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('view.sale.document.selectStatus')"
          @update:modelValue="update('status', $event)"
        />
      </div>
      <div class="form-field">
        <span class="title-text">{{ $t('view.sale.document.tags') }}</span>
        <input
          class="form-control"
          type="text"
          :value="form.tags"
          @input="update('tags', $event.target.value)"
          :placeholder="$t('view.sale.document.placeholder.tagsExample')"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-field">
        <span class="title-text">{{ $t('common.field.remark') }}</span>
        <textarea
          class="form-control"
          rows="2"
          :value="form.remark"
          @input="update('remark', $event.target.value)"
          :placeholder="$t('view.sale.document.placeholder.remarkOptional')"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

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
      yearOptions
    }
  },

  computed: {
    monthOptions() {
      const t = this.$t.bind(this)
      return [
        { value: 1, label: t('view.sale.document.months.jan') },
        { value: 2, label: t('view.sale.document.months.feb') },
        { value: 3, label: t('view.sale.document.months.mar') },
        { value: 4, label: t('view.sale.document.months.apr') },
        { value: 5, label: t('view.sale.document.months.may') },
        { value: 6, label: t('view.sale.document.months.jun') },
        { value: 7, label: t('view.sale.document.months.jul') },
        { value: 8, label: t('view.sale.document.months.aug') },
        { value: 9, label: t('view.sale.document.months.sep') },
        { value: 10, label: t('view.sale.document.months.oct') },
        { value: 11, label: t('view.sale.document.months.nov') },
        { value: 12, label: t('view.sale.document.months.dec') }
      ]
    },

    statusOptions() {
      return [
        { value: 0, label: this.$t('view.sale.document.statusDraft') },
        { value: 1, label: this.$t('view.sale.document.statusFinal') }
      ]
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
