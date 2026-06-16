
<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header">
          <span>ประเมินบัตรต้นทุน</span>
          <span class="bi bi-arrow-right ml-1"></span>
          <span class="ml-1">{{ `ใบจ่าย-รับคืนงาน เลขที่: ${model.wo}-${model.woNumber}` }}</span>
        </div>
        <form @submit.prevent="onSubmit" class="p-2">
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
                  <div v-if="slotProps.data.nameGroup === 'ETC' || slotProps.data.isAdd">
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

                  <!-- <div v-if="slotProps.data.nameGroup === 'ETC' || slotProps.data.isAdd">
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
                  </div> -->
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

                  <!-- <div v-if="slotProps.data.nameGroup === 'ETC' || slotProps.data.isAdd">
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
                  </div> -->
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
                  <span><i class="bi bi-clipboard2-check mr-2"></i></span>
                  <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
                </div>
              </template>
              <template #groupfooter="slotProps">
                <div class="d-flex align-items-center justify-content-between gap-2 type-container">
                  <div>
                    <span><i class="bi bi-clipboard2-check-fill mr-2"></i></span>
                    <span>ต้นทุน</span>
                    <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
                  </div>
                  <div class="text-right mr-2">
                    {{ calculateGroupTotal(slotProps.data.nameGroup).toFixed(2) }}
                  </div>
                </div>
              </template>

              <!-- <template #groupheader="slotProps">
                <div class="flex align-items-center gap-2 type-container">
                  <span><i class="bi bi-clipboard2-check-fill mr-2"></i></span>
                  <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
                </div>
              </template> -->

              <ColumnGroup type="footer">
                <Row>
                  <column :colspan="7">
                    <template #footer>
                      <div class="text-right type-container">
                        <span>ต้นทุนรวมทั้งหมด</span>
                      </div>
                    </template>
                  </column>
                  <column :colspan="1">
                    <template #footer>
                      <div class="text-right type-container">
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

          <div class="action-group-container mt-2">
            <div class="d-flex align-items-center gap-2">
              <DropdownGeneric
                :modelValue="masterValue"
                :options="masterType"
                optionLabel="name"
                optionValue="code"
                :placeholder="$t('production.planView.selectItem')"
                @update:modelValue="masterValue = $event"
              />

              <button
                type="button"
                class="btn btn-sm btn-green mt-1 mr-2"
                title="เพิ่มรายการ"
                @click="addItem"
              >
                <span><i class="bi bi-plus"></i></span>
              </button>
            </div>

            <div>
              <!-- <button
              type="button"
              class="btn btn-green mr-2"
              title="เพิ่มส่วนลด"
              @click="addItemDiscount"
            >
              <span><i class="bi bi-cash-coin"></i></span>
            </button> -->
              <button type="submit" class="btn btn-sm btn-main mt-1" title="บันทึก">
                <span><i class="bi bi-calendar-check"></i></span>
              </button>
            </div>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
/* eslint-disable no-restricted-imports */
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
/* eslint-enable no-restricted-imports */

import { defineAsyncComponent } from 'vue'
import _ from 'lodash'
import moment from 'dayjs'
import api from '@/axios/axios-helper.js'
import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

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
    DropdownGeneric,
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
      autoId: 0,
      status: 70,

      // --- from --- //
      form: {
        // ...interfaceForm
      },
      val: {
        ...interfaceIsValid
      },
      masterValue: 'ETC',
      masterType: [
        { code: 'Gold', name: 'รายการทอง' },
        { code: 'Gem', name: 'รายการวัถุดิบ' },
        { code: 'Worker', name: 'รายการงานช่าง' },
        { code: 'Embed', name: 'รายการงานฝัง' },
        { code: 'ETC', name: 'รายการเพิ่มเติม' }
      ],
      groupOrderRunning: {
        Gold: 1,
        Worker: 2,
        Embed: 3,
        Gem: 4,
        ETC: 5
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
    toNumber(val) {
      const n = Number(val)
      return isNaN(n) ? 0 : n
    },
    caltotalPrice(data) {
      let total = 0
      data.forEach((item) => {
        total += this.toNumber(item.totalPrice)
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
      this.onclear()
      this.$emit('closeModal', 'add')
    },

    onSubmit() {
      if (this.validateForm()) {
        confirmSubmit(
          `บัตรต้นทุน ${this.model.wo}-${this.model.woNumber}`,
          `ยืนยันบันทึกบัตรต้นทุน`,
          async () => {
            await this.submit()
          }
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
      const qty = this.toNumber(item.qty)
      const qtyPrice = this.toNumber(item.qtyPrice)
      const qtyWeight = this.toNumber(item.qtyWeight)
      const qtyWeightPrice = this.toNumber(item.qtyWeightPrice)

      const formattedField = fieldName === 'qtyWeight'
        ? this.toNumber(item[fieldName]).toFixed(3)
        : this.toNumber(item[fieldName]).toFixed(2)

      let newCal = {
        ...item,
        [fieldName]: formattedField,
        totalPrice: (qty * qtyPrice + qtyWeight * qtyWeightPrice).toFixed(2)
      }

      this.tranItems[index] = newCal
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
        nameGroup: this.masterValue ?? 'ETC',
        nameDescription: '',
        date: new Date(),
        qty: 0,
        qtyPrice: '0.00',
        qtyWeight: '0.000',
        qtyWeightPrice: '0.00',
        totalPrice: '0.00',
        isAdd: true
      })

      // เรียงตามลำดับที่กำหนด
      this.tranItems = _.sortBy(this.tranItems, (item) => this.groupOrderRunning[item.nameGroup])

      //console.log('addItem', this.tranItems)
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
        case 'Embed':
          return 'รายการงานฝัง'
        case 'ETC':
          return 'รายการเพิ่มเติม'
        default:
          return 'Unknown'
      }
    },
    calculateGroupTotal(groupName) {
      return this.tranItems
        .filter((item) => item.nameGroup === groupName)
        .reduce((total, item) => total + this.toNumber(item.totalPrice), 0)
    },

    async submit() {
      let no = 1
      const param = {
        productionPlanId: this.model.id,
        wo: this.model.wo,
        woNumber: this.model.woNumber,
        woText: `${this.model.wo}${this.model.woNumber}`,
        item: this.tranItems.map((item) => {
          return {
            no: no++,
            name: item.isAdd ? item.nameDescription : item.name,
            nameGroup: item.nameGroup,
            nameDescription: item.nameDescription,
            date: item.date ? formatISOString(item.date) : null,
            qty: item.qty ?? 0,
            qtyPrice: item.qtyPrice ?? 0,
            qtyWeight: item.qtyWeight ?? 0,
            qtyWeightPrice: item.qtyWeightPrice ?? 0,
            totalPrice: item.totalPrice ?? 0,
            isAdd: item.isAdd
          }
        })
      }
      const res = await api.jewelry.post('ProductionPlan/CreatePrice', param)
      if (res) {
        success(``, '', () => {
          this.$emit('fetch')
        })
      }
    },
    async fetchAllTransection() {
      const res = await api.jewelry.get('ProductionPlan/GetAllTransectionPrice', {
        wo: this.model.wo,
        woNumber: this.model.woNumber
      })
      if (res) {
        this.tranItems = res.items.map((item) => {
          const qty = this.toNumber(item.qty)
          const qtyPrice = this.toNumber(item.qtyPrice)
          const qtyWeight = this.toNumber(item.qtyWeight)
          const qtyWeightPrice = this.toNumber(item.qtyWeightPrice)
          return {
            ...item,
            qty: qty,
            qtyWeight: qtyWeight.toFixed(3),
            qtyPrice: qtyPrice.toFixed(2),
            qtyWeightPrice: qtyWeightPrice.toFixed(2),
            totalPrice: (qty * qtyPrice + qtyWeight * qtyWeightPrice).toFixed(2)
          }
        })

        if (this.model.priceItems) {
          const sourceItem = this.model.priceItems.find(
            (item) => item.name === 'น้ำหนักทองรวมหลังหักเพชรพลอย'
          )

          const targetItem = this.tranItems.find(
            (item) => item.name === 'น้ำหนักทองรวมหลังหักเพชรพลอย'
          )

          if (sourceItem && targetItem) {
            targetItem.qtyWeightPrice = sourceItem.qtyWeightPrice
            targetItem.priceReference = sourceItem.totalPrice
          }
        }

        this.tranItems = _.sortBy(
          this.tranItems,
          (item) => this.groupOrderRunning[item.nameGroup]
        )

        this.addItemDiscount()
      }
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
.action-group-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.text-ref {
  color: gray;
  font-size: small;
}
</style>
