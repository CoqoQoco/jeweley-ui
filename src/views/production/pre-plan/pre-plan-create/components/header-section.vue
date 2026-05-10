<template>
  <div class="header-section-card">
    <pageTitle title="ข้อมูลใบสั่งผลิต" :isShowBtnClose="false" />

    <div class="form-row two-col">
      <div class="form-row two-col">
        <div class="form-field">
          <span class="title-text">ผลิตครั้งที่</span>
          <input
            class="form-control"
            type="number"
            v-model.number="localForm.productionRound"
            min="1"
          />
        </div>
        <div class="form-field">
          <span class="title-text">ประเภททอง/เงิน <span class="text-danger">*</span></span>
          <DropdownGeneric
            :modelValue="localForm.goldType"
            :options="goldTypes"
            optionLabel="description"
            optionValue="code"
            placeholder="เลือกประเภททอง/เงิน"
            @update:modelValue="update('goldType', $event)"
          />
        </div>
      </div>
    </div>
    <div></div>

    <div class="form-row four-col">
      <div class="form-field">
        <span class="title-text">ประเภทงาน <span class="text-danger">*</span></span>
        <DropdownGeneric
          :modelValue="localForm.jobType"
          :options="jobTypes"
          optionLabel="description"
          optionValue="code"
          placeholder="เลือกประเภทงาน"
          @update:modelValue="update('jobType', $event)"
        />
      </div>
      <div class="form-field">
        <span class="title-text">สถานที่</span>
        <DropdownGeneric
          :modelValue="localForm.jobLocation"
          :options="jobLocations"
          optionLabel="description"
          optionValue="code"
          placeholder="เลือกสถานที่"
          @update:modelValue="update('jobLocation', $event)"
        />
      </div>
      <div class="form-field">
        <span class="title-text">วันที่ออกใบสั่ง <span class="text-danger">*</span></span>
        <CalendarGeneric
          v-model="localForm.orderDate"
          placeholder="เลือกวันที่ออกใบสั่ง"
          :showIcon="true"
        />
      </div>
      <div class="form-field">
        <span class="title-text">วันที่ส่งงาน <span class="text-danger">*</span></span>
        <CalendarGeneric
          v-model="localForm.deliveryDate"
          placeholder="เลือกวันที่ส่งงาน"
          :showIcon="true"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-field">
        <span class="title-text">หมายเหตุ</span>
        <textarea
          class="form-control"
          v-model="localForm.remark"
          rows="3"
          placeholder="หมายเหตุ เช่น part-128 หูจี้, PART-795"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const DropdownGeneric = defineAsyncComponent(() =>
  import('@/components/prime-vue/DropdownGeneric.vue')
)
const CalendarGeneric = defineAsyncComponent(() =>
  import('@/components/prime-vue/CalendarGeneric.vue')
)

export default {
  name: 'HeaderSection',
  components: { pageTitle, DropdownGeneric, CalendarGeneric },
  props: {
    form: { type: Object, required: true },
    jobTypes: { type: Array, default: () => [] },
    jobLocations: { type: Array, default: () => [] },
    goldTypes: { type: Array, default: () => [] }
  },
  emits: ['update:form'],
  computed: {
    localForm: {
      get() {
        return this.form
      },
      set(val) {
        this.$emit('update:form', val)
      }
    }
  },
  methods: {
    update(field, value) {
      this.$emit('update:form', { ...this.form, [field]: value })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

input {
  margin-top: 5px !important;
}

.header-section-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  padding: 20px;
  background: #ffffff;
}

.form-row {
  margin-bottom: 10px;

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  &.four-col {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  @media (max-width: 1024px) {
    &.two-col {
      grid-template-columns: 1fr;
    }
    &.four-col {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 600px) {
    &.four-col {
      grid-template-columns: 1fr;
    }
  }
}

.form-field {
  width: 100%;

  .title-text {
    display: block;
    font-weight: 500;
    //margin-bottom: 6px;
  }

  input.form-control,
  textarea.form-control {
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

  textarea.form-control {
    resize: vertical;
  }
}
</style>
