<template>
  <div class="form-custom-col-container">
    <!-- model bom -->
    <div class="filter-container">
      <div class="filter-container-highlight-custom pl-4">
        <div class="d-flex flex-column">
          <span class="desc-text text-white mb-1">รายการวัสดุแผนผลิต</span>
          <!-- <small>เเสดงข้อมูล เบิกผสมทองเเละเบิกวัถุดิบในกระบวนการคัดพลอย</small> -->
        </div>
        <div class="d-flex">
          <div class="text-white vertical-center-container">
            <span class="bi bi-clock mr-2"></span>
            <span v-if="modelBom">{{ formatDateTime(modelBom[0].createDate) }}</span>
            <span v-else class="ml-2">---</span>
          </div>
          <div class="text-white vertical-center-container ml-3">
            <span class="bi bi-pencil mr-2"></span>
            <span v-if="modelBom">{{ modelBom[0].createBy }}</span>
            <span v-else class="ml-2">---</span>
          </div>
        </div>
      </div>

      <!-- <div class="line"></div> -->
      <div class="base-datatable mt-2">
        <DataTable :value="groupBom" stripedRows showGridlines>
          <Column field="index" style="width: 10px">
            <template #body="slotProps">
              <span>{{ slotProps.data.index }}</span>
            </template>
          </Column>

          <Column field="displayName" header="รายการ">
            <template #body="slotProps">
              <div>
                <span>{{ slotProps.data.displayName }}</span>
              </div>
            </template>
          </Column>

          <Column field="qty" header="จำนวน" style="width: 130px">
            <template #body="slotProps">
              <span>{{ toFixed2(slotProps.data.quantity) }}</span>
            </template>
          </Column>

          <Column field="unit" style="width: 20px">
            <template #body="slotProps">
              <span>{{ slotProps.data.unit }}</span>
            </template>
          </Column>

          <Column field="price" header="ราคา" style="width: 130px">
            <template #body="slotProps">
              <span>{{ toFixed2(slotProps.data.price) }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- model transaction , save-->
    <div class="filter-container">
      <div class="bom-table-container">
        <div class="table-header">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex flex-column">
              <span class="title-text">สร้างวัสดุแผนผลิต</span>
              <small
                >เเสดงข้อมูลเบิกผสมทองเเละเบิกวัถุดิบในกระบวนการคัดพลอย
                สร้างวัสดุแผนผลิตเพื่อออกรายงาน</small
              >
            </div>
            <div>
              <button class="btn btn-sm btn-warning mr-2" @click="getBOM">
                <span>
                  <i class="bi bi-arrow-clockwise"></i>
                </span>
              </button>
              <button class="btn btn-sm btn-green" @click="saveBOM" :disabled="!hasTransactionData">
                <span>
                  <i class="bi bi-calendar-check"></i>
                </span>
              </button>
            </div>
          </div>
        </div>
        <div class="base-datatable">
          <DataTable :value="transactionBom" stripedRows showGridlines>
            <!-- <Column field="no" style="width: 10px">
              <template #body="slotProps">
                <span>{{ slotProps.data.no }}</span>
              </template>
            </Column> -->

            <!-- <Column field="action" style="width: 10px">
              <template #body="slotProps">
                <button
                  class="btn btn-sm btn-red"
                  type="button"
                  title="ลบ"
                  @click="delItem(slotProps.index)"
                >
                  <span class="bi bi-trash"></span>
                </button>
              </template>
            </Column> -->

            <Column field="displayName" header="รายการ">
              <template #body="slotProps">
                <div v-if="slotProps.data.type === 'Gem'">
                  <Dropdown
                    v-model="slotProps.data.matchCode"
                    :options="masterGem"
                    optionLabel="nameTh"
                    optionValue="code"
                    class="w-full md:w-14rem"
                    @update:modelValue="onMatchCodeChange($event, slotProps.data, slotProps.index)"
                  >
                  </Dropdown>
                </div>
                <div v-else>
                  <span>{{ slotProps.data.displayName }}</span>
                </div>
              </template>
            </Column>

            <Column field="originName" header="วัสดุ">
              <template #body="slotProps">
                <span>{{ slotProps.data.originName }}</span>
              </template>
            </Column>

            <Column field="qty" header="จำนวน" style="width: 130px">
              <template #body="slotProps">
                <input
                  style="background-color: #b5dad4"
                  v-model="slotProps.data.quantity"
                  type="number"
                  class="form-control text-right"
                  step="any"
                  min="0"
                  required
                  @blur="onBluePrice(slotProps.data, slotProps.index, 'quantity')"
                />
              </template>
            </Column>

            <Column field="unit" style="width: 20px">
              <template #body="slotProps">
                <div>
                  <span>{{ slotProps.data.unit }}</span>
                </div>
              </template>
            </Column>

            <Column field="price" header="ราคา" style="width: 130px">
              <template #body="slotProps">
                <input
                  style="background-color: #b5dad4"
                  v-model="slotProps.data.price"
                  type="number"
                  class="form-control text-right"
                  step="any"
                  min="0"
                  required
                  @blur="onBluePrice(slotProps.data, slotProps.index, 'price')"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate, formatDateTime } from '@/services/utils/dayjs'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { usePlanBOMApiStore } from '@/stores/modules/api/plan/plan-bom-store.js'
//import DataTableWithPaging from '@/components/prime-vue/DataTableWithPaging.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'

export default {
  name: 'plan-bom-view',
  components: {
    //DataTableWithPaging,
    DataTable,
    Column,
    Dropdown
  },

  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    modelMatValue: {
      type: Array,
      required: true,
      default: () => []
    },
    modelBomValue: {
      type: Array,
      required: true,
      default: () => {}
    },
    modelTransactionBomValue: {
      type: Object,
      required: true,
      default: () => {}
    }
  },

  setup() {
    const masterStore = useMasterApiStore()
    const planBOMStore = usePlanBOMApiStore()
    return { planBOMStore, masterStore }
  },

  watch: {
    modelBomValue: {
      handler(newVal) {
        //console.log('modelBomValue changed:', newVal)
        //group boms by type
        const grouped = newVal.reduce((acc, item) => {
          if (!acc[item.displayName]) {
            acc[item.displayName] = {
              index: 0,
              displayName: item.displayName,
              quantity: 0,
              price: 0,
              unit: item.unit
            }
          }
          acc[item.displayName].quantity += item.quantity || 0
          acc[item.displayName].price += item.price || 0
          return acc
        }, {})

        this.groupBom = Object.values(grouped).map((item, idx) => ({
          ...item,
          index: idx + 1
        }))

        //console.log('groupBom:', this.groupBom)
      },
      immediate: true
    },
    modelTransactionBomValue: {
      handler(newVal) {
        console.log('modelTransactionBomValue changed:', newVal)
        this.transactionBom = newVal.boMs.map((item, index) => ({
          ...item,
          quantity: item.quantity ? item.quantity.toFixed(2) : Number(0).toFixed(2),
          price: item.price ? item.price.toFixed(2) : Number(0).toFixed(2)
        }))
      },
      immediate: true
    }
  },

  computed: {
    model() {
      return this.modelValue
    },
    modelMat() {
      return this.modelMatValue
    },
    modelBom() {
      return this.modelBomValue
    },
    modelTransactionBom() {
      return this.modelTransactionBomValue
    },
    masterGem() {
      return this.masterStore.gem
    },
    hasTransactionData() {
      return this.transactionBom && this.transactionBom.length > 0
    }
  },

  data() {
    return {
      transactionBom: [],
      groupBom: []
    }
  },

  methods: {
    formatNumber(value) {
      if (!value) return '0'
      return new Intl.NumberFormat('th-TH').format(value)
    },

    formatCurrency(value) {
      if (!value) return '฿0.00'
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(value)
    },

    formatDate(date) {
      return date ? formatDate(date) : ''
    },
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },

    //tofix(2) แปลงเป็นทศนิยม 2 ตำแหน่ง
    toFixed2(value) {
      return value ? Number(value).toFixed(2) : '0.00'
    },

    onBluePrice(item, index, fieldName) {
      // แปลงค่าเป็นทศนิยม 3 ตำแหน่งเมื่อออกจาก input
      console.log('onBluePrice' + fieldName, item, index)

      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]).toFixed(2) : '0.00',
        totalPrice: Number(item.qty * item.qtyPrice + item.qtyWeight * item.qtyWeightPrice).toFixed(
          2
        )
      }

      // ในVue 3, เราสามารถอัปเดตได้โดยตรง
      this.transactionBom[index] = newCal

      console.log('onBluePrice' + fieldName, this.tranItems[item])
      console.log('onBluePrice' + fieldName, this.tranItems)
      //this.onUpdateQty(item)
    },
    onMatchCodeChange(newValue, rowData, rowIndex) {
      //console.log('onMatchCodeChange', newValue, rowData, rowIndex)
      const selectedGem = this.masterGem.find((gem) => gem.code === newValue)

      if (selectedGem) {
        this.transactionBom[rowIndex].matchCode = selectedGem.code
        this.transactionBom[rowIndex].matchName = selectedGem.nameEn
        this.transactionBom[rowIndex].displayName = selectedGem.nameTh
      }

      console.log('MatchCode changed:', rowData)
    },

    async getBOM() {
      const transactionBom = await this.planBOMStore.fetchTransaction({
        id: this.model.id,
        skipLoading: true
      })

      if (transactionBom) {
        this.transactionBom = transactionBom.boMs.map((item, index) => ({
          ...item,
          quantity: item.quantity ? item.quantity.toFixed(2) : Number(0).toFixed(2),
          price: item.price ? item.price.toFixed(2) : Number(0).toFixed(2)
        }))
      }
    },

    // --- BOM Save Method --- //
    async saveBOM() {
      try {
        const formValue = {
          id: this.model.id,
          bOMs: this.transactionBom.map((item) => ({
            type: item.type,

            matchCode: item.matchCode,
            matchName: item.matchName,

            displayName: item.displayName,

            originCode: item.originCode,
            originName: item.originName,

            quantity: parseFloat(item.quantity) || 0,
            unit: item.unit,
            price: parseFloat(item.price) || 0
          }))
        }

        const response = await this.planBOMStore.fetchSave({
          formValue: formValue,
          skipLoading: true
        })

        if (response) {
          this.$emit('bomSaved', response)
          //console.log('BOM saved successfully:', response)
        }
      } catch (error) {
        console.error('Error saving BOM:', error)
      }
    },

    delItem(index) {
      this.transactionBom.splice(index, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/overide-prime-vue/data-table-dub.scss';

.filter-container-highlight-custom {
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: var(--base-font-color);
  padding: 10px;
}

.form-custom-col-container {
  display: grid;
  gap: 10px;
  padding: 0px;
  grid-template-columns: 2fr 3fr;
  height: calc(100vh - 220px);
}

.bom-table-container {
  height: calc(100vh - 350px);
  overflow-y: auto;
}

.table-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
  padding: 10px 0;
  border-bottom: 1px solid #dee2e6;
}

.summary-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .card-body {
    padding: 1rem;
    text-align: center;
  }

  .card-title {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
  }
}

.bom-summary {
  margin-top: 1rem;
}

.btn-custom {
  min-width: 100px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.table {
  font-size: 0.875rem;

  th,
  td {
    vertical-align: middle;
    padding: 0.5rem;
  }

  .text-end {
    text-align: right;
  }
}

.spinner-border {
  width: 2rem;
  height: 2rem;
}
</style>
