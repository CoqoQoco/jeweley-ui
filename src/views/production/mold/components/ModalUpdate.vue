<template>
  <div class="app-container-modal">
    <modal
      :showModal="isShowModal"
      @closeModal="closeModal"
      width="1100px"
      headerVariant="main"
      :isShowActionPart="true"
    >
      <template #title>
        <span class="title-text-lg d-block">{{ `${$t('view.production.mold.updateTitle')} - ${model.code}` }}</span>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit" id="mold-update-form">
          <div class="p-3">
            <SectionCardGeneric class="modal-section">
              <div class="row">
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
                        {{ $t('view.production.mold.btnEditImage') }}
                      </button>
                    </div>
                    <div class="upload-preview">
                      <div v-if="urlImage">
                        <img :src="urlImage" alt="Preview" class="preview-image" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-5">
                  <FormFieldGeneric :label="$t('common.field.code')" :required="true">
                    <InputTextGeneric v-model="form.code" :disabled="true" :required="true" />
                  </FormFieldGeneric>
                  <FormFieldGeneric :label="$t('common.field.type')" :required="true">
                    <div class="flex-group">
                      <div class="w-25">{{ model.category }}</div>
                      <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
                      <DropdownGeneric
                        v-model="form.category"
                        :options="masterProduct"
                        optionLabel="description"
                        :showClear="form.category ? true : false"
                        :class="val.isValCategory === true ? `p-invalid` : ``"
                        @update:modelValue="onResetValDate('isValCategory')"
                      />
                    </div>
                  </FormFieldGeneric>
                  <FormFieldGeneric :label="$t('view.production.mold.moldBy')">
                    <InputTextGeneric v-model="form.moldBy" />
                  </FormFieldGeneric>
                  <FormFieldGeneric :label="$t('view.production.mold.description')" :required="true">
                    <TextareaGeneric v-model="form.description" :rows="5" :required="true" />
                  </FormFieldGeneric>
                </div>
              </div>
            </SectionCardGeneric>
          </div>
        </form>
      </template>
      <template #action>
        <ButtonGeneric
          variant="main"
          icon="bi-brush"
          :label="$t('view.production.mold.btnUpdate')"
          type="submit"
          form="mold-update-form"
        />
        <ButtonGeneric
          variant="outline"
          :label="$t('common.btn.cancel')"
          class="ml-2"
          @click="closeModal"
        />
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import api from '@/axios/axios-helper.js'
import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import { getAzureBlobUrl } from '@/config/azure-storage-config.js'

import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  components: {
    modal,
    FormFieldGeneric,
    InputTextGeneric,
    TextareaGeneric,
    ButtonGeneric,
    SectionCardGeneric,
    DropdownGeneric
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
      return this.modelValue
    }
  },
  watch: {
    async modelValue(value) {
      this.form = {
        code: value.code,
        moldBy: value.moldBy,
        description: value.description
      }
      await this.fetchImageData(value.code)
    }
  },
  data() {
    return {
      isShowUpdateImage: false,
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
    onSelectImg(e) {
      if (e.target.files[0]) {
        this.name = e.target.files[0].name

        const reader = new FileReader()
        reader.onload = (event) => {
          this.urlImage = event.target.result
        }
        reader.readAsDataURL(e.target.files[0])

        this.form.image = e.target.files[0]
      }
    },
    closeModal() {
      this.$emit('closeModal')
    },
    onSubmit() {
      if (this.VaidateForm()) {
        confirmSubmit(`${this.form.code}`, this.$t('view.production.mold.confirmUpdate'), async () => {
          await this.submit()
        })
      }
    },
    async submit() {
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
        success(``, ``, async () => {
          this.onclear()
          this.$emit('fetch')
        })
      }
    },
    onclear() {
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
      if (index === 'isValCategory') {
        if (this.form.category) {
          this.val.isValCategory = false
        }
      }
    },

    async fetchImageData(path) {
      if (this.type === 'ORDERPLAN') {
        const blobPath = `Mold/${path}-Mold.png`
        this.urlImage = getAzureBlobUrl(blobPath)
      }
    },

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
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.modal-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
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
  height: 22rem;
}
.preview-image {
  width: 20rem;
  height: 20rem;
  margin: 10px 0px;
  border-radius: var(--radius-lg);
}
.flex-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
