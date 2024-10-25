<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <div>
      <!-- ใบเบิก -->
      <div class="filter-container-highlight">
        <div class="form-col-container">
          <div class="d-flex justify-content-between">
            <span class="desc-text-white">
              {{ `ใบคืน/ใบเบิก จาก ใบยืมเลขที่: ${model.running ?? 'loading...'}` }}
            </span>
            <pdf class="btn btn-sm btn-primary" :modelValue="model"></pdf>
          </div>
        </div>
        <div class="form-col-container mt-1">
          <div class="d-flex flex-column">
            <span class="title-text-white">วันที่ยืม</span>
            <span class="desc-text-white">{{ formatDateTime(model.requestDate) }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text-white">กำหนดคืน</span>
            <span class="desc-text-white">{{ formatDateTime(model.returnDate) }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text-white">ผู้ยืม</span>
            <span class="desc-text-white">{{ model.operatorBy }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text-white">หมายเหตุ</span>
            <span class="desc-text-white">{{ model.remark }}</span>
          </div>
        </div>
      </div>
      <div class="form-col-container">
        <DataTable
          :value="model.items"
          dataKey="id"
          ref="dt"
          class="p-datatable-sm"
          stripedRows
          columnResizeMode="fit"
          showGridlines
        >
          <!-- <Column field="no" header="ลำดับ" style="width: 20px"> </Column> -->
          <Column field="no" header="ลำดับ" style="width: 10px"> </Column>
          <Column field="name" header="พลอย/เพชร" style="min-width: 200px"> </Column>
          <Column field="qty" header="จำนวน" sortable style="min-width: 200px">
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
          <Column field="qtyWeight" header="น้ำหนัก" sortable style="min-width: 200px">
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

          <Column field="code" header="รหัส" sortable style="min-width: 200px"> </Column>
          <Column field="groupName" header="หมวดหมู่" sortable style="min-width: 200px"> </Column>
          <Column field="size" header="ขนาด" sortable style="min-width: 200px"> </Column>
          <Column field="shape" header="รูปร่าง" sortable style="min-width: 200px"> </Column>
          <Column field="grade" header="เกรด" sortable style="min-width: 200px"> </Column>

          <Column field="remark2" header="หมายเหตุ-2" sortable style="min-width: 200px"> </Column>
        </DataTable>
      </div>

      <div class="line mt-4 mb-4"></div>

      <!-- ใบคืน -->
      <div class="filter-container-highlight">
        <div class="form-col-container">
          <div class="desc-text-white">
            <span class="bi bi-arrow-bar-down mr-2"></span>
            <span>รายการคืนเข้าคลัง</span>
          </div>
        </div>
      </div>
      <form @submit.prevent="onSubmit">
        <div class="form-col-container">
          <DataTable
            :value="gemsReturn"
            class="p-datatable-sm"
            showGridlines
            v-model:expandedRows="expandedRows"
            @rowExpand="onRowExpand"
            @rowCollapse="onRowCollapse"
          >
            <Column expander style="width: 1px; padding: 0px" />
            <Column style="width: 50px">
              <template #body="slotProps">
                <div class="d-flex justify-content-center">
                  <button
                    class="btn btn-sm btn-green"
                    title="เบิก"
                    type="button"
                    @click="addOutbound(slotProps.data, slotProps.index)"
                  >
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </template>
            </Column>
            <Column field="no" header="ลำดับ" style="width: 10px"> </Column>
            <Column field="code" header="รหัส" style="width: 120px"> </Column>
            <Column field="name" header="พลอย/เพชร" style="min-width: 200px"> </Column>
            <Column field="pickOffQty" header="จำนวนยืม" style="width: 120px">
              <template #body="slotProps">
                <div>
                  <span><i class="mr-1" :class="getIconQty(5)"></i></span>
                  <span>
                    {{
                      slotProps.data.pickOffQty
                        ? Number(slotProps.data.pickOffQty).toFixed(3).toLocaleString()
                        : '0.000'
                    }}
                  </span>
                </div>
              </template>
            </Column>
            <Column field="pickOffQtyWeight" header="น้ำหนักยืม" style="width: 120px">
              <template #body="slotProps">
                <div>
                  <span><i class="mr-1" :class="getIconQty(5)"></i></span>
                  <span>
                    {{
                      slotProps.data.pickOffQtyWeight
                        ? Number(slotProps.data.pickOffQtyWeight).toFixed(3).toLocaleString()
                        : '0.000'
                    }}
                  </span>
                </div>
              </template>
            </Column>
            <Column field="returnQty" header="จำนวนคืน" style="width: 120px">
              <template #body="slotProps">
                <div>
                  <span><i class="mr-1" :class="getIconQty(3)"></i></span>
                  <span :class="getTextColor(slotProps.data.returnQty)">
                    {{
                      slotProps.data.returnQty
                        ? Number(slotProps.data.returnQty).toFixed(3).toLocaleString()
                        : '0.000'
                    }}
                  </span>
                </div>
              </template>
            </Column>
            <Column field="returnQtyWeight" header="น้ำหนักคืน" style="width: 120px">
              <template #body="slotProps">
                <div>
                  <span><i class="mr-1" :class="getIconQty(3)"></i></span>
                  <span :class="getTextColor(slotProps.data.returnQtyWeight)">
                    {{
                      slotProps.data.returnQtyWeight
                        ? Number(slotProps.data.returnQtyWeight).toFixed(3).toLocaleString()
                        : '0.000'
                    }}
                  </span>
                </div>
              </template>
            </Column>
            <template #expansion="slotProps">
              <div class="expand-container">
                <dataExpand
                  :modelExpand="slotProps.data"
                  :slotIndex="slotProps.index"
                  @delOutbound="delOutbound"
                  @onUpdateIssueQty="onUpdateIssueQty"
                  @onblueIssueQty="onblueIssueQty"
                  @onUpdateIssueQtyWeight="onUpdateIssueQtyWeight"
                  @onblueIssueQtyWeight="onblueIssueQtyWeight"
                ></dataExpand>
              </div>
            </template>
            <template #footer>
              <div class="submit-container pb-2 pr-2">
                <button class="btn btn-sm btn-dark mr-2" type="button">
                  <!-- <span><i class="bi bi-search mr-2"></i></span> -->
                  <span>ยกเลิกรายการ</span>
                </button>
                <button class="btn btn-sm btn-main" type="submit">
                  <!-- <span><i class="bi bi-search mr-2"></i></span> -->
                  <span>ตรวจสอบรายการ</span>
                </button>
              </div>
            </template>
          </DataTable>
        </div>
      </form>
      <!-- 
      <div class="line mt-4 mb-4"></div> -->
    </div>

    <confirm
      :isShow="isShowConfirm"
      :modelForm="gemsReturn"
      :modelReferenceRunning="refRunning"
      @closeModal="closeModal"
    ></confirm>

    <!-- <button class="btn btn-secondary" @click="testPush">Test Push</button> -->
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

//const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const pdf = defineAsyncComponent(() => import('@/components/pdf-make/FilePDFPickOffGem.vue'))

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
//import AutoComplete from 'primevue/autocomplete'

import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'

import dataExpand from './PickReturnAndOutboundExpand.vue'
import confirm from './ConfirmView.vue'

export default {
  components: {
    //modal,
    loading,
    DataTable,
    Column,
    //AutoComplete,
    dataExpand,
    confirm,
    pdf
  },
  props: {
    // isShowModal: {
    //   type: Boolean,
    //   required: true,
    //   default: false
    // },
    // modelValue: {
    //   type: Object,
    //   required: true,
    //   default: () => ({})
    // }
    // modelMasterType: {
    //   type: Array,
    //   default: () => []
    // }
  },
  computed: {
    // isShow() {
    //   return this.isShowModal
    // },
    // model() {
    //   return this.modelValue
    // },
    masterType() {
      return this.modelMasterType
    }
  },
  data() {
    return {
      isLoading: false,
      isShowConfirm: false,
      modelMasterType: [
        { id: 1, description: 'รับเข้าคลัง [พลอยใหม่]' },
        { id: 2, description: 'รับเข้าคลัง [พลอยนอกสต๊อก]' },
        { id: 3, description: 'รับเข้าคลัง [พลอยคืน]' },
        { id: 4, description: 'จ่ายออกคลัง' },
        { id: 5, description: 'ยืมออกคลัง' }
      ],
      model: {},
      refRunning: '',
      gemsReturn: [],
      expandedRows: []
    }
  },
  methods: {
    // ----- event
    onSubmit() {
      //this.$emit('submit')
      console.log('gemsReturn:', this.gemsReturn)
      if (this.validateData()) {
        console.log('submit')
        this.isShowConfirm = true
      }
    },
    validateData() {
      let isValid = true
      let errorMessages = []

      this.gemsReturn.forEach((item) => {
        if (item.returnQty < 0 || item.returnQtyWeight < 0) {
          errorMessages.push(`${item.code} จำนวนคืนหรือน้ำหนักคืนไม่ถูกต้อง`)
          isValid = false
        }

        if (item.gemsOutbound) {
          item.gemsOutbound.forEach((outbound) => {
            if (outbound.productionPlan == null) {
              errorMessages.push(`${item.code} กรุณาระบุแผนผลิตให้ถูกต้อง`)
              isValid = false
            }
            if (outbound.issueQty <= 0 && outbound.issueQtyWeight <= 0) {
              errorMessages.push(`${item.code} จำนวนเบิกหรือน้ำหนักเบิกไม่ถูกต้อง`)
              isValid = false
            }
          })
        }
      })

      if (errorMessages.length > 0) {
        // ใช้ \n เพื่อเว้นบรรทัดในข้อความ alert
        const errorMessage = errorMessages.join('</br>')
        swAlert.warning(errorMessage, '')
      }

      return isValid
    },
    closeModal(confirm) {
      this.isShowConfirm = false
      if (confirm) {
        console.log('confirm', confirm)
        this.$router.push('/stock-gem-transection')
      }
    },
    testPush() {
      this.$router.push('/stock-gem-transection')
    },

    // ----- grid event
    onRowExpand(e) {
      console.log('onRowExpand', e)
      console.log('onRowExpand', this.expandedRows)
    },
    onRowCollapse() {
      console.log('onRowCollapse')
    },
    addOutbound(gemReturnItem, index) {
      if (!gemReturnItem.gemsOutbound) {
        gemReturnItem.gemsOutbound = []
      }

      const newOutbound = {
        productionPlan: null,
        issueQty: Number(0).toFixed(3),
        issueQtyWeight: Number(0).toFixed(3),
        remark: '',
        isAlreadyOutbound: false
      }

      gemReturnItem.gemsOutbound.push(newOutbound)

      // ขยายแถวหลังจากเพิ่มรายการใหม่
      if (!this.expandedRows.includes(gemReturnItem)) {
        this.expandedRows.push(gemReturnItem)
      }

      // อัปเดตค่า return quantities
      this.updateReturnQuantities(index)

      console.log('New outbound added:', newOutbound)
      console.log('Updated gemsReturn:', this.gemsReturn)
    },
    delOutbound(itemToDelete, parentIndex) {
      const gemReturnItem = this.gemsReturn[parentIndex]

      if (gemReturnItem && gemReturnItem.gemsOutbound) {
        const index = gemReturnItem.gemsOutbound.findIndex((outbound) => outbound === itemToDelete)
        if (index !== -1) {
          gemReturnItem.gemsOutbound.splice(index, 1)

          //   if (gemReturnItem.gemsOutbound.length === 0) {
          //     gemReturnItem.gemsOutbound.push({
          //       productionPlan: null,
          //       issueQty: 0,
          //       issueQtyWeight: 0
          //     })
          //   }

          this.updateReturnQuantities(parentIndex)
        }
      }

      console.log('Item deleted:', itemToDelete)
      console.log('Updated gemsReturn:', this.gemsReturn)
    },

    onUpdateIssueQty(event, item, parentIndex) {
      item.issueQty = Number(event.target.value)
      this.updateReturnQuantities(parentIndex)
      //this.onblueIssueQty(event, item)
    },

    onUpdateIssueQtyWeight(event, item, parentIndex) {
      item.issueQtyWeight = Number(event.target.value)
      this.updateReturnQuantities(parentIndex)
      //this.onblueIssueQtyWeight(event, item)
    },
    onblueIssueQty(event, item) {
      item.issueQty = Number(event.target.value).toFixed(3)
      console.log('onblueIssueQty', item)
    },
    onblueIssueQtyWeight(event, item) {
      item.issueQtyWeight = Number(event.target.value).toFixed(3)
      console.log('onblueIssueQty', item)
    },

    updateReturnQuantities(parentIndex) {
      console.log('parentIndex', parentIndex)
      const gemReturnItem = this.gemsReturn[parentIndex]
      console.log('updateReturnQuantities', gemReturnItem)

      if (gemReturnItem && gemReturnItem.gemsOutbound) {
        gemReturnItem.returnQty =
          gemReturnItem.pickOffQty -
          gemReturnItem.gemsOutbound.reduce((sum, item) => sum + (Number(item.issueQty) || 0), 0)

        gemReturnItem.returnQtyWeight =
          gemReturnItem.pickOffQtyWeight -
          gemReturnItem.gemsOutbound.reduce(
            (sum, item) => sum + (Number(item.issueQtyWeight) || 0),
            0
          )

        // ปัดเศษทศนิยม 3 ตำแหน่ง
        gemReturnItem.returnQty = Number(gemReturnItem.returnQty.toFixed(3))
        gemReturnItem.returnQtyWeight = Number(gemReturnItem.returnQtyWeight.toFixed(3))

        // if (!this.expandedRows.includes(gemReturnItem)) {
        //   this.expandedRows.push(gemReturnItem)
        // }
        // this.gemsReturn[parentIndex] = { ...gemReturnItem }
        console.log('Updated return quantities:', this.gemsReturn[parentIndex])
      }
    },

    // ----- helper
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },
    getIconQty(type) {
      switch (type) {
        case 1:
        case 2:
        case 3:
          return 'bi bi-arrow-down-square-fill text-success'
        case 4:
          return 'bi bi-arrow-up-square-fill text-danger'
        case 5:
          return 'bi bi-arrow-right-square-fill text-secondary'
        default:
          return ''
      }
    },
    getTypeName(type) {
      return this.masterType.find((item) => item.id === type)?.description
    },
    getTextColor(qty) {
      if (qty === 0) return ''
      if (qty < 0) return 'text-red'
      if (qty > 0) return 'text-green'
    },
    formatNumber(value) {
      return value ? Number(value).toFixed(3) : '0.000'
    },

    // ----------- APIs ----------- //
    async fetchData(running) {
      try {
        this.isLoading = true

        console.log('fetchData', running)

        const params = {
          take: 0,
          skip: 0,
          sort: [],
          search: {
            getRunning: running
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('ReceiptAndIssueStockGem/Picklist', params)
        if (res) {
          let noPick = 1
          this.model = {
            ...res.data[0],
            items: res.data[0].items
              .sort((x) => x.code)
              .map((item) => {
                return {
                  ...item,
                  no: noPick++
                }
              })
          }

          let noReturn = 1

          const paramsOutbound = {
            take: 0,
            skip: 0,
            sort: [],
            search: {
              requestDateStart: null,
              requestDateEnd: null,
              refRunning2: running
            }
          }
          const resOutBound = await api.jewelry.post(
            'ReceiptAndIssueStockGem/ListTransection',
            paramsOutbound
          )
          console.log('resOutBound', resOutBound)

          this.gemsReturn = this.model.items
            .sort((x) => x.code)
            .map((item) => {
              return {
                no: noReturn++,
                code: item.code,
                name: item.name,
                pickOffQty: item.qty,
                pickOffQtyWeight: item.qtyWeight,
                returnQty: parseFloat(
                  item.qty -
                    resOutBound.data
                      .filter((x) => x.code === item.code)
                      .reduce((sum, item) => sum + item.qty, 0)
                ).toFixed(3),
                returnQtyWeight: parseFloat(
                  item.qtyWeight -
                    resOutBound.data
                      .filter((x) => x.code === item.code)
                      .reduce((sum, item) => sum + item.qtyWeight, 0)
                ).toFixed(3),
                gemsOutbound: [
                  //return res.outbound
                  ...resOutBound.data
                    .filter((x) => x.code === item.code)
                    .map((outbound) => {
                      return {
                        productionPlan: {
                          wo: outbound.wo,
                          woNumber: outbound.woNumber,
                          woText: outbound.woText,
                          mold: outbound.mold
                        },
                        issueQty: outbound.qty,
                        issueQtyWeight: outbound.qtyWeight,
                        remark: outbound.remark2,
                        running: outbound.running,
                        requestDate: outbound.requestDate,
                        isAlreadyOutbound: true
                      }
                    })
                ]
              }
            })

          this.refRunning = res.data[0].running

          //expand all
          //this.expandedRows = [...this.gemsReturn]

          //this.$emit('export', true)
        } else {
          //this.$emit('export', true)
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    }
  },
  created() {
    this.$nextTick(() => {
      let id = this.$route.params.id
      this.fetchData(id)
      console.log('model', this.model)
    })

    //this.model = this.modelValue
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form.scss';

:deep(.p-datatable.p-datatable-sm .p-datatable-footer) {
  padding: 0.1rem 0.3rem !important;
}
.text-red {
  color: #ff4d4d;
}
.text-green {
  color: #038387;
}
</style>
