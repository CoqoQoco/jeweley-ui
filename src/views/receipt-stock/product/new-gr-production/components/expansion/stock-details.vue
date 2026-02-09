<template>
  <div class="p-2 filter-container-bg-focus">
    <!-- Quantity and Price -->
    <div class="form-col-container">
      <div>
        <div>
          <span class="title-text">จำนวน</span>
          <span class="title-text"> *</span>
        </div>
        <input
          class="form-control form-control-sm"
          :style="getBgColor(slotProps.data.isReceipt, slotProps.data.qty)"
          type="number"
          step="any"
          min="0"
          v-model="slotProps.data.qty"
          :required="isRequiredField(slotProps.data)"
        />
      </div>

      <div>
        <div>
          <span class="title-text">ราคาขาย</span>
          <span class="title-text"> *</span>
        </div>
        <input
          class="form-control form-control-sm"
          :style="getBgColor(slotProps.data.isReceipt, slotProps.data.price)"
          type="number"
          step="any"
          min="0"
          v-model="slotProps.data.price"
          :required="isRequiredField(slotProps.data)"
        />
      </div>
    </div>

    <!-- Size and Stud Earring -->
    <div class="form-col-container mt-2">
      <div class="form-col-sm-container">
        <div>
          <div>
            <span class="title-text">ขนาด</span>
          </div>
          <input
            type="text"
            class="form-control form-control-sm"
            v-model="slotProps.data.size"
            :required="isRequiredField(slotProps.data, true)"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
        </div>

        <div>
          <div>
            <span class="title-text">แป้นต่างหู</span>
          </div>
          <Dropdown
            v-model="slotProps.data.studEarring"
            :options="masterStud"
            optionLabel="description"
            optionValue="value"
            class="w-full md:w-14rem"
            placeholder="เลือกแป้นต่างหู"
            :showClear="slotProps.data.studEarring ? true : false"
            style="height: 31px !important"
            :disabled="!requiredStud"
          />
        </div>
      </div>

      <!-- Location -->
      <div>
        <div>
          <span class="title-text">คลังจัดเก็บ</span>
        </div>
        <input
          type="text"
          class="form-control form-control-sm"
          v-model="slotProps.data.location"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          disabled
        />
      </div>
    </div>

    <!-- Remark -->
    <div class="form-col-container mt-2">
      <div>
        <div>
          <span class="title-text">หมายเหตุ</span>
        </div>
        <textarea
          type="text"
          class="form-control form-control-sm mt-1"
          v-model="slotProps.data.remark"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Dropdown from 'primevue/dropdown'

export default {
  name: 'StockDetails',

  components: {
    Dropdown
  },

  props: {
    slotProps: {
      type: Object,
      required: true
    },
    masterStud: {
      type: Array,
      required: true
    },
    requiredStud: {
      type: Boolean,
      required: true
    },
    getBgColor: {
      type: Function,
      required: true
    },
    isRequiredField: {
      type: Function,
      required: true
    }
  },

  emits: ['selectImage']
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.form-col-sm-container {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr 1fr;
}

.title-text {
  font-weight: 500;
  color: var(--base-font-color);
}
</style>