<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header">
          <span>ประเมินบัตรต้นทุน</span>
          <span class="bi bi-arrow-right ml-1"></span>
          <span class="ml-1">{{ `ใบจ่าย-รับคืนงาน เลขที่: ${model.wo}-${model.woNumber}` }}</span>
        </div>
        <form @submit.prevent="onSubmit">
          <!-- transection -->
          <div>
            <DataTable
              :value="tranItems"
              rowGroupMode="subheader"
              groupRowsBy="nameGroup"
              stripedRows
              showGridlines
            >
              <ColumnGroup type="header">
                <Row>
                  <Column header="รายละเอียดงาน" :colspan="3" />
                  <!-- <Column header="วันที่" /> -->
                  <Column header="จำนวน" />
                  <Column header="ราคา/จำนวน" />
                  <Column header="น้ำหนัก" />
                  <Column header="ราคา/น้ำหนัก" />
                  <Column header="ราคารวม" />
                </Row>
              </ColumnGroup>

              <Column field="nameGroup"> </Column>
              <Column field="index" style="width: 10px">
                <template #body="slotProps">
                  <span>{{ slotProps.index + 1 }}</span>
                </template>
              </Column>
              <Column field="action" style="width: 10px">
                <template #body="slotProps">
                  <button
                    class="btn btn-sm btn-red"
                    type="button"
                    title="ลบ"
                    @click="delItem(slotProps.index)"
                  >
                    <span class="bi bi-trash"></span>
                  </button>
                </template>
              </Column>
              <Column field="nameDescription">
                <template #body="slotProps">
                  <div v-if="slotProps.data.nameGroup === 'ETC'">
                    <input
                      type="text"
                      style="background-color: #b5dad4"
                      class="form-control"
                      v-model="slotProps.data.nameDescription"
                      required
                    />
                  </div>
                  <div v-else>
                    <span>{{ slotProps.data.nameDescription }}</span>
                    <span v-if="slotProps.data.nameGroup === 'Gold'" class="ml-2 text-ref">
                      {{
                        `[ ราคาอ้างอิง --> ${
                          slotProps.data.priceReference
                            ? slotProps.data.priceReference.toFixed(2)
                            : Number(0).toFixed(2)
                        } ]`
                      }}
                    </span>
                  </div>
                </template>
              </Column>
              <!-- <Column field="date" style="width: 100px">
                <template #body="slotProps">
                  <span>{{ formatDate(slotProps.data.date) }}</span>
                </template>
              </Column> -->

              <Column field="qty" style="width: 130px">
                <template #body="slotProps">
                  <div v-if="slotProps.data.nameGroup === 'ETC'">
                    <input
                      style="background-color: #b5dad4"
                      v-model="slotProps.data.qty"
                      type="number"
                      class="form-control no-spinners text-right"
                      step="any"
                      min="0"
                      required
                      @blur="onBluePrice(slotProps.data, slotProps.index, 'qty')"
                    />
                  </div>
                  <div v-else class="text-right">
                    <span>{{ slotProps.data.qty }}</span>
                  </div>
                </template>
              </Column>
              <Column field="qtyPrice" style="width: 110px">
                <template #body="slotProps">
                  <div>
                    <input
                      style="background-color: #b5dad4"
                      v-model="slotProps.data.qtyPrice"
                      type="number"
                      class="form-control text-right"
                      step="any"
                      min="0"
                      required
                      @blur="onBluePrice(slotProps.data, slotProps.index, 'qtyPrice')"
                    />
                  </div>
                </template>
              </Column>

              <Column field="qtyWeight" style="width: 110px">
                <template #body="slotProps">
                  <div v-if="slotProps.data.nameGroup === 'ETC'">
                    <input
                      style="background-color: #b5dad4"
                      v-model="slotProps.data.qtyWeight"
                      type="number"
                      class="form-control text-right"
                      step="any"
                      min="0"
                      required
                      @blur="onBluePrice(slotProps.data, slotProps.index, 'qtyWeight')"
                    />
                  </div>
                  <div v-else class="text-right">
                    <span>{{ slotProps.data.qtyWeight }}</span>
                  </div>
                </template>
              </Column>
              <Column field="qtyWeightPrice" style="width: 110px">
                <template #body="slotProps">
                  <div>
                    <input
                      style="background-color: #b5dad4"
                      v-model="slotProps.data.qtyWeightPrice"
                      type="number"
                      class="form-control text-right"
                      step="any"
                      min="0"
                      required
                      @blur="onBluePrice(slotProps.data, slotProps.index, 'qtyWeightPrice')"
                    />
                  </div>
                </template>
              </Column>

              <column field="totalPrice" style="width: 150px">
                <template #body="slotProps">
                  <div>
                    <input
                      v-model="slotProps.data.totalPrice"
                      class="form-control text-right"
                      min="0"
                      disabled
                    />
                  </div>
                </template>
              </column>

              <template #groupheader="slotProps">
                <div class="flex align-items-center gap-2 type-container">
                  <span><i class="bi bi-clipboard2-check-fill mr-2"></i></span>
                  <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
                </div>
              </template>
              <ColumnGroup type="footer">
                <Row>
                  <column :colspan="7">
                    <template #footer>
                      <div class="text-right">
                        <span>ต้นทุนรวม</span>
                      </div>
                    </template>
                  </column>
                  <column :colspan="1">
                    <template #footer>
                      <div class="text-right">
                        <span>{{ caltotalPrice(tranItems) }}</span>
                      </div>
                    </template>
                  </column>
                </Row>
              </ColumnGroup>
            </DataTable>
          </div>

          <!-- discounr -->
          <!-- <DataTable :value="tranDiscount" stripedRows showGridlines>
            <ColumnGroup type="header">
              <Row>
                <Column header="รายละเอียดส่วนลด" :colspan="3" />
                <Column header="วันที่" />
                <Column header="จำนวน" />
                <Column header="ราคา" />
              </Row>
            </ColumnGroup>
            <Column field="index" style="width: 10px">
              <template #body="slotProps">
                <span>{{ slotProps.index + 1 }}</span>
              </template>
            </Column>
            <Column field="del" style="width: 10px">
              <template #body="slotProps">
                <button
                  class="btn btn-sm btn-red"
                  type="button"
                  title="ลบ"
                  @click="delItemDiscount(slotProps.index)"
                >
                  <span class="bi bi-trash"></span>
                </button>
              </template>
            </Column>
            <Column field="nameDescription">
              <template #body="slotProps">
                <input
                  type="text"
                  style="background-color: #b5dad4"
                  class="form-control"
                  v-model="slotProps.data.nameDescription"
                  required
                />
              </template>
            </Column>
            <Column field="date" style="width: 100px">
              <template #body="slotProps">
                <span>{{ formatDate(slotProps.data.date) }}</span>
              </template>
            </Column>
            <Column field="qty" style="width: 130px">
              <template #body="slotProps">
                <div class="text-right">
                  <span>{{ slotProps.data.qty }}</span>
                </div>
              </template>
            </Column>
            <Column field="price" style="width: 130px">
              <template #body="slotProps">
                <div>
                  <input
                    style="background-color: #b5dad4"
                    v-model="slotProps.data.price"
                    type="number"
                    class="form-control text-right"
                    step="any"
                    min="0"
                    required
                    @blur="onBlueDiscount(slotProps.data, slotProps.index)"
                  />
                </div>
              </template>
            </Column>

            <template #groupheader="slotProps">
              <div class="flex align-items-center gap-2 type-container">
                <span><i class="bi bi-clipboard2-check-fill mr-2"></i></span>
                <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
              </div>
            </template>
            <ColumnGroup type="footer">
              <Row>
                <column :colspan="5">
                  <template #footer>
                    <div class="text-right">
                      <span>ราคาหลังส่วนลด</span>
                    </div>
                  </template>
                </column>
                <column :colspan="1">
                  <template #footer>
                    <div class="text-right">
                      <span>{{ caltotalPriceAfterDiscount(tranItems, tranDiscount) }}</span>
                    </div>
                  </template>
                </column>
              </Row>
            </ColumnGroup>
          </DataTable> -->

          <div class="text-right mt-2">
            <button
              type="button"
              class="btn btn-sm btn-green mr-2"
              title="เพิ่มรายการ"
              @click="addItem"
            >
              <span><i class="bi bi-plus"></i></span>
            </button>
            <!-- <button
              type="button"
              class="btn btn-green mr-2"
              title="เพิ่มส่วนลด"
              @click="addItemDiscount"
            >
              <span><i class="bi bi-cash-coin"></i></span>
            </button> -->
            <button type="submit" class="btn btn-sm btn-main" title="บันทึก">
              <span><i class="bi bi-calendar-check"></i></span>
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
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

// import AutoComplete from 'primevue/autocomplete'
// import Calendar from 'primevue/calendar'
// import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import _ from 'lodash'
import Row from 'primevue/row'

import moment from 'dayjs'
import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'

// const interfaceMat = {
//   //id: null,
//   //gold: null,
//   goldQTYSend: null,
//   goldWeightSend: null,
//   goldQTYCheck: null,
//   goldWeightCheck: null,
//   workers: null,
//   workersSub: null,
//   description: null,
//   wages: null
// }
const interfaceIsValid = {
  isValStatus: false,
  isValReceiveDate: false,
  isValGemAssignDate: false,
  isValCVDAssignDate: false
}

export default {
  components: {
    modal,
    loading,
    //AutoComplete,
    //Calendar,
    //Dropdown,
    DataTable,
    Column,
    ColumnGroup,
    Row
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
    isShow(newVal) {
      if (newVal) {
        console.log('Modal opened, initializing form')
        this.initForm(newVal)
      }
    }
  },
  computed: {
    isShowModal() {
      return this.isShow
    },
    model() {
      console.log('model', this.modelValue)
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
    }
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,
      autoId: 0,
      status: 70,

      // --- from --- //
      form: {
        // ...interfaceForm
      },
      val: {
        ...interfaceIsValid
      },

      tempMatAssign: [],
      matAssign: [],
      editingRows: [],
      gemAssign: [],
      editingGemRows: [],
      workerItemSearch: [],
      gemItemSearch: [],

      tranItems: [],
      tranDiscount: []
    }
  },
  methods: {
    // ------ helper ------//
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },
    showDate(date) {
      return date ? moment(date).format('DD/MM/yyyy') : ''
    },
    caltotalPrice(data) {
      let total = 0
      data.forEach((item) => {
        total += Number(item.totalPrice)
      })
      return total.toFixed(2)
    },
    caltotalPriceAfterDiscount(data, discount) {
      let total = 0
      let totalDiscount = 0
      data.forEach((item) => {
        total += Number(item.price)
      })
      discount.forEach((item) => {
        totalDiscount += Number(item.price)
      })
      return total > 0 ? (total - totalDiscount).toFixed(2) : Number(0).toFixed(2)
    },
    truncateName(name, maxLength) {
      if (name.length <= maxLength) {
        return name
      }
      return name.slice(0, maxLength) + '...'
    },
    async initForm(value) {
      if (value === true) {
        console.log('initForm', value)
        console.log(this.model)

        this.fetchAllTransection()
      }
    },
    checkOutbound(data) {
      return !_.isEmpty(data.outboundRunning) ? true : false
    },

    // ----- event
    onclear() {
      this.val = {
        ...interfaceIsValid
      }
    },
    closeModal() {
      console.log('closeModal')
      this.onclear()
      this.$emit('closeModal', 'add')
    },

    onSubmit() {
      if (this.validateForm()) {
        swAlert.confirmSubmit(
          `บัตรต้นทุน ${this.model.wo}-${this.model.woNumber}`,
          `ยืนยันบันทึกบัตรต้นทุน`,
          async () => {
            //console.log('call submitPlan')
            await this.submit()
          },
          null,
          null
        )
      }
    },
    validateForm() {
      //   if (!this.form.mold) {
      //     this.val = {
      //       isValMold: true
      //     }
      //     return false
      //   }

      return true
    },
    onBluePrice(item, index, fieldName) {
      // แปลงค่าเป็นทศนิยม 3 ตำแหน่งเมื่อออกจาก input
      console.log('onBluePrice' + fieldName, item, index)

      let newCal = {
        ...item,
        [fieldName]: item[fieldName] ? Number(item[fieldName]).toFixed(2) : '0.00',
        totalPrice: Number(item.qty * item.qtyPrice + item.qtyWeight * item.qtyWeightPrice).toFixed(
          2
        )
      }

      // ในVue 3, เราสามารถอัปเดตได้โดยตรง
      this.tranItems[index] = newCal

      console.log('onBluePrice' + fieldName, this.tranItems[item])
      console.log('onBluePrice' + fieldName, this.tranItems)
      //this.onUpdateQty(item)
    },
    onBlueDiscount(item, index) {
      // แปลงค่าเป็นทศนิยม 3 ตำแหน่งเมื่อออกจาก input
      console.log('onBlurDiscount', item, index)

      let newCal = {
        ...item,
        price: item.price ? Number(item.price).toFixed(2) : '0.00'
      }

      // ในVue 3, เราสามารถอัปเดตได้โดยตรง
      this.tranDiscount[index] = newCal

      console.log('onBlurDiscount', this.tranDiscount[item])
      console.log('onBlurDiscount', this.tranDiscount)
      //this.onUpdateQty(item)
    },
    addItem() {
      this.tranItems.push({
        nameGroup: 'ETC',
        nameDescription: '',
        date: new Date(),
        qty: 0,
        qtyPrice: Number(0).toFixed(2),
        qtyWeight: 0,
        qtyWeightPrice: Number(0).toFixed(2),
        totalPrice: Number(0).toFixed(2)
      })
    },
    addItemDiscount() {
      this.tranDiscount.push({
        nameGroup: 'Discount',
        nameDescription: '',
        date: new Date(),
        qty: 1,
        price: 0
      })
    },
    delItem(index) {
      this.tranItems.splice(index, 1)
    },
    delItemDiscount(index) {
      this.tranDiscount.splice(index, 1)
    },
    getGroupName(id) {
      switch (id) {
        case 'Gold':
          return 'รายการทอง'
        case 'Gem':
          return 'รายการวัถุดิบ'
        case 'Worker':
          return 'รายการงานช่าง'
        default:
          return 'รายการเพิ่มเติม'
      }
    },

    // --- APIs --- //

    async submit() {
      this.isLoading = true
      try {
        let no = 1
        const param = {
          productionPlanId: this.model.id,
          wo: this.model.wo,
          woNumber: this.model.woNumber,
          woText: `${this.model.wo}${this.model.woNumber}`,
          item: this.tranItems.map((item) => {
            return {
              no: no++,
              name: item.nameGroup === 'ETC' ? item.nameDescription : item.name,
              nameGroup: item.nameGroup,
              nameDescription: item.nameDescription,
              date: item.date ? formatISOString(item.date) : null,
              qty: item.qty ?? 0,
              qtyPrice: item.qtyPrice ?? 0,
              qtyWeight: item.qtyWeight ?? 0,
              qtyWeightPrice: item.qtyWeightPrice ?? 0,
              totalPrice: item.totalPrice ?? 0
            }
          })
        }
        const res = await api.jewelry.post('ProductionPlan/CreatePrice', param)
        if (res) {
          swAlert.success(
            ``,
            '',
            () => {
              this.$emit('fetch')
            },
            null,
            null
          )
        }
      } catch (error) {
        console.log(error)
      }
      this.isLoading = false
    },
    async onSearchWorker(e) {
      try {
        //this.isLoading = true
        //console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null,
            type: this.status,
            active: 1
          }
        }
        const res = await api.jewelry.post('Worker/Search', params)
        if (res) {
          //console.log(res)
          this.workerItemSearch = [...res.data]
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    },
    async onSearchWorkerByCode(e) {
      try {
        if (e === null) {
          return null
        }
        //this.isLoading = true
        //console.log(this.formValue)
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
        const res = await api.jewelry.post('Worker/Search', params)
        if (res) {
          //console.log(res.data[0])
          return res.data[0]
        } else {
          return null
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    },
    async onSearchGem(e) {
      try {
        //this.isLoading = true
        //console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null
          }
        }
        const res = await api.jewelry.post('StockGem/Search', params)
        if (res) {
          //console.log(res)
          this.gemItemSearch = [...res]
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    },
    async onSearchGemById(e) {
      try {
        //this.isLoading = true
        //console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            id: e ?? null,
            text: null
          }
        }
        const res = await api.jewelry.post('StockGem/Search', params)
        if (res) {
          //console.log(res)
          if (res) {
            //console.log(res.data[0])
            return res[0]
          } else {
            return null
          }
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    },
    async fetchAllTransection() {
      this.isLoading = true
      try {
        const res = await api.jewelry.get('ProductionPlan/GetAllTransectionPrice', {
          wo: this.model.wo,
          woNumber: this.model.woNumber
        })
        if (res) {
          console.log(res)

          this.tranItems = res.items.map((item) => {
            return {
              ...item,
              qtyPrice: item.qtyPrice ? Number(item.qtyPrice).toFixed(2) : '0.00',
              qtyWeightPrice: item.qtyWeightPrice ? Number(item.qtyWeightPrice).toFixed(2) : '0.00',
              totalPrice: Number(
                item.qty * item.qtyPrice + item.qtyWeight * item.qtyWeightPrice
              ).toFixed(2)
            }
          })

          this.addItemDiscount()
        }
      } catch (error) {
        console.log(error)
      }
      this.isLoading = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

// ** ------ overide primevue style ------
.custom-input {
  margin-top: 5px !important;
}
input {
  margin-top: 0px !important;
}
:deep(.p-autocomplete .p-component) {
  margin-top: 0px !important;
  //background-color: #dad4b5;
}
// :deep(.p-datatable .p-datatable-tfoot > tr > td) {
//   text-align: left;
//   padding: 1rem 1rem;
//   border: 1px solid white;
//   border-width: 0 0 1px 0;
//   color: white;
//   background: var(--base-font-color);
// }

.type-container {
  font-size: 15px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;
  //margin: 0px 0px 10px 0px;
}
.text-ref{
  color: gray;
  font-size: small;
}
</style>
