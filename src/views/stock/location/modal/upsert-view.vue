<template>
  <div>
    <modal
      :showModal="isShow"
      @closeModal="closeModal"
      width="600px"
      :isShowActionPart="true"
    >
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">
          {{ isEditMode ? 'แก้ไข Storage Location' : 'สร้าง Storage Location' }}
        </span>
      </template>

      <template #content>
        <div class="p-3">
          <div class="form-row two-col">
            <div class="form-field">
              <span class="title-text">รหัส <span class="text-danger">*</span></span>
              <input
                type="text"
                class="form-control"
                v-model.trim="form.code"
                placeholder="เช่น MAIN, SHOW-01"
                :disabled="isEditMode"
              />
            </div>
            <div class="form-field">
              <span class="title-text">ลำดับ</span>
              <input
                type="number"
                class="form-control"
                v-model.number="form.sortOrder"
                placeholder="เช่น 1"
                min="0"
              />
            </div>
          </div>

          <div class="form-row two-col">
            <div class="form-field">
              <span class="title-text">ชื่อ (TH) <span class="text-danger">*</span></span>
              <input
                type="text"
                class="form-control"
                v-model.trim="form.nameTh"
                placeholder="เช่น คลังหลัก"
              />
            </div>
            <div class="form-field">
              <span class="title-text">ชื่อ (EN)</span>
              <input
                type="text"
                class="form-control"
                v-model.trim="form.nameEn"
                placeholder="เช่น Main Warehouse"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <span class="title-text">ประเภท</span>
              <DropdownGeneric
                :modelValue="form.type"
                :options="typeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="เลือกประเภท"
                :showClear="true"
                @update:modelValue="form.type = $event"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="d-flex" style="gap: 24px; flex-wrap: wrap;">
              <div class="d-flex align-items-center">
                <input
                  type="checkbox"
                  id="chk-sales-point"
                  v-model="form.isSalesPoint"
                  class="mr-2"
                />
                <label for="chk-sales-point" class="title-text mb-0">จุดขาย</label>
              </div>
              <div class="d-flex align-items-center">
                <input
                  type="checkbox"
                  id="chk-temporary"
                  v-model="form.isTemporary"
                  class="mr-2"
                />
                <label for="chk-temporary" class="title-text mb-0">ชั่วคราว</label>
              </div>
              <div class="d-flex align-items-center">
                <input
                  type="checkbox"
                  id="chk-active"
                  v-model="form.isActive"
                  class="mr-2"
                />
                <label for="chk-active" class="title-text mb-0">ใช้งาน</label>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #action>
        <button class="btn btn-sm btn-main" type="button" @click="onSubmit">
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
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import { warning, success } from '@/services/alert/sweetAlerts.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

const TYPE_OPTIONS = [
  { value: 'WAREHOUSE', label: 'คลัง' },
  { value: 'SHOWROOM', label: 'โชว์รูม' },
  { value: 'BRANCH', label: 'สาขา' },
  { value: 'TEMP', label: 'ชั่วคราว' }
]

const defaultForm = () => ({
  code: null,
  nameTh: null,
  nameEn: null,
  type: null,
  isSalesPoint: false,
  isTemporary: false,
  isActive: true,
  sortOrder: null
})

export default {
  name: 'UpsertView',

  components: {
    modal,
    DropdownGeneric
  },

  setup() {
    const locationStore = useStockLocationApiStore()
    return { locationStore }
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    modelData: {
      type: Object,
      default: null
    }
  },

  emits: ['closeModal', 'fetch'],

  computed: {
    isEditMode() {
      return !!this.modelData?.code
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        if (this.modelData) {
          this.form = { ...defaultForm(), ...this.modelData }
        } else {
          this.form = defaultForm()
        }
      }
    }
  },

  data() {
    return {
      form: defaultForm(),
      typeOptions: TYPE_OPTIONS
    }
  },

  methods: {
    closeModal() {
      this.form = defaultForm()
      this.$emit('closeModal')
    },

    async onSubmit() {
      if (!this.form.nameTh || !this.form.nameTh.trim()) {
        warning('กรุณากรอกชื่อ Storage Location', 'ข้อมูลไม่ครบถ้วน')
        return
      }
      if (!this.form.code || !this.form.code.trim()) {
        warning('กรุณากรอกรหัส Storage Location', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      if (this.isEditMode) {
        await this.locationStore.update({ ...this.form })
      } else {
        await this.locationStore.create({ ...this.form })
      }
      success('บันทึกสำเร็จ')
      this.$emit('fetch')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.form-row {
  margin-bottom: 16px;

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
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

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
}
</style>
