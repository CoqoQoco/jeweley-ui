<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="$emit('search')">
      <div>
        <pageTitle title="ค้นหาใบสั่งผลิต" :isShowBtnClose="false" />

        <div class="form-col-container">
          <div>
            <span class="title-text">รหัสแม่พิมพ์</span>
            <input
              class="form-control bg-input"
              type="text"
              :value="modelForm.moldCode"
              @input="update('moldCode', $event.target.value)"
              placeholder="รหัสแม่พิมพ์"
            />
          </div>

          <div>
            <span class="title-text">สถานะ</span>
            <DropdownGeneric
              :modelValue="modelForm.status"
              :options="masterStore.statuses"
              optionLabel="description"
              optionValue="code"
              placeholder="ทั้งหมด"
              :showClear="true"
              @update:modelValue="update('status', $event)"
            />
          </div>

          <div>
            <span class="title-text">วันที่ออกใบสั่ง</span>
            <div class="flex-group">
              <CalendarGeneric
                class="w-100"
                :modelValue="modelForm.orderDateFrom"
                dateFormat="dd/mm/yy"
                :showIcon="true"
                :manualInput="true"
                placeholder="เริ่มต้น"
                @update:modelValue="update('orderDateFrom', $event)"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                class="w-100"
                :modelValue="modelForm.orderDateTo"
                dateFormat="dd/mm/yy"
                :showIcon="true"
                :manualInput="true"
                placeholder="สิ้นสุด"
                @update:modelValue="update('orderDateTo', $event)"
              />
            </div>
          </div>

          <div class="d-flex align-items-center" style="padding-top: 22px">
            <label class="d-flex align-items-center gap-2 mb-0" style="cursor: pointer">
              <input
                type="checkbox"
                :checked="modelForm.includeCompleted"
                @change="update('includeCompleted', $event.target.checked)"
              />
              <span class="title-text" style="margin-bottom: 0">แสดงรายการที่สร้างแผนครบแล้ว</span>
            </label>
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button class="btn btn-sm btn-main" type="submit" title="ค้นหา">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="$emit('clear')" title="ล้าง">
              <i class="bi bi-x-circle"></i>
            </button>
            <button
              class="btn btn-sm btn-main ml-2"
              type="button"
              title="สร้างใบสั่งผลิต"
              @click="$router.push({ name: 'pre-plan-create' })"
            >
              <i class="bi bi-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import { useMasterPrePlanStore } from '@/stores/modules/api/master/master-pre-plan-store.js'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

export default {
  name: 'FilterBar',
  components: { pageTitle, CalendarGeneric, DropdownGeneric },
  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:modelForm', 'search', 'clear'],
  setup() {
    const masterStore = useMasterPrePlanStore()
    return { masterStore }
  },
  async created() {
    if (!this.masterStore.statuses.length) {
      await this.masterStore.fetchStatuses()
    }
  },
  methods: {
    update(field, value) {
      this.$emit('update:modelForm', { ...this.modelForm, [field]: value })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
