<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShow" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header">
          <span>{{ `เเก้ไขเเม่พิมพ์ - ${model.code}` }}</span>
        </div>
        <form @submit.prevent="onSubmit">
          <div class="form-col-container">
            <!-- image -->
            <div>
              <div class="image-container">
                <div class="upload-btn">
                  <input
                    class="hidden-input"
                    type="file"
                    ref="fileInput"
                    accept=".jpg, .png"
                    @change="onSelectImg"
                  />
                  <button class="btn btn-sm btn-warning btn-upload-custom" type="button">
                    เลือกเเเก้ไขรูปภาพ
                  </button>
                </div>
                <div class="upload-preview">
                  <div v-if="urlImage">
                    <img :src="urlImage" alt="Preview" class="preview-image" />
                    <!-- <i class="bi bi-x del-iamge-x"></i> -->
                  </div>
                </div>
              </div>
            </div>

            <!-- data -->
            <div>
              <div class="form-col-container">
                <div>
                  <span class="title-text">รหัส</span>
                  <input type="text" class="form-control" v-model="form.code" disabled required />
                </div>
              </div>
              <div class="form-col-container">
                <div>
                  <span class="title-text">ประเภท</span>
                  <Dropdown
                    v-model="form.category"
                    :options="masterProduct"
                    optionLabel="description"
                    class="w-full md:w-14rem"
                    :showClear="form.category ? true : false"
                    :class="val.isValCategory === true ? `p-invalid` : ``"
                    @change="onResetValDate('isValCategory')"
                  />
                </div>
              </div>
              <div class="form-col-container">
                <div>
                  <label>ช่างขึ้นพิมพ์</label>
                  <input type="text" class="form-control" v-model="form.moldBy" />
                </div>
              </div>
              <div class="form-col-container">
                <div>
                  <label>คำอธิบาย</label>
                  <textarea
                    class="form-control"
                    v-model="form.description"
                    style="height: 6rem"
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
              <span>เเก้ไขเเม่พิมพ์</span>
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

import Dropdown from 'primevue/dropdown'

import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'

const interfaceForm = {
  code: null,
  category: null,
  description: null
}
const interfaceVal = {
  isValCategory: false
}

export default {
  components: {
    modal,
    loading,
    Dropdown
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
        code: value.code,
        moldBy: value.moldBy,
        description: value.description,
        //category: value.category
        category: this.masterProduct.find((x) => x.code === value.categoryCode)
      }
      //console.log(value)
      await this.fetchImageData(value.code)
    },
    'form.category'() {
      if (this.form.category) {
        this.val.isValCategory = false
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

      this.val = {
        isValCategory: false
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
      if (!this.form.category) {
        this.val = {
          isValCategory: true
        }
        return false
      }

      return true // pass
    },
    onResetValDate(index) {
      if (index === 'isValCategory') {
        if (this.form.category) {
          this.val.isValCategory = false
        }
      }
    },
    onSubmit() {
      if (this.VaidateForm()) {
        swAlert.confirmSubmit(
          `${this.form.code}`,
          `ยืนยันเเก้ไขเเม่พิมพ์`,
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

        // let params = {
        //   code: this.form.code,
        //   category: this.form.category.nameTh,
        //   categoryCode: this.form.category.code,
        //   description: this.form.description,
        //   Images: this.form.image ? this.form.image : null

        // }

        let params = new FormData()
        params.append('code', this.form.code)
        params.append('category', this.form.category.nameTh)
        params.append('categoryCode', this.form.category.code)
        params.append('description', this.form.description)
        params.append('moldBy', this.form.moldBy)
        params.append('images', this.form.image ? this.form.image : null)

        let options = {
          headers: {
            'Content-Type': `multipart/form-data`
          }
        }

        const res = await api.jewelry.post('Mold/UpdateMold', params, options)
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
      this.fetchMasterProductType()
    })
    //this.fetchMasterProductType()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.image-container {
  border: 1px solid var(--base-color);
  background-color: #ffff;
  padding: 0px;
  //display: grid;
}

.hidden-input {
  opacity: 0;
  overflow: hidden;
  position: absolute;
  width: 100%;
  height: 35px;
}
.btn-upload-custom {
  width: 100%;
  height: 35px;
}
.upload-preview {
  display: grid;
  place-items: center;
  //width: 20rem;
  height: 22rem;
}
.preview-image {
  width: 20rem;
  height: 20rem;
  margin: 10px 0px;
  //border: 1px solid var(--base-sub-color);
  //box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  border-radius: 10px;
}
</style>
