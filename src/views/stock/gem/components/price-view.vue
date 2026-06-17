<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="filter-container-highlight">
          <div class="form-col-container">
            <span class="desc-text-white">{{ $t('view.stock.gem.priceTitle', { name: gem.name ?? '...' }) }}</span>
          </div>
          <div class="form-col-container mt-1">
            <div class="form-col-container">
              <div class="d-flex flex-column">
                <span class="title-text-white">{{ $t('view.stock.gem.pricePerQty') }}</span>
                <span class="desc-text-white">{{ gem.priceQty.toFixed(3) }}</span>
              </div>
              <div class="d-flex flex-column">
                <span class="title-text-white">{{ $t('view.stock.gem.pricePerWeight') }}</span>
                <span class="desc-text-white">{{ gem.price.toFixed(3) }}</span>
              </div>
              <div class="d-flex flex-column">
                <span class="title-text-white">{{ $t('view.stock.gem.unit') }}</span>
                <span class="desc-text-white">{{ gem.unitCode }}</span>
              </div>
              <div class="d-flex flex-column">
                <span class="title-text-white">{{ $t('view.stock.gem.unitCode') }}</span>
                <span class="desc-text-white">{{ gem.unit }}</span>
              </div>
            </div>
          </div>
        </div>
        <form @submit.prevent="submit">
          <div class="filter-container mt-2">
            <div class="title-text-lg">
              <span class="mr-2"><i class="bi bi-journal-text"></i></span>
              <span>{{ $t('view.stock.gem.newPriceTitle') }}</span>
            </div>
            <div class="form-col-container">
              <!-- price -->
              <div>
                <div>
                  <span class="title-text">{{ $t('view.stock.gem.pricePerQty') }}</span>
                  <span class="txt-required"> *</span>
                </div>
                <input
                  :class="['form-control', form.priceQty > 0 ? 'input-filled' : '']"
                  type="number"
                  step="any"
                  min="0"
                  required
                  v-model="form.priceQty"
                  @blur="onbluePriceQty($event, form)"
                />
              </div>

              <!-- price qty -->
              <div>
                <div>
                  <span class="title-text">{{ $t('view.stock.gem.pricePerWeight') }}</span>
                  <span class="txt-required"> *</span>
                </div>
                <input
                  :class="['form-control', form.price > 0 ? 'input-filled' : '']"
                  type="number"
                  step="any"
                  min="0"
                  required
                  v-model="form.price"
                  @blur="onbluePrice($event, form)"
                />
              </div>

              <!-- unit code -->
              <div>
                <div>
                  <span class="title-text">{{ $t('view.stock.gem.unit') }}</span>
                  <span class="txt-required"> *</span>
                </div>
                <input
                  :class="['form-control', form.unitCode > 0 ? 'input-filled' : '']"
                  type="text"
                  required
                  v-model="form.unitCode"
                />
              </div>

              <!-- unit -->
              <div>
                <div>
                  <span class="title-text">{{ $t('view.stock.gem.unitCode') }}</span>
                  <span class="txt-required"> *</span>
                </div>
                <DropdownGeneric
                  v-model="form.unit"
                  :options="unitCodeOptions"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  :showClear="form.unit ? true : false"
                  :class="val.isUnit === true ? `p-invalid` : ``"
                />
              </div>
            </div>
            <div class="d-flex justify-content-end mt-2">
              <button class="btn btn-sm btn-main" type="submit">
                <span class="mr-2 mt-1">
                  <i class="bi bi-cash-coin"></i>
                </span>
                <span>{{ $t('view.stock.gem.adjustPrice') }}</span>
              </button>
            </div>
          </div>
        </form>
        <div class="filter-container-highlight mt-2">
          <div class="form-col-container">
            <span class="desc-text-white">{{ $t('view.stock.gem.priceHistory') }}</span>
          </div>
        </div>
        <div class="form-col-container">
          <BaseDataTable
            :items="history.data"
            :totalRecords="history.total"
            :columns="priceHistoryColumns"
            :perPage="20"
            :paginator="false"
          >
            <template #createDateTemplate="{ data: row }">
              <span>{{ formatDateTime(row.createDate) }}</span>
            </template>
            <template #previousPriceTemplate="{ data: row }">
              <span>{{ row.previousPriceUnit.toFixed(3) }}</span>
            </template>
            <template #newPriceTemplate="{ data: row }">
              <span>{{ row.newPriceUnit.toFixed(3) }}</span>
            </template>
            <template #previousPriceUnitTemplate="{ data: row }">
              <span>{{ row.previousPrice.toFixed(3) }}</span>
            </template>
            <template #newPriceUnitTemplate="{ data: row }">
              <span>{{ row.newPrice.toFixed(3) }}</span>
            </template>
          </BaseDataTable>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { success } from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

const interfaceForm = {
  price: Number(0).toFixed(3),
  priceQty: Number(0).toFixed(3)
}
const interfaceVal = {
  isUnit: false
}

export default {
  components: {
    modal,
    DropdownGeneric,
    BaseDataTable
  },
  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelGem: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  computed: {
    isShowModal() {
      return this.isShow
    },
    gem() {
      return this.modelGem
    },
    priceHistoryColumns() {
      return [
        { field: 'createDate', header: this.$t('view.stock.gem.priceHistoryDate'), minWidth: '150px', sortable: false },
        { field: 'previousPrice', header: this.$t('view.stock.gem.priceHistoryPrevQty'), minWidth: '100px', sortable: false },
        { field: 'newPrice', header: this.$t('view.stock.gem.priceHistoryNewQty'), minWidth: '100px', sortable: false },
        { field: 'previousPriceUnit', header: this.$t('view.stock.gem.priceHistoryPrevWeight'), minWidth: '100px', sortable: false },
        { field: 'newPriceUnit', header: this.$t('view.stock.gem.priceHistoryNewWeight'), minWidth: '100px', sortable: false },
        { field: 'unitCode', header: this.$t('view.stock.gem.unit'), minWidth: '100px' },
        { field: 'unit', header: this.$t('view.stock.gem.unitCode'), minWidth: '100px' }
      ]
    },
    unitCodeOptions() {
      return [
        { value: 'Q', description: this.$t('view.stock.gem.unitQty') },
        { value: 'K', description: this.$t('view.stock.gem.unitWeight') }
      ]
    }
  },
  watch: {
    modelGem: {
      handler() {
        this.fetchHistory(this.modelGem.code)
        this.initForm()
      },
      deep: true
    },

    'form.unit'() {
      if (this.form.unit) {
        this.val.isUnit = false
      }
    }
  },
  data() {
    return {
      history: {},
      form: { ...interfaceForm },
      val: { ...interfaceVal }
    }
  },
  methods: {
    // ----- event
    closeModal() {
      this.$emit('closeModal')
    },
    onbluePrice(event, item) {
      item.price = Number(event.target.value).toFixed(3)
    },
    onbluePriceQty(event, item) {
      item.priceQty = Number(event.target.value).toFixed(3)
    },
    submit() {
      if (this.validateForm()) {
        this.onSubmit()
      }
    },
    initForm() {
      this.form = {
        price: this.gem.price.toFixed(3),
        priceQty: this.gem.priceQty.toFixed(3),
        unitCode: this.gem.unitCode,
        unit: this.gem.unit ? this.unitCodeOptions.find((x) => x.value === this.gem.unit) : ''
      }
      this.val = { ...interfaceVal }
    },

    // ------ APIs
    async fetchHistory(code) {
      const params = {
        take: 20,
        skip: 0,
        sort: null,
        search: {
          code: code
        }
      }
      const res = await api.jewelry.post('StockGem/PriceHistory', params)
      if (res) {
        this.history = { ...res }
      }
    },
    async onSubmit() {
      const params = {
        id: this.gem.id,
        code: this.gem.code,

        newPrice: this.form.price,
        newPriceUnit: this.form.priceQty,
        unit: this.form.unit.value,
        unitCode: this.form.unitCode
      }
      const res = await api.jewelry.post('StockGem/Price', params)
      if (res) {
        success('', '', () => {
          this.form = { ...interfaceForm }
          this.$emit('closeModal', 'fetch')
        })
      }
    },

    // ----- validate
    validateForm() {
      let isValid = true
      if (!this.form.unit) {
        this.val.isUnit = true
        isValid = false
      }
      return isValid
    },
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.input-filled {
  background-color: #b5dad4;
}
</style>
