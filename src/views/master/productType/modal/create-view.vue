<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="500px">
      <template v-slot:title>
        <div class="filter-container-highlight">
          <div class="title-text-lg-header">
            <span class="bi bi-database-fill-add mr-2"></span>
            <span>เพิ่มประเภทสินค้า</span>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <!-- code -->
          <div class="form-col-sm-container">
            <div>
              <span class="title-text">รหัส</span>
              <input
                type="text"
                class="form-control"
                v-model="form.code"
                placeholder="EX: B"
                required
              />
            </div>
          </div>

          <!-- name th -->
          <div class="form-col-sm-container mt-2">
            <div>
              <span class="title-text">ชื่อไทย</span>
              <input
                type="text"
                class="form-control"
                v-model="form.nameTh"
                placeholder="EX: สร้อยข้อมือ"
                required
              />
            </div>
          </div>

          <!-- name en -->
          <div class="form-col-sm-container mt-2">
            <div>
              <span class="title-text">ชื่ออังกฤษ</span>
              <input
                type="text"
                class="form-control"
                v-model="form.nameEn"
                placeholder="EX: Bracelet"
                required
              />
            </div>
          </div>

          <!-- prefix -->
          <div class="form-col-sm-container mt-2">
            <div>
              <span class="title-text">อักษรหน้าสินค้า</span>
              <input
                type="text"
                class="form-control"
                v-model="form.prefix"
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
  props: {
    isShowModal: {
      type: Boolean,
      default: false
    }
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  data() {
    return {
      form: {
        ...interfaceFrom
      },

      ///wording
      txtConfirmSubmit: 'ยืนยันเพิ่มประเภทสินค้า'
    }
  },

  methods: {
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
      const res = await this.masterStore.createMaster({
        formValue: param,
        skipLoading: false
      })

      if (res) {
        this.$emit('fetch', this.form)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
