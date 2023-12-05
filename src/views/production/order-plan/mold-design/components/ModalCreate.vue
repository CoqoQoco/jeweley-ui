<template>
  <div class="app-container-modal">
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="1100px">
      <template v-slot:title>
        <h5>สร้างเเม่พิมพ์</h5>
      </template>
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="form-container">
            <div class="row form-group">
              <div class="col-md-7">
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
                      เลือกรูปภาพ
                    </button>
                  </div>
                  <div class="upload-preview">
                    <div v-if="imgUrl">
                      <img :src="imgUrl" alt="Preview" class="preview-image" />
                      <!-- <i class="bi bi-x del-iamge-x"></i> -->
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-5">
                <div class="row form-group">
                  <div class="col-md-12">
                    <label>รหัส</label>
                    <input type="text" class="form-control" v-model="form.code" required />
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-12">
                    <label>ประเภท</label>
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
                </div>
                <div class="row form-group">
                  <div class="col-md-12">
                    <label>คำอธิบาย</label>
                    <textarea
                      class="form-control"
                      v-model="form.description"
                      style="height: 13.8rem"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <!-- <div class="line"></div> -->
            <div class="row form-group">
              <div class="col-md-12">
                <div class="btn-container">
                  <button class="btn btn-sm btn-main" type="submit">
                    <span class="mr-2"><i class="bi bi-gem"></i></span><span>สร้างเเม่พิมพ์</span>
                  </button>
                </div>
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

import swAlert from '@/js/alert/sweetAlerts.js'
import api from '@/axios/axios-config.js'

import Dropdown from 'primevue/dropdown'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
//import modal from '@/components/modal/ModalView.vue'
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
//const UploadImage = defineAsyncComponent(() => import('@/components/prime-vue/UploadImage.vue'))

export default {
  components: {
    modal,
    loading,
    Dropdown
  },
  props: {
    isShowModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: false,

      //image
      //isResetImage: false,
      //imageConatinerHight: '435px',
      name: '',
      imgUrl: '',
      masterProduct: [],

      form: {
        image: null,
        code: null,
        category: null,
        description: null
      },
      val: {
        isValCategory: false
      }
    }
  },
  methods: {
    // ------- import image -------//
    onSelectImg(e) {
      if (e.target.files[0]) {
        this.name = e.target.files[0].name

        //preview
        const reader = new FileReader()
        reader.onload = (event) => {
          this.imgUrl = event.target.result
        }
        reader.readAsDataURL(e.target.files[0])

        //assign
        this.form.image = e.target.files[0]
      }
    },

    closeModal() {
      this.onclear()
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.VaidateForm()) {
        swAlert.confirmSubmit(
          `${this.form.code}`,
          `ยืนยันสร้างเเม่พิมพ์`,
          async () => {
            //console.log('call submitPlan')
            await this.submit()
          },
          null,
          null
        )
      }
    },
    async submit() {
      try {
        this.isLoading = true

        let params = new FormData()
        params.append('code', this.form.code)
        console.log(this.form.category)
        params.append('category', this.form.category.nameTh)
        params.append('categoryCode', this.form.category.code)
        params.append('description', this.form.description)
        params.append('images', this.form.image)

        let options = {
          headers: {
            'Content-Type': `multipart/form-data`
          }
        }

        const res = await api.jewelry.post('Mold/CreateMold', params, options)
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
    },
    onclear() {
      this.$refs.fileInput.value = null
      this.imgUrl = ''
      this.form = {
        image: null,
        code: null,
        category: null,
        description: null
      }

      this.val = {
        isValCategory: false
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
    onResetValDate(index) {
      //console.log(index)
      if (index === 'isValCategory') {
        if (this.form.category) {
          this.val.isValCategory = false
          //console.log(this.val.isValCategory)
        }
      }
    },

    // -------- master ---------- //
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
    }
  },
  created() {
    //this.isResetImage =
  },
  mounted() {
    this.fetchMasterProductType()
  }
}
</script>

<style lang="scss" scoped>
h5 {
  padding: 10px 0px 0px 10px;
  font-size: 21px;
  font-weight: 600;
  color: var(--base-font-color);
}
label {
  color: var(--base-font-color);
  font-weight: 300;
  margin: 5px 0px 0px 0px;
}
.form-group {
  margin-bottom: 5px;
}
.title {
  font-size: 21px;
  font-weight: 600;
  width: 100%;
}
.btn-container {
  margin-top: 10px;
  display: grid;
  place-items: end;
}
.line {
  border-bottom: 1px solid var(--base-font-color);
  margin: 10px 20px;
}

.image-container {
  border: 1px solid var(--base-color);
  background-color: #ffff;
  padding: 0px;
  display: grid;
}
.hidden-input {
  opacity: 0;
  overflow: hidden;
  position: absolute;
  width: 80%;
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
  border: 1px solid var(--base-sub-color);
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  border-radius: 10px;
}
</style>
