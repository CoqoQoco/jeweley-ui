<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal" width="500px" :isShowActionPart="true">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ `แก้ไขพลอย: ${model.code}-${model.nameTh}` }}</span>
      </template>

      <template #content>
        <form @submit.prevent="onSubmit" id="form-gem-update">
          <div class="p-3">
            <div class="form-row">
              <div class="form-field">
                <span class="title-text">รหัส</span>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.code"
                  placeholder="EX: CZ"
                  disabled
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <span class="title-text">ชื่อ TH <span class="text-danger">*</span></span>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.nameTh"
                  placeholder="EX: ทับทิมแดง"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <span class="title-text">ชื่อ EN <span class="text-danger">*</span></span>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.nameEn"
                  placeholder="EX: Ruby"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <span class="title-text">สีพลอย</span>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.color"
                  placeholder="EX: พลอยสีแดง"
                />
              </div>
            </div>
          </div>
        </form>
      </template>

      <template #action>
        <button class="btn btn-sm btn-main" type="submit" form="form-gem-update">
          <i class="bi bi-save"></i> บันทึก
        </button>
        <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="closeModal">
          ยกเลิก
        </button>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import swAlert from '@/services/alert/sweetAlerts.js'

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
          this.form = {}
        }
      },
      deep: true,
      immediate: true
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
      txtConfirmSubmit: 'ยืนยันแก้ไขข้อมูล'
    }
  },
  methods: {
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
@import '@/assets/scss/responsive-style/web';

.form-row {
  margin-bottom: 12px;
}

.form-field {
  width: 100%;

  .title-text {
    display: block;
    margin-bottom: 6px;
  }
}

input.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.4;

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }
}
</style>
