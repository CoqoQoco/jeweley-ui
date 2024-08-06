<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShow" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header">
          <span>{{ `เบิกเเม่พิมพ์ - ${model.code}` }}</span>
        </div>
        <form @submit.prevent="onSubmit">
          <div class="form-col-container">
            <!-- image -->
            <div class="image-container filter-container">
              <div class="upload-preview">
                <div v-if="urlImage">
                  <img :src="urlImage" alt="Preview" class="preview-image" />
                  <!-- <i class="bi bi-x del-iamge-x"></i> -->
                </div>
              </div>
            </div>

            <!-- data -->
            <div>
              <div class="form-col-container filter-container-highlight custom-continer-data">
                <div class="d-flex flex-column">
                  <span class="title-text-white">รหัส</span>
                  <span class="desc-text-white">{{ form.code }}</span>
                </div>
                <div class="d-flex flex-column">
                  <span class="title-text-white">ประเภท</span>
                  <span class="desc-text-white">{{
                    `${form.categoryCode}:${form.category} `
                  }}</span>
                </div>
              </div>
              <div class="form-col-container">
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
              <div class="form-col-container">
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
              <div class="form-col-container">
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
            </div>
          </div>
          <div class="d-flex justify-content-end mt-1">
            <button class="btn btn-sm btn-main" type="submit">
              <span class="mr-2">
                <i class="bi bi-gem"></i>
              </span>
              <span>เบิกเเม่พิมพ์</span>
            </button>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

//import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'

import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatISOString } from '@/services/utils/dayjs'

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
    loading,
    //Dropdown,
    Calendar
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
        categoryCode: value.categoryCode
      }
      await this.fetchImageData(value.code)
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
      urlImage: ''
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
    async fetchImageData(path) {
      try {
        //console.log
        switch (this.type) {
          case 'ORDERPLAN': {
            const param = {
              imageName: `${path}-Mold.png`
            }
            const res = await api.jewelry.get('FileExtension/GetMoldImage', param)

            if (res) {
              this.urlImage = `data:image/png;base64,${res}`
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
    })
    //this.fetchMasterProductType()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
.image-container {
  //border: 1px solid var(--base-color);
  background-color: #ffff;
  padding: 0px;
}

.upload-preview {
  display: grid;
  place-items: center;
}
.preview-image {
  width: 20rem;
  height: 20rem;
  margin: 10px 0px;
  border-radius: 10px;
}
.custom-continer-data {
  padding: 20px 20px;
}
</style>
