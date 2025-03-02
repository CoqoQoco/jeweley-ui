<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="500px">
      <template v-slot:title>
        <div>
          <div class="title-text-lg-header">
            <span class="bi bi-database-fill-gear mr-2"></span>
            <span> {{ `เเก้ไขพลอย: ${model.code}-${model.nameTh}` }}</span>
          </div>
        </div>
      </template>

      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="p-2">
            <!-- code -->
            <div>
              <div class="title-text">
                <span>รหัส</span>
              </div>
              <input
                type="text"
                class="form-control"
                v-model="form.code"
                placeholder="EX: CZ"
                disabled
                required
              />
            </div>

            <!-- name th -->
            <div class="mt-2">
              <div class="title-text">
                <span>ชื่อ TH</span>
                <span> *</span>
              </div>
              <input
                type="text"
                class="form-control"
                :style="getBgColor(form.nameTh)"
                v-model="form.nameTh"
                placeholder="EX: ทับทิมเเดง"
                required
              />
            </div>

            <!-- name en -->
            <div class="mt-2">
              <div class="title-text">
                <span>ชื่อ EN</span>
                <span> *</span>
              </div>
              <input
                type="text"
                class="form-control"
                :style="getBgColor(form.nameEn)"
                v-model="form.nameEn"
                placeholder="EX: Ruby"
                required
              />
            </div>

            <div class="submit-container">
              <button class="btn btn-sm btn-main" type="submit">
                <span><i class="bi bi-calendar-check"></i></span>
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
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

import swAlert from '@/services/alert/sweetAlerts.js'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceForm = {
  code: null,
  nameTh: null,
  nameEn: null,
  prefix: null
}
export default {
  components: { modal },
  props: {
    isShow: {
      type: Boolean,
      default: false,
      required: true
    },
    modelUpdate: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  computed: {
    model() {
      return this.modelUpdate
    }
  },

  watch: {
    modelUpdate: {
      handler(newVal) {
        if (newVal) {
          this.form = { ...newVal }
        } else {
          // กรณี modelUpdate เป็น null/undefined ให้ reset form
          this.form = {} // หรือค่าเริ่มต้นที่ต้องการ
        }
      },
      deep: true, // ถ้าต้องการ watch การเปลี่ยนแปลงของ nested properties
      immediate: true // ถ้าต้องการให้ทำงานทันทีตอน component ถูกสร้าง
    }
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  data() {
    return {
      form: {
        ...interfaceForm
      },

      //wording
      txtConfirmSubmit: 'ยืนยันเเก้ไขข้อมูล'
    }
  },
  methods: {
    getBgColor(data) {
      return data ? 'background-color: #b5dad4' : 'background-color: #dad4b5'
    },

    closeModal() {
      this.onClear()
      this.$emit('closeModal')
    },
    onSubmit() {
      swAlert.confirmSubmit(
        `${this.model.code} : ${this.form.nameTh}`,
        this.txtConfirmSubmit,
        async () => {
          await this.submit()
        },
        null,
        null
      )
    },
    async submit() {
      const param = {
        type: 'GEM',
        ...this.form
      }

      const res = await this.masterStore.updateListMaster({
        form: param
      })

      if (res) {
        swAlert.success(
          ``,
          ``,
          async () => {
            this.onClear()
            this.$emit('closeModal', 'fetch')
          },
          null,
          null
        )
      }
    },
    onClear() {
      this.form = { ...interfaceForm }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
