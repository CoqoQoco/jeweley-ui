<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="500px">
      <template v-slot:title>
        <div>
          <div class="title-text-lg-header">
            <span class="bi bi-database-fill-add mr-2"></span>
            <span>เพิ่มรูปร่างพลอย</span>
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
                  <span> *</span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  :style="getBgColor(form.code)"
                  v-model="form.code"
                  placeholder="EX: OG"
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
                  placeholder="EX: สี่เหลี่ยมตัดมุม"
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
                  placeholder="EX: Octagon"
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
  props: {
    isShow: {
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

      //wording
      txtConfirmSubmit: 'ยืนยันเพิ่มรูปร่างพลอย'
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
        type: 'GEM-SHAPE',
        ...this.form
      }
      const res = await this.masterStore.createMaster({
        formValue: param,
        skipLoading: false
      })

      if (res) {
        this.onClear()
        this.$emit('fetch', this.form)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
