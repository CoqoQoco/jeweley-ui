<template>
  <div class="app-container-modal">
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="1100px">
      <template v-slot:title>
        <h5>{{ `เเก้ไขเเม่พิมพ์ - ${model.code}` }}</h5>
      </template>
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="form-container">
            <div class="row form-group">
              <div class="col-md-7 image-container">
                <div class="image-box-container">
                  <div v-if="urlImage">
                    <img class="image-preview" :src="urlImage" alt="Image" preview />
                  </div>
                  <div v-else class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                  </div>
                </div>
              </div>
              <div class="col-md-5">
                <div class="row form-group">
                  <div class="col-md-12">
                    <label>รหัส</label>
                    <input type="text" class="form-control" v-model="form.code" disabled required />
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-12">
                    <label>ประเภท</label>
                    <div class="flex-group">
                      <div class="w-25">{{ model.category }}</div>
                      <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
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
                  <button class="btn btn-sm btn-warning" type="submit">
                    <span class="mr-2"><i class="bi bi-pencil"></i></span
                    ><span>เเก้ไขเเม่พิมพ์</span>
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
import Dropdown from 'primevue/dropdown'

import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

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
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  computed: {
    model() {
      //console.log(this.modelValue)
      return this.modelValue
    }
  },
  watch: {
    async modelValue(value) {
      this.form = {
        code: value.code,
        description: value.description
      }
      //console.log(value)
      await this.fetchImageData(value.code)
    }
  },
  data() {
    return {
      // --- flag ---- //
      isLoading: false,
      type: 'ORDERPLAN',
      name: '',
      urlImage: '',

      // ------- form ------ //
      form: {
        image: null,
        code: null,
        category: null,
        description: null
      },
      val: {
        isValCategory: false
      },

      //  ------ master ------- //
      masterProduct: []
    }
  },
  methods: {
    // --------- controller --------- //
    closeModal() {
      //this.onclear()
      this.$emit('closeModal')
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
    async submit() {
      try {
        this.isLoading = true

        let params = {
          code: this.form.code,
          category: this.form.category.nameTh,
          categoryCode: this.form.category.code,
          description: this.form.description
        }

        const res = await api.jewelry.post('Mold/UpdateMold', params)
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
      //this.$refs.fileInput.value = null
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
  height: 24rem;
}
.preview-image {
  width: 20rem;
  height: 20rem;
  margin: 10px 0px;
  border: 1px solid var(--base-sub-color);
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  border-radius: 10px;
}

.image-preview {
  max-width: 300px;
  height: auto;
  //border: 1px solid var(--base-color);
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
.flex-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
