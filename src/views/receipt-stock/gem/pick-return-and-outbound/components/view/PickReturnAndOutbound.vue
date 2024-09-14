<template>
    <div>
      <loading :isLoading="isLoading"></loading>
      <modal :showModal="isShow" @closeModal="closeModal">
        <template v-slot:content> </template>
      </modal>
    </div>
  </template>
  
  <script>
  import { defineAsyncComponent } from 'vue'
  
  const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
  const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
  
  export default {
    components: {
      modal,
      loading
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
  