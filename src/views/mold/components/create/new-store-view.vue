<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal">
      <template v-slot:content>
        <form @submit.prevent="onSubmit" class="p-2">
          <div>
            <stepperStatus :events="events" :eventsIdActive="6"></stepperStatus>
          </div>
          <div class="filter-container-highlight mt-2">
            <div class="form-col-sm-container">
              <div class="d-flex flex-column">
                <span class="title-text-white">{{ $t('view.mold.store.fieldMoldCode') }}</span>
                <input class="form-control" v-model="form.moldCode" type="text" required />
              </div>
              <div class="d-flex flex-column">
                <span class="title-text-white">{{ $t('view.mold.store.fieldCode') }}</span>
                <input class="form-control" v-model="form.code" type="text" required />
              </div>
              <div class="d-flex flex-column"></div>
              <div></div>
            </div>
          </div>

          <!-- qty -->
          <div class="form-col-container mt-2">
            <div>
              <div>
                <span class="title-text">{{ $t('view.mold.store.fieldResinWeight') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <input
                type="number"
                step="any"
                class="form-control"
                required
                v-model="form.qtyResin"
              />
            </div>
            <div>
              <div>
                <span class="title-text">{{ $t('view.mold.store.fieldSilverCastWeight') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <input
                type="number"
                step="any"
                class="form-control"
                required
                v-model="form.qtySilverCast"
              />
            </div>
            <div></div>
            <div></div>
          </div>

          <!-- resin -->
          <div class="form-col-container mt-2">
            <div>
              <span>
                <span class="title-text">{{ $t('view.mold.store.fieldPrintBy') }}</span>
                <span class="txt-required"> *</span>
              </span>
              <input type="text" required class="form-control" v-model="form.printBy" />
            </div>
            <div>
              <span>
                <span class="title-text">{{ $t('view.mold.store.fieldCuttingBy') }}</span>
                <span class="txt-required"> *</span>
              </span>
              <input type="text" required class="form-control" v-model="form.cuttingBy" />
            </div>
            <div></div>
            <div></div>
          </div>

          <!-- work by -->
          <div class="form-col-container mt-2">
            <div>
              <span>
                <span class="title-text">{{ $t('view.mold.store.fieldMoldBy') }}</span>
                <span class="txt-required"> *</span>
              </span>
              <input class="form-control" v-model="form.workBy" type="text" required />
            </div>
            <div>
              <div>
                <span class="title-text">{{ $t('view.mold.store.fieldLocation') }}</span>
                <span class="txt-required"> *</span>
              </div>
              <DropdownGeneric
                :modelValue="form.LocationName"
                :options="masterLocationt"
                optionLabel="value"
                :showClear="!!form.LocationName"
                :class="val.isValLocation === true ? `p-invalid` : ``"
                @update:modelValue="onLocationChange"
              />
            </div>
            <div></div>
            <div></div>
          </div>

          <!-- image -->
          <div class="form-col-container mt-2">
            <uploadImages
              :title="$t('view.mold.store.imgTitle')"
              @onUpdateFile="updateFile"
              @btnClearRef="setBtnClearRef"
            ></uploadImages>
          </div>

          <!-- remark -->
          <div class="form-col-container mt-2">
            <div>
              <span class="title-text">{{ $t('view.mold.store.fieldRemark') }}</span>
              <textarea class="form-control" v-model="form.remark" style="height: 50px" />
            </div>
          </div>

          <div class="d-flex justify-content-end mt-1">
            <button class="btn btn-sm btn-main" type="submit">
              <span class="mr-2">
                <i class="bi bi-gem"></i>
              </span>
              <span>{{ $t('view.mold.store.btnSubmit') }}</span>
            </button>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const stepperStatus = defineAsyncComponent(() => import('@/components/prime-vue/StepperStatus.vue'))
const uploadImages = defineAsyncComponent(() => import('@/components/prime-vue/UploadImages.vue'))

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'

import { eventStatus } from '@/views/mold/create-design-new/interface/data.js'

const interfaceForm = {
  images: [],
  workBy: null,
  workerName: null,
  LocationName: null,
  remark: null,
  qtyReceive: 0,
  qtySend: 0,
  code: null,
  moldCode: null,
  qtyResin: null,
  qtySilverCast: null,
  printBy: null,
  cuttingBy: null
}
const interfaceVal = {
  isValLocation: false
}

export default {
  components: {
    modal,
    stepperStatus,
    uploadImages,
    DropdownGeneric
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
      required: true
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  computed: {
    value() {
      return this.modelValue
    }
  },
  data() {
    return {
      events: [...eventStatus],
      form: { ...interfaceForm },
      val: { ...interfaceVal },
      btnClearImg: null,
      countClearFiles: 0,
      masterLocationt: [
        { id: 1, code: 'A', value: 'คลัง 1' },
        { id: 2, code: 'B', value: 'คลัง 2' },
        { id: 3, code: 'C', value: 'คลัง 3' }
      ]
    }
  },
  watch: {
    'form.LocationName'() {
      if (this.form.LocationName) {
        this.val.isValLocation = false
      }
    },
    modelValue: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form.moldCode = newVal.moldCode
          this.form.code = newVal.code
        }
      }
    }
  },
  methods: {
    setBtnClearRef(ref) {
      this.btnClearImg = ref
    },
    closeModal() {
      this.countClearFiles++
      this.onclear()
      this.$emit('closeModal')
    },
    onclear() {
      if (this.btnClearImg) {
        this.btnClearImg.click()
      }
      this.form = { ...interfaceForm }
    },
    onLocationChange(value) {
      this.form.LocationName = value
      if (value) this.val.isValLocation = false
    },
    onSubmit() {
      if (this.VaidateForm()) {
        confirmSubmit(
          `${this.value.moldCode}`,
          this.$t('view.mold.store.confirmTitle'),
          async () => {
            await this.submit()
          },
          null,
          null
        )
      }
    },
    updateFile(files) {
      this.form.images = files
    },
    VaidateForm() {
      if (!this.form.LocationName) {
        this.val = { isValLocation: true }
        return false
      }
      return true
    },

    async submit() {
      let params = new FormData()
      params.append('planId', this.value.id)
      params.append('moldCode', this.form.moldCode)
      params.append('code', this.form.code)
      params.append('workerBy', this.form.workBy)
      params.append('remark', this.form.remark)
      params.append('location', this.form.LocationName.code)
      this.form.images.forEach((file) => {
        params.append(`images`, file)
      })

      params.append('qtyResin', this.form.qtyResin)
      params.append('qtySilverCast', this.form.qtySilverCast)
      params.append('cuttingBy', this.form.cuttingBy)
      params.append('printBy', this.form.printBy)

      let options = {
        headers: {
          'Content-Type': `multipart/form-data`
        }
      }
      const res = await api.jewelry.post('Mold/NewPlanStore', params, options)
      if (res) {
        success(``, '', () => {
          this.countClearFiles++
          this.onclear()
          this.$emit('refresh')
        }, null, null)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
