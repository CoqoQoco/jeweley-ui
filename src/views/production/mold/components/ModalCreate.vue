<template>
  <div class="app-container-modal">
    <modal :showModal="isShowModal" @closeModal="closeModal" width="1100px">
      <!-- <template v-slot:title>
        <h5>{{ $t('view.production.mold.createTitle') }}</h5>
      </template> -->
      <template v-slot:content>
        <h5>{{ $t('view.production.mold.createTitle') }}</h5>
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
                    <button class="btn btn-sm btn-main btn-upload-custom" type="button">
                      {{ $t('view.production.mold.btnSelectImage') }}
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
                    <label>{{ $t('common.field.code') }}</label>
                    <input type="text" class="form-control" v-model="form.code" required />
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-12">
                    <label>{{ $t('common.field.type') }}</label>
                    <DropdownGeneric
                      v-model="form.category"
                      :options="masterProduct"
                      optionLabel="description"
                      :showClear="form.category ? true : false"
                      :class="val.isValCategory === true ? `p-invalid` : ``"
                      @update:modelValue="onResetValDate('isValCategory')"
                    />
                    <!-- <input type="text" class="form-control" v-model="form.category" required /> -->
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-12">
                    <label>{{ $t('view.production.mold.moldBy') }}</label>
                    <input type="text" class="form-control" v-model="form.moldBy" />
                  </div>
                </div>
                <div class="row form-group">
                  <div class="col-md-12">
                    <label>{{ $t('view.production.mold.description') }}</label>
                    <textarea
                      class="form-control"
                      v-model="form.description"
                      style="height: 9.3rem"
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
                    <span class="mr-2"><i class="bi bi-gem"></i></span><span>{{ $t('view.production.mold.btnCreate') }}</span>
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

import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  components: {
    modal,
    DropdownGeneric
  },
  props: {
    isShowModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
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
        confirmSubmit(`${this.form.code}`, this.$t('view.production.mold.confirmCreate'), async () => {
          await this.submit()
        })
      }
    },
    async submit() {
      let params = new FormData()
      params.append('code', this.form.code)
      params.append('category', this.form.category.nameTh)
      params.append('categoryCode', this.form.category.code)
      params.append('moldBy', this.form.moldBy)
      params.append('description', this.form.description)
      params.append('images', this.form.image)

      let options = {
        headers: {
          'Content-Type': `multipart/form-data`
        }
      }

      const res = await api.jewelry.post('Mold/CreateMold', params, options)
      if (res) {
        success(``, ``, async () => {
          this.onclear()
          this.$emit('fetch')
        })
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
      const res = await api.jewelry.get('Master/MasterProductType')
      if (res) {
        this.masterProduct = [...res]
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
.form-container {
  padding: 10px;
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
  border: 1px solid var(--base-sub-color);
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  border-radius: 10px;
}
</style>
