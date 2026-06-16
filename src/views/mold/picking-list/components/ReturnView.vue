<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-header">
          <span>{{ `${$t('view.mold.returnMold.titleReturn')} - ${model.mold}` }}</span>
        </div>
        <form @submit.prevent="onSubmit" class="p-2">
          <div class="form-col-container">
            <!-- image -->
            <div class="image-container filter-container">
              <div class="upload-preview">
                <div v-if="urlImage">
                  <img :src="urlImage" alt="Preview" class="preview-image" />
                </div>
              </div>
            </div>

            <!-- data -->
            <div>
              <div class="form-col-container filter-container-highlight custom-continer-data">
                <div class="d-flex flex-column">
                  <span class="title-text-white">{{ $t('common.field.code') }}</span>
                  <span class="desc-text-white">{{ form.code }}</span>
                </div>
                <div class="d-flex flex-column">
                  <span class="title-text-white">{{ $t('common.field.type') }}</span>
                  <span class="desc-text-white">{{
                    `${form.categoryCode}:${form.category} `
                  }}</span>
                </div>
              </div>
              <div class="filter-container custom-continer-data mt-2">
                <div class="form-col-container">
                  <div class="d-flex flex-column">
                    <span class="title-text">{{ $t('view.mold.returnMold.fieldCheckOutDate') }}</span>
                    <span class="desc-text">{{ formatDate(form.checkOutDate) }}</span>
                  </div>
                  <div class="d-flex flex-column">
                    <span class="title-text">{{ $t('view.mold.returnMold.fieldCheckOutBy') }}</span>
                    <span class="desc-text">{{ form.checkOutName }}</span>
                  </div>
                </div>
                <div class="form-col-container">
                  <div class="d-flex flex-column">
                    <span class="title-text">{{ $t('view.mold.returnMold.fieldDueDate') }}</span>
                    <span class="desc-text">{{ formatDate(form.returnDateSet) }}</span>
                  </div>
                  <div></div>
                </div>
                <div class="form-col-container">
                  <div class="d-flex flex-column">
                    <span class="title-text">{{ $t('view.mold.returnMold.fieldCheckOutDesc') }}</span>
                    <span class="desc-text">{{ form.checkOutDesc }}</span>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-col-container">
            <div>
              <div>
                <span class="title-text">{{ $t('view.mold.returnMold.fieldReturnDate') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <CalendarGeneric
                class="w-100"
                :class="val.isValReturnDate === true ? `p-invalid` : ``"
                v-model="form.returnDate"
                dateFormat="dd/mm/yy"
                :showIcon="true"
                :showButtonBar="true"
              />
            </div>
            <div>
              <div>
                <span class="title-text">{{ $t('view.mold.returnMold.fieldReturnBy') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <input type="text" required class="form-control" v-model="form.returnName" />
            </div>
            <div>
              <div>
                <span class="title-text">{{ $t('view.mold.returnMold.fieldReturnDesc') }}</span>
              </div>
              <input type="text" class="form-control" v-model="form.returnDesc" />
            </div>
          </div>
          <div class="d-flex justify-content-end mt-1">
            <button class="btn btn-sm btn-main" type="submit">
              <span class="mr-2">
                <i class="bi bi-gem"></i>
              </span>
              <span>{{ $t('view.mold.pickingList.btnReturn') }}</span>
            </button>
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
import { formatISOString, formatDate } from '@/services/utils/dayjs'
import { getAzureBlobUrl } from '@/config/azure-storage-config.js'
import api from '@/axios/axios-helper.js'

const interfaceForm = {
  returnName: null,
  returnDate: new Date(),
  returnDesc: null
}
const interfaceVal = {
  isValReturnDate: false
}

export default {
  components: {
    modal,
    CalendarGeneric
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
        ...this.form,
        id: value.id,
        code: value.mold,
        moldBy: value.moldBy,
        description: value.description,
        category: value.category,
        categoryCode: value.categoryCode,
        checkOutName: value.checkOutName,
        checkOutDate: value.checkOutDate,
        checkOutDesc: value.checkOutDescription,
        returnDateSet: value.returnDateSet
      }
      await this.fetchImageData(value.mold)
    },
    'form.returnDate'() {
      if (this.form.returnDate) {
        this.val.isValReturnDate = false
      }
    }
  },
  data() {
    return {
      type: 'ORDERPLAN',
      form: { ...interfaceForm },
      val: { ...interfaceVal },

      urlImage: ''
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
      if (!this.form.returnDate) {
        this.val = { isValReturnDate: true }
        return false
      }
      return true
    },
    onSubmit() {
      if (this.VaidateForm()) {
        confirmSubmit(
          `${this.form.code}`,
          `ยืนยันคืนเเม่พิมพ์`,
          async () => {
            await this.submit()
          },
          null,
          null
        )
      }
    },

    formatDate(date) {
      return formatDate(date)
    },

    async fetchImageData(path) {
      switch (this.type) {
        case 'ORDERPLAN': {
          const blobPath = `Mold/${path}-Mold.png`
          this.urlImage = getAzureBlobUrl(blobPath)
        }
      }
    },
    async submit() {
      let params = {
        ...this.form,
        mold: this.form.code,
        returnDate: formatISOString(this.form.returnDate)
      }

      const res = await api.jewelry.post('StockMold/ReturnMold', params)
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

.image-container {
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
