<template>
  <div>
    <modal
      :showModal="isShow"
      @closeModal="closeModal"
      width="700px"
      :isShowActionPart="true"
    >
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">ย้าย Storage Location</span>
      </template>

      <template #content>
        <div class="p-3">
          <div class="summary-box mb-3">
            <span class="title-text">รายการที่เลือก ({{ selectedItems.length }})</span>
            <div class="summary-list mt-1">
              <span
                v-for="item in selectedItems"
                :key="item.stockNumber"
                class="summary-tag"
              >
                {{ item.stockNumber }}
              </span>
            </div>
          </div>

          <div class="form-row mb-3">
            <div class="form-field">
              <span class="title-text">ย้ายไปที่ (SLOC ปลายทาง) <span class="text-danger">*</span></span>
              <DropdownGeneric
                :modelValue="targetLocationCode"
                :options="locationOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="เลือก Storage Location ปลายทาง"
                :showClear="true"
                @update:modelValue="targetLocationCode = $event"
              />
            </div>
          </div>

          <div class="mb-3">
            <button
              class="btn btn-sm btn-outline-main"
              type="button"
              @click="toggleCreateForm"
            >
              <i :class="showCreateForm ? 'bi bi-dash' : 'bi bi-plus'"></i>
              {{ showCreateForm ? 'ยกเลิกสร้าง SLOC' : '+ สร้าง SLOC ชั่วคราว' }}
            </button>
          </div>

          <div v-if="showCreateForm" class="create-sloc-form p-3 mb-3">
            <h6 class="mb-3">สร้าง SLOC ชั่วคราวใหม่</h6>
            <div class="form-row two-col mb-2">
              <div class="form-field">
                <span class="title-text">รหัส <span class="text-danger">*</span></span>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="newSloc.code"
                  placeholder="เช่น TEMP-001"
                />
              </div>
              <div class="form-field">
                <span class="title-text">ชื่อ <span class="text-danger">*</span></span>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="newSloc.nameTh"
                  placeholder="เช่น บูทงานแฟร์ B"
                />
              </div>
            </div>
            <div class="form-row mb-2">
              <div class="form-field">
                <span class="title-text">ประเภท</span>
                <DropdownGeneric
                  :modelValue="newSloc.type"
                  :options="typeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="TEMP (ชั่วคราว)"
                  :showClear="false"
                  @update:modelValue="newSloc.type = $event"
                />
              </div>
            </div>
            <button class="btn btn-sm btn-green" type="button" @click="onAddSloc">
              <i class="bi bi-plus-circle"></i> เพิ่ม & เลือก
            </button>
          </div>
        </div>
      </template>

      <template #action>
        <button class="btn btn-sm btn-main" type="button" @click="onConfirmMove">
          <i class="bi bi-arrow-left-right"></i> ยืนยันการย้าย
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
import { warning, success, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'
import { useStockMoveLocationApiStore } from '@/stores/modules/api/stock/stock-move-location-api.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

const TYPE_OPTIONS = [
  { value: 'WAREHOUSE', label: 'คลัง' },
  { value: 'SHOWROOM', label: 'โชว์รูม' },
  { value: 'BRANCH', label: 'สาขา' },
  { value: 'TEMP', label: 'ชั่วคราว' }
]

const defaultNewSloc = () => ({
  code: null,
  nameTh: null,
  type: 'TEMP'
})

export default {
  name: 'MoveLocationView',

  components: {
    modal,
    DropdownGeneric
  },

  setup() {
    const locationStore = useStockLocationApiStore()
    const moveStore = useStockMoveLocationApiStore()
    return { locationStore, moveStore }
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    selectedItems: {
      type: Array,
      default: () => []
    }
  },

  emits: ['closeModal', 'fetch'],

  computed: {
    locationOptions() {
      return this.locationStore.all
        .filter((item) => item.isActive)
        .map((item) => ({ value: item.code, label: `${item.code} — ${item.nameTh}` }))
    },

    targetLocationLabel() {
      const found = this.locationOptions.find((o) => o.value === this.targetLocationCode)
      return found ? found.label : this.targetLocationCode
    }
  },

  watch: {
    async isShow(val) {
      if (val) {
        await this.locationStore.fetchAllForMap()
      } else {
        this.reset()
      }
    }
  },

  data() {
    return {
      targetLocationCode: null,
      showCreateForm: false,
      newSloc: defaultNewSloc(),
      typeOptions: TYPE_OPTIONS
    }
  },

  methods: {
    reset() {
      this.targetLocationCode = null
      this.showCreateForm = false
      this.newSloc = defaultNewSloc()
    },

    closeModal() {
      this.reset()
      this.$emit('closeModal')
    },

    toggleCreateForm() {
      this.showCreateForm = !this.showCreateForm
      if (!this.showCreateForm) {
        this.newSloc = defaultNewSloc()
      }
    },

    async onAddSloc() {
      if (!this.newSloc.code || !this.newSloc.code.trim()) {
        warning('กรุณากรอกรหัส SLOC', 'ข้อมูลไม่ครบถ้วน')
        return
      }
      if (!this.newSloc.nameTh || !this.newSloc.nameTh.trim()) {
        warning('กรุณากรอกชื่อ SLOC', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      const newCode = this.newSloc.code
      await this.locationStore.create({
        code: newCode,
        nameTh: this.newSloc.nameTh,
        nameEn: null,
        type: this.newSloc.type || 'TEMP',
        isTemporary: true,
        isActive: true,
        isSalesPoint: true,
        sortOrder: null
      })
      await this.locationStore.fetchAllForMap()
      this.targetLocationCode = newCode
      this.showCreateForm = false
      this.newSloc = defaultNewSloc()
    },

    onConfirmMove() {
      if (!this.targetLocationCode) {
        warning('กรุณาเลือก Storage Location ปลายทาง', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      const count = this.selectedItems.length
      const label = this.targetLocationLabel

      confirmSubmit(
        `ยืนยันย้าย ${count} รายการไปยัง ${label}?`,
        'ยืนยันการย้าย',
        async () => {
          const stockNumbers = this.selectedItems.map((item) => item.stockNumber)
          await this.moveStore.moveLocation({
            stockNumbers,
            targetLocationCode: this.targetLocationCode
          })
          success('ย้าย Storage Location สำเร็จ')
          this.$emit('fetch')
          this.closeModal()
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.summary-box {
  background: #fdf2f2;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
}

.summary-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.summary-tag {
  background: var(--base-font-color);
  color: #fff;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.create-sloc-form {
  border: 1px dashed var(--base-font-color);
  border-radius: 8px;
  background: #fdf9f9;

  h6 {
    color: var(--base-font-color);
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
    background: transparent !important;
  }
}

.form-row {
  margin-bottom: 12px;

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
}
</style>
