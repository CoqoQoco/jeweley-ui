<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header">
          <span>{{ `${$t('view.mold.updateMold.title')} - ${model.code}` }}</span>
        </div>
        <form @submit.prevent="onSubmit" class="p-2">
          <div class="form-col-container">
            <!-- main image -->
            <div class="mt-2">
              <div class="image-container">
                <div class="upload-btn">
                  <input
                    class="hidden-input"
                    type="file"
                    ref="fileInputMain"
                    accept=".jpg, .png"
                    @change="onSelectImageMain"
                  />
                  <button class="btn btn-sm btn-upload-custom" type="button">
                    <span><i class="bi bi-image"></i></span>
                    <span>เเก้ไข</span>
                  </button>
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
                  <input
                    class="hidden-input"
                    type="file"
                    ref="fileInputSub"
                    accept=".jpg, .png"
                    @change="onSelectImageSub"
                  />
                  <button class="btn btn-sm btn-upload-custom" type="button">
                    <span><i class="bi bi-image"></i></span>
                    <span>เเก้ไข</span>
                  </button>
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
            <div class="filter-container-highlight mt-2">
              <div class="form-col-container">
                <div>
                  <span class="title-text-white">{{ $t('view.mold.updateMold.fieldCode') }}</span>
                  <input
                    type="text"
                    class="form-control dis-input-container"
                    v-model="form.code"
                    disabled
                    required
                  />
                </div>
              </div>
              <div class="form-col-container">
                <div>
                  <span class="title-text-white">{{ $t('view.mold.updateMold.fieldCategory') }}</span>
                  <DropdownGeneric
                    :modelValue="form.category"
                    :options="masterProduct"
                    optionLabel="description"
                    :showClear="!!form.category"
                    :class="val.isValCategory === true ? `p-invalid` : ``"
                    @update:modelValue="onCategoryChange"
                  />
                </div>
              </div>
              <div class="form-col-container">
                <div>
                  <span class="title-text-white">{{ $t('view.mold.updateMold.fieldMoldBy') }}</span>
                  <input type="text" class="form-control" v-model="form.moldBy" />
                </div>
              </div>
              <div class="form-col-container">
                <div>
                  <span class="title-text-white">{{ $t('view.mold.updateMold.fieldDescription') }}</span>
                  <textarea
                    class="form-control"
                    v-model="form.description"
                    style="height: 6rem"
                    required
                  />
                </div>
              </div>
              <div class="d-flex justify-content-end mt-2">
                <button class="btn btn-sm btn-main" type="submit">
                  <span class="mr-2">
                    <i class="bi bi-calendar-check"></i>
                  </span>
                  <span>{{ $t('common.btn.save') }}</span>
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

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'
import { compressOptimalImage } from '@/services/helper/file/compress-image.js'
import { getAzureBlobUrl } from '@/config/azure-storage-config.js'

const interfaceForm = {
  code: null,
  category: null,
  description: null,
  imageMain: null,
  imageSub: null
}
const interfaceVal = {
  isValCategory: false
}

export default {
  components: {
    modal,
    DropdownGeneric
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
      this.form = {
        code: value.code,
        moldBy: value.moldBy,
        description: value.description,
        category: this.masterProduct.find((x) => x.code === value.categoryCode)
      }

      if (value.code) {
        await this.fetchImageData(value.code, false)
      }

      if (value.imageDraft1) {
        await this.fetchImageData(value.code, true)
      }
    },
    'form.category'() {
      if (this.form.category) {
        this.val.isValCategory = false
      }
    }
  },
  data() {
    return {
      type: 'ORDERPLAN',
      form: { ...interfaceForm },
      val: { ...interfaceVal },
      masterProduct: [],

      urlImage: '',
      urlImageSub: ''
    }
  },
  methods: {
    closeModal() {
      this.onclear()
      this.$emit('closeModal')
    },
    onclear() {
      if (this.$refs.fileInputMain) this.$refs.fileInputMain.value = null
      if (this.$refs.fileInputSub) this.$refs.fileInputSub.value = null
      this.urlImage = ''
      this.urlImageSub = ''
      this.form = { ...interfaceForm }
      this.val = { isValCategory: false }
    },
    onCategoryChange(value) {
      this.form.category = value
      if (value) this.val.isValCategory = false
    },
    async onSelectImageMain(e) {
      if (e.target.files[0]) {
        this.name = e.target.files[0].name
        const reader = new FileReader()
        reader.onload = (event) => {
          this.urlImage = event.target.result
        }
        reader.readAsDataURL(e.target.files[0])

        const compressedFile = await compressOptimalImage(e.target.files[0])
        const compressedReader = new FileReader()
        compressedReader.onload = (event) => {
          this.urlImage = event.target.result
        }
        compressedReader.readAsDataURL(compressedFile)
        this.form.imageMain = compressedFile
      }
    },
    async onSelectImageSub(e) {
      if (e.target.files[0]) {
        this.name = e.target.files[0].name
        const reader = new FileReader()
        reader.onload = (event) => {
          this.urlImageSub = event.target.result
        }
        reader.readAsDataURL(e.target.files[0])

        const compressedFile = await compressOptimalImage(e.target.files[0])
        const compressedReader = new FileReader()
        compressedReader.onload = (event) => {
          this.urlImageSub = event.target.result
        }
        compressedReader.readAsDataURL(compressedFile)
        this.form.imageSub = compressedFile
      }
    },
    VaidateForm() {
      if (!this.form.category) {
        this.val = { isValCategory: true }
        return false
      }
      return true
    },
    onSubmit() {
      if (this.VaidateForm()) {
        confirmSubmit(
          `${this.form.code}`,
          `ยืนยันเเก้ไขเเม่พิมพ์`,
          async () => {
            await this.submit()
          },
          null,
          null
        )
      }
    },

    async fetchImageData(path, sub) {
      switch (this.type) {
        case 'ORDERPLAN': {
          const blobPath = sub ? `Mold/${path}-Sub-Mold.png` : `Mold/${path}-Mold.png`
          const imageUrl = `${getAzureBlobUrl(blobPath)}?v=${Date.now()}`
          if (sub) {
            this.urlImageSub = imageUrl
          } else {
            this.urlImage = imageUrl
          }
        }
      }
    },
    async fetchMasterProductType() {
      const res = await api.jewelry.get('Master/MasterProductType')
      if (res) {
        this.masterProduct = [...res]
      }
    },
    async submit() {
      let params = new FormData()
      params.append('code', this.form.code)
      params.append('category', this.form.category.nameTh)
      params.append('categoryCode', this.form.category.code)
      params.append('description', this.form.description)
      params.append('moldBy', this.form.moldBy)

      if (this.form.imageMain) params.append('imagesMain', this.form.imageMain)
      if (this.form.imageSub) params.append('imagesSub', this.form.imageSub)

      let options = {
        headers: {
          'Content-Type': `multipart/form-data`
        }
      }

      const res = await api.jewelry.post('Mold/UpdateMold', params, options)
      if (res) {
        success(``, ``, async () => {
          this.onclear()
          this.$emit('fetch')
        }, null, null)
      }
    }
  },
  created() {
    this.$nextTick(() => {
      this.fetchMasterProductType()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

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
  height: 23rem;
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
