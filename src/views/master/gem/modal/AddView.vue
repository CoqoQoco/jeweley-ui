<template>
  <div class="app-container-modal">
    <modal :showModal="isShow" @closeModal="closeModal">
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="title-text-lg">
            <span class="mr-2"><i class="bi bi-journal-text"></i></span>
            <span>
              {{ `เพิ่มพลอย` }}
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
                  required
                />
              </div>
            </div>
            <div class="form-col-container mt-2">
              <!-- name th -->
              <div>
                <div>
                  <span class="title-text">ชื่อไทย</span>
                  <span class="txt-required"> *</span>
                </div>
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
                <div>
                  <span class="title-text">ชื่ออังกฤษ</span>
                  <span class="txt-required"> *</span>
                </div>
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
        code: null,
        nameTh: null,
        nameEn: null
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
        `${this.form.code} : ${this.form.nameTh}`,
        `ยืนยันเพิ่มข้ออมูล`,
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
        nameEn: this.form.nameEn
      }

      const res = await this.masterStore.createListMaster({
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
