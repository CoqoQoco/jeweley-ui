<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header">
          <span>{{ `เบิกเเม่พิมพ์ - ${model.code}` }}</span>
        </div>
        <form @submit.prevent="onSubmit">
          <div class="form-col-container">
            <!-- main image -->
            <div class="mt-2">
              <div class="image-container">
                <div class="upload-btn">
                  <!-- <input
                    class="hidden-input"
                    type="file"
                    ref="fileInput"
                    accept=".jpg, .png"
                    @change="onSelectImageMain"
                  />
                  <button class="btn btn-sm btn-upload-custom" type="button">
                    <span><i class="bi bi-image"></i></span>
                    <span>เเก้ไข</span>
                  </button> -->
                </div>
                <div class="upload-preview">
                  <div v-if="urlImage">
                    <img :src="urlImage" alt="Preview" class="preview-image" />
                  </div>
                </div>
                <div class="upload-title title-upload-custom">
                  <span>รูปที่ 1</span>
                </div>
              </div>
            </div>

            <!-- sub image -->
            <div class="mt-2">
              <div class="image-container">
                <div class="upload-btn">
                  <!-- <input
                    class="hidden-input"
                    type="file"
                    ref="fileInput"
                    accept=".jpg, .png"
                    @change="onSelectImageSub"
                  />
                  <button class="btn btn-sm btn-upload-custom" type="button">
                    <span><i class="bi bi-image"></i></span>
                    <span>เเก้ไข</span>
                  </button> -->
                </div>
                <div class="upload-preview">
                  <div v-if="urlImageSub">
                    <img :src="urlImageSub" alt="Preview" class="preview-image" />
                  </div>
                  <div v-else>
                    <div class="no-image-container" style="height: 100%">
                      <img src="@/assets/no-image.png" class="preview-no-image" />
                      <span class="desc-text">ไม่มีรูปภาพ</span>
                    </div>
                  </div>
                </div>
                <div class="upload-title title-upload-custom">
                  <span>รูปที่ 2</span>
                </div>
              </div>
            </div>

            <!-- data -->
            <div class="filter-container mt-2">
              <div class="form-col-sm-container filter-container-highlight custom-container-data">
                <div class="d-flex flex-column">
                  <span class="title-text-white">รหัส</span>
                  <span class="desc-text-white">{{ form.code }}</span>
                </div>
                <div class="d-flex flex-column">
                  <span class="title-text-white">ประเภท</span>
                  <span class="desc-text-white">{{
                    `${form.categoryCode ?? `Empty`}:${form.category} `
                  }}</span>
                </div>
              </div>
              <div class="form-col-container mt-2">
                <div>
                  <div>
                    <span class="title-text">วันที่เบิก</span>
                    <span class="txt-required"> *</span>
                  </div>
                  <Calendar
                    class="w-100"
                    :class="val.isValCheckOutDate === true ? `p-invalid` : ``"
                    v-model="form.checkOutDate"
                    dateFormat="dd/mm/yy"
                    showIcon
                    showButtonBar
                  />
                </div>
                <div>
                  <div>
                    <span class="title-text">ผู้เบิก</span>
                    <span class="txt-required"> *</span>
                  </div>
                  <input type="text" required class="form-control" v-model="form.checkOutName" />
                </div>
              </div>
              <div class="form-col-container mt-2">
                <div>
                  <div>
                    <span class="title-text">วันที่คืน</span>
                    <span class="txt-required"> *</span>
                  </div>
                  <Calendar
                    class="w-100"
                    :class="val.isValReturnDateSet === true ? `p-invalid` : ``"
                    v-model="form.returnDateSet"
                    dateFormat="dd/mm/yy"
                    showIcon
                    showButtonBar
                  />
                </div>
                <div></div>
              </div>
              <div class="form-col-container mt-2">
                <div>
                  <div>
                    <span class="title-text">เหตุผลการเบิก</span>
                    <span class="txt-required"> *</span>
                  </div>
                  <textarea
                    class="form-control"
                    v-model="form.checkOutDesc"
                    style="height: 4rem"
                    required
                  />
                </div>
              </div>
              <div class="d-flex justify-content-end mt-2">
                <button class="btn btn-sm btn-green" type="submit">
                  <span class="mr-2">
                    <i class="bi bi-calendar-check"></i>
                  </span>
                  <span>บันทึก</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

//import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'

import api from '@/axios/axios-helper.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatISOString } from '@/services/utils/dayjs'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'

const interfaceForm = {
  mold: null,
  checkOutName: null,
  checkOutDate: new Date(),
  checkOutDesc: null,
  returnDateSet: (() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  })()
}
const interfaceVal = {
  isValCheckOutDate: false,
  isValReturnDateSet: false
}

export default {
  components: {
    modal,
    //Dropdown,
    Calendar
  },

  setup() {
    const authStore = useAuthStore()
    return { authStore }
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
    }
  },
  computed: {
    model() {
      return this.modelValue
    },
    user() {
      return this.authStore.user
    }
  },
  watch: {
    async modelValue(value) {
      console.log(value)
      console.log(this.masterProduct)
      this.form = {
        ...this.form,
        code: value.code,
        moldBy: value.moldBy,
        description: value.description,
        category: value.category,
        categoryCode: value.categoryCode,

        checkOutName: this.user?.firstName
      }

      if (value.code) {
        await this.fetchImageData(value.code, false)
      }

      if (value.imageDraft1) {
        await this.fetchImageData(value.code, true)
      }
    },
    'form.checkOutDate'() {
      if (this.form.checkOutDate) {
        this.val.isValCheckOutDate = false
      }
    },
    'form.returnDateSet'() {
      if (this.form.returnDateSet) {
        this.val.isValReturnDateSet = false
      }
    }
  },
  data() {
    return {
      isLoading: false,
      type: 'ORDERPLAN',
      form: { ...interfaceForm },
      val: { ...interfaceVal },
      masterProduct: [],

      // image
      urlImage: '',
      urlImageSub: ''
    }
  },
  methods: {
    // ---------------- event ----------------
    closeModal() {
      //this.onclear()
      this.$emit('closeModal')
    },
    onclear() {
      //this.$refs.fileInput.value = null
      this.imgUrl = ''
      this.form = {
        ...interfaceForm
      }

      this.$emit('fetch')
    },
    onSelectImg(e) {
      this.isLoading = true
      if (e.target.files[0]) {
        //const maxSizeInBytes = 1024 * 1024 // 1 MB (ตั้งค่าตามที่ต้องการ)
        // if (e.target.files[0].size > maxSizeInBytes) {
        //   alert('ไฟล์ที่คุณเลือกมีขนาดเกินกำหนด (1 MB)')
        //   return
        // }
        this.name = e.target.files[0].name

        //preview
        const reader = new FileReader()
        reader.onload = (event) => {
          this.urlImage = event.target.result
        }
        reader.readAsDataURL(e.target.files[0])

        //assign
        this.form.image = e.target.files[0]
      }
      this.isLoading = false
    },
    VaidateForm() {
      if (!this.form.checkOutDate) {
        this.val = {
          isValCheckOutDate: true
        }
        return false
      }
      if (!this.form.returnDateSet) {
        this.val = {
          isValReturnDateSet: true
        }
        return false
      }

      return true // pass
    },
    onResetValDate(index) {
      if (index === 'isValCheckOutDate') {
        if (this.form.checkOutDate) {
          this.val.isValCheckOutDate = false
        }
      }
      if (index === 'isValReturnDateSet') {
        if (this.form.returnDateSet) {
          this.val.isValReturnDateSet = false
        }
      }
    },
    onSubmit() {
      if (this.VaidateForm()) {
        swAlert.confirmSubmit(
          `${this.form.code}`,
          `ยืนยันเบิกเเม่พิมพ์`,
          async () => {
            //console.log('call submitPlan')
            await this.submit()
          },
          null,
          null
        )
      }
    },

    // -------- APIs --------------- //
    // -------- APIs --------------- //
    async fetchImageData(path, sub) {
      try {
        //console.log
        switch (this.type) {
          case 'ORDERPLAN': {
            const param = {
              imageName: sub ? `${path}-Sub-Mold.png` : `${path}-Mold.png`
            }
            const res = await api.jewelry.get('FileExtension/GetMoldImage', param)

            if (res) {
              if (sub) {
                this.urlImageSub = `data:image/png;base64,${res}`
              } else {
                this.urlImage = `data:image/png;base64,${res}`
              }
            }
          }
        }
      } catch (error) {
        console.log(error)
      }
    },
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

        console.log('submit', this.form)

        let params = {
          ...this.form,
          mold: this.form.code,
          checkOutDate: formatISOString(this.form.checkOutDate),
          returnOutDate: formatISOString(this.form.returnDateSet)
        }

        const res = await api.jewelry.post('StockMold/CheckOutMold', params)
        if (res) {
          //console.log(res)
          swAlert.success(
            ``,
            ``,
            async () => {
              this.onclear()
              this.$emit('fetch')
            },
            null,
            null
          )
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
      //this.fetchMasterProductType()
      //console.log('this.user', this.user)
      //this.form.checkOutName = this.user?.firstName
    })
    //this.fetchMasterProductType()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.custom-container-data {
  padding: 10px 10px;
}

.image-container {
  position: relative;
  border: 1px solid var(--base-color);
  background-color: #ffff;
  border-radius: 10px;
  overflow: hidden;
}

.upload-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}
.upload-title {
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 10;
}

.hidden-input {
  opacity: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  cursor: pointer;
}

.btn-upload-custom {
  padding: 5px 10px;
  background-color: var(--base-green);
  border-color: var(--base-warning);
  color: #ffff;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.title-upload-custom {
  padding: 5px 10px;
  background-color: var(--base-sub-color);
  color: #ffff;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.upload-preview {
  display: grid;
  place-items: center;
  height: 28rem;
  background-color: #f8f9fa;
}

.preview-image {
  max-width: 20rem;
  max-height: 20rem;
  width: auto;
  height: auto;
  object-fit: contain;
  margin: 10px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.preview-no-image {
  max-width: 10rem;
  max-height: 10rem;
  width: auto;
  height: auto;
  object-fit: contain;
  margin: 10px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.no-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 300px;
  background-color: #f8f9fa;
  border-radius: 8px;
}
</style>
