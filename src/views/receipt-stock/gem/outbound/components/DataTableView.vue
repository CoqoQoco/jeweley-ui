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

        <Column field="issueQty" header="จำนวนจ่ายตัด" style="width: 100px">
          <template #body="slotProps">
            <input
              style="width: 100px; background-color: #dad4b5"
              :style="slotProps.data.issueQty > 0 ? 'background-color: #b5dad4' : ''"
              class="form-control"
              :max="slotProps.data.quantity"
              type="number"
              step="any"
              required
              v-model="slotProps.data.issueQty"
              @blur="onBlurIssueQty(slotProps.data)"
            />
          </template>
        </Column>
        <Column field="issueQtyWeight" header="น้ำหนักจ่ายตัด" style="width: 100px">
          <template #body="slotProps">
            <input
              style="width: 100px; background-color: #dad4b5"
              :style="slotProps.data.issueQtyWeight > 0 ? 'background-color: #b5dad4' : ''"
              class="form-control"
              :max="slotProps.data.quantityWeight"
              type="number"
              step="any"
              required
              v-model="slotProps.data.issueQtyWeight"
              @blur="onBlurIssueQtyWeight(slotProps.data)"
            />
          </template>
        </Column>

        <Column field="productionPlan" header="แผนผลิต" style="width: 150px">
          <template #body="slotProps">
            <AutoCompleteGeneric
              :modelValue="slotProps.data.productionPlan"
              :suggestions="planSearch"
              @complete="onSearchProductionPlanId"
              optionLabel="woText"
              :forceSelection="true"
              customClass="plan-ac"
              @update:modelValue="slotProps.data.productionPlan = $event"
            >
              <template #option="{ option }">
                <div>{{ `${option.wo}-${option.woNumber}` }}</div>
              </template>
            </AutoCompleteGeneric>
          </template>
        </Column>
        <Column field="remark" header="หมายเหตุ" style="width: 150px">
          <template #body="slotProps">
            <input
              style="width: 150px; background-color: #dad4b5"
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
                      {{ `รวมทั้งหมด  ${formSubmit.gems.length}  รายการ` }}
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

import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
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
    ConfirmView,
    AutoCompleteGeneric
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
      minQty: 1,
      planSearch: []
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
            issueQty: newQty.toFixed(3),
            issueQtyWeight: newQty.toFixed(3)
          }
          this.formSubmit.gems.push(newGems)
        }
      }
    },
    async onSearchProductionPlanId(e) {
      const params = {
        take: 0,
        skip: 0,
        search: {
          text: e.query ?? null
        }
      }
      const res = await api.jewelry.post(
        'ProductionPlan/ProductionPlanSearchByProductionPlanId',
        params
      )
      if (res) {
        this.planSearch = [...res.data]
      }
    },

    onBlurIssueQty(item) {
      this.formSubmit.gems = this.formSubmit.gems.map((gem) => {
        if (gem.code === item.code) {
          if (item.issueQty && Number(item.issueQty) >= 0) {
            gem.issueQty = Number(item.issueQty).toFixed(3)
          }
        }
        return gem
      })
    },
    onBlurIssueQtyWeight(item) {
      this.formSubmit.gems = this.formSubmit.gems.map((gem) => {
        if (gem.code === item.code) {
          if (item.issueQtyWeight && Number(item.issueQtyWeight) >= 0) {
            gem.issueQtyWeight = Number(item.issueQtyWeight).toFixed(3)
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

      const isQty = data.quantity <= 0 && data.quantityWeight <= 0
      if (isQty) {
        res = false
        errorMsg = `${data.code} --> จำนวน/น้ำหนัก คงคลังเท่ากับ 0 `
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
        (gem) => gem.issueQty <= 0 && gem.issueQtyWeight <= 0
      )
      if (invalidGems.length > 0) {
        res = false
        invalidGems.forEach((gem) => {
          errorMsg.push(`${gem.code} -- > จำนวน/น้ำหนัก จ่ายตัดต้องมากกว่า 0 <br/>`)
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

input {
  margin-top: 0px !important;
}
:deep(.plan-ac) {
  .p-autocomplete-input {
    margin-top: 0px !important;
    background-color: #dad4b5;
    width: 150px;
  }
}
</style>
