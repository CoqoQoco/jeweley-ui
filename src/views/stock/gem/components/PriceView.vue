<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="filter-container-highlight">
          <div class="form-col-container">
            <span class="desc-text-white">{{ `ราคาเพชร/พลอย: ${gem.name ?? 'loading...'}` }}</span>
            <!-- <span class="desc-text-white"> ณ วันที่</span> -->
          </div>
          <div class="form-col-container mt-1">
            <div class="form-col-container">
              <div class="d-flex flex-column">
                <span class="title-text-white">ราคา</span>
                <span class="desc-text-white">{{ gem.price.toFixed(3) }}</span>
              </div>
              <div class="d-flex flex-column">
                <span class="title-text-white">ราคาต่อหน่วย</span>
                <span class="desc-text-white">{{ gem.priceQty.toFixed(3) }}</span>
              </div>
              <div class="d-flex flex-column">
                <span class="title-text-white">หน่วย</span>
                <span class="desc-text-white">{{ gem.unitCode }}</span>
              </div>
              <div class="d-flex flex-column">
                <span class="title-text-white">รหัสหน่วย</span>
                <span class="desc-text-white">{{ gem.unit }}</span>
              </div>
            </div>
          </div>
        </div>
        <form @submit.prevent="submit">
          <div class="filter-container mt-2">
            <div class="title-text-lg">
              <span class="mr-2"><i class="bi bi-journal-text"></i></span>
              <span>ราคาใหม่</span>
            </div>
            <div class="form-col-container">
              <!-- price -->
              <div>
                <div>
                  <span class="title-text">ราคา</span>
                  <span class="txt-required"> *</span>
                </div>
                <input
                  :style="form.price > 0 ? 'background-color: #b5dad4' : ''"
                  class="form-control"
                  type="number"
                  step="any"
                  min="0"
                  required
                  v-model="form.price"
                  @blur="onbluePrice($event, form)"
                />
              </div>

              <!-- price qty -->
              <div>
                <div>
                  <span class="title-text">ราคาต่อหน่วย</span>
                  <span class="txt-required"> *</span>
                </div>
                <input
                  :style="form.priceQty > 0 ? 'background-color: #b5dad4' : ''"
                  class="form-control"
                  type="number"
                  step="any"
                  min="0"
                  required
                  v-model="form.priceQty"
                  @blur="onbluePriceQty($event, form)"
                />
              </div>

              <!-- unit code -->
              <div>
                <div>
                  <span class="title-text">หน่วย</span>
                  <span class="txt-required"> *</span>
                </div>
                <input
                  :style="form.unitCode > 0 ? 'background-color: #b5dad4' : ''"
                  class="form-control"
                  type="text"
                  required
                  v-model="form.unitCode"
                />
              </div>

              <!-- unit -->
              <div>
                <div>
                  <span class="title-text">รหัสหน่วย</span>
                  <span class="txt-required"> *</span>
                </div>
                <Dropdown
                  v-model="form.unit"
                  :options="unitCode"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  :showClear="form.unit ? true : false"
                  :class="val.isUnit === true ? `p-invalid` : ``"
                >
                </Dropdown>
              </div>
            </div>
            <div class="d-flex justify-content-end mt-2">
              <!-- <button class="btn btn-sm btn-main mr-2" type="button" @click="onTest">TEST</button> -->
              <button class="btn btn-sm btn-main" type="submit">
                <span class="mr-2 mt-1">
                  <i class="bi bi-cash-coin"></i>
                </span>
                <span>ปรับราคา</span>
              </button>
            </div>
          </div>
        </form>
        <div class="filter-container-highlight mt-2">
          <div class="form-col-container">
            <span class="desc-text-white">ประวัติราคา</span>
          </div>
        </div>
        <div class="form-col-container">
          <DataTable
            :totalRecords="history.total"
            :value="history.data"
            dataKey="id"
            ref="dt"
            class="p-datatable-sm"
            scrollable
            scrollHeight="calc(100vh - 280px)"
            resizableColumns
            showGridlines
          >
            <Column field="createDate" header="วันที่" style="min-width: 150px">
              <template #body="slotProps">
                <span>{{ formatDateTime(slotProps.data.createDate) }}</span>
              </template>
            </Column>
            <Column field="previousPrice" header="ราคาก่อนปรับ" style="min-width: 100px">
              <template #body="slotProps">
                <span>{{ slotProps.data.previousPrice.toFixed(3) }}</span>
              </template>
            </Column>
            <Column field="newPrice" header="ราคาหลังปรับ" style="min-width: 100px">
              <template #body="slotProps">
                <span>{{ slotProps.data.newPrice.toFixed(3) }}</span>
              </template>
            </Column>
            <Column field="previousPriceUnit" header="ราคาต่อหน่วย" style="min-width: 100px">
              <template #body="slotProps">
                <span>{{ slotProps.data.previousPriceUnit.toFixed(3) }}</span>
              </template>
            </Column>
            <Column field="newPriceUnit" header="ราคาต่อหน่วย" style="min-width: 100px">
              <template #body="slotProps">
                <span>{{ slotProps.data.newPriceUnit.toFixed(3) }}</span>
              </template>
            </Column>
            <Column field="unitCode" header="หน่วย" style="min-width: 100px"></Column>
            <Column field="unit" header="รหัสหน่วย" style="min-width: 100px"></Column>
          </DataTable>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
//import Papa from 'papaparse'

import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-config.js'
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
    loading,
    Dropdown,
    DataTable,
    Column
    //Papa
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
      isLoading: false,
      history: {},
      form: { ...interfaceForm },
      val: { ...interfaceVal },
      unitCode: [
        { value: 'K', description: 'K [ราคา]' },
        { value: 'Q', description: 'Q [ราคาต่อหน่วย]' }
      ]
    }
  },
  methods: {
    // ----- event
    closeModal() {
      this.$emit('closeModal')
    },
    onbluePrice(event, item) {
      item.price = Number(event.target.value).toFixed(3)
      console.log('onbluePrice', item)
    },
    onbluePriceQty(event, item) {
      item.priceQty = Number(event.target.value).toFixed(3)
      console.log('PriceQty', item)
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
        unit: this.gem.unit ? this.unitCode.find((x) => x.value === this.gem.unit) : ''
      }
      this.val = { ...interfaceVal }
    },

    // ------ APIs
    async fetchHistory(code) {
      this.isLoading = true
      try {
        const params = {
          take: 20,
          skip: 0,
          sort: null,
          search: {
            code: code
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('StockGem/PriceHistory', params)
        if (res) {
          this.history = { ...res }
        }
        console.log('this.history', this.history)
      } catch (error) {
        console.log(error)
      }
      this.isLoading = false
    },
    async onSubmit() {
      try {
        this.isLoading = true

        console.log('this.form', this.form)
        const params = {
          id: this.gem.id,
          code: this.gem.code,

          newPrice: this.form.price,
          newPriceUnit: this.form.priceQty,
          unit: this.form.unit.value,
          unitCode: this.form.unitCode
        }
        console.log('params', params)
        const res = await api.jewelry.post('StockGem/Price', params)
        if (res) {
          swAlert.success(
            ``,
            '',
            () => {
              this.form = { ...interfaceForm }
              this.$emit('closeModal', 'fetch')
            },
            null,
            null
          )
        }
      } catch (error) {
        console.log(error)
      }
      this.isLoading = false
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

<style lang="scss" scoped></style>
