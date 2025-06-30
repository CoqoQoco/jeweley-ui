<template>
  <div class="d-flex justify-content-center">
    <input
      v-if="!data.isReceipt"
      class="form-control form-control-sm"
      :style="getBgColor(data.isReceipt, data.productNumber)"
      type="text"
      :value="data.productNumber"
      @input="$emit('update', 'productNumber', $event.target.value)"
      :required="isRequiredField(data)"
      :disabled="data.isReceipt"
    />
    <span v-else>{{ data.productNumber }}</span>
  </div>
</template>

<script>
export default {
  name: 'ProductNumberField',
  
  props: {
    data: {
      type: Object,
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

  emits: ['update']
}
</script>