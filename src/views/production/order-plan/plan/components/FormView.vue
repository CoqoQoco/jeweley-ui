<template>
  <div class="view-container">
    <loading :isLoading="isLoading"></loading>
    <form @submit.prevent="onSubmitPlan">
      <div class="zone-container">
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
        <div class="row form-group">
          <div class="col-md-4">
            <label>{{ $t('view.pickinglist.title.wo') }}</label>
            <input type="text" class="form-control" v-model="form.wo" required :disabled="isLock" />
          </div>
          <div class="col-md-4">
            <label>{{ $t('view.pickinglist.title.nowo') }}</label>
            <input
              type="number"
              min="1"
              class="form-control"
              v-model="form.nowo"
              :disabled="isLock"
              required
            />
          </div>
          <div class="col-md-4">
            <label>{{ $t('view.pickinglist.title.requestDate') }}</label>
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
            <label>{{ $t('view.pickinglist.title.mold') }}</label>
            <input
              type="text"
              class="form-control"
              v-model="form.mold"
              :disabled="isLock"
              required
            />
          </div>
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
            <label>{{ $t('view.pickinglist.title.customerNumber') }}</label>
            <input
              type="text"
              class="form-control box-input"
              v-model="form.customerNumber"
              :disabled="isLock"
              required
            />
          </div>
        </div>
        <div class="row form-group">
          <div class="col-md-12">
            <label>{{ $t('view.pickinglist.title.remark') }}</label>
            <textarea class="form-control" v-model="form.remark" :disabled="isLock"> </textarea>
          </div>
        </div>
      </div>
      <div class="zone-container">
        <div class="row form-group">
          <div class="col-md-12">
            <div class="flex-header">
              <label style="font-weight: 700">
                <span class="mr-2"><i class="bi bi-image"></i></span>
                <span>ส่วนที่ 2 รูปส่วนประกอบต่างๆ ใบจ่าย-รับคืน</span>
              </label>
            </div>
          </div>
        </div>
        <div class="row form-group">
          <div class="col-md-12">
            <div class="select-preview-container">
              <div class="preveiw-container" v-if="form.imageUrls.length">
                <div
                  class="image-container"
                  v-for="(imageUrl, index) in form.imageUrls"
                  :key="index"
                >
                  <img :src="imageUrl" alt="Preview" class="preview-image" />
                  <span @click="deleteImage(index)" class="delete-icon">&#10006;</span>
                </div>
              </div>
              <div v-if="!isLock" class="select-continer">
                <input
                  type="file"
                  multiple
                  name="file"
                  class="hidden-input"
                  @change="previewImages"
                  ref="file"
                  accept=".jpg, .png"
                />
                <i class="bi bi-plus-circle" style="font-size: 30px"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="zone-container">
        <div class="row form-group">
          <div class="col-md-12">
            <div class="flex-header">
              <label style="font-weight: 700">
                <span class="mr-2"><i class="bi bi-card-list"></i></span>
                <span>ส่วนที่ 3 ระบุจำนวนการผลิตใบจ่าย-รับคืน</span>
              </label>
            </div>
          </div>
        </div>
        <div class="row form-group">
          <div class="col-md-2">
            <label>{{ $t('view.pickinglist.title.quantity') }}</label>
            <input
              type="number"
              min="1"
              class="form-control"
              v-model="form.qry"
              :disabled="isLock"
              required
            />
          </div>
          <div class="col-md-2">
            <label>{{ $t('view.pickinglist.title.readyMade') }}</label>
            <input
              type="number"
              min="0"
              class="form-control"
              v-model="form.qtyFinish"
              :disabled="isLock"
              required
            />
          </div>
          <div class="col-md-2">
            <label>{{ $t('view.pickinglist.title.semireadyMade') }}</label>
            <input
              type="number"
              min="0"
              class="form-control"
              v-model="form.qtySemiFinish"
              :disabled="isLock"
              required
            />
          </div>
          <div class="col-md-2">
            <label>{{ $t('view.pickinglist.title.cast') }}</label>
            <input
              type="number"
              min="0"
              class="form-control"
              v-model="form.qtyCast"
              :disabled="isLock"
              required
            />
          </div>
          <div class="col-md-4">
            <label>{{ $t('view.pickinglist.title.pc') }}</label>
            <input
              type="text"
              class="form-control"
              v-model="form.qtyUnit"
              :disabled="isLock"
              required
            />
          </div>
        </div>
      </div>
      <div class="zone-container">
        <div class="row form-group">
          <div class="col-md-12">
            <div class="flex-add-mat">
              <div class="flex-header">
                <label style="font-weight: 700">
                  <span class="mr-2"><i class="bi bi-card-list"></i></span>
                  <span>ส่วนที่ 4 ระบุส่วนประกอบในการผลิต</span>
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
                <template #body>
                  <button
                    class="btn btn-sm btn-main"
                    title="ลบส่วนประกอบ"
                    @click="deletMatItem(index)"
                  >
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </template>
              </Column>
              <Column field="material" header="รายการ"></Column>
              <Column field="materialType" header="ประเภท"></Column>
              <Column field="materialSize" header="ขนาด/น้ำหนัก"></Column>
              <Column field="materialQty" header="จำนวน"></Column>
              <Column field="materialRemark" header="หมายเหตุ"></Column>
            </DataTable>
          </div>
          <div v-if="!form.material.length" class="col-md-12 flex-no-mat-add">
            <label>ไม่มีส่วนประกอบ</label>
          </div>
        </div>
      </div>
      <div class="zone-container-btn">
        <div class="row form-group">
          <div class="col-md-12 flex-btn">
            <button class="btn btn-sm btn-main" type="submit">
              <span class="mr-1"><i class="bi bi-gem"></i></span> <span>สร้างใบจ่าย-รับคืนงาน</span>
            </button>
          </div>
        </div>
      </div>
    </form>
    <ModalAddMat :isShowModal="isShowModal" @closeModal="closeModal" @onAdd="AddMat"></ModalAddMat>
  </div>
</template>

<script>
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import { formatISOString } from '@/utils/moment'
import api from '@/axios/axios-config.js'
import loading from '@/components/overlay/loading-overlay.vue'
import swAlert from '@/js/alert/sweetAlerts.js'

import ModalAddMat from '../components/ModalAddMaterial.vue'
export default {
  components: {
    loading,
    Calendar,
    ModalAddMat,
    DataTable,
    Column
  },
  data() {
    return {
      isLoading: false,
      isLock: false,
      isShowModal: false,
      form: {
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
        imageUrls: []
      }
    }
  },
  methods: {
    // ------ private ------ //
    previewImages() {
      console.log(this.$refs.file)
      const temFiles = this.$refs.file
      const files = temFiles.files

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
    deleteImage(index) {
      this.form.imageUrls.splice(index, 1)
      console.log(this.form.imageUrls)
    },
    deletMatItem(index) {
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
        imageUrls: []
      }
    },

    // ------ Api ------ //
    onSubmitPlan() {
      swAlert.confirmSubmit(
        `W.O. ${this.form.wo}-${this.form.nowo} `,
        'ยืนยันสร้างใบจ่าย-รับคืน',
        async () => {
          await this.submitPlan()
        },
        null,
        null
      )
    },
    async submitPlan() {
      try {
        //console.log('submit')
        this.isLoading = true
        const param = {
          wo: this.form.wo,
          woNumber: this.form.woNumber,
          requestDate: formatISOString(this.form.requestDate),

          mold: this.form.mold,
          productNumber: this.form.productNumber,
          customerNumber: this.form.customerNumber,

          remark: this.form.remark,

          qty: this.form.qty,
          qtyFinish: this.form.qtyFinish,
          qtySemiFinish: this.form.qtySemiFinish,
          qtyCast: this.form.qtyCast,
          qtyUnit: this.form.qtyUnit,

          material: [...this.form.material]
        }

        //console.log(param)
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanCreate', param)
        if (res) {
          swAlert.success(
            `W.O. ${this.form.wo}-${this.form.nowo} `,
            'สร้างใบจ่าย-รับคืน สำเร็จ',
            () => {
              this.onResetPage()
            },
            null,
            null
          )
        }

        this.isLoading = false
      } catch (error) {
        this.isLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
label {
  color: var(--base-font-color);
  font-weight: 400;
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
</style>
