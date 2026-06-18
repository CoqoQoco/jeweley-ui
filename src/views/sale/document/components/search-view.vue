<template>
  <div class="filter-container-searchBar">
    <pageTitle
      :title="$t('view.sale.document.title')"
      :description="$t('view.sale.document.description')"
      :isShowBtnClose="false"
    />

    <form @submit.prevent="onSearch">
      <div class="form-col-container">
        <!-- เดือน -->
        <div>
          <span class="title-text">{{ $t('view.sale.document.month') }}</span>
          <select class="form-control bg-input" v-model="form.month">
            <option :value="null">{{ $t('view.sale.document.statusAll') }}</option>
            <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>

        <!-- ปี -->
        <div>
          <span class="title-text">{{ $t('view.sale.document.year') }}</span>
          <select class="form-control bg-input" v-model="form.year">
            <option :value="null">{{ $t('view.sale.document.statusAll') }}</option>
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- ค้นหาชื่อไฟล์ / tag -->
        <div>
          <span class="title-text">{{ $t('view.sale.document.fileSearch') }}</span>
          <InputTextGeneric
            v-model="form.keyword"
            :trim="true"
            :placeholder="$t('view.sale.document.placeholder.fileSearch')"
          />
        </div>
      </div>

      <div class="btn-submit-container-between">
        <div>
          <button class="btn btn-sm btn-main" type="button" :title="$t('view.sale.document.createDocument')" @click="$emit('create-catalog')">
            <i class="bi bi-plus-circle mr-1"></i> {{ $t('view.sale.document.createDocument') }}
          </button>
          <button class="btn btn-sm btn-outline-main ml-2" type="button" :title="$t('view.sale.document.uploadDocument')" @click="$emit('upload')">
            <i class="bi bi-upload mr-1"></i> {{ $t('view.sale.document.uploadDocument') }}
          </button>
        </div>
        <div>
          <button class="btn btn-sm btn-main" type="submit" :title="$t('common.btn.search')">
            <i class="bi bi-search"></i>
          </button>
          <button class="btn btn-sm btn-dark ml-2" type="button" @click="onClear" :title="$t('common.btn.clear')">
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import pageTitle from '@/components/custom/page-title.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

const interfaceForm = {
  month: null,
  year: null,
  keyword: null
}

export default {
  name: 'SaleDocumentSearchView',

  components: { pageTitle, InputTextGeneric },

  emits: ['search', 'clear', 'update:modelForm', 'create-catalog', 'upload'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  data() {
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 4 }, (_, i) => currentYear - i)

    return {
      form: { ...interfaceForm },
      years
    }
  },

  computed: {
    monthOptions() {
      return MONTH_KEYS.map((key, index) => ({
        value: index + 1,
        label: this.$t(`view.sale.document.months.${key}`)
      }))
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', { ...this.form })
    },

    onClear() {
      this.form = { ...interfaceForm }
      this.$emit('clear')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
