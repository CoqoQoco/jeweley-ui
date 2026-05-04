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
            <select
              class="form-select"
              :value="modelForm.status"
              @change="update('status', $event.target.value || null)"
            >
              <option value="">ทั้งหมด</option>
              <option value="Draft">ร่าง</option>
              <option value="Submitted">รออนุมัติ</option>
              <option value="Approved">อนุมัติแล้ว</option>
              <option value="Rejected">ปฏิเสธ</option>
              <option value="Consumed">ส่งผลิตแล้ว</option>
            </select>
          </div>

          <div>
            <span class="title-text">วันที่ออกใบสั่ง</span>
            <div class="flex-group">
              <Calendar
                class="w-100"
                :modelValue="modelForm.orderDateFrom"
                @update:modelValue="update('orderDateFrom', $event)"
                :manualInput="true"
                showIcon
                placeholder="เริ่มต้น"
                dateFormat="dd/mm/yy"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <Calendar
                class="w-100"
                :modelValue="modelForm.orderDateTo"
                @update:modelValue="update('orderDateTo', $event)"
                :manualInput="true"
                showIcon
                placeholder="สิ้นสุด"
                dateFormat="dd/mm/yy"
              />
            </div>
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหา">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="$emit('clear')" title="ล้าง">
              <i class="bi bi-x-circle"></i>
            </button>
            <button
              class="btn btn-sm btn-main"
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
import Calendar from 'primevue/calendar'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

export default {
  name: 'FilterBar',
  components: { pageTitle, Calendar },
  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:modelForm', 'search', 'clear'],
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
