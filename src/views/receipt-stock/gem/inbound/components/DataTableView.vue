<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
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
                class="btn btn-sm btn-red"
                :title="$t('view.receiptStock.gem.inbound.btnDelete')"
                @click="onDelGem(slotProps.data)"
                type="button"
              >
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
          </template>
        </Column>

        <Column field="name" :header="$t('view.receiptStock.gem.inbound.colCode')" style="min-width: 100px"> </Column>

        <Column field="quantity" :header="$t('view.receiptStock.gem.inbound.colStockQty')" style="min-width: 100px">
          <template #body="slotProps">
            {{
              slotProps.data.quantity
                ? Number(slotProps.data.quantity).toFixed(3).toLocaleString()
                : '0.000'
            }}
          </template>
        </Column>
        <Column field="quantityOnProcess" :header="$t('view.receiptStock.gem.inbound.colBorrowQty')" style="min-width: 100px">
          <template #body="slotProps">
            {{
              slotProps.data.quantityOnProcess
                ? Number(slotProps.data.quantityOnProcess).toFixed(3).toLocaleString()
                : '0.000'
            }}
          </template>
        </Column>
        <Column field="quantityWeight" :header="$t('view.receiptStock.gem.inbound.colStockWeight')" style="min-width: 100px">
          <template #body="slotProps">
            {{
              slotProps.data.quantityWeight
                ? Number(slotProps.data.quantityWeight).toFixed(3).toLocaleString()
                : '0.000'
            }}
          </template>
        </Column>
        <Column field="quantityWeightOnProcess" :header="$t('view.receiptStock.gem.inbound.colBorrowWeight')" style="min-width: 100px">
          <template #body="slotProps">
            {{
              slotProps.data.quantityWeightOnProcess
                ? Number(slotProps.data.quantityWeightOnProcess).toFixed(3).toLocaleString()
                : '0.000'
            }}
          </template>
        </Column>
        <Column field="receiveQty" :header="$t('view.receiptStock.gem.inbound.colReceiveQty')" style="width: 100px">
          <template #body="slotProps">
            <input
              style="width: 100px; background-color: #dad4b5"
              :style="slotProps.data.receiveQty > 0 ? 'background-color: #b5dad4' : ''"
              class="form-control"
              type="number"
              step="any"
              min="0"
              required
              v-model="slotProps.data.receiveQty"
              @blur="onBlurReceiveQty(slotProps.data)"
            />
          </template>
        </Column>
        <Column field="receiveQtyWeight" :header="$t('view.receiptStock.gem.inbound.colReceiveWeight')" style="width: 100px">
          <template #body="slotProps">
            <input
              style="width: 100px; background-color: #dad4b5"
              :style="slotProps.data.receiveQtyWeight > 0 ? 'background-color: #b5dad4' : ''"
              class="form-control"
              type="number"
              step="any"
              min="0"
              required
              v-model="slotProps.data.receiveQtyWeight"
              @blur="onBlurReceiveQtyWeight(slotProps.data)"
            />
          </template>
        </Column>
        <Column field="supplierCost" :header="$t('view.receiptStock.gem.inbound.colCostPrice')" style="width: 100px">
          <template #body="slotProps">
            <input
              style="width: 100px; background-color: #dad4b5"
              :style="slotProps.data.supplierCost > 0 ? 'background-color: #b5dad4' : ''"
              class="form-control"
              type="number"
              step="any"
              min="0"
              required
              v-model="slotProps.data.supplierCost"
            />
          </template>
        </Column>
        <Column field="remark" header="หมายเหตุ" style="width: 100px">
          <template #body="slotProps">
            <input
              style="width: 100px; background-color: #dad4b5"
              :style="slotProps.data.remark ? 'background-color: #b5dad4' : ''"
              class="form-control"
              type="text"
              v-model="slotProps.data.remark"
            />
          </template>
        </Column>

        <ColumnGroup type="footer">
          <Row>
            <Column footerStyle="background-color: #921313" :colspan="10">
              <template #footer>
                <div class="d-flex justify-content-between">
                  <div class="footer-text-container">
                    <span>
                      {{ `รวมทั้งหมด  ${formSubmit.gems.length}  รายการ` }}
                    </span>
                  </div>
                  <div>
                    <button class="btn btn-sm btn-outline-main mr-2" type="button" @click="onClear">
                      <span>{{ $t('view.receiptStock.gem.cancelList') }}</span>
                    </button>
                    <button
                      :class="[
                        'btn btn-sm',
                        formSubmit.gems.length ? 'btn-main' : 'btn-outline-main'
                      ]"
                      type="submit"
                      :disabled="!formSubmit.gems.length"
                    >
                      <span>{{ $t('view.receiptStock.gem.checkList') }}</span>
                    </button>
                  </div>
                </div>
              </template>
            </Column>
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
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Row from 'primevue/row'
import ColumnGroup from 'primevue/columngroup'

import { warning } from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'

import ConfirmView from './ConfirmView.vue'

const interfaceFormSubmit = {
  gems: [],
  requestDate: new Date(),
  type: null,
  supplierName: null,
  poOrJob: null,
  remark: null,
  pass: null
}

export default {
  components: {
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
      isShowConfirm: false,
      data: [],
      formScan: { ...this.modelFormScan },
      formSubmit: { ...interfaceFormSubmit },
      minQty: 1
    }
  },
  methods: {
    async fetchScan() {
      const params = this.createScanRequest(this.formScan)

      const res = await api.jewelry.post('ReceiptAndIssueStockGem/Scan', params)
      if (res) {
        if (this.validateScan(res)) {
          const newQty = 0
          const newGems = {
            ...res,
            receiveQty: newQty.toFixed(3),
            receiveQtyWeight: newQty.toFixed(3),
            supplierCost: newQty
          }
          this.formSubmit.gems.push(newGems)
        }
      }
    },

    onBlurReceiveQty(item) {
      this.formSubmit.gems = this.formSubmit.gems.map((gem) => {
        if (gem.code === item.code) {
          if (item.receiveQty && Number(item.receiveQty) >= 0) {
            gem.receiveQty = Number(item.receiveQty).toFixed(3)
          }
        }
        return gem
      })
    },
    onBlurReceiveQtyWeight(item) {
      this.formSubmit.gems = this.formSubmit.gems.map((gem) => {
        if (gem.code === item.code) {
          if (item.receiveQtyWeight && Number(item.receiveQtyWeight) >= 0) {
            gem.receiveQtyWeight = Number(item.receiveQtyWeight).toFixed(3)
          }
        }
        return gem
      })
    },
    onDelGem(item) {
      this.formSubmit.gems = this.formSubmit.gems.filter((gem) => gem.code !== item.code)
    },
    onSubmit() {
      if (this.validateSubmit()) {
        this.isShowConfirm = true
      }
    },
    onCloseConfirm(msg) {
      if (msg === 'confirm') {
        this.onClear()
      }
      this.isShowConfirm = false
    },
    onClear() {
      this.formScan = { ...this.modelFormScan }
      this.formSubmit = { ...interfaceFormSubmit }
      this.formSubmit.gems = []
    },
    createScanRequest(data) {
      const scanRequest = {
        scanType: 'S',
        scans: []
      }

      if (data && data.code) {
        scanRequest.scans.push({ code: String(data.code) })
      } else if (Array.isArray(data)) {
        scanRequest.scans = data
          .filter((scan) => scan && scan.code)
          .map((scan) => ({ code: String(scan.code) }))
      }

      return scanRequest
    },
    validateScan(data) {
      let res = true
      let errorMsg = ''

      const isDuplicate = this.formSubmit.gems.some((gem) => gem.code === data.code)
      if (isDuplicate) {
        res = false
        errorMsg = `${data.code} -- > รหัสซ้ำ กรุณาตรวจสอบ`
      }

      if (errorMsg) {
        warning(errorMsg, '')
      }
      return res
    },
    validateSubmit() {
      let res = true
      let errorMsg = []

      if (!this.formSubmit.gems.length) {
        res = false
        errorMsg[0] = 'ไม่พบรายการเพชรที่ต้องการรับเข้าคลัง'
      }

      const invalidGems = this.formSubmit.gems.filter(
        (gem) => gem.receiveQty <= 0 && gem.receiveQtyWeight <= 0
      )
      if (invalidGems.length > 0) {
        res = false
        invalidGems.forEach((gem) => {
          errorMsg.push(`${gem.code} -- > จำนวน/น้ำหนัก รับต้องมากกว่า 0 <br/>`)
        })
      }

      if (errorMsg.length) {
        warning(errorMsg.join('<br/>'), '')
      }

      return res
    }
  },
  unmounted() {
    this.formScan = { ...this.modelFormScan }
    this.formSubmit = { ...interfaceFormSubmit }
    this.formSubmit.gems = []
  },
  created() {
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
