<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal">
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="title-text-lg">
            <span class="mr-2"><i class="bi bi-journal-text"></i></span>
            <span>
              {{ `เเก้ไขพลอย: ${model.code}-${model.nameTh}` }}
            </span>
          </div>
          <div class="p-2">
            <div class="form-col-container">
              <!-- code -->
              <div>
                <div>
                  <span class="title-text">รหัส</span>
                  <span class="txt-required"> *</span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  :class="form.code ? `` : `bg-warning`"
                  v-model="form.code"
                  disabled
                  required
                />
              </div>
            </div>
            <div class="form-col-container mt-2">
              <!-- name th -->
              <div>
                <span class="title-text">ชื่อไทย</span>
                <input
                  type="text"
                  class="form-control"
                  :class="form.nameTh ? `` : `bg-warning`"
                  v-model="form.nameTh"
                  required
                />
              </div>

              <!-- name en -->
              <div>
                <span class="title-text">ชื่ออังกฤษ</span>
                <input
                  type="text"
                  class="form-control"
                  :class="form.nameEn ? `` : `bg-warning`"
                  v-model="form.nameEn"
                  required
                />
              </div>
            </div>

            <div class="d-flex justify-content-end mt-2">
              <button class="btn btn-sm btn-main" type="submit">
                <!-- <span class="mr-2">
                  <i class="bi bi-gem"></i>
                </span> -->
                <span>ยืนยัน</span>
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

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceForm = {
  code: null,
  nameTh: null,
  nameEn: null
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
      }
    }
  },
  methods: {
    closeModal() {
      this.onclear()
      this.$emit('closeModal')
    },
    onSubmit() {
      swAlert.confirmSubmit(
        `${this.model.code} : ${this.form.nameTh}`,
        `ยืนยันเเก้ไขข้อมูล`,
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
        id: this.model.id,
        code: this.model.code,
        nameTh: this.form.nameTh,
        nameEn: this.form.nameEn
      }

      const res = await this.masterStore.updateListMaster({
        form: param
      })

      if (res) {
        swAlert.success(
          ``,
          ``,
          async () => {
            this.onclear()
            this.$emit('closeModal', 'fetch')
          },
          null,
          null
        )
      }
    },
    onclear() {
      this.form = { ...interfaceForm }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
