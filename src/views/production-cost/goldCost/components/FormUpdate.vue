<template>
  <div class="form-container">
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px" :isShowActionPart="true" headerVariant="main">
      <template #title>
        <span class="title-text-lg d-block">{{ $t('view.productionCost.goldCost.titleUpdate') }}</span>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit" id="goldcost-update-form" class="form-content-container-custom">
          <SectionCardGeneric class="modal-section">
            <div class="form-content-row-four-columns-container mb-2">
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldBookNo')" :required="true">
                <InputTextGeneric v-model="form.bookNo" required disabled />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldNo')" :required="true">
                <InputTextGeneric v-model="form.no" required disabled />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldAssignDate')" :required="true">
                <CalendarGeneric
                  class="w-100"
                  :class="val.isValAssignDate === true ? `p-invalid` : ``"
                  v-model="form.assignDate"
                  :showIcon="true"
                  :showButtonBar="true"
                />
              </FormFieldGeneric>
            </div>
            <div class="form-content-row-four-columns-container mb-2">
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldGoldType')" :required="true">
                <DropdownGeneric
                  v-model="form.gold"
                  :options="masterGold"
                  optionLabel="description"
                  :class="val.isValGold === true ? `p-invalid` : ``"
                  :showClear="!!form.gold?.code"
                />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldGoldPercent')" :required="true">
                <DropdownGeneric
                  v-model="form.goldSize"
                  :options="masterGoldSize"
                  optionLabel="description"
                  :class="val.isValGoldSize === true ? `p-invalid` : ``"
                  :showClear="!!form.goldSize?.code"
                />
              </FormFieldGeneric>
            </div>
            <div class="form-content-row-one-columns-container">
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldGoldReceipt')" :required="true">
                <InputTextGeneric v-model="form.goldReceipt" required />
              </FormFieldGeneric>
            </div>
          </SectionCardGeneric>

          <SectionCardGeneric :title="$t('view.productionCost.goldCost.sectionMelt')" class="modal-section">
            <div class="form-content-row-four-columns-container">
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldMeltDate')">
                <CalendarGeneric
                  class="w-100"
                  :class="val.isValMeltDate === true ? `p-invalid` : ``"
                  v-model="form.meltDate"
                  :showIcon="true"
                  :showButtonBar="true"
                />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldMeltWeight')">
                <InputTextGeneric type="number" step="any" min="0" v-model="form.meltWeight" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldReturnMeltWeight')">
                <InputTextGeneric type="number" step="any" min="0" v-model="form.returnMeltWeight" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldReturnMeltScrap')">
                <InputTextGeneric type="number" step="any" min="0" v-model="form.returnMeltScrapWeight" />
              </FormFieldGeneric>
            </div>
            <div class="form-content-row-four-columns-container">
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldMeltWeightLoss')">
                <InputTextGeneric
                  type="number" step="any" min="0"
                  v-model="form.meltWeightLoss"
                  :disabled="form.meltWeightOver > 0"
                />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldMeltWeightOver')">
                <InputTextGeneric
                  type="number" step="any" min="0"
                  v-model="form.meltWeightOver"
                  :disabled="form.meltWeightLoss > 0"
                />
              </FormFieldGeneric>
            </div>
          </SectionCardGeneric>

          <SectionCardGeneric :title="$t('view.productionCost.goldCost.sectionCast')" class="modal-section">
            <div class="form-content-row-four-columns-container">
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldCastDate')">
                <CalendarGeneric
                  class="w-100"
                  :class="val.isValCastDate === true ? `p-invalid` : ``"
                  v-model="form.castDate"
                  :showIcon="true"
                  :showButtonBar="true"
                />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldCastWeight')">
                <InputTextGeneric type="number" step="any" min="0" v-model="form.castWeight" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldGemWeight')">
                <InputTextGeneric type="number" step="any" min="0" v-model="form.gemWeight" disabled />
              </FormFieldGeneric>
            </div>
            <div class="form-content-row-four-columns-container">
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldReturnCastWeight')">
                <InputTextGeneric type="number" step="any" min="0" v-model="form.returnCastWeight" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldReturnCastMold')">
                <InputTextGeneric type="number" step="any" min="0" v-model="form.returnCastMoldWeight" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldReturnCastBodyBroken')">
                <InputTextGeneric type="number" step="any" min="0" v-model="form.returnCastBodyBrokenWeight" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldReturnCastBodyTotal')">
                <InputTextGeneric type="number" step="any" min="0" disabled :value="onSumBodyReturn()" />
              </FormFieldGeneric>
            </div>
            <div class="form-content-row-four-columns-container">
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldReturnCastScrap')">
                <InputTextGeneric type="number" step="any" min="0" v-model="form.returnCastScrapWeight" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldReturnCastPowder')">
                <InputTextGeneric type="number" step="any" min="0" v-model="form.returnCastPowderWeight" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldCastWeightLoss')">
                <InputTextGeneric
                  type="number" step="any" min="0"
                  v-model="form.castWeightLoss"
                  :disabled="form.castWeightOver > 0"
                />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldCastWeightOver')">
                <InputTextGeneric
                  type="number" step="any" min="0"
                  v-model="form.castWeightOver"
                  :disabled="form.castWeightLoss > 0"
                />
              </FormFieldGeneric>
            </div>
          </SectionCardGeneric>

          <SectionCardGeneric :title="$t('view.productionCost.goldCost.sectionReturnBody')" class="modal-section">
            <div class="form-content-row-one-columns-container mt-1">
              <!-- eslint-disable-next-line no-restricted-imports -->
              <DataTable
                class="p-datatable-sm"
                showGridlines
                dataKey="id"
                v-model:editingRows="editingRows"
                :value="form.items"
                editMode="row"
                scrollable
                resizableColumns
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
                <!-- eslint-disable-next-line no-restricted-imports -->
                <ColumnGroup type="header">
                  <!-- eslint-disable-next-line no-restricted-imports -->
                  <Row>
                    <!-- eslint-disable-next-line no-restricted-imports -->
                    <Column header=""></Column>
                    <!-- eslint-disable-next-line no-restricted-imports -->
                    <Column header="WO ตัวเรือน"></Column>
                    <!-- eslint-disable-next-line no-restricted-imports -->
                    <Column header="จำนวนคืนตัวเรือน"></Column>
                    <!-- eslint-disable-next-line no-restricted-imports -->
                    <Column header="น้ำหนักคืนตัวเรือน"></Column>
                    <!-- eslint-disable-next-line no-restricted-imports -->
                    <Column header="รายละเอียด"></Column>
                    <!-- eslint-disable-next-line no-restricted-imports -->
                    <Column header=""></Column>
                  </Row>
                </ColumnGroup>
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column style="width: 30px">
                  <template #body="prop">
                    <div class="btn btn-sm btn-red text-center w-100" @click="onDelItem(prop.data)">
                      <i class="bi bi-trash-fill"></i>
                    </div>
                  </template>
                </Column>
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column field="productionPlan" style="min-width: 150px">
                  <template #editor="{ data, field }">
                    <!-- eslint-disable-next-line no-restricted-imports -->
                    <AutoComplete
                      v-model="data[field]"
                      :suggestions="productItemSearch"
                      @complete="onSearchProductionPlanId"
                      placeholder="กรอก WO/WO No. ตัวเรือน"
                      :class="data[field] ? `` : `p-invalid`"
                      optionLabel="woText"
                      forceSelection
                    >
                      <template #option="slotProps">
                        <div class="flex align-options-center">
                          <div>{{ `${slotProps.option.wo}-${slotProps.option.woNumber}` }}</div>
                        </div>
                      </template>
                    </AutoComplete>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.productionPlan">
                      {{ `${slotProps.data.productionPlan.wo}-${slotProps.data.productionPlan.woNumber}` }}
                    </div>
                    <div v-else>โปรดระบุ WO/WO No. ตัวเรือน</div>
                  </template>
                </Column>
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column field="returnQTY" style="width: 30px">
                  <template #editor="{ data, field }">
                    <input type="number" min="1" step="any" class="form-control text-right" v-model="data[field]" />
                  </template>
                  <template #body="slotProps">
                    <div class="text-right">{{ `${slotProps.data.returnQTY ?? `0`}` }}</div>
                  </template>
                </Column>
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column field="returnWeight" style="width: 30px">
                  <template #editor="{ data, field }">
                    <input type="number" min="1" step="any" class="form-control text-right" v-model="data[field]" />
                  </template>
                  <template #body="slotProps">
                    <div class="text-right">{{ `${slotProps.data.returnWeight ?? `0`}` }}</div>
                  </template>
                </Column>
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column field="remark" style="min-width: 150px">
                  <template #editor="{ data, field }">
                    <input type="text" class="form-control" v-model="data[field]" />
                  </template>
                </Column>
                <!-- eslint-disable-next-line no-restricted-imports -->
                <Column :rowEditor="true" bodyStyle="text-align:center"></Column>
                <!-- eslint-disable-next-line no-restricted-imports -->
                <ColumnGroup type="footer">
                  <!-- eslint-disable-next-line no-restricted-imports -->
                  <Row>
                    <!-- eslint-disable-next-line no-restricted-imports -->
                    <Column footer="รวมน้ำหนักคืนตัวเรือน" footerStyle="text-align:right" :colspan="3" />
                    <!-- eslint-disable-next-line no-restricted-imports -->
                    <Column :footer="onSumBodyReturn()" footerStyle="text-align:right" />
                    <!-- eslint-disable-next-line no-restricted-imports -->
                    <Column :colspan="2">
                      <template #footer>
                        <div class="d-flex justify-content-end">
                          <div @click="addItems">
                            <i class="bi bi-plus-square-fill"></i>
                          </div>
                        </div>
                      </template>
                    </Column>
                  </Row>
                </ColumnGroup>
              </DataTable>
            </div>
          </SectionCardGeneric>

          <SectionCardGeneric :title="$t('view.productionCost.goldCost.sectionOther')" class="modal-section">
            <div class="form-content-row-one-columns-container">
              <div>
                <TextareaGeneric v-model="form.remark" :rows="3" />
              </div>
            </div>
            <div class="form-content-row-two-columns-container mt-3">
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldAssignBy')">
                <InputTextGeneric v-model="form.assignBy" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.productionCost.goldCost.fieldReceiveBy')">
                <InputTextGeneric v-model="form.receiveBy" />
              </FormFieldGeneric>
            </div>
          </SectionCardGeneric>
        </form>
      </template>
      <template #action>
        <ButtonGeneric variant="outline" :label="$t('view.productionCost.goldCost.btnCancelUpdate')" @click="closeModal" />
        <ButtonGeneric variant="main" :label="$t('view.productionCost.goldCost.btnConfirmUpdate')" type="submit" form="goldcost-update-form" class="ml-2" />
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

// eslint-disable-next-line no-restricted-imports
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'
// eslint-disable-next-line no-restricted-imports
import Row from 'primevue/row'
// eslint-disable-next-line no-restricted-imports
import ColumnGroup from 'primevue/columngroup'
// eslint-disable-next-line no-restricted-imports
import AutoComplete from 'primevue/autocomplete'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

import api from '@/axios/axios-helper.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { formatDate, formatISOString } from '@/services/utils/dayjs'

const interfaceForm = {
  bookNo: null,
  no: null,
  assignDate: new Date(),
  gold: null,
  goldSize: null,
  goldReceipt: null,
  meltDate: null,
  meltWeight: null,
  returnMeltWeight: null,
  returnMeltScrapWeight: null,
  meltWeightLoss: null,
  meltWeightOver: null,
  castWeight: null,
  gemWeight: null,
  returnCastWeight: null,
  returnCastMoldWeight: null,
  returnCastBodyBrokenWeight: null,
  returnCastBodyWeight: null,
  returnCastScrapWeight: null,
  returnCastPowderWeight: null,
  castWeightLoss: null,
  castWeightOver: null,
  remark: null,
  assignBy: null,
  receiveBy: null,
  items: []
}
const interfaceIsValid = {
  isValAssignDate: false,
  isValMeltDate: false,
  isValCastDate: false,
  isValGold: false,
  isValGoldSize: false
}

export default {
  components: {
    modal,
    DataTable,
    Column,
    AutoComplete,
    Row,
    ColumnGroup,
    InputTextGeneric,
    TextareaGeneric,
    FormFieldGeneric,
    ButtonGeneric,
    SectionCardGeneric,
    CalendarGeneric,
    DropdownGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    masterGold: {
      type: Array,
      required: true,
      default: () => []
    },
    masterGoldSize: {
      type: Array,
      required: true,
      default: () => []
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    }
  },

  watch: {
    'form.assignDate'() {
      if (this.form.assignDate) {
        this.val.isValAssignDate = false
      }
    },
    'form.gold'() {
      if (this.form.gold) {
        this.val.isValGold = false
      }
    },
    'form.goldSize'() {
      if (this.form.goldSize) {
        this.val.isValGoldSize = false
      }
    },
    async modelValue(value) {
      this.form = {
        bookNo: value.bookNo,
        no: value.no,
        assignDate: new Date(value.assignDate),
        gold: this.masterGold.find((x) => x.code === value.goldCode),
        goldSize: this.masterGoldSize.find((x) => x.code === value.goldSizeCode),
        goldReceipt: value.goldReceipt,
        meltDate: value.meltDate ? new Date(value.meltDate) : null,
        meltWeight: value.meltWeight,
        returnMeltWeight: value.returnMeltWeight,
        returnMeltScrapWeight: value.returnMeltScrapWeight,
        meltWeightLoss: value.meltWeightLoss,
        meltWeightOver: value.meltWeightOver,
        castDate: value.castDate ? new Date(value.castDate) : null,
        castWeight: value.castWeight,
        gemWeight: value.gemWeight,
        returnCastWeight: value.returnCastWeight,
        returnCastMoldWeight: value.returnCastMoldWeight,
        returnCastBodyBrokenWeight: value.returnCastBodyBrokenWeight,
        returnCastScrapWeight: value.returnCastScrapWeight,
        returnCastPowderWeight: value.returnCastPowderWeight,
        castWeightLoss: value.castWeightLoss,
        castWeightOver: value.castWeightOver,
        remark: value.remark,
        assignBy: value.assignBy,
        receiveBy: value.receiveBy,
        items: await Promise.all(
          value.items.map(async (x) => {
            const res = await this.onSearchProductionPlanIdByCode(x.productionPlanId)
            return {
              id: ++this.autoId,
              productionPlan: { ...res },
              returnWeight: x.returnWeight,
              returnQTY: x.returnQTY,
              remark: x.remark
            }
          })
        )
      }
    }
  },

  data() {
    return {
      autoId: 0,
      form: { ...interfaceForm },
      val: { ...interfaceIsValid },
      editingRows: [],
      productItemSearch: []
    }
  },

  methods: {
    closeModal() {
      this.form = { ...interfaceForm }
      this.val = { ...interfaceIsValid }
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        confirmThenSubmit(
          `เลขที่:${this.form.no} | เล่มที่:${this.form.bookNo}`,
          this.$t('view.productionCost.goldCost.confirmUpdate'),
          async () => {
            await this.submit()
          }
        )
      }
    },
    validateForm() {
      if (!this.form.assignDate) {
        this.val = { isValAssignDate: true }
        return false
      }
      if (!this.form.gold) {
        this.val = { isValGold: true }
        return false
      }
      if (!this.form.goldSize) {
        this.val = { isValGoldSize: true }
        return false
      }
      return true
    },

    onRowEditSave(event) {
      const { newData, index } = event
      this.form.items[index] = newData
    },
    addItems() {
      this.form.items.push({
        id: ++this.autoId,
        productionPlanId: null,
        returnWeight: 0
      })
    },
    onDelItem(item) {
      const index = this.form.items.indexOf(item)
      this.form.items.splice(index, 1)
    },
    onSumBodyReturn() {
      let sum = 0
      if (this.form.items) {
        this.form.items.forEach((x) => { sum += x.returnWeight })
      }
      return sum.toFixed(2)
    },

    formatDate(date) {
      return date ? formatDate(date) : ''
    },

    async submit() {
      this.form.items = this.form.items.map((x) => ({
        ...x,
        productionPlanId: x.productionPlan
          ? `${x.productionPlan.wo}-${x.productionPlan.woNumber}`
          : null
      }))

      const params = {
        ...this.form,
        goldCode: this.form.gold.code,
        goldSizeCode: this.form.goldSize.code,
        assignDateFormat: this.form.assignDate ? formatISOString(this.form.assignDate) : null,
        meltDateFormat: this.form.meltDate ? formatISOString(this.form.meltDate) : null,
        castDateFormat: this.form.castDate ? formatISOString(this.form.castDate) : null
      }

      const res = await api.jewelry.post('ProductionPlanCost/UpdateGoldCost', params)
      if (res) {
        success(null, null, () => {
          this.form = { ...interfaceForm }
          this.val = { ...interfaceIsValid }
          this.$emit('fetch')
        })
      }
    },

    async onSearchProductionPlanId(e) {
      const params = {
        take: 0,
        skip: 0,
        search: { text: e.query ?? null }
      }
      const res = await api.jewelry.post(
        'ProductionPlan/ProductionPlanSearchByProductionPlanId',
        params
      )
      if (res) {
        this.productItemSearch = [...res.data]
      }
    },

    async onSearchProductionPlanIdByCode(e) {
      const productionPlanId = e.replace(/-/g, '')
      const params = {
        take: 0,
        skip: 0,
        search: { text: productionPlanId }
      }
      const res = await api.jewelry.post(
        'ProductionPlan/ProductionPlanSearchByProductionPlanId',
        params
      )
      if (res) {
        return res.data.find((x) => x.woText === productionPlanId)
      }
      return null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/form-modal.scss';

.form-content-container-custom {
  padding: var(--sp-lg) var(--sp-lg);
  overflow: auto;
}

.modal-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
