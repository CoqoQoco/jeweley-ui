<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="500px">
      <template v-slot:title>
        <div>
          <div class="title-text-lg-header">
            <span class="bi bi-database-fill-gear mr-2"></span>
            <span> {{ `เเก้ไขประเภทสินค้า: ${model.code}-${model.nameTh}` }}</span>
          </div>
        </div>
      </template>

      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="p-2">
            <!-- code -->
            <div class="form-col-sm-container">
              <div>
                <div class="title-text">
                  <span>รหัส</span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.code"
                  placeholder="EX: B"
                  disabled
                  required
                />
              </div>
            </div>

            <!-- name th -->
            <div class="mt-2">
              <div>
                <div class="title-text">
                  <span>ชื่อ TH</span>
                  <span> *</span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  :style="getBgColor(form.nameTh)"
                  v-model="form.nameTh"
                  placeholder="EX: สร้อยข้อมือ"
                  required
                />
              </div>
            </div>

            <!-- name en -->
            <div class="mt-2">
              <div>
                <div class="title-text">
                  <span>ชื่อ EN</span>
                  <span> *</span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  :style="getBgColor(form.nameEn)"
                  v-model="form.nameEn"
                  placeholder="EX: Bracelet"
                  required
                />
              </div>
            </div>

            <!-- prefix -->
            <div class="mt-2">
              <div>
                <div class="title-text">
                  <span>อักษรหน้าสินค้า</span>
                  <span> *</span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  :style="getBgColor(form.prefix)"
                  v-model="form.prefix"
                  placeholder="EX: DK"
                  required
                />
              </div>
            </div>


            <div class="mt-2">
              <div>
                <div class="title-text">
                  <span>อักษรหน้าสินค้า (Silver)</span>
                  <span> *</span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  :style="getBgColor(form.prefix2)"
                  v-model="form.prefix2"
                  placeholder="EX: DK"
                  required
                />
              </div>
            </div>

            <div class="submit-container">
              <button class="btn btn-sm btn-main" type="submit">
                <span><i class="bi bi-calendar-check"></i></span>
                <!-- <span>เพิ่มพลอย</span> -->
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

const interfaceFrom = {
  code: null,
  nameTh: null,
  nameEn: null,
  prefix: null
}

export default {
  components: { modal },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
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
          this.form = {}
        }
      },
      deep: true, // ถ้าต้องการ watch การเปลี่ยนแปลงของ nested properties
      immediate: true // ถ้าต้องการให้ทำงานทันทีตอน component ถูกสร้าง
    }
  },

  data() {
    return {
      form: {
        ...interfaceFrom
      },

      //wording
      txtConfirmSubmit: 'ยืนยันเเก้ไขประเภทสินค้า'
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
        `${this.form.code} : ${this.form.nameTh}`,
        this.txtConfirmSubmit,
        async () => {
          await this.submit()
        },
        null,
        null
      )
    },
    onClear() {
      this.form = {
        ...interfaceFrom
      }
    },
    async submit() {
      const param = {
        type: 'PRODUCT-TYPE',
        ...this.form
      }
      const res = await this.masterStore.updateMaster({
        formValue: param,
        skipLoading: false
      })

      if (res) {
        this.onClear()
        this.$emit('fetch')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
