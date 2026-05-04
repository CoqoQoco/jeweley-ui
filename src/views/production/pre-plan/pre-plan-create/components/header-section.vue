<template>
  <div class="card p-3">
    <h6 class="mb-3">ข้อมูลใบสั่งผลิต</h6>
    <div class="responsive-grid-2col mb-2">
      <div>
        <span class="title-text">เลขที่ใบสั่ง <span class="text-danger">*</span></span>
        <input class="form-control" v-model="localForm.orderNo" placeholder="เช่น 6903009" />
      </div>
      <div>
        <span class="title-text">ผลิตครั้งที่</span>
        <input
          class="form-control"
          type="number"
          v-model.number="localForm.productionRound"
          min="1"
        />
      </div>
    </div>

    <div class="mb-2">
      <span class="title-text">ประเภทงาน <span class="text-danger">*</span></span>
      <div class="d-flex gap-3 mt-1 flex-wrap">
        <div v-for="jt in jobTypes" :key="jt.value" class="form-check">
          <input
            class="form-check-input"
            type="radio"
            :value="jt.value"
            v-model="localForm.jobType"
            :id="'jt-' + jt.value"
          />
          <label class="form-check-label" :for="'jt-' + jt.value">{{ jt.label }}</label>
        </div>
      </div>
    </div>

    <div class="mb-2">
      <span class="title-text">สถานที่</span>
      <div class="d-flex gap-3 mt-1">
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            value="Domestic"
            v-model="localForm.jobLocation"
            id="loc-domestic"
          />
          <label class="form-check-label" for="loc-domestic">งานในประเทศ</label>
        </div>
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            value="Overseas"
            v-model="localForm.jobLocation"
            id="loc-overseas"
          />
          <label class="form-check-label" for="loc-overseas">งานต่างประเทศ</label>
        </div>
      </div>
    </div>

    <div class="responsive-grid-2col mb-2">
      <div>
        <span class="title-text">วันที่ออกใบสั่ง <span class="text-danger">*</span></span>
        <CalendarGeneric
          v-model="localForm.orderDate"
          placeholder="เลือกวันที่ออกใบสั่ง"
          :showIcon="true"
        />
      </div>
      <div>
        <span class="title-text">วันที่ส่งงาน <span class="text-danger">*</span></span>
        <CalendarGeneric
          v-model="localForm.deliveryDate"
          placeholder="เลือกวันที่ส่งงาน"
          :showIcon="true"
        />
      </div>
    </div>

    <div class="mb-2">
      <span class="title-text">หมายเหตุ</span>
      <textarea
        class="form-control"
        v-model="localForm.remark"
        rows="2"
        placeholder="หมายเหตุ เช่น part-128 หูจี้, PART-795"
      ></textarea>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const CalendarGeneric = defineAsyncComponent(
  () => import('@/components/prime-vue/CalendarGeneric.vue')
)

export default {
  name: 'HeaderSection',
  components: { CalendarGeneric },
  props: {
    form: { type: Object, required: true },
  },
  emits: ['update:form'],
  data() {
    return {
      jobTypes: [
        { value: 'NewDesign', label: 'งานแบบใหม่' },
        { value: 'Sale', label: 'งานขาย' },
        { value: 'CustomCustomer', label: 'งานสั่งมีชื่อลูกค้า' },
      ],
    }
  },
  computed: {
    localForm: {
      get() {
        return this.form
      },
      set(val) {
        this.$emit('update:form', val)
      },
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>
