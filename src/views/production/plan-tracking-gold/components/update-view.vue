<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.production.planTrackingGold.updateTitle') }}</span>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit" id="gold-update-form">
          <div class="p-4">
            <!-- ข้อมูล -->
            <pageTitle :title="$t('view.production.planTrackingGold.formTitle')" :isShowBtnClose="false" class="mb-3" />
            <div class="border-container p-4">
              <div class="form-col-container">
                <div>
                  <span class="title-text">
                    <span>{{ $t('view.production.planTrackingGold.bookNo') }}</span>
                    <span class="txt-required"> *</span>
                  </span>
                  <input type="text" class="form-control" v-model="form.bookNo" required disabled />
                </div>
                <div>
                  <span class="title-text">
                    <span>{{ $t('view.production.planTrackingGold.no') }}</span>
                    <span class="txt-required"> *</span>
                  </span>
                  <input type="text" class="form-control" v-model="form.no" required disabled />
                </div>
                <div>
                  <span class="title-text">
                    <span>{{ $t('view.production.planTrackingGold.assignDate') }}</span>
                    <span class="txt-required"> *</span>
                  </span>
                  <CalendarGeneric
                    v-model="form.assignDate"
                    :showButtonBar="true"
                    :customClass="val.isValAssignDate === true ? 'p-invalid' : ''"
                  />
                </div>
                <div></div>
              </div>
              <div class="form-col-container">
                <div>
                  <span class="title-text">
                    <span>{{ $t('view.production.planTrackingGold.goldType') }}</span>
                    <span class="txt-required"> *</span>
                  </span>
                  <DropdownGeneric
                    :modelValue="form.gold"
                    :options="masterGold"
                    optionLabel="description"
                    :showClear="!!form.gold?.code"
                    :customClass="val.isValGold === true ? 'p-invalid' : ''"
                    @update:modelValue="form.gold = $event"
                  />
                </div>
                <div>
                  <span class="title-text">
                    <span>{{ $t('view.production.planTrackingGold.goldPercent') }}</span>
                    <span class="txt-required"> *</span>
                  </span>
                  <DropdownGeneric
                    :modelValue="form.goldSize"
                    :options="masterGoldSize"
                    optionLabel="description"
                    :showClear="!!form.goldSize?.code"
                    :customClass="val.isValGoldSize === true ? 'p-invalid' : ''"
                    @update:modelValue="form.goldSize = $event"
                  />
                </div>
              </div>
              <div class="form-col-container">
                <div>
                  <span class="title-text">
                    <span>{{ $t('view.production.planTrackingGold.goldReceipt') }}</span>
                    <span class="txt-required"> *</span>
                  </span>
                  <input type="text" class="form-control" v-model="form.goldReceipt" required />
                </div>
              </div>
              <div class="form-col-container">
                <div>
                  <span class="title-text">
                    <span>{{ $t('view.production.planTrackingGold.assignBy') }}</span>
                  </span>
                  <input type="text" class="form-control" v-model="form.assignBy" />
                </div>
                <div>
                  <span class="title-text">
                    <span>{{ $t('view.production.planTrackingGold.receiveBy') }}</span>
                  </span>
                  <input type="text" class="form-control" v-model="form.receiveBy" />
                </div>
              </div>
              <div class="form-col-container">
                <div>
                  <span class="title-text">
                    <span>{{ $t('view.production.planTrackingGold.otherDetail') }}</span>
                  </span>
                  <textarea class="form-control" v-model="form.remark"></textarea>
                </div>
              </div>
              <div class="form-col-container">
                <div>
                  <span class="title-text">
                    <span>{{ $t('view.production.planTrackingGold.colCost') }}</span>
                    <span class="txt-required"> *</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.cost"
                    required
                  />
                </div>
                <div></div>
              </div>
            </div>

            <!-- ทองหลอม -->
            <pageTitle title="ข้อมูลทองหลอม (โปรดระบุน้ำหนัก)" :isShowBtnClose="false" class="mt-4 mb-3" />
            <div class="border-container p-4">
              <div class="form-col-container">
                <div>
                  <span class="title-text">
                    <span>วันที่เบิกหลอม</span>
                  </span>
                  <CalendarGeneric
                    v-model="form.meltDate"
                    :showButtonBar="true"
                    :customClass="val.isValMeltDate === true ? 'p-invalid' : ''"
                  />
                </div>
                <div>
                  <span class="title-text">
                    <span>เบิกทองหลอม</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.meltWeight"
                  />
                </div>
                <div>
                  <span class="title-text">
                    <span>คืนทองหลอม</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.returnMeltWeight"
                  />
                </div>
                <div></div>
              </div>

              <!-- ขี้เบ้า -->
              <div class="mt-3 filter-container-bg">
                <div class="form-col-container">
                  <div>
                    <span class="title-text-white">
                      <span>คืนขี้เบ้า</span>
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      class="form-control"
                      v-model="form.returnMeltScrapWeight"
                    />
                  </div>
                  <div>
                    <span class="title-text-white">
                      <span>วันที่คืนขี้เบ้า</span>
                    </span>
                    <CalendarGeneric
                      v-model="form.returnMeltScrapWeightDate"
                      :showButtonBar="true"
                    />
                  </div>
                  <div></div>
                  <div></div>
                </div>
              </div>
              <div class="form-col-container mt-2">
                <div>
                  <span class="title-text">
                    <span>น้ำหนักขาด</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.meltWeightLoss"
                    :disabled="form.meltWeightOver > 0"
                  />
                </div>
                <div>
                  <span class="title-text">
                    <span>น้้ำหนักเกิน</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.meltWeightOver"
                    :disabled="form.meltWeightLoss > 0"
                  />
                </div>
              </div>
              <div class="form-col-container">
                <div>
                  <span class="title-text">{{ $t('view.production.planTrackingGold.colZill') }}</span>
                  <AutoCompleteGeneric
                    :modelValue="form.zill"
                    apiEndpoint="Master/ListMaster"
                    :additionalSearchParams="{ type: 'ZILL', goldCode: form.gold?.code, goldSizeCode: form.goldSize?.code }"
                    placeholder="กรอกรหัสซิล ...."
                    :forceSelection="true"
                    :minLength="3"
                    :disabled="!form.gold || !form.goldSize"
                    @update:modelValue="form.zill = $event"
                  />
                </div>
                <div>
                  <span class="title-text">
                    <span>{{ $t('view.production.planTrackingGold.colZillQty') }}</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.zillQty"
                    :disabled="!form.gold || !form.goldSize || !form.zill"
                  />
                </div>
              </div>
            </div>

            <!-- ทองหล่อ -->
            <pageTitle title="ข้อมูลทองหล่อ (โปรดระบุน้ำหนัก)" :isShowBtnClose="false" class="mt-4 mb-3" />
            <div class="border-container p-4">
              <div class="form-col-container">
                <div>
                  <span class="title-text">
                    <span>วันที่เบิกหล่อ</span>
                  </span>
                  <CalendarGeneric
                    v-model="form.castDate"
                    :showButtonBar="true"
                    :customClass="val.isValCastDate === true ? 'p-invalid' : ''"
                  />
                </div>
                <div>
                  <span class="title-text">
                    <span>เบิกทองหล่อ</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.castWeight"
                  />
                </div>
                <div>
                  <span class="title-text">
                    <span>เบิกพลอยเพชร</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.gemWeight"
                    disabled
                  />
                </div>
                <div></div>
              </div>
              <div class="form-col-container">
                <div>
                  <span class="title-text">
                    <span>คืนทองหล่อ</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.returnCastWeight"
                  />
                </div>
                <div>
                  <span class="title-text">
                    <span>คืนเเม่พิมพ์</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.returnCastMoldWeight"
                  />
                </div>
                <div>
                  <span class="title-text">
                    <span>คืนตัวเรือนเสีย</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.returnCastBodyBrokenWeight"
                  />
                </div>
                <div>
                  <span class="title-text">
                    <span>รวมคืนตัวเรือน</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    disabled
                    :value="onSumBodyReturn()"
                  />
                </div>
              </div>
              <div class="form-col-container">
                <div>
                  <span class="title-text">
                    <span>คืนผงทอง</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.returnCastPowderWeight"
                  />
                </div>
                <div>
                  <span class="title-text">
                    <span>น้ำหนักขาด</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.castWeightLoss"
                    :disabled="form.castWeightOver > 0"
                  />
                </div>
                <div>
                  <span class="title-text">
                    <span>น้้ำหนักเกิน</span>
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    class="form-control"
                    v-model="form.castWeightOver"
                    :disabled="form.castWeightLoss > 0"
                  />
                </div>
                <div></div>
              </div>

              <!-- ขี้เบ้า -->
              <div class="mt-3 filter-container-bg">
                <div class="form-col-container">
                  <div>
                    <span class="title-text-white">
                      <span>คืนขี้เบ้า</span>
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      class="form-control"
                      v-model="form.returnCastScrapWeight"
                    />
                  </div>
                  <div>
                    <span class="title-text-white">
                      <span>วันที่คืนขี้เบ้า</span>
                    </span>
                    <CalendarGeneric
                      v-model="form.returnCastScrapWeightDate"
                      :showButtonBar="true"
                    />
                  </div>
                  <div></div>
                  <div></div>
                </div>
              </div>

              <div class="title-text-lg mt-4 mt-2">
                <span class="mr-2"><i class="bi bi-gem"></i></span>
                <span>คืนตัวเรือน</span>
              </div>
              <div class="form-col-container">
                <!-- ColumnGroup exception: DataTable + ColumnGroup + Row with editMode="row" — cannot use BaseDataTable -->
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
                  <ColumnGroup type="header">
                    <Row>
                      <Column header=""></Column>
                      <Column header="WO ตัวเรือน"></Column>
                      <Column header="จำนวนคืนตัวเรือน"></Column>
                      <Column header="น้ำหนักคืนตัวเรือน"></Column>
                      <Column header="รายละเอียด"></Column>
                      <Column header=""></Column>
                    </Row>
                  </ColumnGroup>
                  <Column style="width: 30px">
                    <template #body="prop">
                      <div
                        class="btn btn-sm btn-red text-center w-100"
                        @click="onDelItem(prop.data)"
                      >
                        <i class="bi bi-trash-fill"></i>
                      </div>
                    </template>
                  </Column>
                  <Column field="productionPlan" style="min-width: 150px">
                    <template #editor="{ data, field }">
                      <AutoCompleteGeneric
                        :modelValue="data[field]"
                        apiEndpoint="ProductionPlan/ProductionPlanSearchByProductionPlanId"
                        optionLabel="woText"
                        placeholder="กรอก WO/WO No. ตัวเรือน"
                        :forceSelection="true"
                        :customClass="data[field] ? '' : 'p-invalid'"
                        @update:modelValue="data[field] = $event"
                      >
                        <template #option="{ option }">
                          <div>{{ `${option.wo}-${option.woNumber}` }}</div>
                        </template>
                      </AutoCompleteGeneric>
                    </template>
                    <template #body="slotProps">
                      <div v-if="slotProps.data.productionPlan">
                        {{
                          `${slotProps.data.productionPlan.wo}-${slotProps.data.productionPlan.woNumber}`
                        }}
                      </div>
                      <div v-else>โปรดระบุ WO/WO No. ตัวเรือน</div>
                    </template>
                  </Column>
                  <Column field="returnQTY" header="จำนวนคืนตัวเรือน" style="width: 30px">
                    <template #editor="{ data, field }">
                      <input
                        type="number"
                        min="1"
                        step="any"
                        class="form-control text-right"
                        v-model="data[field]"
                      />
                    </template>
                    <template #body="slotProps">
                      <div class="text-right">
                        {{ `${slotProps.data.returnQTY ?? `0`}` }}
                      </div>
                    </template>
                  </Column>
                  <Column field="returnWeight" header="น้ำหนักคืนตัวเรือน" style="width: 30px">
                    <template #editor="{ data, field }">
                      <input
                        type="number"
                        min="1"
                        step="any"
                        class="form-control text-right"
                        v-model="data[field]"
                      />
                    </template>
                    <template #body="slotProps">
                      <div class="text-right">
                        {{ `${slotProps.data.returnWeight ?? `0`}` }}
                      </div>
                    </template>
                  </Column>
                  <Column field="remark" header="รายละเอียด" style="min-width: 150px">
                    <template #editor="{ data, field }">
                      <input
                        type="text"
                        class="form-control"
                        v-model="data[field]"
                      />
                    </template>
                  </Column>
                  <Column :rowEditor="true" bodyStyle="text-align:center"> </Column>
                  <ColumnGroup type="footer">
                    <Row>
                      <Column
                        footer="รวมน้ำหนักคืนตัวเรือน"
                        footerStyle="text-align:right"
                        :colspan="3"
                      />
                      <Column :footer="onSumBodyReturn()" footerStyle="text-align:right" />
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
            </div>
          </div>
        </form>
      </template>
      <template #action>
        <button class="btn btn-sm btn-main" type="submit" form="gold-update-form">
          <i class="bi bi-save"></i> {{ $t('common.btn.save') }}
        </button>
        <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="closeModal">
          {{ $t('common.btn.cancel') }}
        </button>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

// eslint-disable-next-line no-restricted-imports
// ColumnGroup exception: DataTable + ColumnGroup + Row with editMode="row" — cannot use BaseDataTable
import DataTable from 'primevue/datatable' // eslint-disable-line no-restricted-imports
import Column from 'primevue/column' // eslint-disable-line no-restricted-imports
import Row from 'primevue/row' // eslint-disable-line no-restricted-imports
import ColumnGroup from 'primevue/columngroup' // eslint-disable-line no-restricted-imports

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'

import api from '@/axios/axios-helper.js'
import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import { formatISOString } from '@/services/utils/dayjs'

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
  returnMeltScrapWeightDate: null,
  meltWeightLoss: null,
  meltWeightOver: null,
  castWeight: null,
  gemWeight: null,
  returnCastWeight: null,
  returnCastMoldWeight: null,
  returnCastBodyBrokenWeight: null,
  returnCastBodyWeight: null,
  returnCastScrapWeight: null,
  returnCastScrapWeightDate: null,
  returnCastPowderWeight: null,
  castWeightLoss: null,
  castWeightOver: null,
  remark: null,
  assignBy: null,
  receiveBy: null,
  zill: null,
  zillQty: null,
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
    pageTitle,
    DropdownGeneric,
    CalendarGeneric,
    AutoCompleteGeneric,
    DataTable,
    Column,
    Row,
    ColumnGroup
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
      required: true
    },
    modelMasterGold: {
      type: Array,
      required: true,
      default: () => []
    },
    modelMasterGoldSize: {
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
  computed: {
    masterGold() {
      return this.modelMasterGold
    },
    masterGoldSize() {
      return this.modelMasterGoldSize
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
        returnMeltScrapWeightDate: value.returnMeltScrapWeightDate
          ? new Date(value.returnMeltScrapWeightDate)
          : null,
        meltWeightLoss: value.meltWeightLoss,
        meltWeightOver: value.meltWeightOver,
        castDate: value.castDate ? new Date(value.castDate) : null,
        castWeight: value.castWeight,
        gemWeight: value.gemWeight,
        returnCastWeight: value.returnCastWeight,
        returnCastMoldWeight: value.returnCastMoldWeight,
        returnCastBodyBrokenWeight: value.returnCastBodyBrokenWeight,
        returnCastScrapWeight: value.returnCastScrapWeight,
        returnCastScrapWeightDate: value.returnCastScrapWeightDate
          ? new Date(value.returnCastScrapWeightDate)
          : null,
        returnCastPowderWeight: value.returnCastPowderWeight,
        castWeightLoss: value.castWeightLoss,
        castWeightOver: value.castWeightOver,
        remark: value.remark,
        assignBy: value.assignBy,
        receiveBy: value.receiveBy,
        zill: value.zill,
        zillQty: value.zillQty,
        cost: value.cost,
        items: await Promise.all(
          value.items.map(async (x) => {
            const res = await this.onSearchProductionPlanIdByCode(x.productionPlanId)
            return {
              id: ++this.autoId,
              productionPlan: {
                ...res
              },
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

      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceIsValid
      },

      editingRows: []
    }
  },
  methods: {
    closeModal() {
      this.form = {
        ...interfaceForm
      }
      this.val = {
        ...interfaceIsValid
      }
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        confirmSubmit(
          `เลขที่:${this.form.no} | เล่มที่:${this.form.bookNo} `,
          `${this.$t('view.production.planTrackingGold.confirmSave')}`,
          async () => {
            await this.submit()
          }
        )
      }
    },
    validateForm() {
      if (!this.form.assignDate) {
        this.val = {
          isValAssignDate: true
        }
        return false
      }
      if (!this.form.gold) {
        this.val = {
          isValGold: true
        }
        return false
      }
      if (!this.form.goldSize) {
        this.val = {
          isValGoldSize: true
        }
        return false
      }
      return true
    },

    onRowEditSave(event) {
      let { newData, index } = event
      this.form.items[index] = newData
    },
    addItems() {
      const add = {
        id: ++this.autoId,
        productionPlanId: null,
        returnWeight: 0
      }
      this.form.items.push(add)
    },
    onDelItem(item) {
      const index = this.form.items.indexOf(item)
      this.form.items.splice(index, 1)
    },
    onSumBodyReturn() {
      let sum = 0
      if (this.form.items) {
        this.form.items.forEach((x) => {
          sum += x.returnWeight
        })
      }
      return sum.toFixed(2)
    },

    async submit() {
      this.form.items = this.form.items.map((x) => {
        return {
          ...x,
          id: x.productionPlan ? x.productionPlan.id : null,
          productionPlanId: x.productionPlan
            ? `${x.productionPlan.wo}-${x.productionPlan.woNumber}`
            : null
        }
      })

      const params = {
        ...this.form,
        goldCode: this.form.gold.code,
        goldSizeCode: this.form.goldSize.code,
        assignDateFormat: this.form.assignDate ? formatISOString(this.form.assignDate) : null,
        meltDateFormat: this.form.meltDate ? formatISOString(this.form.meltDate) : null,
        castDateFormat: this.form.castDate ? formatISOString(this.form.castDate) : null,
        returnMeltScrapWeightDate: this.form.returnMeltScrapWeightDate
          ? formatISOString(this.form.returnMeltScrapWeightDate)
          : null,
        returnCastScrapWeightDate: this.form.returnCastScrapWeightDate
          ? formatISOString(this.form.returnCastScrapWeightDate)
          : null
      }

      const res = await api.jewelry.post('ProductionPlanCost/UpdateGoldCost', params)
      if (res) {
        success(
          null,
          null,
          () => {
            this.form = {
              ...interfaceForm
            }
            this.val = {
              ...interfaceIsValid
            }
            this.$emit('fetch')
          }
        )
      }
    },
    async onSearchProductionPlanIdByCode(e) {
      const productionPlanId = e.replace(/-/g, '')
      const params = {
        take: 0,
        skip: 0,
        search: {
          text: productionPlanId
        }
      }
      const res = await api.jewelry.post(
        'ProductionPlan/ProductionPlanSearchByProductionPlanId',
        params
      )
      if (res) {
        return res.data.find((x) => x.woText === productionPlanId)
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.card { background: #ffffff !important; }

input.form-control,
textarea.form-control {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }
}

textarea.form-control {
  resize: vertical;
}
</style>
