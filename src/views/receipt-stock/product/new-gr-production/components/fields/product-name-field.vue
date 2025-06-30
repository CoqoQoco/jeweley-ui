<template>
  <div class="d-flex justify-content-center">
    <div v-if="!data.isReceipt" class="input-group input-group-sm">
      <div class="input-group input-group-inner">
        <input
          class="form-control"
          :style="getBgColor(data.isReceipt, productNameValue)"
          type="text"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :value="productNameValue"
          @input="updateProductName($event.target.value)"
          :required="isRequiredField(data)"
          :disabled="data.isReceipt"
        />
        <div class="input-group-append mr-1">
          <button
            type="button"
            class="btn btn-green btn-sm btn-input-group"
            style="height: 35px !important; margin-top: 5px"
            @click="onSearch"
          >
            <span class="bi bi-search"></span>
          </button>
        </div>
      </div>
    </div>
    <span v-else>{{ productNameValue }}</span>
  </div>
</template>

<script>
export default {
  name: 'ProductNameField',
  
  props: {
    data: {
      type: Object,
      required: true
    },
    language: {
      type: String,
      required: true,
      validator: (value) => ['EN', 'TH'].includes(value)
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

  emits: ['search', 'update'],

  computed: {
    productNameValue() {
      return this.language === 'EN' ? this.data.productNameEN : this.data.productNameTH
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.data, this.language)
    },
    
    updateProductName(value) {
      const field = this.language === 'EN' ? 'productNameEN' : 'productNameTH'
      this.$emit('update', field, value)
    }
  }
}
</script>

<style lang="scss" scoped>
.input-group-prepend .btn,
.input-group-append .btn {
  position: relative;
  z-index: 0 !important;
}
</style>