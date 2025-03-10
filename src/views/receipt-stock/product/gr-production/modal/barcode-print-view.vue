<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-bg">
          <span><i class="bi bi-calendar-check-fill mr-2"></i></span>
          <span>บันทึกสินค้าสำเร็จ | เลือกสินค้าเพื่อพิมพ์ Barcode</span>
        </div>
        <div>
          <BaseDataTable
            scrollHeight="600px"
            dataKey="stockNumber"
            :items="stock"
            :columns="columns"
            :selectionMode="true"
            :itemsSelection="selectedItems"
            :preSelectedItems="itemsToPreSelect"
            @update:itemsSelection="updateSelection"
            :paginator="false"
          >
            <template #footer>
              <div class="d-flex justify-content-between items-center">
                <!-- status -->
                <div class="vertical-center-container">
                  <span class="title-text">
                    จำนวนรายการที่เลือก: {{ checkItemSelectedLength() }}
                  </span>
                  <span class="title-text ml-2 mr-2">|</span>
                  <span class="title-text" :class="[getStatusSeverity(isCheckPrinterService)]">
                    {{ getPrinterServiceStatus(isCheckPrinterService) }}
                  </span>
                </div>

                <!-- action -->
                <div>
                  <button class="btn btn-sm btn-dark" type="button" @click="closeModal">
                    <span class="bi bi-x"></span>
                  </button>
                  <button
                    :class="[
                      'btn btn-sm  ml-2',
                      checkItemSelectedLength() === 0 ? 'btn-secondary' : 'btn-main'
                    ]"
                    :disabled="checkItemSelectedLength() === 0"
                  >
                    <span class="bi bi-upc-scan"></span>
                  </button>
                </div>
              </div>
            </template>
          </BaseDataTable>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  components: {
    modal,
    BaseDataTable
  },

  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelStock: {
      type: Array,
      required: true,
      default: () => []
    }
  },

  watch: {
    isShow: {
      handler(val) {
        //console.log('isShow', val)
        this.isShowModal = val
      },
      immediate: true
    },
    modelStock: {
      handler(val) {
        if (val.length > 0) {
          this.stock = [...val]
          //this.itemsToPreSelect = [...val]
          this.selectedItems = [...val]
          //console.log('modelStock', val)
        }
      },
      immediate: true
    }
  },

  data() {
    return {
      isShowModal: false,
      isCheckPrinterService: false,

      stock: this.modelStock,
      selectedItems: [],
      itemsToPreSelect: [],
      selectionType: 'single',
      columns: [
        {
          field: 'stockNumber',
          header: 'เลขที่ผลิต',
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
          field: 'productNameEn',
          header: 'ชื่อสินค้า EN',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'productNameTh',
          header: 'ชื่อสินค้า TH',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'receiptNumber',
          header: 'เลขที่ตั้งรับ',
          sortable: false,
          minWidth: '150px'
        }
        // {
        //   field: 'receiptNumber',
        //   header: 'เลขที่ตั้งรับ',
        //   sortable: false,
        //   minWidth: '150px'
        // }
      ]
    }
  },

  methods: {
    onClear() {
      this.stock = []
      this.selectedItems = []
      this.itemsToPreSelect = []
    },

    closeModal() {
      this.$emit('closeModal')
      this.onClear()
    },

    updateSelection(newSelection) {
      this.selectedItems = newSelection
    },

    checkItemSelectedLength() {
      //console.log('item', item)
      if (this.selectedItems.length > 0) {
        return this.selectedItems.length
      }

      return 0
    },

    getPrinterServiceStatus(check) {
      let name = 'เครื่องพิมพ์'
      return `${name}${check ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'}`
    },
    getStatusSeverity(check) {
      return check ? 'box-status-success' : 'box-status-disable'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.box-status-success {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  font-size: 12px;
  background-color: #038387;
  width: 170px;
  height: 100%;
}
.box-status-disable {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  font-size: 12px;
  background-color: #ff4d4d;
  width: 170px;
  height: 100%;
}
</style>
