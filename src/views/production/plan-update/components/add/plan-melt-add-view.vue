<!-- eslint-disable vue/no-restricted-imports -->
<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header">
          <span>{{ $t('planUpdate.meltJobTitle') }}</span>
          <span class="bi bi-arrow-right ml-1"></span>
          <span class="ml-1">{{ `: ใบจ่าย-รับคืนงาน เลขที่: ${model.wo}-${model.woNumber}` }}</span>
        </div>
        <form @submit.prevent="onSubmit" class="p-2">
          <div class="form-col-container">
            <div>
              <span class="title-text">{{ $t('planUpdate.meltReceiveDate') }}</span>
              <CalendarGeneric
                v-model="form.receiveDate"
                dateFormat="dd/mm/yy"
                :showIcon="true"
                :showTime="true"
                hourFormat="24"
                :showButtonBar="true"
                class="w-100"
                :class="val.isValReceiveDate === true ? `p-invalid` : ``"
              />
            </div>
            <div>
              <span class="title-text">{{ $t('planUpdate.meltReceiveBy') }}</span>
              <InputTextGeneric v-model="form.receiveBy" :required="true" />
            </div>
            <div></div>
            <div></div>
          </div>

          <div class="line mt-3"></div>

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
              v-model:editingRows="editingRows"
              :value="matAssign"
              editMode="row"
              @row-edit-save="onRowEditSave"
              :pt="{
                table: { style: 'min-width: 50rem' },
                column: {
                  bodycell: ({ state }) => ({
                    style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                  })
                }
              }"
            >
              <Column style="width: 30px">
                <template #body="prop">
                  <ButtonGeneric variant="red" icon="bi-trash-fill" @click="onDelGold(prop.data)" />
                </template>
              </Column>
              <Column field="gold" :header="$t('planUpdate.goldType')" style="min-width: 80px">
                <template #editor="{ data, field }">
                  <Dropdown
                    v-model="data[field]"
                    :options="masterGold"
                    optionLabel="code"
                    optionValue="code"
                    class="w-full md:w-14rem"
                    placeholder="เลือกทอง"
                  />
                </template>
              </Column>
              <Column field="requestDate" :header="$t('planUpdate.requestDate')" style="min-width: 210px">
                <template #editor="{ data, field }">
                  <div>
                    <Calendar
                      class="w-100"
                      v-model="data[field]"
                      dateFormat="dd/mm/yy"
                      showIcon
                      showTime
                      hourFormat="24"
                      showButtonBar
                    />
                  </div>
                </template>
                <template #body="slotProps">
                  <div v-if="slotProps.data.requestDate">
                    {{ formatDateTime(slotProps.data.requestDate) }}
                  </div>
                </template>
              </Column>
              <Column field="goldQTYSend" header="จำนวน" style="min-width: 100px">
                <template #editor="{ data, field }">
                  <input type="number" :class="data[field] ? `` : `-`" class="form-control" v-model="data[field]" />
                </template>
              </Column>
              <Column field="goldWeightSend" :header="$t('common.field.weight')" style="min-width: 100px">
                <template #editor="{ data, field }">
                  <input type="number" step="any" :class="data[field] ? `` : `-`" class="form-control" v-model="data[field]" />
                </template>
              </Column>
              <Column field="description" :header="$t('planUpdate.description')" style="min-width: 120px">
                <template #editor="{ data, field }">
                  <input type="text" :class="data[field] ? `` : `-`" class="form-control" v-model="data[field]" />
                </template>
              </Column>
              <Column :rowEditor="true" bodyStyle="text-align:center" />
              <template #footer>
                <div class="d-flex justify-content-between">
                  <div>{{ $t('planUpdate.total') }} {{ matAssign.length }} {{ $t('planUpdate.items') }}</div>
                  <div @click="addMat">
                    <i class="bi bi-plus-square-fill"></i>
                  </div>
                </div>
              </template>
            </DataTable>
          </div>

          <div class="line mt-3"></div>

          <div class="form-col-container mt-2">
            <div>
              <span class="title-text">{{ $t('planUpdate.remark1') }}</span>
              <TextareaGeneric v-model="form.remark1" :rows="2" />
            </div>
          </div>

          <div class="form-col-container">
            <div>
              <span class="title-text">{{ $t('planUpdate.remark2') }}</span>
              <TextareaGeneric v-model="form.remark2" :rows="2" />
            </div>
          </div>

          <div class="d-flex justify-content-end mt-3">
            <ButtonGeneric variant="dark" :label="$t('common.btn.cancel')" class="mr-2" type="button" @click="closeModal" />
            <ButtonGeneric variant="main" :label="$t('common.btn.confirm')" type="submit" />
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { formatDateTime, formatISOString } from '@/services/utils/dayjs'

import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import api from '@/axios/axios-helper.js'
import { storage } from '@/services/storage.js'

import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

const interfaceForm = {
  status: null,
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
    Calendar,
    Dropdown,
    DataTable,
    Column,
    CalendarGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric
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
    }
  },
  watch: {
    'form.receiveDate'(val) {
      if (val) {
        this.val = { isValReceiveDate: false }
      }
    },
    isShow(val) {
      if (val) {
        this.seedGolds()
      }
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
    }
  },
  data() {
    return {
      isLoading: false,
      autoId: 0,
      autoIdGem: 0,
      status: 500,
      form: { ...interfaceForm },
      val: { ...interfaceIsValid },
      tempMatAssign: [],
      matAssign: [],
      editingRows: [],
      gemAssign: [],
      editingGemRows: [],
      workerItemSearch: [],
      gemItemSearch: [],
      user: null
    }
  },
  methods: {
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    calTotalWages(data) {
      data.totalWages = data.wages * (data.goldQTYCheck ?? 0)
    },
    onRowEditSave(event) {
      let { newData, index } = event
      this.matAssign[index] = newData
    },
    onDelGold(item) {
      const index = this.matAssign.indexOf(item)
      this.matAssign.splice(index, 1)
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
    seedGolds() {
      const golds = [...new Set((this.modelMat || []).map((m) => m.gold).filter(Boolean))]
      this.tempMatAssign = golds.map((gold) => ({
        id: ++this.autoId,
        gold,
        requestDate: new Date(),
        goldQTYSend: null,
        goldWeightSend: null,
        goldQTYCheck: null,
        goldWeightCheck: null,
        worker: null,
        workerSub: null,
        wages: null
      }))
      this.matAssign = this.tempMatAssign.map((row) => ({ ...row }))
    },
    onclear() {
      this.form = { ...interfaceForm }
      this.val = { ...interfaceIsValid }
      this.matAssign = [...this.tempMatAssign]
      this.gemAssign = []
    },
    closeModal() {
      this.onclear()
      this.$emit('closeModal', 'add')
    },
    onSubmit() {
      if (this.validateForm()) {
        confirmThenSubmit(
          `${this.model.wo}-${this.model.woNumber}`,
          this.$t('planUpdate.confirmMelt'),
          async () => {
            await this.submit()
          }
        )
      }
    },
    validateForm() {
      return true
    },
    async submit() {
      this.matAssign = this.matAssign.map((item) => ({
        ...item,
        worker: item.workers?.code,
        workerSub: item.workersSub?.code
      }))
      this.gemAssign = this.gemAssign.map((item) => ({
        id: item.gem?.id,
        code: item.gem?.code,
        name: item.gem?.name,
        QTY: item.QTY,
        weight: item.weight
      }))
      const param = {
        wo: this.model.wo,
        woNumber: this.model.woNumber,
        productionPlanId: this.model.id,
        status: this.status,
        sendName: this.form.receiveBy,
        sendDate: this.form.receiveDate ? formatISOString(this.form.receiveDate) : null,
        checkName: this.form.receiveBy,
        checkDate: this.form.receiveDate ? formatISOString(this.form.receiveDate) : null,
        remark1: this.form.remark1,
        remark2: this.form.remark2,
        totalWages: this.form.totalWages,
        golds: [...this.matAssign],
        gems: [...this.gemAssign]
      }
      const res = await api.jewelry.post('ProductionPlan/ProductionPlanAddStatusDetail', param)
      if (res) {
        success(
          ``,
          '',
          () => {
            this.form = { ...interfaceForm }
            this.val = { ...interfaceIsValid }
            this.matAssign = [...this.tempMatAssign]
            this.gemAssign = []
            this.$emit('fetch')
          }
        )
      }
    },
    async onSearchWorker(e) {
      const params = {
        take: 0,
        skip: 0,
        search: { text: e.query ?? null, type: this.status, active: 1 }
      }
      const res = await api.jewelry.post('Worker/Search', params)
      if (res) {
        this.workerItemSearch = [...res.data]
      }
    }
  },
  created() {
    this.$nextTick(() => {
      this.seedGolds()
      this.user = storage.getJSON('user-dk')
      this.form.receiveBy = this.user?.firstName
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.custom-input {
  margin-top: 5px !important;
}
input {
  margin-top: 0px !important;
}
</style>
