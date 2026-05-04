<template>
  <div class="card p-3">
    <h6 class="mb-3">ประเภททอง <span class="text-danger">*</span></h6>
    <div class="d-flex gap-3 flex-wrap">
      <div v-for="gt in goldTypes" :key="gt.value" class="form-check">
        <input
          class="form-check-input"
          type="radio"
          :value="gt.value"
          :id="'gt-' + gt.value"
          v-model="localGoldType"
        />
        <label class="form-check-label" :for="'gt-' + gt.value">{{ gt.label }}</label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoldSection',
  props: {
    goldType: { type: String, default: '18K' },
  },
  emits: ['update:goldType'],
  data() {
    return {
      goldTypes: [
        { value: '18K', label: '18K' },
        { value: '14K', label: '14K' },
        { value: '9K', label: '9K' },
        { value: 'Silver', label: 'เงิน' },
      ],
    }
  },
  computed: {
    localGoldType: {
      get() {
        return this.goldType
      },
      set(val) {
        this.$emit('update:goldType', val)
      },
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>
