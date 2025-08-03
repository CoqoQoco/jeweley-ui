<template>
  <div class="app-container-modal">
    <modal :showModal="isShow" @closeModal="closeModal" width="500px">
      <template v-slot:title>
        <div>
          <div class="title-text-lg-header">
            <span class="bi bi-database-fill-add mr-2"></span>
            <span>เพิ่มพลอย</span>
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
                <span> *</span>
              </div>
              <input
                type="text"
                class="form-control"
                :style="getBgColor(form.code)"
                v-model="form.code"
                placeholder="EX: CZ"
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

            <!-- color -->
            <div class="mt-2">
              <div class="title-text">
                <span>สีพลอย</span>
              </div>
              <input
                type="text"
                class="form-control"
                :style="getBgColor(form.color)"
                v-model="form.color"
                placeholder="EX: พลอยสีแดง"
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

import swAlert from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceForm = {
  code: null,
  nameTh: null,
  nameEn: null,
  color: null,
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
        ...interfaceForm
      },

      //wording
      txtConfirmSubmit: 'ยืนยันเพิ่มพลอย'
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
    async submit() {
      this.isLoading = true

      const param = {
        type: 'GEM',
        code: this.form.code,
        nameTh: this.form.nameTh,
        nameEn: this.form.nameEn,
        color: this.form.color
      }

      const res = await this.masterStore.createListMaster({
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
      this.form = {
        code: null,
        nameTh: null,
        nameEn: null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
