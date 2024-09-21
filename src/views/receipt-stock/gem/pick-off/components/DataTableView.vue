<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <form @submit.prevent="onSubmit">
      <DataTable
        :value="formSubmit.gems"
        showGridlines
        dataKey="id"
        ref="dt"
        class="p-datatable-sm"
        scrollable
        stripedRows
        columnResizeMode="fit"
        scrollHeight="calc(100vh - 160px)"
      >
        <Column style="width: 50px">
          <template #body="slotProps">
            <div class="table-btn-action-container">
              <button
                class="btn btn-sm btn btn-main"
                title="ลบรายการ"
                @click="onDelGem(slotProps.data)"
                type="button"
              >
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
          </template>
        </Column>

        <Column field="name" header="รหัส" style="min-width: 100px"> </Column>

        <!-- <Column field="code" header="รหัส" style="min-width: 100px"> </Column> -->
        <!-- <Column field="groupName" header="หมวดหมู่" style="min-width: 100px"> </Column> -->
        <!-- <Column field="size" header="ขนาด" style="min-width: 100px"> </Column>
        <Column field="shape" header="รูปร่าง" style="min-width: 100px"> </Column>
        <Column field="grade" header="เกรด" style="min-width: 100px"> </Column> -->

        <Column field="quantity" header="จำนวนคงคลัง" style="min-width: 100px">
          <template #body="slotProps">
            {{
              slotProps.data.quantity
                ? Number(slotProps.data.quantity).toFixed(3).toLocaleString()
                : '0.000'
            }}
          </template>
        </Column>
        <Column field="quantityOnProcess" header="จำนวนยืมคลัง" style="min-width: 100px">
          <template #body="slotProps">
            {{
              slotProps.data.quantityOnProcess
                ? Number(slotProps.data.quantityOnProcess).toFixed(3).toLocaleString()
                : '0.000'
            }}
          </template>
        </Column>
        <Column field="quantityWeight" header="น้ำหนักคงคลัง" style="min-width: 100px">
          <template #body="slotProps">
            {{
              slotProps.data.quantityWeight
                ? Number(slotProps.data.quantityWeight).toFixed(3).toLocaleString()
                : '0.000'
            }}
          </template>
        </Column>
        <Column field="quantityWeightOnProcess" header="น้ำหนักยืมคลัง" style="min-width: 100px">
          <template #body="slotProps">
            {{
              slotProps.data.quantityWeightOnProcess
                ? Number(slotProps.data.quantityWeightOnProcess).toFixed(3).toLocaleString()
                : '0.000'
            }}
          </template>
        </Column>
        <column field="issueQty" header="จำนวนยืมออก" style="width: 100px">
          <template #body="slotProps">
            <input
              style="width: 100px; background-color: #dad4b5"
              :style="slotProps.data.issueQty > 0 ? 'background-color: #b5dad4' : ''"
              class="form-control"
              type="number"
              step="any"
              min="0"
              required
              v-model="slotProps.data.issueQty"
              @blur="onBlurReceiveQty(slotProps.data)"
            />
            <!-- @change="onChangeQty(slotProps.data)" -->
          </template>
        </column>
        <column field="issueQtyWeight" header="น้ำหนักยืมออก" style="width: 100px">
          <template #body="slotProps">
            <input
              style="width: 100px; background-color: #dad4b5"
              :style="slotProps.data.issueQtyWeight > 0 ? 'background-color: #b5dad4' : ''"
              class="form-control"
              type="number"
              step="any"
              min="0"
              required
              v-model="slotProps.data.issueQtyWeight"
              @blur="onBlurReceiveQtyWeight(slotProps.data)"
            />
          </template>
        </column>
        <column field="remark" header="หมายเหตุ" style="width: 100px">
          <template #body="slotProps">
            <input
              style="width: 100px; background-color: #dad4b5"
              :style="slotProps.data.remark ? 'background-color: #b5dad4' : ''"
              class="form-control"
              type="text"
              v-model="slotProps.data.remark"
            />
            <!-- @change="onChangeQty(slotProps.data)" -->
          </template>
        </column>

        <ColumnGroup type="footer">
          <Row>
            <column footerStyle="background-color: #921313" :colspan="10">
              <template #footer>
                <div class="d-flex justify-content-between">
                  <!-- text -->
                  <div class="footer-text-container">
                    <span>
                      {{ `รวมทั้งหมด&nbsp;&nbsp;${formSubmit.gems.length}&nbsp;&nbsp;รายการ` }}
                    </span>
                  </div>

                  <!-- btn submit -->
                  <div>
                    <button class="btn btn-sm btn-secondary mr-2" type="button" @click="onClear">
                      <span>ยกเลิกรายการ</span>
                    </button>
                    <button
                      :class="[
                        'btn btn-sm',
                        formSubmit.gems.length ? 'btn-primary' : 'btn-secondary'
                      ]"
                      type="submit"
                      :disabled="!formSubmit.gems.length"
                    >
                      <span>ตรวจสอบรายการ</span>
                    </button>
                  </div>
                </div>
              </template>
            </column>
          </Row>
        </ColumnGroup>
      </DataTable>
    </form>

    <ConfirmView
      :isShow="isShowConfirm"
      :modelForm="formSubmit"
      @closeModal="onCloseConfirm"
    ></ConfirmView>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Row from 'primevue/row'
import ColumnGroup from 'primevue/columngroup' // optional
//import Papa from 'papaparse'

//import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'

import ConfirmView from './ConfirmView.vue'

const interfaceFormSubmit = {
  gems: [],
  requestDate: new Date(),
  returnDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  type: null,
  //supplierName: null,
  //poOrJob: null,
  remark: null,
  pass: null
}

export default {
  components: {
    loading,
    DataTable,
    Column,
    Row,
    ColumnGroup,
    ConfirmView
  },
  props: {
    modelFormScan: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    modelFormScan: {
      handler(val) {
        this.formScan = { ...val }
        this.fetchScan()
      },
      deep: true
    }
  },
  data() {
    return {
      isLoading: false,
      isShowConfirm: false,
      data: [],
      formScan: { ...this.modelFormScan },
      formSubmit: { ...interfaceFormSubmit },
      minQty: 1
    }
  },
  methods: {
    // ------------ APIs
    async fetchScan() {
      try {
        this.isLoading = true

        console.log('fetchScan req', this.form)
        // new array
        const params = this.createScanRequest(this.formScan)
        console.log('params', params)

        const res = await api.jewelry.post('ReceiptAndIssueStockGem/Scan', params)
        if (res) {
          if (this.validateScan(res)) {
            const newQty = 0
            const newGems = {
              ...res,
              //issueQty: newQty.toFixed(3),
              //issueQtyWeight: newQty.toFixed(3),

               issueQty: res.quantity.toFixed(3),
              issueQtyWeight: res.quantityWeight.toFixed(3),

              supplierCost: newQty
            }
            this.formSubmit.gems.push(newGems)
            console.log('fetchScan res', this.formSubmit.gems)
          }
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },

    // ------------ Events
    onUpdateQty(item) {
      console.log('onUpdateQty', item)
      this.formSubmit.gems = this.formSubmit.gems.map((gem) => {
        if (gem.code === item.code) {
          gem.issueQty = item.issueQty
        }
        return gem
      })
      console.log('onUpdateQty', this.formSubmit.gems)
    },
    onBlurReceiveQty(item) {
      // แปลงค่าเป็นทศนิยม 3 ตำแหน่งเมื่อออกจาก input
      console.log('onBlurReceiveQty', item)
      this.formSubmit.gems = this.formSubmit.gems.map((gem) => {
        if (gem.code === item.code) {
          if (item.issueQty && Number(item.issueQty) >= 0) {
            gem.issueQty = Number(item.issueQty).toFixed(3)
          }
        }
        return gem
      })
      console.log('onBlurReceiveQty', this.formSubmit.gems)
      //this.onUpdateQty(item)
    },
    onBlurReceiveQtyWeight(item) {
      // แปลงค่าเป็นทศนิยม 3 ตำแหน่งเมื่อออกจาก input
      console.log('onBlurReceiveQtyWeight', item)
      this.formSubmit.gems = this.formSubmit.gems.map((gem) => {
        if (gem.code === item.code) {
          if (item.issueQtyWeight && Number(item.issueQtyWeight) >= 0) {
            gem.issueQtyWeight = Number(item.issueQtyWeight).toFixed(3)
          }
        }
        return gem
      })
      console.log('onBlurReceiveQtyWeight', this.formSubmit.gems)
      //this.onUpdateQty(item)
    },
    onDelGem(item) {
      console.log('onDelGem', item)
      this.formSubmit.gems = this.formSubmit.gems.filter((gem) => gem.code !== item.code)
      console.log('onDelGem', this.formSubmit.gems)
    },
    onSubmit() {
      //console.log('onSubmit', this.formSubmit)
      if (this.validateSubmit()) {
        this.isShowConfirm = true
      }
    },
    onCloseConfirm(msg) {
      console.log('onCloseConfirm', msg)
      if (msg === 'confirm') {
        console.log('onCloseConfirm -->', msg)
        //this.formSubmit = { ...interfaceFormSubmit }
        //this.formSubmit.gems = []

        this.onClear()
        //window.location.reload()
      }

      this.isShowConfirm = false
    },
    onClear() {
      this.formScan = { ...this.modelFormScan }
      this.formSubmit = { ...interfaceFormSubmit }
      this.formSubmit.gems = []
    },
    // ------------ Helpers
    createScanRequest(data) {
      const scanRequest = {
        scanType: 'S',
        scans: []
      }

      if (data && data.code) {
        // ถ้า code เป็น string เดียว
        scanRequest.scans.push({ code: String(data.code) })
      } else if (Array.isArray(data)) {
        // ถ้า formScan เป็น array ของ objects ที่มี 'code'
        scanRequest.scans = data
          .filter((scan) => scan && scan.code)
          .map((scan) => ({ code: String(scan.code) }))
      }

      return scanRequest
    },
    validateScan(data) {
      let res = true
      let errorMsg = ''

      //check duplicate data in this.formSubmit.gems
      const isDuplicate = this.formSubmit.gems.some((gem) => gem.code === data.code)
      if (isDuplicate) {
        res = false
        errorMsg = `${data.code} -- > รหัสซ้ำ กรุณาตรวจสอบ`
      }

      //check mininum qty > 0
      // const isQty = data.quantity <= 0
      // if (isQty) {
      //   res = false
      //   errorMsg = `${data.code} --> จำนวนคงคลังเท่ากับ 0 `
      // }

      if (errorMsg) {
        swAlert.warning(errorMsg, '')
      }
      return res
    },
    validateSubmit() {
      let res = true
      let errorMsg = []

      //check this.formSubmit.gems.length
      if (!this.formSubmit.gems.length) {
        res = false
        errorMsg[0] = 'ไม่พบรายการเพชรที่ต้องการรับเข้าคลัง'
      }

      //check all item.receiveQty > 0 in this.formSubmit.gems
      const invalidGems = this.formSubmit.gems.filter(
        (gem) => gem.issueQty <= 0 && gem.issueQtyWeight <= 0
      )
      if (invalidGems.length > 0) {
        res = false
        invalidGems.forEach((gem) => {
          errorMsg.push(`${gem.code} -- > จำนวน/น้ำหนัก ยืมต้องมากกว่า 0 <br/>`)
        })
      }

      const invalidGreaterQty = this.formSubmit.gems.filter(
        (gem) =>
          gem.issueQty > gem.quantity ||
          gem.issueQtyWeight > gem.quantityWeight
      )
      if (invalidGreaterQty.length > 0) {
        res = false
        invalidGreaterQty.forEach((gem) => {
          errorMsg.push(`${gem.code} -- > จำนวน/น้ำหนัก คงคลังไม่เพียงพอ <br/>`)
        })
      }

      if (errorMsg.length) {
        swAlert.warning(errorMsg.join('<br/>'), '')
      }

      return res
    }
  },
  unmounted() {
    console.log('unmounted')
    this.formScan = { ...this.modelFormScan }
    this.formSubmit = { ...interfaceFormSubmit }
    this.formSubmit.gems = []
  },
  created() {
    console.log('created')
    this.formScan = { ...this.modelFormScan }
    this.formSubmit = { ...interfaceFormSubmit }
    this.formSubmit.gems = []
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
.footer-text-container {
  display: grid;
  place-items: center;
  color: white;
}
.table-btn-action-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
