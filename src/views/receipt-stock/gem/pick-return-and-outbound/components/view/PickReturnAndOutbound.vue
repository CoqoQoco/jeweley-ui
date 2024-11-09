<template>
    <div>
      <modal :showModal="isShow" @closeModal="closeModal">
        <template v-slot:content> </template>
      </modal>
    </div>
  </template>
  
  <script>
  import { defineAsyncComponent } from 'vue'
  
  const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
  
  export default {
    components: {
      modal,
    },
    props: {
      isShowModal: {
        type: Boolean,
        required: true,
        default: false
      },
      modelValue: {
        type: Object,
        required: true,
        default: () => ({})
      }
    },
    computed: {
      isShow() {
        return this.isShow
      },
      model() {
        return this.modelValue
      }
    },
    data() {
      return {
        isLoading: false
      }
    },
    methods: {
      // ----- event
      closeModal() {
        this.$emit('closeModal')
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  @import '@/assets/scss/custom-style/standard-data-table';
  </style>
  