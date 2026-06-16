<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header">
          <span>{{ `${$t('view.mold.picking.titleCheckOut')} - ${model.code}` }}</span>
        </div>
        <form @submit.prevent="onSubmit" class="p-2">
          <div class="form-col-container">
            <!-- main image -->
            <div class="mt-2">
              <div class="image-container">
                <div class="upload-btn"></div>
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
                <div class="upload-btn"></div>
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
                  <span class="title-text-white">{{ $t('common.field.code') }}</span>
                  <span class="desc-text-white">{{ form.code }}</span>
                </div>
                <div class="d-flex flex-column">
                  <span class="title-text-white">{{ $t('common.field.type') }}</span>
                  <span class="desc-text-white">{{
                    `${form.categoryCode ?? `Empty`}:${form.category} `
                  }}</span>
                </div>
              </div>
              <div class="form-col-container mt-2">
                <div>
                  <div>
                    <span class="title-text">{{ $t('view.mold.picking.fieldCheckOutDate') }}</span>
                    <span class="txt-required"> *</span>
                  </div>
                  <CalendarGeneric
                    class="w-100"
                    :class="val.isValCheckOutDate === true ? `p-invalid` : ``"
                    v-model="form.checkOutDate"
                    dateFormat="dd/mm/yy"
                    :showIcon="true"
                    :showButtonBar="true"
                  />
                </div>
                <div>
                  <div>
                    <span class="title-text">{{ $t('view.mold.picking.fieldCheckOutBy') }}</span>
                    <span class="txt-required"> *</span>
                  </div>
                  <input type="text" required class="form-control" v-model="form.checkOutName" />
                </div>
              </div>
              <div class="form-col-container mt-2">
                <div>
                  <div>
                    <span class="title-text">{{ $t('view.mold.picking.fieldReturnDate') }}</span>
                    <span class="txt-required"> *</span>
                  </div>
                  <CalendarGeneric
                    class="w-100"
                    :class="val.isValReturnDateSet === true ? `p-invalid` : ``"
                    v-model="form.returnDateSet"
                    dateFormat="dd/mm/yy"
                    :showIcon="true"
                    :showButtonBar="true"
                  />
                </div>
                <div></div>
              </div>
              <div class="form-col-container mt-2">
                <div>
                  <div>
                    <span class="title-text">{{ $t('view.mold.picking.fieldCheckOutDesc') }}</span>
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

import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { getAzureBlobUrl } from '@/config/azure-storage-config.js'

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
    CalendarGeneric
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
      type: 'ORDERPLAN',
      form: { ...interfaceForm },
      val: { ...interfaceVal },

      urlImage: '',
      urlImageSub: ''
    }
  },
  methods: {
    closeModal() {
      this.$emit('closeModal')
    },
    onclear() {
      this.imgUrl = ''
      this.form = { ...interfaceForm }
      this.$emit('fetch')
    },
    VaidateForm() {
      if (!this.form.checkOutDate) {
        this.val = { isValCheckOutDate: true }
        return false
      }
      if (!this.form.returnDateSet) {
        this.val = { isValReturnDateSet: true }
        return false
      }
      return true
    },
    onSubmit() {
      if (this.VaidateForm()) {
        confirmSubmit(
          `${this.form.code}`,
          `ยืนยันเบิกเเม่พิมพ์`,
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
          const imageUrl = getAzureBlobUrl(blobPath)
          if (sub) {
            this.urlImageSub = imageUrl
          } else {
            this.urlImage = imageUrl
          }
        }
      }
    },
    async submit() {
      let params = {
        ...this.form,
        mold: this.form.code,
        checkOutDate: formatISOString(this.form.checkOutDate),
        returnOutDate: formatISOString(this.form.returnDateSet)
      }

      const res = await api.jewelry.post('StockMold/CheckOutMold', params)
      if (res) {
        success(``, ``, async () => {
          this.onclear()
          this.$emit('fetch')
        }, null, null)
      }
    }
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
