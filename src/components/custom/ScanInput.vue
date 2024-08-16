<template>
  <div class="input-group">
    <input
      type="text"
      class="form-control"
      :style="`background-color: ${!disabled ? background : null}`"
      :id="id"
      :placeholder="placeholder"
      :value="modelValue"
      @input="handleInput"
      @keypress.enter.prevent="onEnter"
      @keydown.space.prevent
      :disabled="disabled"
      @focus="onFocus"
      @blur="onBlur"
    />
    <div class="input-group-append cursor">
      <span @click="onEnter" class="input-group-text bi bi-upc-scan"> </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    documentPrefix: {
      type: String,
      default: 'PO'
    },
    background: {
      type: String,
      default: '#FFC21B'
    },
    id: {
      type: String,
      default: ''
    },
    modelValue: {
      type: String
      // default: "",
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    funcForSingleItem: {
      type: Function,
      default: () => async () => {
        return []
      }
    },
    funcForMultiItems: {
      type: Function,
      default: () => async () => {
        return []
      }
    }
  },
  methods: {
    handleInput(e) {
      this.$emit('update:modelValue', e.target.value)
    },
    onEnter() {
      if (!this.disabled) {
        // Step 1 : Check not blank input
        if (this.modelValue) {
          const propsValue = this.modelValue
          const correctValue = this.modelValue.match(/[0-9A-Za-z]/)
          if (correctValue) {
            const inputScanValue = propsValue.slice(correctValue.index)
            const inputPrefixValue = propsValue.slice(0, correctValue.index)
            const isDocumentFormat = this.documentPrefix === inputPrefixValue
            // Step 3 : Is Correct Document Prefix format
            if (isDocumentFormat) {
              this.funcForMultiItems(inputScanValue)
            } else {
              this.funcForSingleItem(inputScanValue)
            }
          }
        }
      }
    },
    onFocus(event) {
      this.$emit('focus', event)
    },
    onBlur(event) {
      this.$emit('blur', event)
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.input-group-text) {
  border-left: none;
  font-size: 14px;
}

:deep(input) {
  margin-top: 0px !important;
}
</style>
