<template>
  <div class="from-header-container">
    <loading :isLoading="isLoading"></loading>
    <div class="data-container">
      <div>
        <div class="row form-group mb-0">
          <div class="col-md-5 image-container">
            <div class="image-box-container">
              <div v-if="urlImage">
                <img class="image-preview" :src="urlImage" alt="Image" preview />
              </div>
              <div v-else class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>
          </div>
          <div class="col-md-7 detail-container">
            <div class="row form-group">
              <div class="col-4">
                <label class="label-subject txt-title">เลขที่ W.O.</label>
                <h4>{{ form.wo }}</h4>
              </div>
              <div class="col-4">
                <label class="label-subject txt-title">ลำดับ</label>
                <h4>{{ form.woNumber }}</h4>
              </div>
              <div class="col-4">
                <label class="label-subject txt-title">แม่พิมพ์</label>
                <h4>{{ form.mold }}</h4>
              </div>
            </div>
            <div class="row form-group">
              <div class="col-4">
                <label class="label-subject txt-title">วันสร้างใบงาน</label>
                <h4>{{ formatDate(form.createDate) }}</h4>
              </div>
              <div class="col-4">
                <label class="label-subject txt-title">ใบงานเเก้ไขล่าสุด</label>
                <h4>{{ formatDate(form.updateDate) }}</h4>
              </div>
              <div class="col-4">
                <label class="label-subject txt-title">วันส่งงานลูกค้า</label>
                <h4>{{ formatDate(form.requestDate) }}</h4>
                <!-- <Calendar
                  class="w-100"
                  v-model="form.requestDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                  required
                /> -->
              </div>
            </div>
            <div class="row form-group">
              <div class="col-4">
                <label class="label-subject txt-title">รหัสลูกค้า</label>
                <h4>{{ form.customerNumber }}</h4>
              </div>
              <div class="col-4">
                <label class="label-subject txt-title">ประเภทลูกค้า</label>
                <h4>{{ customerType }}</h4>
              </div>
              <div class="col-2">
                <label class="label-subject txt-title">จำนวนสินค้า</label>
                <h4>{{ form.productQty }}</h4>
                <!-- <input
                  class="form-control"
                  type="number"
                  min="1"
                  v-model="form.productQty"
                  required
                /> -->
              </div>
              <div class="col-2">
                <label class="label-subject txt-title">หน่วย</label>
                <h4>{{ form.productQtyUnit }}</h4>
                <!-- <input class="form-control" type="text" v-model="form.productQtyUnit" required /> -->
              </div>
            </div>
            <div class="row form-group">
              <div class="col-4">
                <label class="label-subject txt-title">รหัสสินค้า</label>
                <h4>{{ form.productNumber }}</h4>
                <!-- <input class="form-control" type="text" v-model="form.productNumber" required /> -->
              </div>
              <div class="col-4">
                <label class="label-subject txt-title">ชื่อสินค้า</label>
                <h4>{{ form.productName }}</h4>
                <!-- <input class="form-control" type="text" v-model="form.productName" required /> -->
              </div>
              <div class="col-4">
                <label class="label-subject txt-title">ประเภทสินค้า</label>
                <h4>{{ productType }}</h4>
                <!-- <div class="form-control bg-disable">{{ form.customerType }}</div> -->
              </div>
            </div>
          </div>
        </div>
        <div class="row form-group">
          <div class="col-md-5">
            <label class="label-subject txt-title">รายละเอียดสินค้า</label>
            <h5>{{ form.productDetail }}</h5>
            <!-- <h5>{{ form.productDetail }}</h5> -->
            <!-- <textarea
              class="form-control"
              v-model="form.productDetail"
              style="height: 70px; color: var(--base-font-color)"
              disabled
            >
            </textarea> -->
          </div>
          <div class="col-md-5">
            <label class="label-subject txt-title">{{ $t('view.pickinglist.title.remark') }}</label>
            <!-- <h5>{{ form.remark }}</h5> -->
            <h5>{{ form.remark }}</h5>
            <!-- <textarea
              class="form-control"
              v-model="form.remark"
              style="height: 70px; color: var(--base-font-color)"
              disabled
            >
            </textarea> -->
          </div>
          <div class="col-md-2 zone-container-btn">
            <button class="btn btn-sm btn-warning" @click="onUpdateHeader">
              <span class="mr-1"><i class="bi bi-gem"></i></span>
              <span>เเก้ไขใบจ่าย-รับคืนงาน</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="data-container">
      <div class="mb-3 p-1 text-left" style="height: 31px; width: 450px" disable>
        <h5 style="color: var(--base-font-color)">ส่วนประกอบงานผลิต</h5>
      </div>
      <div class="row form-group">
        <div class="col-md-12">
          <DataTable :value="mat" class="p-datatable-sm" showGridlines>
            <Column style="width: 100px; text-align: center">
              <template #body="prop">
                <button
                  class="btn btn-sm btn-main"
                  title="ลบส่วนประกอบ"
                  type="button"
                  @click="onDeletMatItem(prop.data)"
                >
                  <i class="bi bi-trash-fill"></i>
                </button>
              </template>
            </Column>
            <Column field="goldNavigation" header="ประเภททอง">
              <template #body="prop">
                <div v-if="prop.data.goldNavigation?.code">
                  {{ `${prop.data.goldNavigation?.code}: ${prop.data.goldNavigation?.nameTh}` }}
                </div>
                <div v-else>-</div>
              </template>
            </Column>
            <Column field="goldSizeNavigation" header="เปอร์เซ็นทอง">
              <template #body="prop">
                <div v-if="prop.data.goldSizeNavigation?.code">
                  {{ `${prop.data.goldSizeNavigation?.nameTh}` }}
                </div>
                <div v-else>-</div>
              </template>
            </Column>
            <Column field="goldQty" header="จำนวนทอง">
              <template #body="prop">
                {{ `${prop.data.goldQty ?? '-'}` }}
              </template>
            </Column>
            <Column field="gemNavigation" header="ประเภทพลอย">
              <template #body="prop">
                <div v-if="prop.data.gemNavigation?.code">
                  {{ `${prop.data.gemNavigation?.code}: ${prop.data.gemNavigation?.nameTh}` }}
                </div>
                <div v-else>-</div>
              </template>
            </Column>
            <Column field="gemShapeNavigation.code" header="รูปร่าง/ขนาด พลอย">
              <template #body="prop">
                <div v-if="prop.data.gemShapeNavigation?.code">
                  {{
                    `${prop.data.gemShapeNavigation?.code}: ${prop.data.gemShapeNavigation?.nameTh} ${prop.data.gemSize}`
                  }}
                </div>
                <div v-else>-</div>
              </template>
            </Column>
            <!-- <Column field="gemSize" header="ขนาดพลอย"> </Column> -->
            <Column field="gemQty" header="จำนวนพลอย">
              <template #body="prop">
                {{ `${prop.data.gemQty ?? '-'}  ${prop.data.gemQty ? prop.data.gemUnit : ''}` }}
              </template>
            </Column>
            <Column field="gemQty" header="น้ำหนักพลอย">
              <template #body="prop">
                {{
                  `${prop.data.gemWeight ?? '-'}  ${
                    prop.data.gemWeight ? prop.data.gemWeightUnit : ''
                  }`
                }}
              </template>
            </Column>
            <Column field="gemQty" header="จำนวนเพชร">
              <template #body="prop">
                {{
                  `${prop.data.diamondQty ?? '-'}  ${
                    prop.data.diamondQty ? prop.data.diamondUnit : ''
                  }`
                }}
              </template>
            </Column>
            <Column field="gemQty" header="น้ำหนักเพชร">
              <template #body="prop">
                {{
                  `${prop.data.diamondWeight ?? '-'}  ${
                    prop.data.diamondWeight ? prop.data.diamondWeightUnit : ''
                  }`
                }}
              </template>
            </Column>
            <Column field="diamondSize" header="ขนาดเพชร">
              <template #body="prop">
                {{ `${prop.data.diamondSize ?? '-'}` }}
              </template>
            </Column>
            <Column field="diamondQuality" header="คุณภาพเพชร">
              <template #body="prop">
                {{ `${prop.data.diamondQuality ?? '-'}` }}
              </template>
            </Column>
            <template #footer>
              <div class="col-md-12">
                <button
                  class="btn btn-sm btn-warning ml-2"
                  type="button"
                  @click="onShowModalAddMaterial"
                  style="width: 200px"
                >
                  <span class="mr-1"><i class="bi bi-gem"></i></span>
                  <span>เพิ่มส่วนประกอบ</span>
                </button>
              </div>
            </template>
          </DataTable>
        </div>
        <div v-if="!mat.length" class="col-md-12 flex-no-mat-add">
          <label>ไม่มีส่วนประกอบ</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { formatDate, formatDateTime } from '@/utils/moment'
import moment from 'dayjs'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
//import Calendar from 'primevue/calendar'
//const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))
//import Image from 'primevue/image'
import api from '@/axios/axios-config.js'
import swAlert from '@/js/alert/sweetAlerts.js'

//import api from '@/axios/axios-config.js'
export default {
  components: {
    loading,
    //Calendar,
    DataTable,
    Column
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    modelMatValue: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    // model() {
    //   return this.modelValue
    // }
    // requestDate() {
    //   return this.modelValue.requestDate
    // }
  },
  watch: {
    async modelValue(value) {
      //this.take = 10
      //this.skip = 0
      this.form = { ...value }
      //console.log(this.form)
      await this.fetchImageData()
      this.getValue()
    },
    async modelMatValue(value) {
      //console.log(value)
      this.mat = [...value]
    }
  },
  data() {
    return {
      isLoading: false,
      data: {},
      mat: [],
      type: 'ORDERPLAN',
      urlImage: '',
      lockEdit: false,
      form: {},

      customerType: '',
      productType: ''
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
    // ----- api ------ //
    async fetchImageData() {
      try {
        //console.log
        switch (this.type) {
          case 'ORDERPLAN': {
            //console.log(this.form)
            const param = {
              imageName: `${this.form.mold}-Mold.png`
            }
            const res = await api.jewelry.get('FileExtension/GetMoldImage', param)

            if (res) {
              this.urlImage = `data:image/png;base64,${res}`

              if (this.form) {
                this.form.requestDate = this.showDate(this.form.requestDate)
              }
            }
          }
        }
      } catch (error) {
        console.log(error)
      }
    },
    getValue() {
      this.customerType = this.form.customerTypeNavigation.nameTh
      this.productType = this.form.productTypeNavigation.nameTh
    },
    onUpdateHeader() {
      // swAlert.confirmSubmit(
      //   `W.O. ${this.form.wo}-${this.form.woNumber} `,
      //   'ยืนยันเเก้ไขใบจ่าย-รับคืน',
      //   async () => {
      //     //console.log('call submitPlan')
      //     //await this.editPlan()
      //   },
      //   null,
      //   null
      // )
      this.$emit('showModalUpdateHeader')
    },
    async editPlan() {
      try {
        this.isLoading = true

        //console.log(this.form.requestDate)
        //console.log(new Date(this.form.requestDate))

        const params = {
          id: this.form.id,
          wo: this.form.wo,
          woNumber: this.form.woNumber,
          requestDate: this.form.requestDate,

          productQty: this.form.productQty,
          productQtyUnit: this.form.productQtyUnit,

          productNumber: this.form.productNumber,
          productName: this.form.productName,
          productDetail: this.form.productDetail,
          remark: this.form.remark
        }

        console.log(params)
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanUpdateHeader', params)
        if (res) {
          this.$emit('headerFetchData')
        }

        this.isLoading = false
      } catch (error) {
        this.isLoading = false
      }
    },
    onDeletMatItem(item) {
      swAlert.confirmSubmit(
        `${item.goldNavigation.code}-${item.goldNavigation.nameTh}, จำนวน ${item.goldQty}`,
        'ยืนยันลบส่วนประกอบ',
        async () => {
          await this.DeletMatItem(item)
        },
        null,
        null
      )
    },
    async DeletMatItem(item) {
      try {
        this.isLoading = true

        const params = {
          planId: this.form.id,
          wo: this.form.wo,
          woNumber: this.form.woNumber,
          materialId: item.id
        }
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanDeleteMaterial', params)
        if (res) {
          this.$emit('matFetchData')
        }

        this.isLoading = false
      } catch (error) {
        this.isLoading = false
      }
    },

    // ---------- add mat ------------- //
    onShowModalAddMaterial() {
      this.$emit('showModalAddMat')
    }
  },
  created() {
    // if (this.form.customerTypeNavigation) {
    //   console.log('get')
    // }
  },
  mounted() {
    // if (this.form.customerTypeNavigation) {
    //   console.log('get')
    // }
  }
}
</script>

<style lang="scss" scoped>
// input {
//   margin-top: 5px !important;
//   //   .form-control {
//   //     margin-top: 0px !important;
//   //   }
// }
h4,
h5 {
  color: var(--base-font-color);
}
.data-container {
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  //background-color: var(--base-color);
  padding: 20px 40px;
  margin-bottom: 20px;
}
.image-preview {
  max-width: 300px;
  height: auto;
  border: 1px solid var(--base-color);
  border-radius: 8px;
  object-fit: contain;
}
.image-container {
  display: grid;
  place-items: center;
  //height: 300px;
}
.image-box-container {
  border: 1px solid var(--base-color);
  border-radius: 8px;
}
.detail-container {
  //padding: 10px 0px;
}
.txt-title {
  //font-size: 15px;
  //color: var(--base-font-color);
}
.txt-data {
}
.bg-disable {
  background-color: #e9ecef;
  height: 35px;
  margin-top: 5px;
}
.zone-container-btn {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.flex-no-mat-add {
  text-align: center;
  margin-top: 5px;
  color: var(--base-sub-color);
}
</style>
