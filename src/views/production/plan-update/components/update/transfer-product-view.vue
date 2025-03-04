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
                    <span class="bi bi-cart-check-fill mr-2"></span>
                    <span>โอนสินค้า</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4">
            <span class="title-text-lg">
              เมื่อดำเนินการโอนสินค้าเสร็จสิ้น แผนการผลิตจะถูกปรับสถานะเป็น 'สำเร็จ'
              ซึ่งไม่สามารถแก้ไขข้อมูลได้อีก
              และจำเป็นต้องดำเนินการตามขั้นตอนถัดไปคือการรับสินค้าเข้าคลังสินค้าในระบบตามกระบวนการที่กำหนดไว้
            </span>
          </div>

          <div class="pr-2">
            <div class="submit-container">
              <button
                :class="['btn btn-sm ml-2 btn-green']"
                style="height: 34px"
                @click="onTransferStatus"
                type="submit"
              >
                <span><i class="bi bi-calendar-check"></i></span>
                <span class="ml-2">โอนสินค้า</span>
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

import swAlert from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

import { usePlanUpdateApiStore } from '@/stores/modules/api/plan-update-store.js'

const interfaceForm = {
  formerStatus: null,
  targetStatus: null,
  name: null,
  isExportTransfer: false,
  job: []
}

const interfaceVal = {
  isTargetStatus: false
}

export default {
  components: {
    modal
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
    }
  },

  data() {
    return {
      form: { ...interfaceForm },
      val: { ...interfaceVal }
    }
  },

  computed: {
    isShowModal() {
      return this.isShow
    },
    model() {
      return this.modelValue
    },
    statusTransfer() {
      return this.statusTransferValue
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
        swAlert.confirmSubmit('', 'ยืนยันการโอนสินค้า?', async () => {
          await this.submit()
        })
      }
    },

    validateForm() {
      let isValid = true

      if (this.statusTransfer !== 95) {
        swAlert.warning('สถาะแผนผลิตไม่ถูกต้อง ไม่สามารถโอนสินค้างานนี้ได้', '', () => {
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

    async submit() {
      const selectedItems = []
      selectedItems.push(this.model)
      const res = await this.planUpdateStore.submitTransfer({
        formerStatus: this.statusTransfer,
        targetStatus: 100,
        selectedItems: [...selectedItems]
      })

      if (res.success) {
        this.form = { ...interfaceForm }
        swAlert.success(`เลขที่แผนรับสินค้า: ${res.receiptNumber}`, 'โอนสินค้าสำเร็จ', () => {
          this.$emit('closeModal', 'go-receipt', res.receiptNumber)
        })
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
