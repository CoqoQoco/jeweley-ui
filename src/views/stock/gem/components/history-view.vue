<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="filter-container-highlight">
          <div class="form-col-container">
            <div class="d-flex justify-content-between">
              <span class="desc-text-white">
                {{ `ประวัติเพชร/พลอย: ${gem.name ?? 'loading...'}` }}
              </span>
              <span class="mr-5 desc-text-white">{{ `${take} รายการล่าสุด` }}</span>
            </div>
          </div>
        </div>

        <div class="form-col-container p-2">
          <DataTable
            :totalRecords="history.total"
            :value="history.data"
            dataKey="id"
            ref="dt"
            class="p-datatable-sm"
            scrollHeight="calc(100vh - 200px)"
            scrollable
            resizableColumns
            showGridlines
          >
            <Column field="requestDate" header="วันทำรายการ (ล่าสุด)" style="min-width: 200px">
              <template #body="slotProps">
                {{ formatDateTime(slotProps.data.requestDate) }}
              </template>
            </Column>
            <Column field="running" header="เลขที่รายการ" style="min-width: 200px"> </Column>
            <Column field="refRunning1" header="เลขที่อ้างอิง 1" style="min-width: 200px"> </Column>
            <Column field="refRunning2" header="เลขที่อ้างอิง 2" style="min-width: 200px"> </Column>
            <!-- <Column field="name" header="พลอย/เพชร" style="min-width: 200px"> </Column> -->
            <Column field="type" header="ประเภท" style="min-width: 200px">
              <template #body="slotProps">
                <div>
                  <span><i class="mr-1" :class="getIconQty(slotProps.data.type)"></i></span>
                  <span>
                    {{ getTypeName(slotProps.data.type) }}
                  </span>
                </div>
              </template>
            </Column>
            <Column field="qty" header="จำนวน" style="min-width: 200px">
              <template #body="slotProps">
                <div>
                  <span><i class="mr-1" :class="getIconQty(slotProps.data.type)"></i></span>
                  <span>
                    {{
                      slotProps.data.qty
                        ? Number(slotProps.data.qty).toFixed(3).toLocaleString()
                        : '0.000'
                    }}
                  </span>
                </div>
              </template>
            </Column>
            <Column field="qtyWeight" header="น้ำหนัก" style="min-width: 200px">
              <template #body="slotProps">
                <div>
                  <span><i class="mr-1" :class="getIconQty(slotProps.data.type)"></i></span>
                  <span>
                    {{
                      slotProps.data.qtyWeight
                        ? Number(slotProps.data.qtyWeight).toFixed(3).toLocaleString()
                        : '0.000'
                    }}
                  </span>
                </div>
              </template>
            </Column>
            <Column
              field="previousRemianQty"
              header="จำนวนก่อนใช้"
              sortable
              style="min-width: 200px"
            >
              <template #body="slotProps">
                <div>
                  <span>
                    {{
                      slotProps.data.previousRemianQty
                        ? Number(slotProps.data.previousRemianQty).toFixed(3).toLocaleString()
                        : '0.000'
                    }}
                  </span>
                </div>
              </template>
            </Column>
            <Column
              field="previousRemianQtyWeight"
              header="น้ำหนักก่อนใช้"
              sortable
              style="min-width: 200px"
            >
              <template #body="slotProps">
                <div>
                  <span>
                    {{
                      slotProps.data.previousRemianQtyWeight
                        ? Number(slotProps.data.previousRemianQtyWeight).toFixed(3).toLocaleString()
                        : '0.000'
                    }}
                  </span>
                </div>
              </template>
            </Column>
            <Column field="pointRemianQty" header="จำนวนคงเหลือ" style="min-width: 200px">
              <template #body="slotProps">
                <div>
                  <span>
                    {{
                      slotProps.data.pointRemianQty
                        ? Number(slotProps.data.pointRemianQty).toFixed(3).toLocaleString()
                        : '0.000'
                    }}
                  </span>
                </div>
              </template>
            </Column>
            <Column
              field="pointRemianQtyWeight"
              header="น้ำหนักคงเหลือ"
              sortable
              style="min-width: 200px"
            >
              <template #body="slotProps">
                <div>
                  <span>
                    {{
                      slotProps.data.pointRemianQtyWeight
                        ? Number(slotProps.data.pointRemianQtyWeight).toFixed(3).toLocaleString()
                        : '0.000'
                    }}
                  </span>
                </div>
              </template>
            </Column>

            <Column field="woText" header="W.O." style="min-width: 200px"> </Column>
            <Column field="mold" header="เเม่พิมพ์" style="min-width: 200px"> </Column>
            <Column field="remark1" header="หมายเหตุ-1" style="min-width: 200px"> </Column>
            <Column field="remark2" header="หมายเหตุ-2" style="min-width: 200px"> </Column>

            <Column field="jobOrPo" header="Invoice/Ref No." style="min-width: 200px"> </Column>
            <Column field="subpplierName" header="ร้านผลิต/ชื่อร้าน" style="min-width: 200px">
            </Column>
            <Column field="supplierCost" header="ราคาทุน" style="min-width: 200px">
              <template #body="slotProps">
                <div>
                  <span>
                    {{
                      slotProps.data.supplierCost
                        ? Number(slotProps.data.supplierCost).toFixed(2).toLocaleString()
                        : '0.000'
                    }}
                  </span>
                </div>
              </template>
            </Column>

            <Column field="code" header="รหัส" style="min-width: 200px"> </Column>
            <Column field="groupName" header="หมวดหมู่" style="min-width: 200px"> </Column>
            <Column field="size" header="ขนาด" style="min-width: 200px"> </Column>
            <Column field="shape" header="รูปร่าง" style="min-width: 200px"> </Column>
            <Column field="grade" header="เกรด" style="min-width: 200px"> </Column>
            <Column field="price" header="ราคา" style="min-width: 150px">
              <template #body="slotProps">
                {{
                  slotProps.data.price
                    ? Number(slotProps.data.price).toFixed(3).toLocaleString()
                    : '0.00'
                }}
              </template>
            </Column>
            <Column field="priceQty" header="ราคาต่อหน่วย" style="min-width: 150px">
              <template #body="slotProps">
                {{
                  slotProps.data.priceQty
                    ? Number(slotProps.data.priceQty).toFixed(3).toLocaleString()
                    : '0.00'
                }}
              </template>
            </Column>
            <Column field="unitCode" header="หน่วย" style="min-width: 150px"> </Column>
            <Column field="unit" header="รหัสหน่วย" style="min-width: 150px"> </Column>
          </DataTable>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

//import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
//import Papa from 'papaparse'

//import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

export default {
  components: {
    modal,
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
        //this.initForm()
      },
      deep: true
    }
  },
  data() {
    return {
      isLoading: false,
      history: {},
      masterType: [
        { id: 1, description: 'รับเข้าคลัง [พลอยใหม่]' },
        { id: 2, description: 'รับเข้าคลัง [พลอยนอกสต๊อก]' },
        { id: 3, description: 'รับเข้าคลัง [พลอยคืน]' },
        { id: 4, description: 'จ่ายออกคลัง' },
        { id: 5, description: 'ยืมออกคลัง' },
        { id: 6, description: 'คืนเข้าคลัง' },
        { id: 7, description: 'เบิกออกคลัง' }
      ],
      sort: [
        {
          field: 'requestDate',
          dir: 'desc'
        }
      ],
      take: 100
    }
  },
  methods: {
    // ----- event
    closeModal() {
      this.$emit('closeModal')
    },

    // ------ APIs
    async fetchHistory() {
      this.isLoading = true
      try {
        const params = {
          take: this.take,
          skip: 0,
          sort: this.sort,
          search: {
            requestDateStart: null,
            requestDateEnd: null,
            type: null,

            code: this.gem.code ?? null,
            groupName: null,
            grade: null,
            shape: null,
            size: null,
            status: ['completed']
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('ReceiptAndIssueStockGem/ListTransection', params)
        if (res) {
          this.history = { ...res }
        }
      } catch (error) {
        console.log(error)
      }
      this.isLoading = false
    },

    // ----- helper
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },
    getTypeName(type) {
      return this.masterType.find((item) => item.id === type)?.description
    },
    getIconQty(type) {
      switch (type) {
        case 1:
        case 2:
        case 3:
        case 6:
          return 'bi bi-arrow-down-square-fill text-success'
        case 4:
        case 7:
          return 'bi bi-arrow-up-square-fill text-danger'
        case 5:
          return 'bi bi-arrow-right-square-fill text-secondary'
        default:
          return ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
