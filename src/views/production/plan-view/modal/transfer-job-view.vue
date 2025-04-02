<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="500px">
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div>
            <div class="form-col-container">
              <div class="title-text-lg-bg">
                <div class="flex-column">
                  <span>
                    {{ `ใบจ่าย-รับคืนงาน เลขที่: ${model.wo}-${model.woNumber}` }}
                  </span>
                  <div>
                    <span class="bi bi-arrow-down-up mr-2"></span>
                    <span>โอนงาน</span>
                    <span class="ml-2">{{ `[${statusTransfer.nameTh}]` }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-2">
            <!-- target status -->
            <div class="form-col-container">
              <div>
                <span class="title-text">แผนกรับโอน</span>
                <Dropdown
                  v-model="form.targetStatus"
                  :options="allowSelectStatus"
                  optionLabel="nameTh"
                  optionValue="id"
                  class="w-full md:w-14rem"
                  :class="val.isTargetStatus === true ? `p-invalid` : ``"
                />
              </div>
            </div>

            <div class="form-col-container mt-2">
              <!-- name -->
              <div>
                <span class="title-text">กำหนดช่างรับงาน</span>
                <AutoComplete
                  v-model="form.worker"
                  :suggestions="workerItemSearch"
                  @complete="onSearchWorker"
                  :class="form.worker ? `` : `-`"
                  optionLabel="nameTh"
                  forceSelection
                  :disabled="this.form.targetStatus === 95"
                >
                </AutoComplete>
              </div>
            </div>

            <div class="submit-container">
              <button
                :class="['btn btn-sm ml-2 btn-green']"
                style="height: 34px"
                @click="onTransferStatus"
                type="submit"
              >
                <span><i class="bi bi-calendar-check"></i></span>
                <span class="ml-2">โอนงาน</span>
              </button>
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
import AutoComplete from 'primevue/autocomplete'

import api from '@/axios/axios-helper.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

import { usePlanUpdateApiStore } from '@/stores/modules/api/plan-update-store.js'

const interfaceForm = {
  formerStatus: null,
  targetStatus: null,
  name: null,
  isExportTransfer: false,
  job: [],
  worker: null
}

const interfaceVal = {
  isTargetStatus: false
}

export default {
  components: {
    modal,
    Dropdown,
    AutoComplete
  },

  setup() {
    const planUpdateStore = usePlanUpdateApiStore()
    return { planUpdateStore }
  },

  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => ({})
    },
    statusTransferValue: {
      type: Number,
      required: true,
      default: () => 0
    },
    masterStatusValue: {
      type: Array,
      required: true,
      default: () => []
    }
  },

  data() {
    return {
      form: { ...interfaceForm },
      val: { ...interfaceVal },
      workerItemSearch: []
    }
  },

  computed: {
    isShowModal() {
      return this.isShow
    },
    model() {
      return this.modelValue
    },
    masterStatus() {
      return this.masterStatusValue
    },
    statusTransfer() {
      const res = this.masterStatusValue.find((item) => item.id === this.statusTransferValue)
      console.log('statusTransfer:', res)
      return res || {}
    },
    allowSelectStatus() {
      let removeStatus = [
        10,
        49,
        55,
        59,
        69,
        79,
        84,
        85,
        89,
        94,
        100,
        500,
        this.statusTransferValue
      ]

      if (this.modelValue.tbtProductionPlanStatusHeader) {
        const statusArray = this.modelValue.tbtProductionPlanStatusHeader.map((item) => item.status)
        removeStatus = [...removeStatus, ...statusArray]
      }

      return this.masterStatus.filter((item) => !removeStatus.includes(item.id))
    }
  },

  watch: {
    'form.targetStatus'() {
      if (this.form.targetStatus) {
        this.val.isTargetStatus = false
      }
    }
  },

  methods: {
    closeModal() {
      this.form = { ...interfaceForm }
      this.$emit('closeModal')
    },

    onSubmit() {
      if (this.validateForm()) {
        swAlert.confirmSubmit('', 'ยืนยันการโอนสถานะงาน?', async () => {
          await this.submit()
        })
      }
    },

    validateForm() {
      let isValid = true

      if (!this.form.targetStatus) {
        this.val.isTargetStatus = true
        isValid = false
      }

      let statusNotAllow = [49, 54, 55, 59, 69, 79, 84, 85, 94, 500]
      if (statusNotAllow.includes(this.form.targetStatus)) {
        swAlert.warning('ไม่สามารถโอนสถานงานนี้ได้', '', () => {
          isValid = false
        })
      }
      return isValid
    },

    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },

    formatDate(date) {
      return formatDate(date)
    },

    getStatusName(statusId) {
      return this.masterStatus.find((item) => item.id === statusId)?.nameTh || ''
    },

    async onSearchWorker(e) {
      try {
        ////console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null,
            type: this.status,
            active: 1
          }
        }
        const res = await api.jewelry.post('Worker/Search', params, { skipLoading: true })
        if (res) {
          ////console.log(res)
          this.workerItemSearch = [...res.data]
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
      } catch (error) {
        console.log(error)
      }
    },

    async submit() {
      const selectedItems = []
      selectedItems.push(this.model)
      const res = await this.planUpdateStore.submitTransfer({
        formerStatus: this.statusTransferValue,
        targetStatus: this.form.targetStatus,

        selectedItems: [...selectedItems],

        workerName: this.form.worker?.nameTh,
        workerCode: this.form.worker?.code
      })

      if (res.success) {
        this.form = { ...interfaceForm }
        this.$emit('fetch')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.form-col-container-custom {
  display: grid;
  gap: 10px;
  grid-template-columns: 150px 1fr;
}
</style>
