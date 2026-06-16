<!-- eslint-disable vue/no-restricted-imports -->
<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header mb-2">
          <span>{{ $t('planUpdate.gemJobTitle') }}</span>
          <span class="bi bi-arrow-right ml-1"></span>
          <span class="ml-1">{{ `: ใบจ่าย-รับคืนงาน เลขที่: ${model.wo}-${model.woNumber}` }}</span>
        </div>
        <form @submit.prevent="onSubmit">
          <div class="form-col-container">
            <div>
              <span class="title-text">{{ $t('planUpdate.gemReceiveDate') }}</span>
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
              <span class="title-text">{{ $t('planUpdate.gemReceiveBy') }}</span>
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
              <Column field="gold" :header="$t('planUpdate.goldType')" style="min-width: 200px">
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
              <Column field="requestDate" :header="$t('planUpdate.requestDate')" style="min-width: 200px">
                <template #editor="{ data, field }">
                  <div>
                    <Calendar
                      class="w-100"
                      v-model="data[field]"
                      dateFormat="dd/mm/yy"
                      showIcon
                      showButtonBar
                    />
                  </div>
                </template>
                <template #body="slotProps">
                  <div v-if="slotProps.data.requestDate">
                    {{ formatDate(slotProps.data.requestDate) }}
                  </div>
                </template>
              </Column>
              <Column field="workers" header="ช่างคัดพลอย" style="min-width: 200px">
                <template #editor="{ data, field }">
                  <AutoComplete
                    v-model="data[field]"
                    :suggestions="workerItemSearch"
                    @complete="onSearchWorker"
                    placeholder="กรอกรหัส/ชื่อช่าง...."
                    :class="data[field] ? `` : `bg-warning`"
                    optionLabel="code"
                    forceSelection
                  >
                    <template #option="slotProps">
                      <div class="flex align-options-center">
                        <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
                      </div>
                    </template>
                  </AutoComplete>
                </template>
                <template #body="slotProps">
                  <div v-if="slotProps.data.workers">
                    {{ `${slotProps.data.workers.code} - ${slotProps.data.workers.nameTh}` }}
                  </div>
                </template>
              </Column>
              <Column field="workersSub" header="ช่างคัดเพชร" style="min-width: 200px">
                <template #editor="{ data, field }">
                  <AutoComplete
                    v-model="data[field]"
                    :suggestions="workerItemSearch"
                    @complete="onSearchWorker"
                    placeholder="กรอกรหัส/ชื่อช่าง...."
                    :class="data[field] ? `` : `bg-warning`"
                    optionLabel="code"
                    forceSelection
                  >
                    <template #option="slotProps">
                      <div class="flex align-options-center">
                        <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
                      </div>
                    </template>
                  </AutoComplete>
                </template>
                <template #body="slotProps">
                  <div v-if="slotProps.data.workersSub">
                    {{ `${slotProps.data.workersSub.code} - ${slotProps.data.workersSub.nameTh}` }}
                  </div>
                </template>
              </Column>
              <Column field="goldQTYCheck" :header="$t('common.field.quantity')" style="width: 100px">
                <template #editor="{ data, field }">
                  <input type="number" class="form-control" v-model="data[field]" />
                </template>
                <template #body="slotProps">
                  {{ slotProps.data && slotProps.data.goldQTYCheck ? Number(slotProps.data.goldQTYCheck).toFixed(3).toLocaleString() : '0.000' }}
                </template>
              </Column>
              <Column field="goldWeightCheck" :header="$t('common.field.weight')" style="width: 100px">
                <template #editor="{ data, field }">
                  <input type="number" step="any" class="form-control" v-model="data[field]" />
                </template>
                <template #body="slotProps">
                  {{ slotProps.data && slotProps.data.goldWeightCheck ? Number(slotProps.data.goldWeightCheck).toFixed(3).toLocaleString() : '0.000' }}
                </template>
              </Column>
              <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center" />
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

          <div class="form-col-container mt-3">
            <DataTable
              class="p-datatable-sm"
              showGridlines
              v-model:editingRows="editingGemRows"
              :value="gemAssign"
              editMode="row"
              dataKey="id"
              @row-edit-save="onRowGemEditSave"
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
                  <div class="btn btn-sm btn-red text-center w-100" @click="onDelGem(prop.data)">
                    <i class="bi bi-trash-fill"></i>
                  </div>
                </template>
              </Column>
              <Column field="gem" header="พลอย" style="min-width: 200px">
                <template #editor="{ data, field }">
                  <AutoComplete
                    v-model="data[field]"
                    :suggestions="gemItemSearch"
                    @complete="onSearchGem"
                    @item-select="onGemSelect(data)"
                    placeholder="กรอกรหัสพลอย...."
                    :class="data[field] ? `` : `bg-warning`"
                    optionLabel="name"
                    forceSelection
                    :minLength="4"
                  >
                    <template #option="slotProps">
                      <div class="flex align-options-center">
                        <div>{{ `${slotProps.option.name}` }}</div>
                      </div>
                    </template>
                  </AutoComplete>
                </template>
                <template #body="slotProps">
                  <div v-if="slotProps.data.gem">
                    {{ `${slotProps.data.gem.name}` }}
                  </div>
                </template>
              </Column>
              <Column field="qty" :header="$t('common.field.quantity')" style="width: 100px">
                <template #editor="{ data, field }">
                  <input type="number" step="any" class="form-control" v-model="data[field]" />
                </template>
                <template #body="slotProps">
                  {{ slotProps.data && slotProps.data.qty ? Number(slotProps.data.qty).toFixed(3).toLocaleString() : '0.000' }}
                </template>
              </Column>
              <Column field="weight" :header="$t('common.field.weight')" style="width: 100px">
                <template #editor="{ data, field }">
                  <input type="number" step="any" class="form-control" v-model="data[field]" />
                </template>
                <template #body="slotProps">
                  {{ slotProps.data && slotProps.data.weight ? Number(slotProps.data.weight).toFixed(3).toLocaleString() : '0.000' }}
                </template>
              </Column>
              <Column field="price" :header="$t('common.field.price')" style="width: 100px">
                <template #editor="{ data, field }">
                  <input type="number" step="any" class="form-control" v-model="data[field]" />
                </template>
                <template #body="slotProps">
                  {{ slotProps.data && slotProps.data.price ? Number(slotProps.data.price).toFixed(3).toLocaleString() : '0.000' }}
                </template>
              </Column>
              <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center" />
              <template #footer>
                <div class="d-flex justify-content-between">
                  <div>{{ $t('planUpdate.total') }} {{ gemAssign.length }} {{ $t('planUpdate.items') }}</div>
                  <div @click="addGem">
                    <i class="bi bi-plus-square-fill"></i>
                  </div>
                </div>
              </template>
            </DataTable>
          </div>
          <div>
            <span class="title-text">*</span>
            <span class="title-text" style="font-size: 11px">{{ $t('planUpdate.costCardNote') }}</span>
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
import { formatDate, formatISOString } from '@/services/utils/dayjs'
import _ from 'lodash'

import AutoComplete from 'primevue/autocomplete'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import api from '@/axios/axios-helper.js'

import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

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
      status: 70,
      form: { ...interfaceForm },
      val: { ...interfaceIsValid },
      tempMatAssign: [],
      matAssign: [],
      editingRows: [],
      gemAssign: [],
      editingGemRows: [],
      workerItemSearch: [],
      gemItemSearch: []
    }
  },
  methods: {
    formatDate(date) {
      return date ? formatDate(date) : ''
    },
    onRowEditSave(event) {
      let { newData, index } = event
      this.matAssign[index] = newData
    },
    onRowGemEditSave(event) {
      let { newData, index } = event
      this.gemAssign[index] = newData
    },
    onDelGold(item) {
      const index = this.matAssign.indexOf(item)
      this.matAssign.splice(index, 1)
    },
    onDelGem(item) {
      const index = this.gemAssign.indexOf(item)
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
        gem: null,
        qty: null,
        weight: null,
        price: null
      }
      this.gemAssign.push(add)
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
    onGemSelect(event) {
      const selectedGem = event.gem
      const rowData = event
      if (selectedGem && rowData) {
        rowData.price = selectedGem.price
      }
    },
    onSubmit() {
      if (this.validateForm()) {
        confirmThenSubmit(
          `${this.model.wo}-${this.model.woNumber}`,
          this.$t('planUpdate.confirmGem'),
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
        qty: item.qty,
        weight: item.weight,
        price: item.price
      }))
      const param = {
        wo: this.model.wo,
        woNumber: this.model.woNumber,
        productionPlanId: this.model.id,
        HeaderId: this.form.headerId,
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
    },
    async onSearchWorkerByCode(e) {
      if (e === null) {
        return null
      }
      const params = {
        take: 0,
        skip: 0,
        search: { code: e, text: null, type: null, active: 0 }
      }
      const res = await api.jewelry.post('Worker/Search', params)
      if (res) {
        return res.data[0]
      }
      return null
    },
    async onSearchGem(e) {
      const params = {
        take: 0,
        skip: 0,
        search: { text: e.query ?? null }
      }
      const res = await api.jewelry.post('StockGem/Search', params)
      if (res) {
        this.gemItemSearch = [...res]
      }
    },
    async onSearchGemById(e) {
      const params = {
        take: 0,
        skip: 0,
        search: { id: e ?? null, text: null }
      }
      const res = await api.jewelry.post('StockGem/Search', params)
      if (res && res.length > 0) {
        return res[0]
      }
      return null
    },
    async initForm() {
      var value = this.model.tbtProductionPlanStatusHeader.find((x) => x.status === this.status)
      if (value && Object.keys(value).length > 0) {
        this.form = {
          receiveDate: _.get(value, 'checkDate') ? new Date(value.checkDate) : new Date(),
          receiveBy: _.get(value, 'checkName', ''),
          status: this.status || null,
          remark1: _.get(value, 'remark1', ''),
          remark2: _.get(value, 'remark2', ''),
          headerId: _.get(value, 'id', 0)
        }
        if (value.tbtProductionPlanStatusDetail) {
          this.matAssign = await Promise.all(
            value.tbtProductionPlanStatusDetail.map(async (thing) => ({
              id: ++this.autoId,
              gold: thing.gold,
              goldQTYSend: thing.goldQtySend,
              goldWeightSend: thing.goldWeightSend,
              goldQTYCheck: thing.goldQtyCheck,
              goldWeightCheck: thing.goldWeightCheck,
              description: thing.description,
              workers: await this.onSearchWorkerByCode(thing.worker),
              workersSub: await this.onSearchWorkerByCode(thing.workerSub),
              worker: thing.worker,
              workerSub: thing.workerSub,
              wages: thing.wages,
              totalWages: thing.totalWages,
              requestDate: new Date(thing.requestDate)
            }))
          )
        }
        if (value.tbtProductionPlanStatusGem) {
          this.gemAssign = await Promise.all(
            value.tbtProductionPlanStatusGem.map(async (thing) => ({
              id: ++this.autoIdGem,
              gem: await this.onSearchGemById(thing.id),
              qty: thing.qty,
              weight: thing.weight,
              price: thing.price
            }))
          )
        }
      }
    }
  },
  created() {
    this.matAssign = [...this.modelMat]
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
