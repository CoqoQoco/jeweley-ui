<template>
  <div class="app-container">
    <div class="box-center">
      <stepperStatus :events="events" :eventsIdActive="1"></stepperStatus>
    </div>
    <div id="step1" class="filter-container mt-2">
      <div>
        <span class="title-text-lg mb-2">สร้างเเบบเเม่พิมพ์ (ใหม่)</span>
      </div>
      <form @submit.prevent="onSubmit">
        <!-- mold code -->
        <div class="form-col-container">
          <div>
            <div>
              <span class="title-text">รหัสตั้งเเม่พิมพ์</span>
              <span class="txt-required"> *</span>
            </div>
            <input
              type="text"
              class="form-control"
              :class="form.moldCode ? `` : `bg-warning`"
              v-model="form.moldCode"
              required
            />
          </div>
          <div>
            <div>
              <span class="title-text">ประเภท</span>
              <span class="txt-required"> *</span>
            </div>
            <Dropdown
              v-model="form.category"
              :options="masterProduct"
              optionLabel="description"
              class="w-full md:w-14rem"
              :showClear="form.category ? true : false"
              :class="val.isValCategory === true ? `p-invalid` : ``"
              @change="onResetValDate('isValCategory')"
            />
            <!-- <input type="text" class="form-control" v-model="form.category" required /> -->
          </div>
          <div></div>
        </div>

        <!-- resin -->
        <div class="form-col-container mt-2">
          <div>
            <span>
              <span class="title-text">ขึ้น CAD โดย</span>
              <span class="txt-required"> *</span>
            </span>
            <input type="text" required class="form-control" v-model="form.designBy" />
          </div>
          <div>
            <span>
              <span class="title-text">ปริ้นเรซิ่นโดย</span>
              <span class="txt-required"> *</span>
            </span>
            <input type="text" required class="form-control" v-model="form.ResinBy" />
          </div>
          <div></div>
        </div>

        <!-- remark -->
        <div class="form-col-container">
          <div>
            <span class="title-text">รายละเอียด</span>
            <textarea class="form-control" v-model="form.remark" style="height: 50px" />
          </div>
        </div>

        <!-- image -->
        <div class="mt-2">
          <uploadImages
            title="รูปต้นเเบบเเม่พิมพ์ (ไม่เกิน 2 รูป)"
            @onUpdateFile="updateFile"
          ></uploadImages>
        </div>

        <!-- gems -->
        <div class="mt-4">
          <div class="title-text-lg-header">
            <span>ส่วนประกอบเพชร/พลอย</span>
          </div>
          <div>
            <DataTable
              class="p-datatable-sm"
              showGridlines
              v-model:editingRows="editingRows"
              :value="form.gems"
              editMode="row"
              dataKey="id"
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
              <Column :rowEditor="true" style="width: 100px" bodyStyle="text-align:center">
              </Column>
              <Column style="width: 60px">
                <template #body="prop">
                  <div class="btn btn-danger text-center w-100" @click="onDelGems(prop.data)">
                    <i class="bi bi-trash-fill"></i>
                  </div>
                </template>
              </Column>

              <Column field="gem" header="ประเภทเพชร/พลอย" style="min-width: 150px">
                <template #body="slotProps">
                  <span>{{ slotProps.data.gem?.description }}</span>
                </template>
                <template #editor="{ data, field }">
                  <Dropdown
                    v-model="data[field]"
                    :options="masterGem"
                    optionLabel="description"
                    class="w-full md:w-14rem"
                    placeholder="เลือกพลอย"
                    :showClear="data[field] ? true : false"
                  >
                  </Dropdown>
                </template>
              </Column>
              <Column field="gemShape" header="รูปร่างพลอย" style="min-width: 150px">
                <template #body="slotProps">
                  <span>{{ slotProps.data.gemShape?.description }}</span>
                </template>
                <template #editor="{ data, field }">
                  <Dropdown
                    v-model="data[field]"
                    :options="masterGemShape"
                    optionLabel="description"
                    class="w-full md:w-14rem"
                    placeholder="เลือกรูปร่าง"
                    :showClear="data[field] ? true : false"
                  >
                  </Dropdown>
                </template>
              </Column>
              <Column field="size" header="ขนาด" style="width: 200px">
                <template #editor="{ data, field }">
                  <input
                    type="text"
                    min="1"
                    :class="data[field] ? `` : `bg-warning`"
                    class="form-control"
                    v-model="data[field]"
                  />
                </template>
              </Column>
              <Column field="qty" header="จำนวน" style="width: 200px">
                <template #editor="{ data, field }">
                  <input
                    type="number"
                    min="1"
                    :class="data[field] ? `` : `bg-warning`"
                    class="form-control"
                    v-model="data[field]"
                  />
                </template>
              </Column>
              <template #footer>
                <div class="d-flex justify-content-between">
                  <div>ทั้งหมด {{ this.form.gems.length }} รายการ</div>
                  <div class="btn btn-sm btn-warning" @click="onAddGems">
                    <span class="text-center">
                      <i class="bi bi-plus"></i>
                    </span>
                  </div>
                </div>
              </template>
            </DataTable>
          </div>
        </div>

        <!-- btn -->
        <div class="d-flex justify-content-end mt-3">
          <!-- <button class="btn btn-sm btn-main mr-2" type="button" @click="onTest">TEST</button> -->
          <button class="btn btn-sm btn-main" type="submit">
            <span class="mr-2">
              <i class="bi bi-gem"></i>
            </span>
            <span>ออกเเบบเเละขึ้น 3D</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { eventStatus, mateiralType } from './interface/data.js'

const stepperStatus = defineAsyncComponent(() => import('@/components/prime-vue/StepperStatus.vue'))
const uploadImages = defineAsyncComponent(() => import('@/components/prime-vue/UploadImages.vue'))

import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'

const interfaceForm = {
  images: [],
  moldCode: null,

  qtyBeforeCasting: null,
  qtyBeforeSend: null,
  remark: null,
  category: null,

  designBy: null,
  ResinBy: null,
  gems: []
}
const interfaceGem = {
  gem: null,
  gemShape: null,
  size: null,
  qty: null
}
const interfaceVal = {
  isValCategory: false
}
export default {
  components: {
    stepperStatus,
    uploadImages,
    Dropdown,
    DataTable,
    Column
  },
  watch: {
    'form.category'() {
      if (this.form.category) {
        this.val.isValCategory = false
      }
    }
  },
  data() {
    return {
      isLoading: false,
      events: [...eventStatus],
      mateiralType: [...mateiralType],
      form: { ...interfaceForm },
      val: { ...interfaceVal },

      masterProduct: [],
      masterGem: [],
      masterGemShape: [],

      // ---- datatable ---- //
      editingRows: [],
      autoId: 0
    }
  },
  methods: {
    onSubmit() {
      console.log('submit', this.form)
      if (this.VaidateForm()) {
        swAlert.confirmSubmit(
          `${this.form.moldCode}`,
          `ยืนยันสร้างเเบบเเม่พิมพ์`,
          async () => {
            //console.log('call submitPlan')
            await this.submit()
          },
          null,
          null
        )
      }
    },
    onclear() {
      this.form = { ...interfaceForm }
    },
    updateFile(files) {
      this.form.images = files
    },
    onResetValDate(index) {
      if (index === 'isValCategory') {
        if (this.form.category) {
          this.val.isValCategory = false
        }
      }
    },
    VaidateForm() {
      if (!this.form.category) {
        this.val = {
          isValCategory: true
        }
        return false
      }

      return true // pass
    },
    onTest() {
      this.$router.push({ name: 'plan-list' })
    },

    // --- datatable --- //
    onRowEditSave(event) {
      let { newData, index } = event
      this.form.gems[index] = newData
    },
    onDelGems(item) {
      const index = this.form.gems.indexOf(item)
      this.form.gems.splice(index, 1)
    },
    onAddGems() {
      const addGem = {
        id: ++this.autoId,
        ...interfaceGem
      }
      this.form.gems.push(addGem)
    },

    // ------ Apis ------ //
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
    async submit() {
      try {
        this.isLoading = true

        console.log('this.form', this.form)
        // const param = {
        //   moldCode: this.form.moldCode,
        //   sizeGem: this.form.sizeGem,
        //   qtyGem: this.form.qtyGem,
        //   sizeDiamond: this.form.sizeDiamond,
        //   qtyDiamond: this.form.qtyDiamond,
        //   qtyBeforeCasting: this.form.qtyBeforeCasting,
        //   qtyBeforeSend: this.form.qtyBeforeSend,
        //   images: this.form.images
        // }
        let params = new FormData()
        params.append('moldCode', this.form.moldCode)
        params.append('qtySend', 0)
        params.append('qtyReceive', 0)
        params.append('remark', this.form.remark)
        params.append('Catagory', this.form.category?.code)
        params.append('designBy', this.form.designBy)
        params.append('ResinBy', this.form.ResinBy)

        //params.append('images', this.form.images)

        this.form.images.forEach((file) => {
          params.append(`images`, file) // ใช้ชื่อ "Images" ตรงกับ property ใน model
        })

        //add gems
        if (this.form.gems && this.form.gems.length > 0) {
          this.form.gems.forEach((item, index) => {
            if (item.gem && item.gemShape) {
              params.append(`gems[${index}][gemCode]`, item.gem.code)
              params.append(`gems[${index}][gemShapeCode]`, item.gemShape.code)
              params.append(`gems[${index}][size]`, item.size)
              params.append(`gems[${index}][qty]`, item.qty)
            }
          })
        }

        console.log('params', params)

        let options = {
          headers: {
            'Content-Type': `multipart/form-data`
          }
        }
        const res = await api.jewelry.post('Mold/NewPlanDesign', params, options)
        if (res) {
          swAlert.success(
            ``,
            '',
            () => {
              this.onclear()
              //this.$router.go(-1)
              this.$router.push({ name: 'plan-list' })
              //this.$router.push({ name: 'design-create' })
            },
            null,
            null
          )
        }

        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
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
  created() {
    this.$nextTick(() => {
      this.fetchMasterProductType(), this.fetchMasterGem(), this.fetchMasterGemShape()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.zone-container {
  //border: 1px solid #dddddd;
  //border-radius: 5px;
  //box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  //background-color: #f7f7f7;
  padding: 20px 20px;
  //margin-bottom: 20px;
}
</style>
