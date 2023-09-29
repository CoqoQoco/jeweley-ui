<template>
  <div class="view-container">
    <loading :isLoading="isLoading"></loading>
    <form @submit.prevent="onSubmitPlan">
      <div class="zone-container">
        <!-- Title -->
        <div class="row form-group">
          <div class="col-md-12">
            <div class="flex-header">
              <label style="font-weight: 700">
                <span class="mr-2"><i class="bi bi-card-list"></i></span>
                <span>ส่วนที่ 1 ระบุรายละเอียดใบจ่าย-รับคืน</span>
              </label>
            </div>
          </div>
        </div>
        <!-- PRODUCT -->
        <div class="row form-group">
          <div class="col-md-6">
            <div class="row form-group">
              <div class="col-md-6">
                <div class="row form-group">
                  <div class="col-md-8">
                    <label>{{ $t('view.pickinglist.title.wo') }}</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.wo"
                      required
                      :disabled="isLock"
                    />
                  </div>
                  <div class="col-md-4">
                    <label>ลำดับ</label>
                    <input
                      type="number"
                      min="1"
                      class="form-control"
                      v-model="form.nowo"
                      :disabled="isLock"
                      required
                    />
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <label>{{ $t('view.pickinglist.title.mold') }}</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.mold"
                  :disabled="isLock"
                  required
                />
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-4">
                <label>{{ $t('view.pickinglist.title.customerNumber') }}</label>
                <input
                  type="text"
                  class="form-control box-input"
                  v-model="form.customerNumber"
                  :disabled="isLock"
                  required
                />
              </div>
              <div class="col-md-4">
                <label>ชื่อลูกค้า</label>
                <Dropdown
                  v-model="form.customerType"
                  :options="masterCustomer"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  :showClear="form.customerType ? true : false"
                />
              </div>
              <div class="col-md-4">
                <label>วันส่งงานลูกค้า</label>
                <Calendar
                  class="w-100"
                  v-model="form.requestDate"
                  showIcon
                  :disabled="isLock"
                  required
                />
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-4">
                <label>{{ $t('view.pickinglist.title.productNumber') }}</label>
                <input
                  type="text"
                  class="form-control box-input"
                  v-model="form.productNumber"
                  :disabled="isLock"
                  required
                />
              </div>
              <div class="col-md-4">
                <label>ชื่อสินค้า</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.productName"
                  :disabled="isLock"
                  required
                />
              </div>
              <div class="col-md-4">
                <label>ประเภทสินค้า</label>
                <Dropdown
                  v-model="form.productType"
                  :options="masterProduct"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  required
                  :showClear="form.productType ? true : false"
                />
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>รายละเอียดสินค้า</label>
                <textarea
                  class="form-control"
                  v-model="form.productDetail"
                  :disabled="isLock"
                  style="height: 94px"
                >
                </textarea>
              </div>
            </div>
            <div class="row form-group">
              <div class="col-md-12">
                <label>{{ $t('view.pickinglist.title.remark') }}</label>
                <textarea
                  class="form-control"
                  v-model="form.remark"
                  :disabled="isLock"
                  style="height: 92px"
                >
                </textarea>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <label>รูปสินค้า</label>
            <uploadImage
              :reset="isResetImage"
              :hight="imageConatinerHight"
              @onImportFile="onImportFile"
            ></uploadImage>
          </div>
        </div>
        <!-- <div class="row form-group">
          <div class="col-md-12">
            <label>{{ $t('view.pickinglist.title.remark') }}</label>
            <textarea class="form-control" v-model="form.remark" :disabled="isLock"> </textarea>
          </div>
        </div> -->
      </div>

      <!-- ส่วนประกอบการผลิต -->
      <div class="zone-container">
        <div class="row form-group">
          <div class="col-md-12">
            <div class="flex-add-mat">
              <div class="flex-header">
                <label style="font-weight: 700">
                  <span class="mr-2"><i class="bi bi-card-list"></i></span>
                  <span>ส่วนที่ 2 ระบุส่วนประกอบในการผลิต</span>
                </label>
              </div>
              <div>
                <button
                  class="btn btn-sm btn-add-components"
                  :class="`${!isLock ? `btn-warning` : `btn-secondary`}`"
                  @click="showAddMat"
                  type="button"
                  :disabled="isLock"
                >
                  <span class="mr-1"><i class="bi bi-plus"></i></span>
                  <!-- <span class="mr-1"><i class="bi bi-gem"></i></span> -->
                  <span>เพิ่มส่วนประกอบ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="row form-group">
          <div class="col-md-12">
            <DataTable :value="form.material" class="p-datatable-sm">
              <Column style="width: 100px; text-align: center">
                <template #body="prop">
                  <button
                    class="btn btn-sm btn-main"
                    title="ลบส่วนประกอบ"
                    type="button"
                    @click="deletMatItem(prop.data)"
                  >
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </template>
              </Column>
              <Column field="gold.code" header="ประเภททอง">
                <template #body="prop">
                  <div v-if="prop.data.gold?.code">
                    {{ `${prop.data.gold?.code}: ${prop.data.gold?.nameTh}` }}
                  </div>
                  <div v-else>-</div>
                </template>
              </Column>
              <Column field="goldSize.code" header="เปอร์เซ็นทอง">
                <template #body="prop">
                  <div v-if="prop.data.goldSize?.code">
                    {{ `${prop.data.goldSize?.nameTh}` }}
                  </div>
                  <div v-else>-</div>
                </template>
              </Column>
              <Column field="gem.code" header="ประเภทพลอย">
                <template #body="prop">
                  <div v-if="prop.data.gem?.code">
                    {{ `${prop.data.gem?.code}: ${prop.data.gem?.nameTh}` }}
                  </div>
                  <div v-else>-</div>
                </template>
              </Column>
              <Column field="gemShape.code" header="รูปร่าง/ขนาด พลอย">
                <template #body="prop">
                  <div v-if="prop.data.gemShape?.code">
                    {{ `${prop.data.gemShape?.code}: ${prop.data.gemShape?.nameTh}` }}
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
              <Column field="diamondQuality" header="คุณภาพเพชร">
                <template #body="prop">
                  {{ `${prop.data.diamondQuality ?? '-'}` }}
                </template>
              </Column>
            </DataTable>
          </div>
          <div v-if="!form.material.length" class="col-md-12 flex-no-mat-add">
            <label>ไม่มีส่วนประกอบ</label>
          </div>
        </div>
      </div>
      <!-- ยืนยัน, เเก้ไข -->
      <div class="zone-container-btn">
        <div class="row form-group">
          <div class="col-md-12 flex-btn">
            <!-- <button class="btn btn-sm btn-info mr-2" type="button" @click="onTest">
              <span class="mr-1"><i class="bi bi-gem"></i></span> <span>ทดสอบ</span>
            </button> -->
            <button class="btn btn-sm btn-main" type="submit">
              <span class="mr-1"><i class="bi bi-gem"></i></span> <span>สร้างใบจ่าย-รับคืนงาน</span>
            </button>
          </div>
        </div>
      </div>
    </form>
    <ModalAddMat
      :isShowModal="isShowModal"
      :masterGold="masterGold"
      :masterGoldSize="masterGoldSize"
      :masterGem="masterGem"
      :masterGemShape="masterGemShape"
      @closeModal="closeModal"
      @onAdd="AddMat"
    ></ModalAddMat>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import { formatISOString } from '@/utils/moment'
import api from '@/axios/axios-config.js'
import swAlert from '@/js/alert/sweetAlerts.js'
import Dropdown from 'primevue/dropdown'

//import loading from '@/components/overlay/loading-overlay.vue'
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue')) // Customize Report Config

//import UploadImage from '@/components/prime-vue/UploadImage.vue'
const UploadImage = defineAsyncComponent(() => import('@/components/prime-vue/UploadImage.vue'))

import ModalAddMat from '../components/ModalAddMaterial.vue'
export default {
  components: {
    loading,
    Calendar,
    ModalAddMat,
    DataTable,
    Column,
    UploadImage,
    Dropdown
  },
  data() {
    return {
      isLoading: false,
      isLock: false,
      isShowModal: false,
      isResetImage: false,
      imageConatinerHight: '435px',
      form: {
        wo: '',
        nowo: null,
        mold: '',

        customerNumber: '',
        customerType: '',
        requestDate: new Date().toISOString().substr(0, 10),

        productNumber: '',
        productName: '',
        productType: '',

        productDetail: '',
        remark: '',

        material: []
      },
      fileImage: [],

      masterProduct: [],
      masterCustomer: [],
      masterGold: [],
      masterGoldSize: [],
      masterGem: [],
      masterGemShape: []
    }
  },
  methods: {
    // ------ private ------ //
    previewImages() {
      //console.log(e.target.files[0])
      //console.log(this.$refs.file)
      const temFiles = this.$refs.file
      const files = temFiles.files
      //console.log(files)

      this.fileImage.push(files)
      //this.fileImage = Array.from(temFiles.files)
      //console.log(this.fileImage)

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            this.form.imageUrls.push(event.target.result)
          }
          reader.readAsDataURL(file)
        }
      }
    },
    onTest() {
      for (const item of this.fileImage) {
        console.log(item)

        const fileList = item
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i]
          console.log(file)
          console.log(file.name)
        }
      }
    },
    deleteImage(index) {
      this.form.imageUrls.splice(index, 1)
      this.fileImage.splice(index, 1)
      //console.log(this.form.imageUrls)
    },
    deletMatItem(item) {
      const index = this.form.material.indexOf(item)
      //console.log(index)
      this.form.material.splice(index, 1)
    },
    showAddMat() {
      //console.log('add mat')
      this.isShowModal = true
    },
    AddMat(item) {
      //console.log(item);
      this.form.material.push(item)

      // this.form.components = this.form.components.length
      //   ? [this.form.components, ...item]
      //   : this.form.components.push(item)
    },
    closeModal() {
      this.isShowModal = false
    },
    onResetPage() {
      this.form = {
        wo: null,
        nowo: null,
        requestDate: new Date().toISOString().substr(0, 10),
        mold: null,
        productNumber: null,
        customerNumber: null,
        remark: null,
        qtyUnit: 'PC',
        qry: 1,
        qtyFinish: 0,
        qtySemiFinish: 0,
        qtyCast: 0,
        material: [],
        imageUrls: [],
        images: []
      }
    },

    //components
    onImportFile(e) {
      //console.log(e)
      this.form.image = e
    },

    // ------ Api ------ //
    onSubmitPlan() {
      swAlert.confirmSubmit(
        `W.O. ${this.form.wo}-${this.form.nowo} `,
        'ยืนยันสร้างใบจ่าย-รับคืน',
        async () => {
          //console.log('call submitPlan')
          await this.submitPlan()
        },
        null,
        null
      )
    },
    async submitPlan() {
      try {
        //console.log('submitPlan')
        this.isLoading = true
        console.log(this.form)

        let params = new FormData()
        params.append('wo', this.form.wo)
        params.append('woNumber', this.form.nowo)
        params.append('mold', this.form.mold)

        params.append('customerNumber', this.form.customerNumber)
        params.append('customerType', this.form.customerType.code)
        params.append('requestDate', formatISOString(this.form.requestDate))

        params.append('productNumber', this.form.productNumber)
        params.append('productName', this.form.productName)
        params.append('productType', this.form.productType.code)

        params.append('productDetail', this.form.productDetail)
        params.append('remark', this.form.remark)

        params.append('images', this.form.image)

        //https://tutorial.eyehunts.com/js/javascript-formdata-append-array/
        params.append('material', JSON.stringify(this.form.material))

        //Chat GPT
        // this.form.material.forEach((value, index) => {
        //   // เพิ่มข้อมูลในรูปแบบ key-value โดยกำหนด key เป็น "myArray[]" เพื่อระบุว่าเป็นอาร์เรย์
        //   params.append(`material[${index}]`, value)
        // })

        //console.log(this.form.image)

        let options = {
          headers: {
            'Content-Type': `multipart/form-data`
          }
        }

        //console.log(params)
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanCreate', params, options)

        if (res) {
          this.isResetImage = !this.isResetImage
          swAlert.success(
            `W.O. ${this.form.wo}-${this.form.nowo} `,
            'สร้างใบจ่าย-รับคืน สำเร็จ',
            () => {
              this.onResetPage()
              this.$router.push('/plan-order-tracking')
            },
            null,
            null
          )
          // if (this.form.imageUrls.length) {
          //   //console.log('upload image')
          //   await this.uploadImage()
          // } else {
          //   swAlert.success(
          //     `W.O. ${this.form.wo}-${this.form.nowo} `,
          //     'สร้างใบจ่าย-รับคืน สำเร็จ',
          //     () => {
          //       this.onResetPage()
          //     },
          //     null,
          //     null
          //   )
          // }
        }

        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    validateSubmitPlan() {
      let res = 'success'
      if (!this.form.material.length) {
        res = 'กรุณาระบุส่วนประกอบ ใบจ่าย-รับคืน'
      }
      return res
    },
    async uploadImage() {
      try {
        let params = new FormData()
        params.append('wo', this.form.wo)
        params.append('woNumber', this.form.nowo)

        //test
        //console.log(this.fileImage[0])
        //params.append('images', this.fileImage[0].file)

        for (const item of this.fileImage) {
          //console.log(item)

          const fileList = item
          for (let i = 0; i < fileList.length; i++) {
            params.append('images', fileList[i])
            //params.append(`images-${i + 1}`, fileList[i])
            const file = fileList[i]
            //console.log(file)
            console.log(file.name)
          }
        }

        let options = {
          headers: {
            'Content-Type': `multipart/form-data`
          }
        }

        const res = await api.jewelry.post(
          'ProductionPlan/ProductionPlanCreateImage',
          params,
          options
        )

        if (res) {
          console.log(res)
          swAlert.success(
            null,
            '',
            () => {
              this.onResetPage()
            },
            null,
            null
          )
        }
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },

    // ----- master -------//
    async fetchMasterProductType() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterProductType')
        if (res) {
          this.masterProduct = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterCustomerType() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterCustomerType')
        if (res) {
          this.masterCustomer = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGold() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGold')
        if (res) {
          this.masterGold = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGoldSize() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGoldSize')
        if (res) {
          this.masterGoldSize = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGem() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGem')
        if (res) {
          this.masterGem = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGemShape() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGemShape')
        if (res) {
          this.masterGemShape = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  },
  mounted() {
    this.fetchMasterProductType()
    this.fetchMasterCustomerType()
    this.fetchMasterGold()
    this.fetchMasterGoldSize()
    this.fetchMasterGem()
    this.fetchMasterGemShape()
  },
  async created() {
    //await this.fetchMasterProductType()
    //await this.fetchMasterCustomerType()
    //await this.fetchMasterGold()
    //await this.fetchMasterGoldSize()
    //await this.fetchMasterGem()
    //await this.fetchMasterGemShape()
    //test
    // this.form = {
    //   wo: '6606003',
    //   nowo: 1,
    //   mold: 'R/9640',
    //   customerNumber: 'THI001',
    //   customerType: '',
    //   requestDate: new Date().toISOString().substr(0, 10),
    //   productNumber: 'R09640DI3',
    //   productName: 'Ring Diamond 9K',
    //   productType: '',
    //   productDetail: 'งานขาย',
    //   remark: 'งานขาย งานขาย งานขาย งานขาย',
    //   material: []
    // }
  }
}
</script>

<style lang="scss" scoped>
label {
  color: var(--base-font-color);
  font-weight: 400;
  margin: 5px 0px 0px 0px;
}
textarea {
  min-height: 35px !important;
}
.form-group {
  margin-bottom: 5px;
}
.zone-container {
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  //background-color: var(--base-color);
  padding: 20px 40px;
  margin-bottom: 20px;
}
.zone-container-btn {
  //border: 1px solid #dddddd;
  //border-radius: 5px;
  //box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  //background-color: #f7f7f7;
  //background-color: var(--base-color);
  //padding: 5px 40px;

  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.flex-header {
  font-size: 15px;
  display: grid;
}
.select-preview-container {
  display: flex;
  flex-direction: row;
  margin-top: 5px;
}
.preveiw-container {
  display: flex;
  //justify-content: center;
  width: auto;
  overflow-x: auto; /* เพิ่มการเลื่อนในแนวนอน */
  white-space: nowrap; /* ป้องกันข้อความขึ้นบรรทัดใหม่ */
  //width: 100%;
}
.select-continer {
  display: flex;
  justify-content: center;
  align-items: center;
  //background-color: var(--base-color);
  height: 130px;
  width: 130px;
  border: 1px solid var(--base-color);
  color: var(--base-color);
  //margin: 0px 0px 0px 0px;
  .hidden-input {
    opacity: 0;
    overflow: hidden;
    position: absolute;
    width: 130px;
    height: 130px;
  }
}
.select-continer:hover {
  border: 1px solid var(--base-font-color);
  color: var(--base-font-color);
  //margin: 0px 0px 0px 10px;
}
.image-container {
  display: inline-block;
  position: relative;
}
.preview-image {
  height: 130px;
  width: 130px;
  margin-right: 5px;
  border: 0.1px solid var(--base-color);
}
.delete-icon {
  position: absolute;
  top: 0;
  right: 0;
  margin-right: 10px;
  cursor: pointer;
  padding: 5px;
  color: var(--base-color);
  &:hover {
    color: var(--base-font-color);
  }
}
.flex-add-mat {
  display: flex;
  justify-content: space-between;
}
.flex-no-mat-add {
  text-align: center;
  margin-top: 5px;
  color: var(--base-sub-color);
}
.product-container {
  //margin-bottom: 10px;
  display: grid;
}
</style>
