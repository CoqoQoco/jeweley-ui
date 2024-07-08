<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShow" @closeModal="closeModal" width="800px">
      <template v-slot:content>
        <!-- ข้อมูล -->
        <div class="title-text-lg-bg">
          <span class="mr-1"><i class="bi bi-journal-text"></i></span>
          <span>ข้อมูลเบิกผสมทอง</span>
        </div>
        <div class="filter-container">
          <div class="form-col-sm-container">
            <div class="d-flex flex-column">
              <span class="title-text">เล่มที่</span>
              <span class="desc-text">{{ form.bookNo }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="title-text">เลขที่</span>
              <span class="desc-text">{{ form.no }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="title-text">วันที่</span>
              <span class="desc-text">{{ formatDate(form.assignDate) }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="title-text">หมายเลขลำดับ</span>
              <span class="desc-text">{{ form.runningNumber }}</span>
            </div>
          </div>
          <div class="form-col-sm-container">
            <div class="d-flex flex-column">
              <span class="title-text">ประเภททอง</span>
              <span class="desc-text">{{
                form.gold ? `${form.gold?.code}:${form.gold?.nameTh}` : ``
              }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="title-text">เปอร์เซ็นทอง</span>
              <span class="desc-text">{{ form.goldSize ? `${form.goldSize?.nameTh}` : `` }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="title-text">สูตรผสมทอง</span>
              <span class="desc-text">{{ form.goldReceipt }}</span>
            </div>
            <div></div>
          </div>
          <div class="form-col-sm-container">
            <div class="d-flex flex-column">
              <span class="title-text">ชื่อผู้เบิกทอง</span>
              <span class="desc-text">{{ form.assignBy }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="title-text">ชื่อผู้รับทอง</span>
              <span class="desc-text">{{ form.receiveBy }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="title-text">รายละเอียดอื่นๆ</span>
              <span class="desc-text">{{ form.remark }}</span>
            </div>
            <div></div>
          </div>
        </div>

        <div class="line"></div>

        <!-- รายละเอียด -->
        <div class="form-col-sm-container title-text-lg-bg">
          <div>
            <div class="">
              <span><i class="bi bi-card-checklist mr-1"></i></span>
              <span> เบิกทองหล่อ</span>
            </div>
            <!-- <small class="ml-4">{{ `วันที่เบิกหลอม: ${formatDate(form.meltDate)}` }}</small> -->
          </div>
          <div class="font-weight-bold">รายการ</div>
          <div class="font-weight-bold text-right">น้ำหนัก</div>
        </div>
        <div class="form-col-sm-container mr-3">
          <div class="ml-2">
            <small>{{ `วันที่เบิกหล่อ: ${formatDate(form.castDate)}` }}</small>
          </div>
          <div class="text-main">เบิกหล่อ</div>
          <div class="text-main text-right">
            {{ form.castWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-col-sm-container mr-3">
          <div></div>
          <div class="text-main">คืนทองหล่อ</div>
          <div class="text-main text-right">
            {{ form.returnCastWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-col-sm-container mr-3">
          <div></div>
          <div class="text-main">คืนขี้เบ้า</div>
          <div class="text-main text-right">
            {{ form.returnCastScrapWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-col-sm-container mr-3">
          <div></div>
          <div class="text-main">คืนเเม่พิมพ์</div>
          <div class="text-main text-right">
            {{ form.returnCastMoldWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-col-sm-container mr-3">
          <div></div>
          <div class="text-main">คืนตัวเรือน</div>
          <div class="text-main text-right">
            {{ form.returnCastBodyWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-col-sm-container mr-3">
          <div></div>
          <div class="text-main">คืนตัวเรือนเสีย</div>
          <div class="text-main text-right">
            {{
              form.returnCastBodyBrokenWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2)
            }}
          </div>
        </div>
        <div class="form-col-sm-container mr-3">
          <div></div>
          <div class="text-main">คืนผงทอง</div>
          <div class="text-main text-right">
            {{ form.returnCastPowderWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-col-sm-container mr-3">
          <div></div>
          <div class="text-main">น้ำหนักขาด</div>
          <div class="text-main text-right">
            {{ form.castWeightLoss?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-col-sm-container mr-3">
          <div></div>
          <div class="text-main">น้้ำหนักเกิน</div>
          <div class="text-main text-right">
            {{ form.castWeightOver?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>

        <div class="line"></div>

        <div class="form-col-sm-container title-text-lg-bg">
          <div>
            <div class="">
              <span><i class="bi bi-gem mr-1"></i></span>
              <span> คืนตัวเรือน</span>
            </div>
          </div>
          <div class="">รายการ</div>
          <div class="d-flex justify-content-between">
            <div class="">จำนวน</div>
            <div class="">น้ำหนัก</div>
          </div>
        </div>
        <div v-if="form.items.length">
          <div v-for="(item, index) in form.items" :key="index">
            <div class="form-col-sm-container">
              <div></div>
              <div class="text-main">
                {{ `${item.productionPlan.wo}-${item.productionPlan.woNumber}` }}
              </div>
              <div class="d-flex justify-content-between">
                <div class="text-main">
                  {{ item.returnQTY.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
                </div>
                <div class="text-main text-right mr-3">
                  {{ item.returnWeight.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
          <div class="form-col-sm-container">
            <div></div>
            <div class="text-main font-weight-bold">รวมน้ำหนักคืนตัวเรือน</div>
            <div class="text-main text-right mr-3">
              {{ form.returnCastBodyWeight.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
            </div>
          </div>
        </div>
        <div v-else class="d-flex justify-content-center">
          <div style="color: var(--base-sub-color)">-- ไม่มีรายการคืนตัวเรือน --</div>
        </div>

        <div class="line"></div>

        <div class="d-flex justify-content-center mt-3">
          <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
            <span class="mr-2"><i class="bi bi-x-circle"></i></span>
            <span>ปิดหน้าต่าง</span>
          </button>
          <button class="btn btn-sm btn-info btn-custom" type="button" @click="generatePDF()">
            <span class="mr-2"><i class="bi bi-printer"></i></span>
            <span>พิมพ์เอกสาร</span>
          </button>
        </div>
        <div class="p-2"></div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

import pdfMake from 'pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'

// import Dropdown from 'primevue/dropdown'
// import Calendar from 'primevue/calendar'
// import DataTable from 'primevue/datatable'
// import Column from 'primevue/column'
// import Row from 'primevue/row'
// import ColumnGroup from 'primevue/columngroup' // optional
// import AutoComplete from 'primevue/autocomplete'

import api from '@/axios/axios-config.js'
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
  returnCastBodyWeight: null,
  returnCastScrapWeight: null,
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
    loading
    // Dropdown,
    // Calendar,
    // DataTable,
    // Column,
    // AutoComplete,
    // Row,
    // ColumnGroup
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
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
    },
    model() {
      return this.modelValue
    }
  },
  watch: {
    // 'form.assignDate'() {
    //   if (this.form.assignDate) {
    //     this.val.isValAssignDate = false
    //   }
    // },
    // 'form.gold'() {
    //   if (this.form.gold) {
    //     this.val.isValGold = false
    //   }
    // },
    // 'form.goldSize'() {
    //   if (this.form.goldSize) {
    //     this.val.isValGoldSize = false
    //   }
    // }
    // 'form.meltDate'() {
    //   if (this.form.meltDate) {
    //     this.val.isValMeltDate = false
    //   }
    // }
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
        returnCastBodyWeight: value.returnCastBodyWeightTotal,
        returnCastScrapWeight: value.returnCastScrapWeight,
        returnCastPowderWeight: value.returnCastPowderWeight,
        castWeightLoss: value.castWeightLoss,
        castWeightOver: value.castWeightOver,
        remark: value.remark,
        assignBy: value.assignBy,
        receiveBy: value.receiveBy,
        runningNumber: value.runningNumber,
        zill: value.zill,
        zillQty: value.zillQty,
        items: await Promise.all(
          value.items.map(async (x) => {
            const res = await this.onSearchProductionPlanIdByCode(x.productionPlanId)
            //console.log(res)
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
      productItemSearch: [],
      defaultDisplay: {
        emptyValue: 0
      }
    }
  },
  methods: {
    // --- controller --- //
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
        swAlert.confirmSubmit(
          `เลขที่:${this.form.no} | เล่มที่:${this.form.bookNo} `,
          'ยืนยันเเก้ไขใบเบิกทอง',
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
        //console.log(this.form)

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
        console.log(params)

        const res = await api.jewelry.post('ProductionPlanCost/UpdateGoldCost', params)
        if (res) {
          //this.isResetImage = !this.isResetImage
          swAlert.success(
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
    },
    async onSearchProductionPlanIdByCode(e) {
      try {
        //this.isLoading = true
        //console.log(e)
        const productionPlanId = e.replace(/-/g, '')

        const params = {
          take: 0,
          skip: 0,
          search: {
            text: productionPlanId
            //type: this.form.status,
            //active: 1
          }
        }
        //console.log(params)
        const res = await api.jewelry.post(
          'ProductionPlan/ProductionPlanSearchByProductionPlanId',
          params
        )
        if (res) {
          //console.log(res)
          //console.log(res.data[0])
          //return res.data[0]
          return res.data.find((x) => x.woText === productionPlanId)
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        } else {
          return null
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    },

    // --- PDF --- //
    async generatePDF() {
      pdfMake.vfs = vfs
      pdfMake.fonts = {
        THSarabunNew: {
          normal: 'THSarabunNew.ttf',
          bold: 'THSarabunNew Bold.ttf',
          italics: 'THSarabunNew Italic.ttf',
          bolditalics: 'THSarabunNew BoldItalic.ttf'
        }
      }

      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [20, 20, 20, 10],
        content: [
          // --- header --- //
          {
            columns: [
              'บริษัท ดวงเเก้ว จิวเวลรี่ แมนูแฟคเจอเรอร์ จำกัด',
              { text: 'ใบผสมทอง', alignment: 'right' }
            ],
            bold: true,
            fontSize: 15,
            margin: [0, 0, 0, 0],
            border: [false, false, false, true]
          },

          // --- no --- //
          {
            columns: [
              {
                text: `เล่มที่: ${this.form.bookNo}  เลขที่: ${this.form.no}  ลำดับ: ${this.form.runningNumber}`,
                style: 'boldText'
              },
              {
                text: `วันที่: ${this.formatDate(this.form.assignDate)}`,
                alignment: 'right'
              }
            ],
            //bold: true,
            fontSize: 14,
            margin: [0, 0, 0, 0],
            border: [false, false, false, true]
          },

          //underline
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    columns: [],
                    border: [false, false, false, true]
                  }
                ]
              ]
            },
            layout: {
              defaultBorder: false
            },
            margin: [0, 0, 0, 0]
          },

          // ----- header info -------//
          {
            columns: [
              {
                stack: [
                  { text: 'ประเภททอง', style: 'title' },
                  {
                    text: this.form.gold ? `${this.form.gold.code}:${this.form.gold.nameTh}` : ``,
                    style: 'desc'
                  }
                ]
              },
              {
                stack: [
                  { text: 'เปอร์เซ็นทอง', style: 'title' },
                  {
                    text: this.form.goldSize ? `${this.form.goldSize.nameTh}` : ``,
                    style: 'desc'
                  }
                ]
              },
              {
                stack: [
                  { text: 'สูตรผสมทอง', style: 'title' },
                  {
                    text: this.form.goldReceipt,
                    style: 'desc'
                  }
                ]
              }
            ],
            margin: [0, 10, 0, 0]
          },

          //underline
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    columns: [],
                    border: [false, false, false, true]
                  }
                ]
              ]
            },
            layout: {
              defaultBorder: false
            },
            margin: [0, 0, 0, 10]
          },

          // --- รายการเบิกทองหลอม --- //
          // {
          //   columns: ['รายการเบิกทองหลอม'],
          //   //bold: true,
          //   fontSize: 15,
          //   margin: [0, 0, 0, 0]
          // },
          // {
          //   style: 'tableExample',
          //   table: {
          //     widths: [120, 180, 50, '*'],
          //     body: [
          //       //titel
          //       [
          //         {
          //           text: `วันที่: ${this.formatDate(this.form.meltDate)}`,
          //           style: 'title',
          //           border: [false, false, false, false]
          //           //colSpan: 4,
          //           //alignment: 'center'
          //         },
          //         {
          //           text: `รายการ`,
          //           style: 'title',
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: `น้ำหนัก`,
          //           style: 'title',
          //           alignment: 'right',
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: ``,
          //           style: 'title',
          //           border: [false, false, false, false]
          //         }
          //       ],
          //       //เบิกทองหลอม
          //       [
          //         {
          //           text: ``,
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: `เบิกหลอม`,
          //           style: 'boldText',
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: `${this.form.meltWeight ?? `0`}`,
          //           style: 'boldText',
          //           alignment: 'right',
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: ``,
          //           border: [false, false, false, false]
          //         }
          //       ],
          //       [
          //         {
          //           text: ``,
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: `คืนทองหลอม`,
          //           style: 'boldText',
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: `${this.form.returnMeltWeight ?? `0`}`,
          //           style: 'boldText',
          //           alignment: 'right',
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: ``,
          //           border: [false, false, false, false]
          //         }
          //       ],
          //       [
          //         {
          //           text: ``,
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: `คืนขี้เบ้า`,
          //           style: 'boldText',
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: `${this.form.returnMeltScrapWeight ?? `0`}`,
          //           style: 'boldText',
          //           alignment: 'right',
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: ``,
          //           border: [false, false, false, false]
          //         }
          //       ],
          //       [
          //         {
          //           text: ``,
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: `น้ำหนักขาด`,
          //           style: 'boldText',
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: `${this.form.meltWeightLoss ?? `0`}`,
          //           style: 'boldText',
          //           alignment: 'right',
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: ``,
          //           border: [false, false, false, false]
          //         }
          //       ],
          //       [
          //         {
          //           text: ``,
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: `น้้ำหนักเกิน`,
          //           style: 'boldText',
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: `${this.form.meltWeightOver ?? `0`}`,
          //           style: 'boldText',
          //           alignment: 'right',
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: ``,
          //           border: [false, false, false, false]
          //         }
          //       ]
          //     ],
          //     layout: {
          //       defaultBorder: false
          //     },
          //     //border: [false, false, false, false],
          //     margin: [0, 0, 0, 0]
          //   }
          // },

          // --- รายการเบิกทองหล่อ --- //
          {
            columns: ['รายการเบิกทองหล่อ'],
            //bold: true,
            fontSize: 15,
            margin: [0, 0, 0, 0]
          },
          {
            style: 'tableExample',
            table: {
              widths: [120, 180, 50, '*'],
              body: [
                //titel
                [
                  {
                    text: `วันที่: ${this.formatDate(this.form.castDate)}`,
                    style: 'title',
                    border: [false, false, false, false]
                    //colSpan: 4,
                    //alignment: 'center'
                  },
                  {
                    text: `รายการ`,
                    style: 'title',
                    border: [false, false, false, false]
                  },
                  {
                    text: `น้ำหนัก`,
                    style: 'title',
                    alignment: 'right',
                    border: [false, false, false, false]
                  },
                  {
                    text: ``,
                    style: 'title',
                    border: [false, false, false, false]
                  }
                ],
                //เบิกทองหล่อ
                [
                  {
                    text: ``,
                    border: [false, false, false, false]
                  },
                  {
                    text: `เบิกหล่อ`,
                    style: 'boldText',
                    border: [false, false, false, false]
                  },
                  {
                    text: `${
                      this.form.castWeight?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)
                    }`,
                    style: 'boldText',
                    alignment: 'right',
                    border: [false, false, false, false]
                  },
                  {
                    text: ``,
                    border: [false, false, false, false]
                  }
                ],
                // [
                //   {
                //     text: ``,
                //     border: [false, false, false, false]
                //   },
                //   {
                //     text: `เบิกพลอยเพชร`,
                //     style: 'boldText',
                //     border: [false, false, false, false]
                //   },
                //   {
                //     text: `${this.form.gemWeight ?? `0`}`,
                //     style: 'boldText',
                //     alignment: 'right',
                //     border: [false, false, false, false]
                //   },
                //   {
                //     text: ``,
                //     border: [false, false, false, false]
                //   }
                // ],
                [
                  {
                    text: ``,
                    border: [false, false, false, false]
                  },
                  {
                    text: `คืนทองหล่อ`,
                    style: 'boldText',
                    border: [false, false, false, false]
                  },
                  {
                    text: `${
                      this.form.returnCastWeight?.toFixed(2) ??
                      this.defaultDisplay.emptyValue.toFixed(2)
                    }`,
                    style: 'boldText',
                    alignment: 'right',
                    border: [false, false, false, false]
                  },
                  {
                    text: ``,
                    border: [false, false, false, false]
                  }
                ],
                [
                  {
                    text: ``,
                    border: [false, false, false, false]
                  },
                  {
                    text: `คืนขี้เบ้า`,
                    style: 'boldText',
                    border: [false, false, false, false]
                  },
                  {
                    text: `${
                      this.form.returnCastScrapWeight?.toFixed(2) ??
                      this.defaultDisplay.emptyValue.toFixed(2)
                    }`,
                    style: 'boldText',
                    alignment: 'right',
                    border: [false, false, false, false]
                  },
                  {
                    text: ``,
                    border: [false, false, false, false]
                  }
                ],
                [
                  {
                    text: ``,
                    border: [false, false, false, false]
                  },
                  {
                    text: `คืนเเม่พิมพ์`,
                    style: 'boldText',
                    border: [false, false, false, false]
                  },
                  {
                    text: `${
                      this.form.returnCastMoldWeight?.toFixed(2) ??
                      this.defaultDisplay.emptyValue.toFixed(2)
                    }`,
                    style: 'boldText',
                    alignment: 'right',
                    border: [false, false, false, false]
                  },
                  {
                    text: ``,
                    border: [false, false, false, false]
                  }
                ],
                [
                  {
                    text: ``,
                    border: [false, false, false, false]
                  },
                  {
                    text: `คืนตัวเรือน`,
                    style: 'boldText',
                    border: [false, false, false, false]
                  },
                  {
                    text: `${
                      this.form.returnCastBodyWeight?.toFixed(2) ??
                      this.defaultDisplay.emptyValue.toFixed(2)
                    }`,
                    style: 'boldText',
                    alignment: 'right',
                    border: [false, false, false, false]
                  },
                  {
                    text: ``,
                    border: [false, false, false, false]
                  }
                ],
                [
                  {
                    text: ``,
                    border: [false, false, false, false]
                  },
                  {
                    text: `คืนตัวเรือนเสีย`,
                    style: 'boldText',
                    border: [false, false, false, false]
                  },
                  {
                    text: `${
                      this.form.returnCastBodyBrokenWeight?.toFixed(2) ??
                      this.defaultDisplay.emptyValue.toFixed(2)
                    }`,
                    style: 'boldText',
                    alignment: 'right',
                    border: [false, false, false, false]
                  },
                  {
                    text: ``,
                    border: [false, false, false, false]
                  }
                ],
                [
                  {
                    text: ``,
                    border: [false, false, false, false]
                  },
                  {
                    text: `คืนผงทอง`,
                    style: 'boldText',
                    border: [false, false, false, false]
                  },
                  {
                    text: `${
                      this.form.returnCastPowderWeight?.toFixed(2) ??
                      this.defaultDisplay.emptyValue.toFixed(2)
                    }`,
                    style: 'boldText',
                    alignment: 'right',
                    border: [false, false, false, false]
                  },
                  {
                    text: ``,
                    border: [false, false, false, false]
                  }
                ],
                [
                  {
                    text: ``,
                    border: [false, false, false, false]
                  },
                  {
                    text: `น้ำหนักขาด`,
                    style: 'boldText',
                    border: [false, false, false, false]
                  },
                  {
                    text: `${
                      this.form.castWeightLoss?.toFixed(2) ??
                      this.defaultDisplay.emptyValue.toFixed(2)
                    }`,
                    style: 'boldText',
                    alignment: 'right',
                    border: [false, false, false, false]
                  },
                  {
                    text: ``,
                    border: [false, false, false, false]
                  }
                ],
                [
                  {
                    text: ``,
                    border: [false, false, false, false]
                  },
                  {
                    text: `น้้ำหนักเกิน`,
                    style: 'boldText',
                    border: [false, false, false, false]
                  },
                  {
                    text: `${
                      this.form.castWeightOver?.toFixed(2) ??
                      this.defaultDisplay.emptyValue.toFixed(2)
                    }`,
                    style: 'boldText',
                    alignment: 'right',
                    border: [false, false, false, false]
                  },
                  {
                    text: ``,
                    border: [false, false, false, false]
                  }
                ]
              ],
              layout: {
                paddingTop: function (i) {
                  return i === 1
                },
                paddingBottom: function (i) {
                  return i === 1
                },
                margin: [0, 0, 0, 0]
              },
              margin: [0, 0, 0, 0]
            }
          },

          // --- รายการคืนตัวเรือน --- //
          // {
          //   columns: ['รายการคืนตัวเรือน'],
          //   //bold: true,
          //   fontSize: 15,
          //   margin: [0, 0, 0, 0]
          // },
          {
            style: 'tableExample',
            table: {
              widths: [120, 180, 50, 10, '*'],
              body: [
                //titel
                [
                  {
                    text: `รายการคืนตัวเรือน`,
                    fontSize: 15,
                    border: [false, false, false, false]
                    //colSpan: 4,
                    //alignment: 'center'
                  },
                  {
                    text: `รายการ`,
                    style: 'title',
                    border: [false, false, false, false]
                  },
                  {
                    text: `น้ำหนัก`,
                    style: 'title',
                    alignment: 'right',
                    border: [false, false, false, false]
                  },
                  {
                    text: ``,
                    style: 'title',
                    border: [false, false, false, false]
                    //colSpan: 4,
                    //alignment: 'center'
                  },
                  {
                    text: `จำนวน`,
                    style: 'title',
                    border: [false, false, false, false]
                  }
                ],
                //ตัวเรือน
                ...this.buildReturnBody(),
                [
                  {
                    text: ``,
                    fontSize: 15,
                    border: [false, false, false, false]
                    //colSpan: 4,
                    //alignment: 'center'
                  },
                  {
                    text: `รวมคืนตัวเรือน`,
                    style: 'boldText',
                    alignment: 'right',
                    border: [false, false, false, false]
                  },
                  {
                    text: `${
                      this.form.returnCastBodyWeight?.toFixed(2) ??
                      this.defaultDisplay.emptyValue.toFixed(2)
                    }`,
                    style: 'boldText',
                    alignment: 'right',
                    border: [false, false, false, false]
                  },
                  {
                    text: ``,
                    style: 'title',
                    border: [false, false, false, false]
                    //colSpan: 4,
                    //alignment: 'center'
                  },
                  {
                    text: ``,
                    style: 'title',
                    border: [false, false, false, false]
                  }
                ]
              ]
            }
          },
          //underline
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    columns: [],
                    border: [false, false, false, true]
                  }
                ]
              ]
            },
            layout: {
              defaultBorder: false
            },
            margin: [0, 0, 0, 10]
          },

          // ---- sign ---- //
          {
            columns: [
              {
                stack: [
                  { text: 'ผู้เบิกทอง', style: 'title', margin: [0, 0, 0, 10] },
                  {
                    text: `{.................................................................}`,
                    style: 'desc'
                  },
                  {
                    text: `${this.form.assignBy}`,
                    style: 'desc'
                  }
                ],
                alignment: 'center'
              },
              {
                stack: [
                  { text: 'ผู้รับทอง', style: 'title', margin: [0, 0, 0, 10] },
                  {
                    text: `{.................................................................}`,
                    style: 'desc'
                  },
                  {
                    text: `${this.form.receiveBy}`,
                    style: 'desc'
                  }
                ],
                alignment: 'center'
              }
            ],
            margin: [0, 10, 0, 0]
          }
        ],
        defaultStyle: {
          font: 'THSarabunNew'
        },
        styles: {
          title: {
            fontSize: 10
          },
          desc: {
            fontSize: 11,
            bold: true
          },
          boldText: {
            fontSize: 11,
            bold: true
          }
        }
      }

      pdfMake.createPdf(docDefinition).open()
    },
    buildReturnBody() {
      let body = []
      if (this.form.items) {
        this.form.items.forEach((x) => {
          body.push([
            {
              text: ``,
              border: [false, false, false, false]
            },
            {
              text: `${x.productionPlan.wo}-${x.productionPlan.woNumber}`,
              style: 'boldText',
              border: [false, false, false, false]
            },
            {
              text: `${x.returnWeight?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`,
              style: 'boldText',
              alignment: 'right',
              border: [false, false, false, false]
            },
            {
              text: ``,
              border: [false, false, false, false]
            },
            {
              text: `${x.returnQTY?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`,
              //style: 'boldText',
              border: [false, false, false, false]
            }
          ])
        })
      }
      return body
    }
  },
  async created() {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
