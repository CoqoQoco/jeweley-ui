<template>
  <div class="d-flex justify-content-center">
    <input
      v-if="!data.isReceipt"
      class="form-control form-control-sm"
      :style="getBgColor(data.isReceipt, data.moldDesign)"
      type="text"
      :value="data.moldDesign"
      @input="$emit('update', 'moldDesign', $event.target.value)"
      :required="isRequiredField(data)"
      :disabled="data.isReceipt"
    />
    <span v-else>{{ data.moldDesign }}</span>
  </div>
</template>

<script>
export default {
  name: 'MoldDesignField',
  
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