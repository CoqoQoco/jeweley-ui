<template>
  <div class="app-container">
    <form @submit.prevent="onSearch">
      <pageTitle
        :title="`ตรวจสอบค่าเเรงช่าง : ${data.code ?? ''} - ${data.nameTh ?? ''}`"
        :isShowBtnClose="false"
        :isShowRightSlot="false"
      >
        <template #rightSlot>
          <button class="btn btn-sm btn-warning mr-2" type="button" @click="onCreate" title="สร้าง">
            <span><i class="bi bi-search"></i></span>
          </button>
        </template>
      </pageTitle>
      <div class="p-2">
        <div class="form-col-container">
          <!-- date -->
          <div>
            <span class="title-text">วันที่ตรวจสอบ</span>
            <div class="flex-group">
              <Calendar
                class="w-100"
                v-model="form.requestDateStart"
                :max-date="form.requestDateEnd"
                :class="val.isValRequestDateStart === true ? `p-invalid` : ``"
                :manualInput="false"
                showIcon
                dateFormat="dd/mm/yy"
                placeholder="เริ่มต้น"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <Calendar
                class="w-100"
                v-model="form.requestDateEnd"
                :min-date="form.requestDateStart"
                :class="val.isValRequestDateEnd === true ? `p-invalid` : ``"
                :manualInput="false"
                showIcon
                dateFormat="dd/mm/yy"
                placeholder="สิ้นสุด"
              />
              <!-- <div class="submit-container ml-5">
                <button class="btn btn-sm btn-main mr-2" type="submit">
                  <span><i class="bi bi-search"></i></span>
                </button>
                <button class="btn btn-sm btn-dark" type="button" @click="onClear">
                  <span><i class="bi bi-x-circle"></i></span>
                </button>
              </div> -->
            </div>
          </div>

          <div>
            <div class="d-flex justify-content-start">
              <button
                class="btn btn-sm btn-green"
                type="submit"
                style="height: 35px; margin-top: 27px"
              >
                <span><i class="bi bi-search mr-2"></i></span>
                <span>ตรวจสอบ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>

    <div class="p-2">
      <div class="data-table-container mt-2">
        <!-- scrollHeight="calc(100vh - 305px)" -->
        <DataTable
          :value="dataWages.items"
          class="p-datatable-sm"
          scrollHeight="calc(100vh - 280px)"
          show-gridlines
          scrollable
          resizableColumns
        >
          <ColumnGroup type="header">
            <Row>
              <Column header="เลขที่ใบงาน"></Column>
              <Column header="สถานะใบงาน"></Column>
              <Column header="วันที่ส่งงาน"></Column>
              <Column header="รหัสสินค้า"></Column>
              <Column header="สถานะ"></Column>
              <Column header="เเผนกงาน"></Column>
              <Column header="รายละเอียด"></Column>
              <Column header="จำนวนจ่าย"></Column>
              <Column header="น้ำหนักจ่าย"></Column>
              <Column header="จำนวนรับ"></Column>
              <Column header="น้ำหนักรับ"></Column>
              <Column header="ราคาต่อหน่วย"></Column>
              <Column header="ราคา"></Column>
            </Row>
          </ColumnGroup>
          <Column field="wo">
            <template #body="slotProps">
              {{ `${slotProps.data.wo}-${slotProps.data.woNumber}` }}
            </template>
          </Column>
          <Column field="statusActiveName"></Column>
          <Column field="jobDate">
            <template #body="slotProps">
              {{ `${formatDate(slotProps.data.jobDate)}` }}
            </template>
          </Column>
          <Column field="productNumber"></Column>
          <Column field="status">
            <template #body="slotProps">
              {{ slotProps.data.wagesStatus === 100 ? `สำเร็จ` : `ติดตามระหว่างผลิต` }}
            </template>
          </Column>
          <Column field="statusName"></Column>
          <Column field="desc">
            <template #body="slotProps">
              {{
                `${slotProps.data.gold} 
                ${slotProps.data.goldSize ? ` - ${slotProps.data.goldSize}` : ``}
                ${slotProps.data.description ? `[${slotProps.data.description}]` : ``}`
              }}
            </template>
          </Column>
          <Column field="goldQtySend">
            <template #body="slotProps">
              {{
                slotProps.data.status === 70
                  ? slotProps.data.goldQtyCheck
                  : slotProps.data.goldQtySend
              }}
            </template>
          </Column>
          <Column field="goldWeightSend">
            <template #body="slotProps">
              {{
                slotProps.data.status === 70
                  ? slotProps.data.goldWeightCheck
                  : slotProps.data.goldWeightSend
              }}
            </template>
          </Column>
          <Column field="goldQtyCheck">
            <template #body="slotProps">
              {{ slotProps.data.status === 70 ? 0 : slotProps.data.goldQtyCheck }}
            </template>
          </Column>
          <Column field="goldWeightCheck">
            <template #body="slotProps">
              {{ slotProps.data.status === 70 ? 0 : slotProps.data.goldWeightCheck }}
            </template></Column
          >
          <Column field="wages">
            <template #body="slotProps">
              <div>
                {{
                  `${
                    slotProps.data.wages
                      ? Number(slotProps.data.wages).toFixed(2).toLocaleString()
                      : Number(0).toFixed(2).toLocaleString()
                  }`
                }}
              </div>
            </template>
          </Column>
          <Column field="totalWages">
            <template #body="slotProps">
              <div>
                {{
                  `${
                    slotProps.data.totalWages
                      ? Number(slotProps.data.totalWages).toFixed(2).toLocaleString()
                      : Number(0).toFixed(2).toLocaleString()
                  }`
                }}
              </div>
            </template>
          </Column>
          <ColumnGroup type="footer">
            <Row>
              <Column :footer="`จำวนวน  ${dataWages.items.length}  รายการ`" :colspan="5" />
              <Column footer="รวมจำนวนรับ" :colspan="3" footerStyle="text-align:right" />
              <Column :footer="dataWages.totalGoldQtyCheck" />
              <Column footer="รวมราคา" :colspan="3" footerStyle="text-align:right" />
              <Column
                :footer="
                  dataWages.totalWages
                    ? Number(dataWages.totalWages).toFixed(2).toLocaleString()
                    : Number(0).toFixed(2).toLocaleString()
                "
              />
            </Row>
          </ColumnGroup>
        </DataTable>
      </div>

      <div class="submit-container">
        <!-- <button
          class="btn btn-sm btn-info mr-2"
          style="width: 200px"
          @click="generatePDF('success')"
        >
          <span><i class="bi bi-printer"></i></span>
          <span class="ml-2">พิมพ์สลิปสถานะติดตาม</span>
        </button> -->
        <button
          class="btn btn-sm btn-info mr-2"
          style="width: 200px"
          @click="generatePDF('wating')"
        >
          <span><i class="bi bi-printer"></i></span>
          <span class="ml-2">พิมพ์สลิปสถานะสำเร็จ</span>
        </button>
        <button
          class="btn btn-sm btn-danger mr-2"
          style="width: 200px"
          @click="onGenerateStatusPDF('wating')"
        >
          <span><i class="bi bi-printer"></i></span>
          <span class="ml-2">พิมพ์สลิปติดตามงาน</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import pageTitle from '@/components/custom/PageTitleMain.vue'

import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Row from 'primevue/row'
import ColumnGroup from 'primevue/columngroup' // optional
import pdfMake from 'pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'

import api from '@/axios/axios-helper.js'
import { formatISOString, formatDate } from '@/services/utils/dayjs'
//import swAlert from '@/services/alert/sweetAlerts.js'

import { usePlanWorkerApiStore } from '@/stores/modules/api/worker/plan-worker-store.js'

const interfaceForm = {
  requestDateStart: new Date(new Date().setDate(new Date().getDate() - 30)),
  requestDateEnd: new Date()
}
const interfaceValid = {
  isValRequestDateStart: false,
  isValRequestDateEnd: false
}
export default {
  components: {
    pageTitle,
    Calendar,
    DataTable,
    Column,
    Row,
    ColumnGroup
  },

  setup() {
    const workerStore = usePlanWorkerApiStore()
    return { workerStore }
  },

  computed: {
    query() {
      //return this.$route.query
      const url = window.location.href
      return url.split('/').slice(-1)[0]
    }
  },

  watch: {
    'form.requestDateStart'() {
      if (this.form.requestDateStart) {
        this.val.isValRequestDateStart = false
      }
    },
    'form.requestDateEnd'() {
      if (this.form.requestDateEnd) {
        this.val.isValRequestDateEnd = false
      }
    }
  },

  data() {
    return {
      // --- flag --- //
      isLoading: false,
      isShowDataTable: false,
      isShowNoDataTable: false,

      // --- form --- //
      data: {},
      dataWages: {
        items: []
      },
      dataActiveStatus: {},
      form: {
        interfaceForm
      },
      val: {
        ...interfaceValid
      }
    }
  },

  methods: {
    // --- controller --- //
    async onSearch() {
      if (this.validateForm()) {
        //   swAlert.confirmSubmit(
        //     ``,
        //     '',
        //     async () => {
        //       await this.submitPlan()
        //     },
        //     null,
        //     null
        //   )
        await this.search()
      }
    },
    validateForm() {
      if (!this.form.requestDateStart) {
        this.val = {
          isValRequestDateStart: true
        }
        return false
      }
      if (!this.form.requestDateEnd) {
        this.val = {
          isValRequestDateEnd: true
        }
        return false
      }

      return true
    },
    formatDate(date) {
      //console.log(date)
      return date ? formatDate(date) : null
    },

    // --- APIs --- //

    async search() {
      try {
        this.isLoading = true

        //console.log(this.form)

        const params = {
          requestDateStart: formatISOString(this.form.requestDateStart),
          requestDateEnd: formatISOString(this.form.requestDateEnd),
          //requestDateStart: this.form.requestDateStart,
          //requestDateEnd: this.form.requestDateEnd,
          code: this.data.code
        }
        const res = await api.jewelry.post('Worker/SearchWorkerWages', params)
        if (res) {
          this.dataWages = { ...res }
          console.log(this.dataWages)

          //console.log(res.items.length)
          if (res.items.length > 0) {
            //console.log('show')
            this.isShowDataTable = true
            this.isShowNoDataTable = false
          } else {
            //console.log('no show')
            this.isShowDataTable = false
            this.isShowNoDataTable = true
          }
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },
    async searchActiveStatus() {
      try {
        this.isLoading = true

        //console.log(this.form)

        const params = {
          requestDateStart: formatISOString(this.form.requestDateStart),
          requestDateEnd: formatISOString(this.form.requestDateEnd),
          //requestDateStart: this.form.requestDateStart,
          //requestDateEnd: this.form.requestDateEnd,
          code: this.data.code
        }
        const res = await api.jewelry.post('Worker/SearchWorkerActiveStatus', params)
        if (res) {
          this.dataActiveStatus = { ...res }
          console.log(this.dataWages)
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },

    // --- table PDF --- //
    // --- table --- //
    tablePay() {
      return {
        fontSize: 11,
        //bold: true,
        margin: [0, 0, 0, 0],
        table: {
          headerRows: 1,
          widths: [60, 60, '*', 60, 60, 50, 50, 50],
          body: this.buildTablePayBody(),
          layout: {
            defaultBorder: false
          }
        }
      }
    },
    buildTablePayBody() {
      let body = []
      const title = [
        this.setTableRow(`วันที่`, `title`),
        this.setTableRow(`เลขที่ใบงาน`, `title`),
        this.setTableRow(`รหัสสินค้า`, `title`),
        this.setTableRow(`แผนก`, `title`),
        this.setTableRow(`รายละเอียด`, `title`),
        this.setTableRow(`จำนวน`, `title-right`),
        this.setTableRow(`ราคา/หน่วย`, `title-right`),
        this.setTableRow(`จำนวนเงิน`, `title-right`)
      ]

      //title
      body.push(title)

      //body
      //const payItem = this.dataWages.items.filter((x) => x.wagesStatus === 100)
      const payItem = [...this.dataWages.items]
      //console.log(this.dataWages)
      let totalGoldQtyCheck = 0
      payItem.forEach((item) => {
        totalGoldQtyCheck += item.goldQtyCheck
        const row = [
          this.setTableRow(`${formatDate(item.jobDate)}`, `row`),
          this.setTableRow(`${item.wo}-${item.woNumber}`, `row`),
          this.setTableRow(`${item.productNumber}`, `row`),
          this.setTableRow(`${item.statusName}`, `row`),
          this.setTableRow(
            `${item.gold}${item.goldSize ? `- ${item.goldSize}` : ``} ${
              item.description ? `[${item.description}]` : ``
            }`,
            `row`
          ),
          this.setTableRow(`${item.goldQtyCheck ?? ``}`, `row-right`),
          this.setTableRow(
            item.wages ? Number(item.wages).toFixed(2).toLocaleString() : '0.00',
            `row-right`
          ),
          this.setTableRow(
            item.totalWages ? Number(item.totalWages).toFixed(2).toLocaleString() : '0.00',
            `row-right`
          )
        ]
        body.push(row)
      })

      //footer
      const footer = [
        this.setTableRow(``, `foot-right`),
        this.setTableRow(``, `foot-right`),
        this.setTableRow(``, `foot-right`),
        this.setTableRow(``, `foot-right`),
        this.setTableRow(`รวม`, `foot-right`),
        this.setTableRow(`${totalGoldQtyCheck}`, `foot-right`),
        this.setTableRow(``, `foot-right`),
        this.setTableRow(
          this.dataWages.totalWages
            ? Number(this.dataWages.totalWages).toFixed(2).toLocaleString()
            : '0.00',
          `foot-right`
        )
      ]
      body.push(footer)

      return body
    },
    tableStatus() {
      return {
        fontSize: 11,
        //bold: true,
        margin: [0, 0, 0, 0],
        table: {
          headerRows: 1,
          widths: [60, 60, '*', 60, 60, 50, 50, 50],
          body: this.buildTableStatusBody(),
          layout: {
            defaultBorder: false
          }
        }
      }
    },
    buildTableStatusBody() {
      let body = []
      const title = [
        this.setTableRow(`วันที่`, `title`),
        this.setTableRow(`เลขที่ใบงาน`, `title`),
        this.setTableRow(`รหัสสินค้า`, `title`),
        this.setTableRow(`แผนก`, `title`),
        this.setTableRow(`รายละเอียด`, `title`),
        this.setTableRow(`จำนวน`, `title-right`),
        this.setTableRow(`น้ำหนักจ่าย`, `title-right`)
      ]

      //title
      body.push(title)

      //body
      const payItem = this.dataWages.items.filter((x) => x.status === x.statusActive)
      //const payItem = [...this.dataActiveStatus.items]
      //console.log(this.dataWages)
      let totalGoldQtyCheck = 0
      let totalGoldQtyWeightCheck = 0
      payItem.forEach((item) => {
        totalGoldQtyCheck += item.status === 70 ? item.goldQtyCheck : item.goldQtySend
        totalGoldQtyWeightCheck += item.status === 70 ? item.goldWeightCheck : item.goldWeightSend
        const row = [
          this.setTableRow(`${formatDate(item.jobDate)}`, `row`),
          this.setTableRow(`${item.wo}-${item.woNumber}`, `row`),
          this.setTableRow(`${item.productNumber}`, `row`),
          this.setTableRow(`${item.statusName}`, `row`),
          this.setTableRow(
            `${item.gold}${item.goldSize ? `- ${item.goldSize}` : ``} ${
              item.description ? `[${item.description}]` : ``
            }`,
            `row`
          ),
          this.setTableRow(
            `${item.status === 70 ? item.goldQtyCheck : item.goldQtySend ?? ``}`,
            `row-right`
          ),
          this.setTableRow(
            `${item.status === 70 ? item.goldWeightCheck : item.goldWeightSend ?? ``}`,
            `row-right`
          )
        ]
        body.push(row)
      })

      //footer
      const footer = [
        this.setTableRow(``, `foot-right`),
        this.setTableRow(``, `foot-right`),
        this.setTableRow(``, `foot-right`),
        this.setTableRow(``, `foot-right`),
        this.setTableRow(`รวม`, `foot-right`),
        this.setTableRow(`${totalGoldQtyCheck}`, `foot-right`),
        this.setTableRow(`${totalGoldQtyWeightCheck}`, `foot-right`)
      ]
      body.push(footer)

      return body
    },
    tableWaiting() {
      return {
        fontSize: 13,
        //bold: true,
        margin: [0, 0, 0, 0],
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*', '*', 50, 50, 50],
          body: this.buildTableWatingBody(),
          layout: {
            defaultBorder: false
          }
        }
      }
    },
    buildTableWatingBody() {
      let body = []
      const title = [
        this.setTableRow(`เลขที่ใบงาน`, `title`),
        this.setTableRow(`รหัสสินค้า`, `title`),
        this.setTableRow(`แผนก`, `title`),
        this.setTableRow(`รายละเอียด`, `title`),
        this.setTableRow(`จำนวน`, `title-right`),
        this.setTableRow(`ราคา/หน่วย`, `title-right`),
        this.setTableRow(`จำนวนเงิน`, `title-right`)
      ]

      //title
      body.push(title)

      //body
      const payItem = this.dataWages.items.filter((x) => x.wagesStatus === 10)
      //console.log(this.dataWages)
      let totalGoldQtyCheck = 0
      payItem.forEach((item) => {
        totalGoldQtyCheck += item.goldQtyCheck
        const row = [
          this.setTableRow(`${item.wo}-${item.woNumber}`, `row`),
          this.setTableRow(`${item.productNumber}`, `row`),
          this.setTableRow(`${item.statusName}`, `row`),
          this.setTableRow(
            `${item.gold}${item.goldSize ? `- ${item.goldSize}` : ``} ${
              item.description ? `[${item.description}]` : ``
            }`,
            `row`
          ),
          this.setTableRow(`${item.goldQtyCheck ?? ``}`, `row-right`),
          this.setTableRow(
            item.wages ? Number(item.wages).toFixed(2).toLocaleString() : '0.00',
            `row-right`
          ),
          this.setTableRow(
            item.totalWages ? Number(item.totalWages).toFixed(2).toLocaleString() : '0.00',
            `row-right`
          )
        ]
        body.push(row)
      })

      //footer
      const footer = [
        this.setTableRow(``, `foot-right`),
        this.setTableRow(``, `foot-right`),
        this.setTableRow(``, `foot-right`),
        this.setTableRow(`รวม`, `foot-right`),
        this.setTableRow(`${totalGoldQtyCheck}`, `foot-right`),
        this.setTableRow(``, `foot-right`),
        this.setTableRow(
          this.dataWages.totalWages ? Number(0).toFixed(2).toLocaleString() : '0.00',
          `foot-right`
        )
      ]
      body.push(footer)

      return body
    },

    // --- table PDF helper --- '//
    setTableRow(text, config) {
      switch (config) {
        case 'title': {
          return {
            text: text,
            bold: true,
            border: [false, true, false, true]
          }
        }
        case 'title-right': {
          return {
            text: text,
            alignment: 'right',
            bold: true,
            border: [false, true, false, true]
          }
        }
        case 'row': {
          return {
            text: text,
            bold: true,
            border: [false, false, false, false]
          }
        }
        case 'row-right': {
          return {
            text: text,
            bold: true,
            alignment: 'right',
            border: [false, false, false, false]
          }
        }
        case 'foot-right': {
          return {
            text: text,
            bold: true,
            alignment: 'right',
            border: [false, true, false, false]
          }
        }
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
              { text: 'ค่าเเรงตามพนักงาน', alignment: 'right' }
            ],
            bold: true,
            fontSize: 15,
            margin: [0, 0, 0, 0],
            border: [false, false, false, true]
          },

          // --- worker info --- //
          {
            columns: [
              `พนักงาน: ${this.data.code} - ${this.data.nameTh}`,
              {
                text: `วันที่: ${formatDate(this.dataWages.wagesDateStart)} - ${formatDate(
                  this.dataWages.wagesDateEnd
                )}`,
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

          // pay table

          {
            columns: ['สถานะสำเร็จ'],
            //bold: true,
            fontSize: 15,
            margin: [0, 15, 0, 0]
          },
          this.tablePay()

          // wating table
          // {
          //   columns: ['สถานะติดตามระหว่างผลิต'],
          //   //bold: true,
          //   fontSize: 15,
          //   margin: [0, 15, 0, 0]
          // },
          // this.tableWaiting()
        ],
        defaultStyle: {
          font: 'THSarabunNew'
        },
        styles: {
          title: {
            fontSize: 10
          },
          desc: {
            fontSize: 13,
            bold: true
          },
          boldText: {
            //fontSize: 15,
            bold: true
          }
        }
      }

      pdfMake.createPdf(docDefinition).open()
    },
    //onGenerateStatusPDF() { },
    async onGenerateStatusPDF() {
      //this.searchActiveStatus()
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
              { text: 'ติดตามสถานะงาน', alignment: 'right' }
            ],
            bold: true,
            fontSize: 15,
            margin: [0, 0, 0, 0],
            border: [false, false, false, true]
          },

          // --- worker info --- //
          {
            columns: [
              `พนักงาน: ${this.data.code} - ${this.data.nameTh}`,
              {
                text: `วันที่: ${formatDate(this.dataWages.wagesDateStart)} - ${formatDate(
                  this.dataWages.wagesDateEnd
                )}`,
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

          // pay table

          {
            columns: ['ติดตามสถานะงาน'],
            //bold: true,
            fontSize: 15,
            margin: [0, 15, 0, 0]
          },
          this.tableStatus()

          // wating table
          // {
          //   columns: ['สถานะติดตามระหว่างผลิต'],
          //   //bold: true,
          //   fontSize: 15,
          //   margin: [0, 15, 0, 0]
          // },
          // this.tableWaiting()
        ],
        defaultStyle: {
          font: 'THSarabunNew'
        },
        styles: {
          title: {
            fontSize: 10
          },
          desc: {
            fontSize: 13,
            bold: true
          },
          boldText: {
            //fontSize: 15,
            bold: true
          }
        }
      }

      pdfMake.createPdf(docDefinition).open()
    }
  },

  async created() {
    this.$nextTick(async () => {
      const url = window.location.href
      const code = url.split('/').slice(-1)[0]

      const res = await this.workerStore.fetchReturnSearch({
        skip: 0,
        take: 0,
        sort: [],
        formValue: {
          code: code,
          text: null,
          type: null,
          active: 1
        }
      })

      if (res) {
        this.data = { ...res.data[0] }
        this.form = { ...interfaceForm }
      }
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.input-group-text {
  height: 35px;
  margin-top: 5px;
}
</style>
