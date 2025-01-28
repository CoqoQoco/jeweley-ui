<template>
  <div class="app-container">
    <div class="filter-container-highlight">
      <div class="form-col-container">
        <div class="d-flex justify-content-between">
          <span class="desc-text-white">
            {{
              `รับสินค้างานผลิต แผนผลิตเลขที่ [ W.O. ] : 
              ${data.wo ? `${data.wo}-${data.woNumber}` : 'loading...'}`
            }}
          </span>
        </div>
      </div>
    </div>

    <div class="form-col-container">
      <BaseDataTable :items="header" :columns="headerColumns" :paginator="false">
        <template #productQtyTemplate="{ data }">
          <div class="d-flex justify-content-end p-1">
            <span>{{ data.qtyRunning }}</span>
            <span>/</span>
            <span>{{ data.productQty }}</span>
          </div>
        </template>
      </BaseDataTable>
    </div>

    <div class="line mt-4 mb-4"></div>

    <div class="filter-container-highlight">
      <div class="form-col-container">
        <div class="desc-text-white d-flex justify-content-between">
          <div>
            <span class="bi bi-box-arrow-in-down mr-2"></span>
            <span>รายการสินค้ารับเข้าคลัง</span>
          </div>
          <div>
            <span>{{ `จำนวนรับเเล้ว ${data.qtyRunning}/${data.productQty}` }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="form-col-container">
      <uploadImages
        title="รูปสินค้า"
        @onUpdateFile="updateFile"
        @btnClearRef="setBtnClearRef"
      ></uploadImages>
    </div>

    <div class="form-col-container">
      <form>
        <BaseDataTable
          :items="form"
          dataKey="stockNumber"
          :columns="formColumns"
          :paginator="false"
          :selectionMode="true"
          :itemsSelection="selectedItems"
          @update:itemsSelection="updateSelection"
          :disabledItems="itemsToDisable"
          :preSelectedItems="itemsToPreSelect"
        >
          <template #productNumberTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getbgColor(data.isReceipt, data.productNumber)"
                type="text"
                v-model="data.productNumber"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #productNameTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getbgColor(data.isReceipt, data.productName)"
                type="text"
                v-model="data.productName"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #productQtyTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getbgColor(data.isReceipt, data.productQty)"
                type="Number"
                step="any"
                min="0"
                v-model="data.productQty"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #sizeTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getbgColor(data.isReceipt, data.size)"
                type="text"
                v-model="data.size"
                :disabled="data.isReceipt"
              />
            </div>
          </template>

          <template #goldTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getbgColor(data.isReceipt, data.gold)"
                type="text"
                v-model="data.gold"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #diamondTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getbgColor(data.isReceipt, data.diamond)"
                type="text"
                v-model="data.diamond"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #gemTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getbgColor(data.isReceipt, data.gem)"
                type="text"
                v-model="data.gem"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #locationTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getbgColor(data.isReceipt, data.location)"
                type="text"
                v-model="data.location"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #priceTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getbgColor(data.isReceipt, data.price)"
                type="Number"
                step="any"
                min="0"
                v-model="data.price"
                :required="isRequiredField(data)"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #remarkTemplate="{ data }">
            <div class="d-flex justify-content-center">
              <input
                v-if="!data.isReceipt"
                class="form-control form-control-sm"
                :style="getbgColor(data.isReceipt, data.remark)"
                type="text"
                v-model="data.remark"
                :disabled="data.isReceipt"
              />
              <span v-else>{{ data.productNumber }}</span>
            </div>
          </template>

          <template #footer>
            <div class="d-flex justify-content-between items-center">
              <span>จำนวนรายการที่เลือก: {{ checkItemSelectedLength(form) }}</span>
              <div>
                <button class="btn btn-sm btn-main">บันทึก</button>
              </div>
            </div>
          </template>
        </BaseDataTable>
      </form>
    </div>
  </div>
</template>

<script>
//import { defineAsyncComponent } from 'vue'
//const uploadImages = defineAsyncComponent(() => import('@/components/prime-vue/UploadImages.vue'))

import { useReceiptProductionApiStore } from '@/stores/modules/api/receipt/receipt-production-api.js'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import uploadImages from '@/components/prime-vue/UploadImages.vue'

export default {
  name: 'ProductionPlanList',

  components: {
    BaseDataTable,
    uploadImages
  },

  setup() {
    const receiptProductionStore = useReceiptProductionApiStore()
    return { receiptProductionStore }
  },

  data() {
    return {
      param: {},
      data: {},
      header: [],
      form: [],

      selectedItems: [],
      itemsToDisable: [], // items ที่ต้องการ disable
      itemsToPreSelect: [], // items ที่ต้องการให้ติ๊กถูกไว้ตั้งแต่แรก

      headerColumns: [
        {
          field: 'receiptNumber',
          header: 'เลขที่ตั้งรับสินค้า',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'receiptDate',
          header: 'วันที่ผลิตสำเร็จ',
          sortable: false,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'mold',
          header: 'เเม่พิมพ์',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productTypeName',
          header: 'ประเภทสินค้า',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'gold',
          header: 'สีของทอง/เงิน',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'goldSize',
          header: 'ประเภททอง/เงิน',
          sortable: false,
          minWidth: '150px'
        }
      ],
      formColumns: [
        {
          field: 'no',
          header: 'ลำดับ',
          sortable: false,
          width: '50px'
        },

        //เลขที่ผลิต
        {
          field: 'stockNumber',
          header: 'รหัสตั้งรับสินค้า',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productName',
          header: 'ชื่อสินค้า',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productQty',
          header: 'จำนวน',
          sortable: false,
          minWidth: '100px'
        },
        {
          field: 'size',
          header: 'ไซส์',
          sortable: false,
          minWidth: '100px'
        },
        {
          field: 'gold',
          header: 'น้้ำหนักทอง',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'diamond',
          header: 'น้้ำหนักเพชร',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'gem',
          header: 'น้้ำหนักพลอย',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'location',
          header: 'คลังจัดเก็บ',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'price',
          header: 'ราคาขาย',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'remark',
          header: 'หมายเหตุ',
          sortable: false,
          minWidth: '150px'
        }
      ],

      btnClearImg: null,
      images: []
    }
  },

  methods: {
    async fetchData() {
      this.data = await this.receiptProductionStore.fetchDataGetPlan({
        formValue: this.param
      })

      //init header
      this.header.push(this.data)
      this.form = [...this.data.receiptStocks]
      this.itemsToDisable = this.form.filter((item) => item.isReceipt)
      this.itemsToPreSelect = this.form.filter((item) => item.isReceipt)
    },

    setBtnClearRef(ref) {
      this.btnClearImg = ref
      console.log('setBtnClearRef', this.btnClearImg)
    },
    updateFile(files) {
      this.images = files
    },

    getbgColor(isReceipt, data) {
      if (isReceipt) {
        return 'background-color: #e0e0e0'
      } else if (data) {
        return 'background-color: #b5dad4'
      } else {
        return 'background-color: #dad4b5'
      }
    },
    checkItemSelectedLength(item) {
      console.log('item', item)
      return item.filter(
        (item) =>
          !item.isReceipt &&
          this.selectedItems.some(
            (selected) => selected.stockNumber === item.stockNumber // หรือใช้ field อื่นที่เป็น unique identifier
          )
      ).length
    },
    isRequiredField(data) {
      return (
        !data.isReceipt &&
        this.selectedItems.some((selected) => selected.stockNumber === data.stockNumber)
      )
    },

    updateSelection(newSelection) {
      this.selectedItems = newSelection
    }
  },

  created() {
    this.$nextTick(() => {
      this.param = {
        running: this.$route.params.id
      }
      console.log('this.param', this.param)
      this.fetchData()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form';

.form-control {
  font-size: 50px;
}
</style>
