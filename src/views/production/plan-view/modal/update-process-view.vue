<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header mb-2">
          <span>อัพเดตงาน</span>
          <span class="bi bi-arrow-right ml-1"> [{{ getStatusName }}]</span>
          <span class="ml-1">{{ `: ใบจ่าย-รับคืนงาน เลขที่: ${model.wo}-${model.woNumber}` }}</span>
        </div>
        <form @submit.prevent="onSubmit">
          <div class="form-col-container">
            <!-- name -->
            <div>
              <span :class="['title-text', [500].includes(status) ? 'text-secondary' : '']"
                >กำหนดช่างรับงาน</span
              >
              <AutoComplete
                v-model="form.worker"
                :suggestions="workerItemSearch"
                @complete="onSearchWorker"
                :class="{ 'cell-readonly': [500].includes(status) }"
                optionLabel="nameTh"
                forceSelection
                :disabled="[500].includes(status)"
              >
              </AutoComplete>
            </div>

            <div></div>
            <div></div>
            <div></div>
          </div>

          <!-- gold -->
          <div class="form-col-container mt-3">
            <DataTable
              class="p-datatable-sm"
              showGridlines
              dataKey="id"
              ref="dt"
              resizableColumns
              scrollable
              stripedRows
              columnResizeMode="fit"
              :value="matAssign"
              :pt="{ table: { style: 'min-width: 50rem' } }"
            >
              <Column style="width: 30px">
                <template #body="{ data }">
                  <ButtonGeneric
                    variant="red"
                    type="button"
                    icon="bi-trash-fill"
                    class="w-100"
                    :title="$t('common.btn.delete')"
                    @click="onDelGold(data)"
                  />
                </template>
              </Column>

              <Column field="gold" header="ทอง" style="width: 70px">
                <template #body="{ data }">
                  <DropdownGeneric
                    v-model="data.gold"
                    :options="masterGold"
                    optionLabel="code"
                    optionValue="code"
                    :placeholder="$t('view.production.planUpdateCell.selectGold')"
                    :ariaLabel="$t('view.production.planUpdateCell.gold')"
                  />
                </template>
              </Column>
              <Column field="requestDate" header="วันที่" style="width: 240px">
                <template #body="{ data }">
                  <CalendarGeneric
                    v-model="data.requestDate"
                    dateFormat="dd/mm/yy"
                    :showButtonBar="true"
                    :manualInput="true"
                    :showTime="status !== 70"
                    hourFormat="24"
                  />
                </template>
              </Column>
              <Column
                field="goldQTYSend"
                :header="status === 80 ? 'จำนวนจ่าย [ชิ้น]' : 'จำนวนจ่าย'"
                style="width: 80px"
              >
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model.number="data.goldQTYSend"
                    type="number"
                    step="any"
                    :aria-label="$t('view.production.planUpdateCell.goldQtySend')"
                  />
                </template>
              </Column>
              <Column field="goldWeightSend" header="น้ำหนักจ่าย" style="width: 80px">
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model.number="data.goldWeightSend"
                    type="number"
                    step="any"
                    :aria-label="$t('view.production.planUpdateCell.goldWeightSend')"
                  />
                </template>
              </Column>
              <Column
                field="goldQTYCheck"
                :header="status === 80 ? 'จำนวนฝัง [เม็ด]' : status === 70 ? 'จำนวน' : 'จำนวนรับ'"
                style="width: 80px"
              >
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model.number="data.goldQTYCheck"
                    type="number"
                    step="any"
                    :aria-label="$t('view.production.planUpdateCell.goldQtyCheck')"
                    @change="calTotalWages(data)"
                  />
                </template>
              </Column>
              <Column field="goldWeightCheck" header="น้ำหนักรับ" style="width: 80px">
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model.number="data.goldWeightCheck"
                    type="number"
                    step="any"
                    :aria-label="$t('view.production.planUpdateCell.goldWeightCheck')"
                  />
                </template>
              </Column>
              <Column
                field="description"
                header="รายละเอียด"
                style="width: 110px"
                v-if="status !== 70"
              >
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model="data.description"
                    type="text"
                    :aria-label="$t('common.field.description')"
                  />
                </template>
              </Column>
              <Column
                field="workers"
                :header="status === 90 ? `ช่างขัด` : status === 70 ? 'ช่างคัดพลอย' : `ช่างรับงาน`"
                style="width: 140px"
              >
                <template #body="{ data }">
                  <AutoCompleteGeneric
                    v-model="data.workers"
                    :suggestions="workerItemSearch"
                    :placeholder="$t('view.production.planUpdateCell.placeholderWorker')"
                    :aria-label="$t('view.production.planUpdateCell.worker')"
                    optionLabel="code"
                    :forceSelection="true"
                    @complete="onSearchWorker"
                  >
                    <template #option="{ option }">
                      <div class="flex align-options-center">
                        <div>{{ `${option.code} - ${option.nameTh}` }}</div>
                      </div>
                    </template>
                  </AutoCompleteGeneric>
                  <small v-if="data.workers?.nameTh" class="worker-name">{{ data.workers.nameTh }}</small>
                </template>
              </Column>
              <Column
                field="workersSub"
                :header="status === 90 ? `ช่างชุบ` : status === 70 ? 'ช่างคัดเพชร' : ''"
                style="width: 140px"
                v-if="status === 90 || status === 70"
              >
                <template #body="{ data }">
                  <AutoCompleteGeneric
                    v-model="data.workersSub"
                    :suggestions="workerItemSearch"
                    :placeholder="$t('view.production.planUpdateCell.placeholderWorker')"
                    :aria-label="$t('view.production.planUpdateCell.workerSub')"
                    optionLabel="code"
                    :forceSelection="true"
                    @complete="onSearchWorker"
                  >
                    <template #option="{ option }">
                      <div class="flex align-options-center">
                        <div>{{ `${option.code} - ${option.nameTh}` }}</div>
                      </div>
                    </template>
                  </AutoCompleteGeneric>
                  <small v-if="data.workersSub?.nameTh" class="worker-name">{{ data.workersSub.nameTh }}</small>
                </template>
              </Column>
              <Column
                field="wages"
                header="ค่าเเรงต่อชิ้น"
                style="min-width: 90px"
                v-if="status !== 70"
              >
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model.number="data.wages"
                    type="number"
                    min="0"
                    step="any"
                    :aria-label="$t('view.production.planUpdateCell.wages')"
                    :class="{ 'cell-readonly': !data.goldQTYCheck }"
                    :disabled="!data.goldQTYCheck"
                    @change="calTotalWages(data)"
                  />
                </template>
              </Column>
              <Column
                field="totalWages"
                header="รวมค่าแรง"
                style="min-width: 100px"
                v-if="status !== 70"
              >
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model.number="data.totalWages"
                    type="number"
                    min="0"
                    step="any"
                    :aria-label="$t('view.production.planUpdateCell.totalWages')"
                    class="cell-readonly"
                    :disabled="true"
                  />
                </template>
              </Column>
              <template #footer>
                <div class="d-flex justify-content-between">
                  <div>ทั้งหมด {{ this.matAssign.length }} รายการ</div>
                  <ButtonGeneric
                    variant="dark"
                    type="button"
                    icon="bi-plus-square-fill"
                    :title="$t('common.btn.add')"
                    @click="addMat"
                  />
                </div>
              </template>
            </DataTable>
          </div>

          <!-- gold loss - เฉพาะฝัง -->
          <div class="mt-3" v-if="status === 80">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="title-text">คำนวณ Gold Loss</span>
              <div class="d-flex align-items-center">
                <span class="title-text mr-2" style="white-space: nowrap">ราคาทอง (บาท/กรัม)</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  class="form-control form-control-sm"
                  style="width: 130px"
                  v-model.number="goldLossPrice"
                  placeholder="0.00"
                />
              </div>
            </div>
            <BaseDataTable
              :items="goldLossRows"
              :columns="goldLossColumns"
              dataKey="id"
              :paginator="false"
              :showGridlines="true"
              scrollHeight="300px"
            >
              <template #weightDiffTemplate="slotProps">
                <div
                  style="font-weight: 600"
                  :style="calculateWeightDifference(slotProps.data.goldWeightSend, slotProps.data.goldWeightCheck).style"
                >
                  <span>{{ calculateWeightDifference(slotProps.data.goldWeightSend, slotProps.data.goldWeightCheck).difference }}</span>
                  <span class="ml-1">({{ calculateWeightDifference(slotProps.data.goldWeightSend, slotProps.data.goldWeightCheck).percentage }})</span>
                </div>
              </template>
              <template #lossPercentTemplate="slotProps">
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  class="form-control form-control-sm text-right"
                  :value="goldLossPercents[slotProps.data.itemNo] ?? 0"
                  @input="goldLossPercents[slotProps.data.itemNo] = $event.target.value !== '' ? Number($event.target.value) : 0"
                  placeholder="0"
                />
              </template>
              <template #weightLossAllowedTemplate="slotProps">
                <span style="font-weight: 600">{{ fmt2(slotProps.data.weightLossAllowed) }}</span>
              </template>
              <template #weightLossActualTemplate="slotProps">
                <span
                  style="font-weight: 600"
                  :style="slotProps.data.weightLossActual > 0 ? 'color: #038387' : slotProps.data.weightLossActual < 0 ? 'color: #ff4d4d' : ''"
                >
                  {{ fmtSign2(slotProps.data.weightLossActual) }}
                </span>
              </template>
              <template #moneyDiffTemplate="slotProps">
                <span
                  style="font-weight: 600"
                  :style="slotProps.data.moneyDiff > 0 ? 'color: #038387' : slotProps.data.moneyDiff < 0 ? 'color: #ff4d4d' : ''"
                >
                  {{ fmtSign2(slotProps.data.moneyDiff) }}
                </span>
              </template>
              <template #remarkTemplate="slotProps">
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :value="goldLossRemarks[slotProps.data.itemNo] ?? ''"
                  @input="goldLossRemarks[slotProps.data.itemNo] = $event.target.value"
                  placeholder="รายละเอียด..."
                />
              </template>
              <template #footer>
                <div class="d-flex justify-content-end title-text">
                  <span class="mr-2">รวมเงิน ได้/ขาด :</span>
                  <span
                    style="font-weight: 600"
                    :style="goldLossMoneyTotal > 0 ? 'color: #038387' : goldLossMoneyTotal < 0 ? 'color: #ff4d4d' : ''"
                  >
                    {{ fmtSign2(goldLossMoneyTotal) }}
                  </span>
                </div>
              </template>
            </BaseDataTable>
          </div>

          <!-- gems - คัดพลอย และ แต่ง -->
          <div class="form-col-container mt-3" v-if="status === 70 || status === 50">
            <DataTable
              class="p-datatable-sm"
              showGridlines
              :value="gemAssign"
              dataKey="id"
              :pt="{ table: { style: 'min-width: 50rem' } }"
            >
              <Column style="width: 30px">
                <template #body="{ data }">
                  <ButtonGeneric
                    variant="red"
                    type="button"
                    icon="bi-trash-fill"
                    class="w-100"
                    :title="$t('common.btn.delete')"
                    @click="onDelGem(data)"
                  />
                </template>
              </Column>
              <Column field="outboundRunning" header="เลขที่เบิก" style="min-width: 200px">
              </Column>
              <Column field="gem" header="พลอย" style="min-width: 200px">
                <template #body="{ data }">
                  <AutoCompleteGeneric
                    v-model="data.gem"
                    :suggestions="gemItemSearch"
                    :placeholder="$t('view.production.planUpdateCell.placeholderGem')"
                    :aria-label="$t('view.production.planUpdateCell.gem')"
                    :customClass="checkOutbound(data) ? 'cell-readonly' : ''"
                    optionLabel="name"
                    :forceSelection="true"
                    :minLength="4"
                    :disabled="checkOutbound(data)"
                    @complete="onSearchGem"
                    @item-select="onGemSelect($event, data)"
                  >
                    <template #option="{ option }">
                      <div class="flex align-options-center">
                        <div>{{ `${option.name}` }}</div>
                      </div>
                    </template>
                  </AutoCompleteGeneric>
                </template>
              </Column>
              <Column field="qty" header="จำนวน" style="width: 100px">
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model.number="data.qty"
                    type="number"
                    step="any"
                    :aria-label="$t('common.field.quantity')"
                    :class="{ 'cell-readonly': checkOutbound(data) }"
                    :disabled="checkOutbound(data)"
                  />
                </template>
              </Column>
              <Column field="weight" header="น้ำหนัก" style="width: 100px">
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model.number="data.weight"
                    type="number"
                    step="any"
                    :aria-label="$t('common.field.weight')"
                    :class="{ 'cell-readonly': checkOutbound(data) }"
                    :disabled="checkOutbound(data)"
                  />
                </template>
              </Column>

              <Column field="length" header="ความยาว" style="width: 100px">
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model.number="data.length"
                    type="number"
                    step="any"
                    :aria-label="$t('view.production.planUpdateCell.length')"
                  />
                </template>
              </Column>
              <Column field="lengthUnit" header="หน่วยความยาว" style="width: 100px">
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model="data.lengthUnit"
                    type="text"
                    :aria-label="$t('view.production.planUpdateCell.lengthUnit')"
                  />
                </template>
              </Column>

              <Column field="price" header="ราคา" style="width: 100px">
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model.number="data.price"
                    type="number"
                    step="any"
                    :aria-label="$t('common.field.price')"
                  />
                </template>
              </Column>
              <template #footer>
                <div class="d-flex justify-content-between">
                  <div>ทั้งหมด {{ this.gemAssign.length }} รายการ</div>
                  <ButtonGeneric
                    variant="dark"
                    type="button"
                    icon="bi-plus-square-fill"
                    :title="$t('common.btn.add')"
                    @click="addGem"
                  />
                </div>
              </template>
            </DataTable>
          </div>

          <div class="form-col-container mt-2">
            <div>
              <span class="title-text">หมายเหตุ - 1</span>
              <textarea class="form-control" v-model="form.remark1" style="height: 50px">
              </textarea>
            </div>
          </div>

          <div class="form-col-container mt-2">
            <div>
              <span class="title-text">หมายเหตุ - 2</span>
              <textarea class="form-control" v-model="form.remark2" style="height: 50px">
              </textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end align-items-center mt-3">
            <span v-if="initFailed" class="text-danger mr-3">
              โหลดข้อมูลไม่สำเร็จ กรุณาปิดแล้วเปิดใหม่
            </span>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="closeModal">
              ยกเลิก
            </button>
            <button
              class="btn btn-sm btn-main"
              type="submit"
              :disabled="isInitLoading || initFailed"
            >
              ยืนยัน
            </button>
          </div>
        </form>

        <!-- plan gold history -->
        <div class="mt-3">
          <planOverview :modelValue="model"></planOverview>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
/* eslint-disable no-restricted-imports */
import AutoComplete from 'primevue/autocomplete'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
/* eslint-enable no-restricted-imports */

import { defineAsyncComponent } from 'vue'
import _ from 'lodash'

import api from '@/axios/axios-helper.js'
import { confirmSubmit, success, warning } from '@/services/alert/sweetAlerts.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import planOverview from '../components/plan-overview.vue'
import { calculateWeightDifference } from '@/services/helper/match.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceForm = {
  status: null,
  headerId: 0,

  receiveDate: new Date(),
  receiveBy: null,

  assignTo: null,
  remark1: null,
  remark2: null,
  totalWages: null
}

const interfaceIsValid = {
  isValStatus: false,
  isValReceiveDate: false,
  isValGemAssignDate: false,
  isValCVDAssignDate: false
}

export default {
  components: {
    modal,
    AutoComplete,
    DataTable,
    Column,
    planOverview,
    BaseDataTable,
    ButtonGeneric,
    InputTextGeneric,
    AutoCompleteGeneric,
    DropdownGeneric,
    CalendarGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
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
    masterStatus: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGold: {
      type: Array,
      required: true,
      default: () => []
    },
    statusCode: {
      type: Number,
      required: false,
      default: 50
    }
  },

  watch: {
    isShow(newVal) {
      if (newVal) {
        //console.log('Modal opened, initializing form')
        this.initForm()
      }
    },
    modelValue: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          //console.log('modelValue changed, initializing form')
          this.initForm()
        }
      },
      deep: true
    },
    'form.receiveDate'(val) {
      if (val) {
        this.val = {
          isValReceiveDate: false
        }
      }
    },
    statusCode(newVal) {
      this.status = newVal
    }
  },

  computed: {
    isShowModal() {
      return this.isShow
    },
    model() {
      return this.modelValue
    },
    modelMat() {
      return this.modelMatValue
    },
    modelStatus() {
      return this.masterStatus
    },
    modelGold() {
      return this.masterGold
    },
    getStatusName() {
      switch (this.status) {
        case 50:
          return 'จ่ายเเต่ง'
        case 60:
          return 'ขัดดิบ'
        case 70:
          return 'คัดพลอย'
        case 80:
          return 'ฝัง'
        case 90:
          return 'ขัดชุบ'
        case 500:
          return 'หลอม'
        default:
          return ''
      }
    },
    goldLossRows() {
      if (this.status !== 80) return []
      return this.matAssign.map((item) => {
        const lossPercent = Number(this.goldLossPercents[item.itemNo] ?? 0)
        const weightSend = item.goldWeightSend ?? 0
        const weightCheck = item.goldWeightCheck ?? 0
        const rawLoss = weightSend - weightCheck
        const weightLossAllowed = weightCheck * (lossPercent / 100)
        const weightLossActual = Math.round((weightLossAllowed - rawLoss) * 10000) / 10000  // + = ได้ (เขียว), - = ขาด (แดง)
        const moneyDiff = Math.round(weightLossActual * 100) / 100 * (this.goldLossPrice ?? 0)
        return { ...item, weightDiff: weightSend - weightCheck, lossPercent, weightLossAllowed, weightLossActual, moneyDiff }
      })
    },
    goldLossMoneyTotal() {
      return this.goldLossRows.reduce((sum, row) => sum + (row.moneyDiff ?? 0), 0)
    }
  },

  data() {
    return {
      // --- flag --- //
      isLoading: false,
      autoId: 0,
      autoIdGem: 0,
      isInitLoading: false,
      initFailed: false,
      initRunId: 0,
      status: this.statusCode,

      // --- from --- //
      form: {
        // ...interfaceForm
      },
      val: {
        ...interfaceIsValid
      },

      tempMatAssign: [],
      matAssign: [],
      gemAssign: [],
      workerItemSearch: [],
      gemItemSearch: [],

      user: null,

      // --- gold loss (status 80) --- //
      goldLossPrice: null,
      goldLossPercents: {},
      goldLossRemarks: {},
      goldLossColumns: [
        { field: 'gold', header: 'ทอง', minWidth: '80px', sortable: false },
        { field: 'requestDate', header: 'วันที่', minWidth: '120px', format: 'datetime', sortable: false },
        { field: 'goldQTYSend', header: 'จำนวนจ่าย [ชิ้น]', minWidth: '120px', align: 'right', format: 'decimal2', sortable: false },
        { field: 'goldWeightSend', header: 'น้ำหนักจ่าย', minWidth: '110px', align: 'right', format: 'decimal2', sortable: false },
        { field: 'goldQTYCheck', header: 'จำนวนฝัง [เม็ด]', minWidth: '120px', align: 'right', format: 'decimal2', sortable: false },
        { field: 'goldWeightCheck', header: 'น้ำหนักรับ', minWidth: '110px', align: 'right', format: 'decimal2', sortable: false },
        { field: 'weightDiff', header: 'น้ำหนัก ขาด/เกิน', minWidth: '150px', align: 'right', sortable: false },
        { field: 'lossPercent', header: '%loss', minWidth: '90px', align: 'center', sortable: false },
        { field: 'weightLossAllowed', header: 'น้ำหนักที่ loss ได้', minWidth: '130px', align: 'right', sortable: false },
        { field: 'weightLossActual', header: 'น้ำหนัก loss', minWidth: '120px', align: 'right', sortable: false },
        { field: 'moneyDiff', header: 'เงิน ได้/ขาด', minWidth: '120px', align: 'right', sortable: false },
        { field: 'remark', header: 'รายละเอียด', minWidth: '160px', sortable: false }
      ]
    }
  },

  methods: {
    // ------ helper ------//
    fmt2(val) {
      return val != null ? Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0.00'
    },
    fmtSign2(val) {
      if (val == null) return '0.00'
      const sign = val >= 0 ? '+' : '-'
      return `${sign}${Math.abs(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    },
    calculateWeightDifference(weightSend, weightReceived) {
      return calculateWeightDifference(weightSend ?? 0, weightReceived ?? 0)
    },
    calTotalWages(data) {
      data.totalWages = data.wages * (data.goldQTYCheck ?? 0)
    },
    checkOutbound(data) {
      return !_.isEmpty(data.outboundRunning) ? true : false
    },
    async lookupWorkerOrStub(code) {
      if (!code) return null
      const found = await this.onSearchWorkerByCode(code)
      return found || { code, nameTh: code }
    },
    async initForm() {
      const runId = ++this.initRunId
      this.isInitLoading = true
      this.initFailed = false
      try {
        const value = this.model.tbtProductionPlanStatusHeader.find((x) => x.status === this.status)
        if (value && Object.keys(value).length > 0) {
          const workerCode = _.get(value, 'workerCode')
          const form = {
            worker: workerCode
              ? await this.onSearchWorkerByCode(workerCode)
              : null,
            status: this.status || null,
            remark1: _.get(value, 'remark1', ''),
            remark2: _.get(value, 'remark2', ''),
            headerId: _.get(value, 'id', 0)
          }

          let matAssign = null
          if (value.tbtProductionPlanStatusDetail) {
            matAssign = await Promise.all(
              value.tbtProductionPlanStatusDetail.map(async (thing) => {
                return {
                  id: ++this.autoId,
                  itemNo: thing.itemNo,
                  gold: thing.gold,
                  goldQTYSend: thing.goldQtySend,
                  goldWeightSend: thing.goldWeightSend,
                  goldQTYCheck: thing.goldQtyCheck,
                  goldWeightCheck: thing.goldWeightCheck,
                  description: thing.description,
                  workers: await this.lookupWorkerOrStub(thing.worker),
                  workersSub: await this.lookupWorkerOrStub(thing.workerSub),
                  worker: thing.worker,
                  workerSub: thing.workerSub,
                  wages: thing.wages,
                  totalWages: thing.totalWages,
                  requestDate: thing.requestDate ? new Date(thing.requestDate) : new Date()
                }
              })
            )
          }

          // กรณีเป็นการคัดพลอย หรือ แต่ง
          let gemAssign = null
          if ((this.status === 70 || this.status === 50) && value.tbtProductionPlanStatusGem) {
            gemAssign = await Promise.all(
              value.tbtProductionPlanStatusGem.map(async (thing) => {
                const gem = await this.onSearchGemById(thing.id)
                return {
                  id: ++this.autoIdGem,
                  outboundRunning: thing.outboundRunning ?? null,
                  outboundName: thing.outboundName,
                  outboundDate: thing.outboundDate,
                  itemNo: thing.itemNo,
                  gem: gem || { id: thing.id, code: thing.code, name: thing.name },
                  gemId: thing.id,
                  qty: thing.qty,
                  weight: thing.weight,
                  price: thing.price,
                  length: thing.length,
                  lengthUnit: thing.lengthUnit
                }
              })
            )
          }

          if (runId !== this.initRunId) return

          this.form = form
          if (matAssign) this.matAssign = matAssign
          if (gemAssign) this.gemAssign = gemAssign

          // โหลด gold loss data สำหรับ status 80
          if (this.status === 80) {
            this.goldLossPrice = value.goldLossPrice ?? null
            const percents = {}
            const remarks = {}
            ;(value.tbtProductionPlanStatusDetail || []).forEach((detail) => {
              if (detail.lossPercent != null) percents[detail.itemNo] = detail.lossPercent
              if (detail.lossRemark) remarks[detail.itemNo] = detail.lossRemark
            })
            this.goldLossPercents = percents
            this.goldLossRemarks = remarks
          }
        }
      } catch (error) {
        if (runId === this.initRunId) this.initFailed = true
        console.log(error)
      } finally {
        if (runId === this.initRunId) this.isInitLoading = false
      }
    },

    // ----- event
    findRowIndex(list, item) {
      const byRef = list.indexOf(item)
      if (byRef >= 0) return byRef
      return item?.id != null ? list.findIndex((x) => x.id === item.id) : -1
    },
    onDelGold(item) {
      const index = this.findRowIndex(this.matAssign, item)
      if (index < 0) return
      this.matAssign.splice(index, 1)
    },
    onDelGem(item) {
      const index = this.findRowIndex(this.gemAssign, item)
      if (index < 0) return
      this.gemAssign.splice(index, 1)
    },
    addMat() {
      const add = {
        id: ++this.autoId,
        gold: 'YG',
        requestDate: new Date(),
        goldQTYSend: null,
        goldWeightSend: null,
        goldQTYCheck: null,
        goldWeightCheck: null,
        worker: null,
        workerSub: null,
        wages: null
      }
      this.matAssign.push(add)
    },
    addGem() {
      const add = {
        id: ++this.autoIdGem,
        itemNo: null,
        outboundRunning: null,
        gem: null,
        qty: null,
        weight: null,

        length : null,
        lengthUnit : null,
        price: null
      }
      this.gemAssign.push(add)
    },
    onClear() {
      this.form = {
        ...interfaceForm
      }
      this.val = {
        ...interfaceIsValid
      }
      this.matAssign = [...this.tempMatAssign]
      this.gemAssign = []
      this.initRunId++
      this.isInitLoading = false
      this.initFailed = false
      this.goldLossPercents = {}
      this.goldLossRemarks = {}
      this.goldLossPrice = null
    },
    closeModal() {
      this.onClear()
      this.$emit('closeModal', 'add')
    },

    onSubmit() {
      if (this.isInitLoading || this.initFailed) return
      if (this.validateForm()) {
        confirmSubmit(
          `ยืนยันเเก้ไขงาน [${this.getStatusName}]`,
          `${this.model.wo}-${this.model.woNumber}`,
          async () => {
            await this.submit()
          }
        )
      }
    },
    validateForm() {
      // ตรวจสอบข้อมูลก่อนส่ง (สามารถเพิ่มเงื่อนไขได้)
      return true
    },

    onGemSelect(event, rowData) {
      // กรณีเลือกพลอย (เฉพาะงานคัดพลอย)
      const selectedGem = event.value
      if (selectedGem) {
        rowData.price = selectedGem.unit === 'Q' ? selectedGem.priceQty : selectedGem.price
      }
    },

    // --- APIs --- //
    async submit() {
      const golds = this.matAssign.map((item) => ({
        ...item,
        worker: item.workers?.code ?? null,
        workerSub: item.workersSub?.code ?? null,
        lossPercent: this.status === 80 ? (this.goldLossPercents[item.itemNo] ?? null) : undefined,
        lossRemark: this.status === 80 ? (this.goldLossRemarks[item.itemNo] ?? null) : undefined
      }))

      const gems = this.gemAssign.map((item) => ({
        id: item.gem?.id,
        outboundRunning: item.outboundRunning ?? null,
        outboundName: item.outboundName ?? null,
        outboundDate: item.outboundDate ?? null,
        itemNo: item.itemNo,
        code: item.gem?.code,
        name: item.gem?.name,
        qty: item.qty,
        weight: item.weight,
        price: item.price,
        length: item.length,
        lengthUnit: item.lengthUnit
      }))

      const param = {
        wo: this.model.wo,
        woNumber: this.model.woNumber,
        productionPlanId: this.model.id,
        HeaderId: this.form.headerId,

        status: this.status,
        workerName: this.form.worker?.nameTh,
        workerCode: this.form.worker?.code,
        remark1: this.form.remark1,
        remark2: this.form.remark2,
        totalWages: this.form.totalWages,
        goldLossPrice: this.status === 80 ? (this.goldLossPrice ?? null) : undefined,
        golds,
        gems
      }

      let url = 'ProductionPlan/ProductionPlanUpdateStatusDetail'

      if ([500].includes(this.status)) {
        url = 'ProductionPlan/ProductionPlanAddStatusDetail'
      }

      const res = await api.jewelry.post(url, param)
      if (res) {
        success(``, '', () => {
          this.form = { ...interfaceForm }
          this.val = { ...interfaceIsValid }
          this.matAssign = [...this.tempMatAssign]
          this.gemAssign = []
          this.$emit('fetch')
        })
      }
    },
    async saveGoldLoss() {
      let headerId = this.form.headerId
      if (!headerId) {
        const header = (this.model.tbtProductionPlanStatusHeader || []).find(
          (x) => x.status === this.status
        )
        headerId = header?.id
      }
      if (!headerId) {
        warning('ไม่พบข้อมูล กรุณาบันทึกข้อมูลก่อน')
        return
      }
      const payload = {
        headerId,
        goldLossPrice: this.goldLossPrice,
        items: this.matAssign.map((item) => ({
          itemNo: item.itemNo,
          lossPercent: this.goldLossPercents[item.itemNo] ?? null,
          lossRemark: this.goldLossRemarks[item.itemNo] ?? null
        }))
      }
      const res = await api.jewelry.post('ProductionPlan/GoldLossUpdate', payload)
      if (res !== undefined) {
        success('บันทึก Gold Loss สำเร็จ')
      }
    },
    async onSearchWorker(e) {
      try {
        ////console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null,
            type: this.status,
            active: 1
          }
        }
        const res = await api.jewelry.post('Worker/Search', params, { skipLoading: true })
        if (res) {
          ////console.log(res)
          this.workerItemSearch = [...res.data]
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
      } catch (error) {
        console.log(error)
      }
    },
    async onSearchWorkerByCode(e) {
      try {
        if (e === null) {
          return null
        }
        ////console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            code: e,
            text: null,
            type: null,
            active: 0
          }
        }
        const res = await api.jewelry.post('Worker/Search', params, { skipLoading: true })
        if (res) {
          ////console.log(res.data[0])
          return res.data[0]
        } else {
          return null
        }
      } catch (error) {
        console.log(error)
      }
    },
    async onSearchGem(e) {
      try {
        ////console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null
          }
        }
        const res = await api.jewelry.post('StockGem/Search', params, { skipLoading: true })
        if (res) {
          ////console.log(res)
          this.gemItemSearch = [...res]
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
      } catch (error) {
        console.log(error)
      }
    },
    async onSearchGemById(e) {
      try {
        const params = {
          take: 0,
          skip: 0,
          search: {
            id: e ?? null,
            text: null
          }
        }
        const res = await api.jewelry.post('StockGem/Search', params, { skipLoading: true })
        if (res) {
          ////console.log(res)
          if (res) {
            ////console.log(res.data[0])
            return res[0]
          } else {
            return null
          }
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

// ** ------ overide primevue style ------
.worker-name {
  display: block;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
.custom-input {
  margin-top: 5px !important;
}
input {
  //margin-top: 0px !important;
}
:deep(.p-autocomplete .p-component) {
  margin-top: 0px !important;
  //background-color: #dad4b5;
}
</style>
