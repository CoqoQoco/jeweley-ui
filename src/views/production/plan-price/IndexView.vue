<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <div class="title-text-lg-header mb-2">
      <span>ประเมินราคา</span>
      <span class="bi bi-arrow-right ml-1"></span>
      <span class="ml-1">{{ `ใบจ่าย-รับคืนงาน เลขที่: ${plan[0]}-${plan[1]}` }}</span>
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
              <Column header="รายละเอียดงานต่างๆ" :colspan="3" />
              <Column header="วันที่" />
              <Column header="จำนวน" />
              <Column header="ราคา" />
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
              </div>
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
                  @blur="onBluePrice(slotProps.data, slotProps.index)"
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
                    <span>ราคาก่อนส่วนลด</span>
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
      <DataTable :value="tranDiscount" stripedRows showGridlines>
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
      </DataTable>
      <div></div>

      <div class="text-right mt-2">
        <button type="button" class="btn btn-green mr-2" title="เพิ่มรายการ" @click="addItem">
          <span><i class="bi bi-plus"></i></span>
        </button>
        <button
          type="button"
          class="btn btn-green mr-2"
          title="เพิ่มส่วนลด"
          @click="addItemDiscount"
        >
          <span><i class="bi bi-cash-coin"></i></span>
        </button>
        <button type="button" class="btn btn-main" title="บันทึก">
          <span><i class="bi bi-calendar-check"></i></span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

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

export default {
  components: {
    loading,
    //AutoComplete,
    //Calendar,
    //Dropdown,
    DataTable,
    Column,
    ColumnGroup,
    Row
  },
  props: {},
  watch: {},
  data() {
    return {
      // --- flag --- //
      isLoading: false,
      autoId: 0,

      plan: [],

      // --- from --- //
      form: {
        // ...interfaceForm
      },

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

    // --- event
    caltotalPrice(data) {
      let total = 0
      data.forEach((item) => {
        total += Number(item.price)
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
    checkOutbound(data) {
      return !_.isEmpty(data.outboundRunning) ? true : false
    },

    // ----- event
    onSubmit() {
      if (this.validateForm()) {
        swAlert.confirmSubmit(
          `ยืนยันเเก้ไขงาน [คัดพลอย]`,
          `${this.model.wo}-${this.model.woNumber}`,
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
    onBluePrice(item, index) {
      // แปลงค่าเป็นทศนิยม 3 ตำแหน่งเมื่อออกจาก input
      console.log('onBlurPrice', item, index)

      let newCal = {
        ...item,
        price: item.price ? Number(item.price).toFixed(2) : '0.00'
      }

      // ในVue 3, เราสามารถอัปเดตได้โดยตรง
      this.tranItems[index] = newCal

      console.log('onBlurPrice', this.tranItems[item])
      console.log('onBlurPrice', this.tranItems)
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
        qty: 1,
        price: 0
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
          return 'รายการเพชรเเละพลอย'
        case 'Worker':
          return 'รายการงานช่าง'
        default:
          return 'อื่นๆ'
      }
    },

    // --- APIs --- //

    async fetchAllTransection(wo, woNumber) {
      this.isLoading = true
      try {
        const res = await api.jewelry.get('ProductionPlan/GetAllTransectionPrice', {
          wo: wo,
          woNumber: woNumber
        })
        if (res) {
          console.log(res)

          this.tranItems = res.items.map((item) => {
            return {
              ...item,
              price: item.price ? Number(item.price).toFixed(2) : '0.00'
            }
          })

          this.addItemDiscount()
        }
      } catch (error) {
        console.log(error)
      }
      this.isLoading = false
    }
  },
  created() {
    this.$nextTick(() => {
      let id = this.$route.params.id

      //seperate id by '-'
      this.plan = id.split('-')

      console.log(this.plan)

      this.fetchAllTransection(this.plan[0], this.plan[1])
    })
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

.type-container {
  font-size: 15px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;
  //margin: 0px 0px 10px 0px;
}
</style>
