<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle :title="$t('view.production.goldLossTang.listTitle')" :description="$t('view.production.goldLossTang.listDesc')" :isShowBtnClose="false" />

        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.production.goldLossTang.filterDocumentNo') }}</span>
            <InputTextGeneric
              :modelValue="documentNo"
              :placeholder="$t('view.production.goldLossTang.filterDocumentNo')"
              @update:modelValue="$emit('update:documentNo', $event)"
            />
          </div>

          <div>
            <span class="title-text">{{ $t('view.production.goldLossTang.fieldWorker') }}</span>
            <InputTextGeneric
              :modelValue="workerCode"
              :placeholder="$t('view.production.goldLossTang.placeholderWorker')"
              @update:modelValue="$emit('update:workerCode', $event)"
            />
          </div>

          <div>
            <span class="title-text">{{ $t('view.production.goldLossTang.fieldDateStart') }}</span>
            <CalendarGeneric
              class="w-100"
              :modelValue="dateStart"
              :maxDate="dateEnd"
              :manualInput="false"
              :showIcon="true"
              dateFormat="dd/mm/yy"
              :placeholder="$t('common.label.start')"
              @update:modelValue="$emit('update:dateStart', $event)"
            />
          </div>

          <div>
            <span class="title-text">{{ $t('view.production.goldLossTang.fieldDateEnd') }}</span>
            <CalendarGeneric
              class="w-100"
              :modelValue="dateEnd"
              :minDate="dateStart"
              :manualInput="false"
              :showIcon="true"
              dateFormat="dd/mm/yy"
              :placeholder="$t('common.label.end')"
              @update:modelValue="$emit('update:dateEnd', $event)"
            />
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <ButtonGeneric
              variant="main"
              icon="bi-search"
              type="submit"
              :title="$t('common.btn.search')"
            />
            <ButtonGeneric
              variant="dark"
              icon="bi-x-circle"
              class="ml-2"
              :title="$t('common.btn.clear')"
              @click="onClear"
            />
            <ButtonGeneric
              variant="green"
              icon="bi-file-earmark-excel"
              class="ml-2"
              :title="$t('view.production.goldLossTang.exportExcel')"
              @click="$emit('export')"
            />
            <ButtonGeneric
              variant="main"
              icon="bi-plus"
              class="ml-2"
              :title="$t('view.production.goldLossTang.createSlip')"
              @click="$emit('create')"
            />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
const CalendarGeneric = defineAsyncComponent(() => import('@/components/prime-vue/CalendarGeneric.vue'))

export default {
  name: 'GoldLossTangListSearchView',

  components: {
    pageTitle,
    InputTextGeneric,
    ButtonGeneric,
    CalendarGeneric
  },

  props: {
    documentNo: {
      type: String,
      default: ''
    },
    workerCode: {
      type: String,
      default: ''
    },
    dateStart: {
      type: Date,
      default: null
    },
    dateEnd: {
      type: Date,
      default: null
    }
  },

  emits: ['update:documentNo', 'update:workerCode', 'update:dateStart', 'update:dateEnd', 'search', 'clear', 'export', 'create'],

  methods: {
    onSearch() {
      this.$emit('search')
    },
    onClear() {
      this.$emit('clear')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
