<template>
  <div class="form-container">
    <modal :showModal="isShow" @closeModal="closeModal" width="1000px">
      <template v-slot:content>
        <div class="txt-title-custom-modal">
          <span><i class="bi bi-clipboard-data"></i></span>
          <span> {{ $t('view.productionCost.goldCost.titleView') }}</span>
        </div>
        <div class="header-container">
          <div class="form-content-row-four-columns-container mb-2">
            <div class="d-flex flex-column">
              <span class="txt-data-title">{{ $t('view.productionCost.goldCost.fieldBookNo') }}</span>
              <span class="txt-data-desc">{{ form.bookNo }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="txt-data-title">{{ $t('view.productionCost.goldCost.fieldNo') }}</span>
              <span class="txt-data-desc">{{ form.no }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="txt-data-title">{{ $t('view.productionCost.goldCost.fieldAssignDate') }}</span>
              <span class="txt-data-desc">{{ formatDate(form.assignDate) }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="txt-data-title">{{ $t('view.productionCost.goldCost.fieldRunningNumber') }}</span>
              <span class="txt-data-desc">{{ form.runningNumber }}</span>
            </div>
          </div>
          <div class="form-content-row-four-columns-container">
            <div class="d-flex flex-column">
              <span class="txt-data-title">{{ $t('view.productionCost.goldCost.fieldGoldType') }}</span>
              <span class="txt-data-desc">{{
                form.gold ? `${form.gold?.code}:${form.gold?.nameTh}` : ``
              }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="txt-data-title">{{ $t('view.productionCost.goldCost.fieldGoldPercent') }}</span>
              <span class="txt-data-desc">{{
                form.goldSize ? `${form.goldSize?.nameTh}` : ``
              }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="txt-data-title">{{ $t('view.productionCost.goldCost.fieldGoldReceipt') }}</span>
              <span class="txt-data-desc">{{ form.goldReceipt }}</span>
            </div>
          </div>
        </div>
        <div class="line"></div>
        <div class="form-content-data-custom-columns-container mt-2">
          <div>
            <div class="txt-data-title-main-color">
              <span><i class="bi bi-card-checklist"></i></span>
              <span> {{ $t('view.productionCost.goldCost.sectionCast') }}</span>
            </div>
          </div>
          <div class="font-weight-bold">รายการ</div>
          <div class="font-weight-bold text-right">น้ำหนัก</div>
        </div>
        <div class="form-content-data-custom-columns-container">
          <div>
            <small>{{ `วันที่เบิกหล่อ: ${formatDate(form.castDate)}` }}</small>
          </div>
          <div class="text-main font-weight-bold">เบิกหล่อ</div>
          <div class="text-main font-weight-bold text-right">
            {{ form.castWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-content-data-custom-columns-container">
          <div></div>
          <div class="text-main font-weight-bold">คืนทองหล่อ</div>
          <div class="text-main font-weight-bold text-right">
            {{ form.returnCastWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-content-data-custom-columns-container">
          <div></div>
          <div class="text-main font-weight-bold">คืนขี้เบ้า</div>
          <div class="text-main font-weight-bold text-right">
            {{ form.returnCastScrapWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-content-data-custom-columns-container">
          <div></div>
          <div class="text-main font-weight-bold">คืนเเม่พิมพ์</div>
          <div class="text-main font-weight-bold text-right">
            {{ form.returnCastMoldWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-content-data-custom-columns-container">
          <div></div>
          <div class="text-main font-weight-bold">คืนตัวเรือน</div>
          <div class="text-main font-weight-bold text-right">
            {{ form.returnCastBodyWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-content-data-custom-columns-container">
          <div></div>
          <div class="text-main font-weight-bold">คืนตัวเรือนเสีย</div>
          <div class="text-main font-weight-bold text-right">
            {{ form.returnCastBodyBrokenWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-content-data-custom-columns-container">
          <div></div>
          <div class="text-main font-weight-bold">คืนผงทอง</div>
          <div class="text-main font-weight-bold text-right">
            {{ form.returnCastPowderWeight?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-content-data-custom-columns-container">
          <div></div>
          <div class="text-main font-weight-bold">น้ำหนักขาด</div>
          <div class="text-main font-weight-bold text-right">
            {{ form.castWeightLoss?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="form-content-data-custom-columns-container">
          <div></div>
          <div class="text-main font-weight-bold">น้้ำหนักเกิน</div>
          <div class="text-main font-weight-bold text-right">
            {{ form.castWeightOver?.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
          </div>
        </div>
        <div class="line"></div>
        <div class="form-content-data-custom-columns-container mt-2">
          <div>
            <div class="txt-data-title-main-color">
              <span><i class="bi bi-gem"></i></span>
              <span> {{ $t('view.productionCost.goldCost.sectionReturnBody') }}</span>
            </div>
          </div>
          <div class="font-weight-bold">รายการ</div>
          <div class="font-weight-bold text-right">น้ำหนัก</div>
          <div class="font-weight-bold ml-4">จำนวน</div>
        </div>
        <div v-if="form.items.length">
          <div v-for="(item, index) in form.items" :key="index">
            <div class="form-content-data-custom-columns-container">
              <div></div>
              <div class="text-main font-weight-bold">
                {{ `${item.productionPlan.wo}-${item.productionPlan.woNumber}` }}
              </div>
              <div class="text-main font-weight-bold text-right">
                {{ item.returnWeight.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
              </div>
              <div class="text-main font-weight-bold ml-4">
                {{ item.returnQTY.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
              </div>
            </div>
          </div>
          <div class="form-content-data-custom-columns-container">
            <div></div>
            <div class="font-weight-bold text-right">รวมน้ำหนักคืนตัวเรือน</div>
            <div class="text-main font-weight-bold text-right">
              {{ form.returnCastBodyWeight.toFixed(2) ?? defaultDisplay.emptyValue.toFixed(2) }}
            </div>
            <div></div>
          </div>
        </div>
        <div v-else class="d-flex justify-content-center">
          <div style="color: var(--base-sub-color)">-- ไม่มีรายการคืนตัวเรือน --</div>
        </div>
        <div class="line"></div>
        <div class="header-container">
          <div class="form-content-row-custom-tree-columns-container">
            <div class="d-flex flex-column justify-content-center">
              <span class="txt-data-title">{{ $t('view.productionCost.goldCost.sectionOther') }}</span>
              <span>{{ form.remark }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="txt-data-title">{{ $t('view.productionCost.goldCost.fieldAssignBy') }}</span>
              <span class="txt-data-desc">{{ form.assignBy }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="txt-data-title">{{ $t('view.productionCost.goldCost.fieldReceiveBy') }}</span>
              <span class="txt-data-desc">{{ form.receiveBy }}</span>
            </div>
          </div>
          <div class="d-flex justify-content-center mt-3">
            <button class="btn btn-sm btn-outline-main mr-2" type="button" @click="closeModal">
              <span class="mr-2"><i class="bi bi-x-circle"></i></span>
              <span>{{ $t('common.btn.close') }}</span>
            </button>
            <button class="btn btn-sm btn-green" type="button" @click="generatePDF()">
              <span class="mr-2"><i class="bi bi-printer"></i></span>
              <span>{{ $t('common.btn.print') }}</span>
            </button>
          </div>
        </div>
        <div class="p-2"></div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import pdfMake from 'pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'

import api from '@/axios/axios-helper.js'
import { formatDate } from '@/services/utils/dayjs'

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

export default {
  components: {
    modal
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
      defaultDisplay: {
        emptyValue: 0
      }
    }
  },

  methods: {
    closeModal() {
      this.form = { ...interfaceForm }
      this.$emit('closeModal')
    },

    formatDate(date) {
      return date ? formatDate(date) : ''
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
    },

    generatePDF() {
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
            fontSize: 14,
            margin: [0, 0, 0, 0],
            border: [false, false, false, true]
          },
          {
            table: {
              widths: ['*'],
              body: [[{ columns: [], border: [false, false, false, true] }]]
            },
            layout: { defaultBorder: false },
            margin: [0, 0, 0, 0]
          },
          {
            columns: [
              {
                stack: [
                  { text: 'ประเภททอง', style: 'title' },
                  { text: this.form.gold ? `${this.form.gold.code}:${this.form.gold.nameTh}` : ``, style: 'desc' }
                ]
              },
              {
                stack: [
                  { text: 'เปอร์เซ็นทอง', style: 'title' },
                  { text: this.form.goldSize ? `${this.form.goldSize.nameTh}` : ``, style: 'desc' }
                ]
              },
              {
                stack: [
                  { text: 'สูตรผสมทอง', style: 'title' },
                  { text: this.form.goldReceipt, style: 'desc' }
                ]
              }
            ],
            margin: [0, 10, 0, 0]
          },
          {
            table: {
              widths: ['*'],
              body: [[{ columns: [], border: [false, false, false, true] }]]
            },
            layout: { defaultBorder: false },
            margin: [0, 0, 0, 10]
          },
          {
            columns: ['รายการเบิกทองหล่อ'],
            fontSize: 15,
            margin: [0, 0, 0, 0]
          },
          {
            style: 'tableExample',
            table: {
              widths: [120, 180, 50, '*'],
              body: [
                [
                  { text: `วันที่: ${this.formatDate(this.form.castDate)}`, style: 'title', border: [false, false, false, false] },
                  { text: `รายการ`, style: 'title', border: [false, false, false, false] },
                  { text: `น้ำหนัก`, style: 'title', alignment: 'right', border: [false, false, false, false] },
                  { text: ``, style: 'title', border: [false, false, false, false] }
                ],
                [
                  { text: ``, border: [false, false, false, false] },
                  { text: `เบิกหล่อ`, style: 'boldText', border: [false, false, false, false] },
                  { text: `${this.form.castWeight?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`, style: 'boldText', alignment: 'right', border: [false, false, false, false] },
                  { text: ``, border: [false, false, false, false] }
                ],
                [
                  { text: ``, border: [false, false, false, false] },
                  { text: `คืนทองหล่อ`, style: 'boldText', border: [false, false, false, false] },
                  { text: `${this.form.returnCastWeight?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`, style: 'boldText', alignment: 'right', border: [false, false, false, false] },
                  { text: ``, border: [false, false, false, false] }
                ],
                [
                  { text: ``, border: [false, false, false, false] },
                  { text: `คืนขี้เบ้า`, style: 'boldText', border: [false, false, false, false] },
                  { text: `${this.form.returnCastScrapWeight?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`, style: 'boldText', alignment: 'right', border: [false, false, false, false] },
                  { text: ``, border: [false, false, false, false] }
                ],
                [
                  { text: ``, border: [false, false, false, false] },
                  { text: `คืนเเม่พิมพ์`, style: 'boldText', border: [false, false, false, false] },
                  { text: `${this.form.returnCastMoldWeight?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`, style: 'boldText', alignment: 'right', border: [false, false, false, false] },
                  { text: ``, border: [false, false, false, false] }
                ],
                [
                  { text: ``, border: [false, false, false, false] },
                  { text: `คืนตัวเรือน`, style: 'boldText', border: [false, false, false, false] },
                  { text: `${this.form.returnCastBodyWeight?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`, style: 'boldText', alignment: 'right', border: [false, false, false, false] },
                  { text: ``, border: [false, false, false, false] }
                ],
                [
                  { text: ``, border: [false, false, false, false] },
                  { text: `คืนตัวเรือนเสีย`, style: 'boldText', border: [false, false, false, false] },
                  { text: `${this.form.returnCastBodyBrokenWeight?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`, style: 'boldText', alignment: 'right', border: [false, false, false, false] },
                  { text: ``, border: [false, false, false, false] }
                ],
                [
                  { text: ``, border: [false, false, false, false] },
                  { text: `คืนผงทอง`, style: 'boldText', border: [false, false, false, false] },
                  { text: `${this.form.returnCastPowderWeight?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`, style: 'boldText', alignment: 'right', border: [false, false, false, false] },
                  { text: ``, border: [false, false, false, false] }
                ],
                [
                  { text: ``, border: [false, false, false, false] },
                  { text: `น้ำหนักขาด`, style: 'boldText', border: [false, false, false, false] },
                  { text: `${this.form.castWeightLoss?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`, style: 'boldText', alignment: 'right', border: [false, false, false, false] },
                  { text: ``, border: [false, false, false, false] }
                ],
                [
                  { text: ``, border: [false, false, false, false] },
                  { text: `น้้ำหนักเกิน`, style: 'boldText', border: [false, false, false, false] },
                  { text: `${this.form.castWeightOver?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`, style: 'boldText', alignment: 'right', border: [false, false, false, false] },
                  { text: ``, border: [false, false, false, false] }
                ]
              ],
              layout: {
                paddingTop: function (i) { return i === 1 },
                paddingBottom: function (i) { return i === 1 },
                margin: [0, 0, 0, 0]
              },
              margin: [0, 0, 0, 0]
            }
          },
          {
            style: 'tableExample',
            table: {
              widths: [120, 180, 50, 10, '*'],
              body: [
                [
                  { text: `รายการคืนตัวเรือน`, fontSize: 15, border: [false, false, false, false] },
                  { text: `รายการ`, style: 'title', border: [false, false, false, false] },
                  { text: `น้ำหนัก`, style: 'title', alignment: 'right', border: [false, false, false, false] },
                  { text: ``, style: 'title', border: [false, false, false, false] },
                  { text: `จำนวน`, style: 'title', border: [false, false, false, false] }
                ],
                ...this.buildReturnBody(),
                [
                  { text: ``, fontSize: 15, border: [false, false, false, false] },
                  { text: `รวมคืนตัวเรือน`, style: 'boldText', alignment: 'right', border: [false, false, false, false] },
                  { text: `${this.form.returnCastBodyWeight?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`, style: 'boldText', alignment: 'right', border: [false, false, false, false] },
                  { text: ``, style: 'title', border: [false, false, false, false] },
                  { text: ``, style: 'title', border: [false, false, false, false] }
                ]
              ]
            }
          },
          {
            table: {
              widths: ['*'],
              body: [[{ columns: [], border: [false, false, false, true] }]]
            },
            layout: { defaultBorder: false },
            margin: [0, 0, 0, 10]
          },
          {
            columns: [
              {
                stack: [
                  { text: 'ผู้เบิกทอง', style: 'title', margin: [0, 0, 0, 10] },
                  { text: `{.................................................................}`, style: 'desc' },
                  { text: `${this.form.assignBy}`, style: 'desc' }
                ],
                alignment: 'center'
              },
              {
                stack: [
                  { text: 'ผู้รับทอง', style: 'title', margin: [0, 0, 0, 10] },
                  { text: `{.................................................................}`, style: 'desc' },
                  { text: `${this.form.receiveBy}`, style: 'desc' }
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
          title: { fontSize: 10 },
          desc: { fontSize: 11, bold: true },
          boldText: { fontSize: 11, bold: true }
        }
      }

      pdfMake.createPdf(docDefinition).open()
    },

    buildReturnBody() {
      const body = []
      if (this.form.items) {
        this.form.items.forEach((x) => {
          body.push([
            { text: ``, border: [false, false, false, false] },
            { text: `${x.productionPlan.wo}-${x.productionPlan.woNumber}`, style: 'boldText', border: [false, false, false, false] },
            { text: `${x.returnWeight?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`, style: 'boldText', alignment: 'right', border: [false, false, false, false] },
            { text: ``, border: [false, false, false, false] },
            { text: `${x.returnQTY?.toFixed(2) ?? this.defaultDisplay.emptyValue.toFixed(2)}`, border: [false, false, false, false] }
          ])
        })
      }
      return body
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
.form-content-row-custom-tree-columns-container {
  display: grid;
  place-items: center;
  grid-template-columns: 2fr 2fr 2fr;
  gap: var(--sp-sm);
  padding: 0 var(--sp-xl);
  margin-top: var(--sp-sm);
}
.form-content-data-custom-columns-container {
  display: grid;
  grid-template-columns: 4fr 4fr 1fr 3fr;
  gap: var(--sp-sm);
  padding: 0 var(--sp-xl);
  margin-top: var(--sp-sm);
}
.line {
  border-top: 1px solid var(--color-border);
  margin: var(--sp-lg) var(--sp-xl);
}
.txt-data-title {
  font-size: var(--fs-base);
}
.txt-data-title-main-color {
  font-size: var(--fs-lg);
  font-weight: bold;
  color: var(--base-font-color);
}
.txt-data-desc {
  font-size: var(--fs-xl);
  color: var(--base-font-color);
}
.txt-title-custom-modal {
  padding: var(--sp-sm) var(--sp-sm);
  margin: 0 var(--sp-xl);
  font-size: var(--fs-xl);
  color: #ffff;
  background-color: var(--base-font-color);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}
.header-container {
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  background-color: var(--color-card-bg);
  padding: var(--sp-lg);
  margin: 0 var(--sp-xl);
}
</style>
