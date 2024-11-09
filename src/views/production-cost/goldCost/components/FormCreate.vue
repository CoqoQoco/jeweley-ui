<template>
  <div class="form-container">
  
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px">
      <template v-slot:content>
        <form @submit.prevent="onSubmit" class="form-content-container-custom">
          <div class="mb-3">
            <span class="txt-title-modal">เพิ่มข้อมูลผสมทอง</span>
          </div>
          <div class="form-content-row-four-columns-container mb-2">
            <div>
              <span class="txt-title">
                <span>เล่มที่</span>
                <span class="txt-required"> *</span>
              </span>
              <input type="text" class="form-control" v-model="form.bookNo" required />
            </div>
            <div>
              <span class="txt-title">
                <span>เลขที่</span>
                <span class="txt-required"> *</span>
              </span>
              <input type="text" class="form-control" v-model="form.no" required />
            </div>
            <div>
              <span class="txt-title">
                <span>วันที่เบิก</span>
                <span class="txt-required"> *</span>
              </span>
              <Calendar
                class="w-100"
                :class="val.isValAssignDate === true ? `p-invalid` : ``"
                v-model="form.assignDate"
                dateFormat="dd/mm/yy"
                showIcon
                showButtonBar
              />
            </div>
          </div>
          <div class="form-content-row-four-columns-container mb-2">
            <div>
              <span class="txt-title">
                <span>ประเภททอง</span>
                <span class="txt-required"> *</span>
              </span>
              <Dropdown
                v-model="form.gold"
                :options="masterGold"
                optionLabel="description"
                class="w-full md:w-14rem"
                :class="val.isValGold === true ? `p-invalid` : ``"
                :showClear="form.gold?.code ? true : false"
              />
            </div>
            <div>
              <span class="txt-title">
                <span>เปอร์เซ็นทอง</span>
                <span class="txt-required"> *</span>
              </span>
              <Dropdown
                v-model="form.goldSize"
                :options="masterGoldSize"
                optionLabel="description"
                class="w-full md:w-14rem"
                :class="val.isValGoldSize === true ? `p-invalid` : ``"
                :showClear="form.goldSize?.code ? true : false"
              />
            </div>
          </div>
          <div class="form-content-row-one-columns-container">
            <div>
              <span class="txt-title">
                <span>สูตรผสมทอง</span>
                <span class="txt-required"> *</span>
              </span>
              <input type="text" class="form-control" v-model="form.goldReceipt" required />
            </div>
          </div>
          <div class="txt-title-part mt-2">
            <span>เบิกทองหลอม (โปรดระบุน้ำหนัก)</span>
          </div>
          <div class="form-content-row-four-columns-container">
            <div>
              <span class="txt-title">
                <span>วันที่เบิกหลอม</span>
                <!-- <span class="txt-required"> *</span> -->
              </span>
              <Calendar
                class="w-100"
                :class="val.isValMeltDate === true ? `p-invalid` : ``"
                v-model="form.meltDate"
                dateFormat="dd/mm/yy"
                showIcon
                showButtonBar
              />
            </div>
            <div>
              <span class="txt-title">
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
              <span class="txt-title">
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
            <div>
              <span class="txt-title">
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
          </div>
          <div class="form-content-row-four-columns-container">
            <div>
              <span class="txt-title">
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
              <span class="txt-title">
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

          <div class="txt-title-part mt-2">
            <span>เบิกทองหล่อ (โปรดระบุน้ำหนัก)</span>
          </div>

          <div class="form-content-row-four-columns-container">
            <div>
              <span class="txt-title">
                <span>วันที่เบิกหล่อ</span>
                <!-- <span class="txt-required"> *</span> -->
              </span>
              <Calendar
                class="w-100"
                :class="val.isValCastDate === true ? `p-invalid` : ``"
                v-model="form.castDate"
                dateFormat="dd/mm/yy"
                showIcon
                showButtonBar
              />
            </div>
            <div>
              <span class="txt-title">
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
              <span class="txt-title">
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
          </div>
          <div class="form-content-row-four-columns-container">
            <div>
              <span class="txt-title">
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
              <span class="txt-title">
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
              <span class="txt-title">
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
              <span class="txt-title">
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
          <div class="form-content-row-four-columns-container">
            <div>
              <span class="txt-title">
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
              <span class="txt-title">
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
              <span class="txt-title">
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
              <span class="txt-title">
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
          </div>
          <div class="txt-title-part mt-2">
            <span>คืนตัวเรือน</span>
          </div>
          <div class="form-content-row-one-columns-container mt-1">
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
                    class="btn btn-sm btn-danger text-center w-100"
                    @click="onDelItem(prop.data)"
                  >
                    <i class="bi bi-trash-fill"></i>
                  </div>
                </template>
              </Column>
              <Column field="productionPlan" style="min-width: 150px">
                <template #editor="{ data, field }">
                  <!-- <input
                      type="text"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    /> -->
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
                    {{
                      `${slotProps.data.productionPlan.wo}-${slotProps.data.productionPlan.woNumber}`
                    }}
                  </div>
                  <div v-else>โปรดระบุ WO/WO No. ตัวเรือน</div>
                  <!-- <input type="text" class="form-control" v-model="form.bookNo" required /> -->
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
                    :class="data[field] ? `` : ``"
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
                        <!-- <div>
                          ทั้งหมด {{ this.form.items ? this.form.items.length : `0` }} รายการ
                        </div> -->
                        <div @click="addItems">
                          <i class="bi bi-plus-square-fill"></i>
                        </div>
                      </div>
                    </template>
                  </Column>
                </Row>
              </ColumnGroup>
              <!-- <template #footer>
                <div class="d-flex justify-content-between">
                  <div>ทั้งหมด {{ this.form.items ? this.form.items.length : `0` }} รายการ</div>
                  <div @click="addItems">
                    <i class="bi bi-plus-square-fill"></i>
                  </div>
                </div>
              </template> -->
            </DataTable>
          </div>

          <div class="txt-title-part mt-2">
            <span>รายละเอียดอื่นๆ</span>
          </div>
          <div class="form-content-row-one-columns-container">
            <div>
              <!-- <span class="txt-title">
                <span>สูตรผสมทอง</span>
                <span class="txt-required"> *</span>
              </span> -->
              <textarea class="form-control" v-model="form.remark"></textarea>
            </div>
          </div>

          <div class="form-content-row-two-columns-container mt-3">
            <div>
              <span class="txt-title-part-custom">
                <span>ชื่อผู้เบิกทอง</span>
              </span>
              <input type="text" class="form-control" v-model="form.assignBy" />
            </div>
            <div>
              <span class="txt-title-part-custom">
                <span>ชื่อผู้รับทอง</span>
              </span>
              <input type="text" class="form-control" v-model="form.receiveBy" />
            </div>
          </div>

          <div class="d-flex justify-content-center mt-3">
            <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
              ยกเลิกเพิ่มข้อมูลผสมทอง
            </button>
            <button class="btn btn-sm btn-warning btn-custom" type="submit">
              ยืนยันเพิ่มข้อมูลผสมทอง
            </button>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'


const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Row from 'primevue/row'
import ColumnGroup from 'primevue/columngroup' // optional
import AutoComplete from 'primevue/autocomplete'

import api from '@/axios/axios-helper.js'
import swAlert from '@/services/alert/sweetAlerts.js'
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
  //returnCastBodyWeight: null,
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
  
    Dropdown,
    Calendar,
    DataTable,
    Column,
    AutoComplete,
    Row,
    ColumnGroup
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
    }
    // 'form.meltDate'() {
    //   if (this.form.meltDate) {
    //     this.val.isValMeltDate = false
    //   }
    // }
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,
      autoId: 0,

      // ---- form ------ //
      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceIsValid
      },

      // ----- table -------- //
      editingRows: [],
      productItemSearch: []
    }
  },
  methods: {
    // --- controller --- //
    closeModal() {
      this.form = {
        ...interfaceForm
      }
      this.form.items = []
      this.val = {
        ...interfaceIsValid
      }
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.validateForm()) {
        swAlert.confirmSubmit(
          `เลขที่:${this.form.no} | เล่มที่:${this.form.bookNo} `,
          'ยืนยันเพิ่มใบเบิกทอง',
          async () => {
            await this.submit()
          },
          null,
          null
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
      // if (!this.form.meltDate) {
      //   this.val = {
      //     isValMeltDate: true
      //   }
      //   return false
      // }
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

    // ----------- Grid -------------------//
    onRowEditSave(event) {
      let { newData, index } = event
      // if (!newData.productionPlanId) {
      //   console.log("can't be null")
      // }
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
      return sum
    },

    // ------ helper ----- //
    formatDate(date) {
      return date ? formatDate(date) : ''
    },

    // --- APIs --- //
    async submit() {
      try {
        this.isLoading = true
        //console.log(this.form.items)

        this.form.items = this.form.items.map((x) => {
          return {
            ...x,
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
          castDateFormat: this.form.castDate ? formatISOString(this.form.castDate) : null
        }
        //console.log(params)

        const res = await api.jewelry.post('ProductionPlanCost/CreateGoldCost', params)
        if (res) {
          //this.isResetImage = !this.isResetImage
          swAlert.success(
            null,
            null,
            () => {
              this.form = {
                ...interfaceForm
              }
              this.form.items = []
              this.val = {
                ...interfaceIsValid
              }
              this.$emit('fetch')
            },
            null,
            null
          )
          //this.onClearVal()
        }

        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async onSearchProductionPlanId(e) {
      try {
        //this.isLoading = true
        //console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null
            //type: this.form.status,
            //active: 1
          }
        }
        const res = await api.jewelry.post(
          'ProductionPlan/ProductionPlanSearchByProductionPlanId',
          params
        )
        if (res) {
          //console.log(res)
          this.productItemSearch = [...res.data]
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/form-modal.scss';

.form-content-container-custom {
  padding: 20px 20px;
  overflow: auto;
}
.form-content-custom-columns-container {
  display: grid;
  grid-template-columns: 1fr 1fr 4fr;
  gap: 10px;
  padding: 0px 30px;
  margin-top: 5px;
}
.txt-title-part-custom {
  //padding-left: 30px;
  padding-top: 10px;
  font-size: 14px;
  color: var(--base-font-color);
}
</style>
