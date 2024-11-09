<template>
  <div>
    <modal :showModal="isShow" @closeModal="closeModal">
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="title-text-lg">
            <span class="mr-2"><i class="bi bi-journal-text"></i></span>
            <span>ระบุข้อมูลใหม่</span>
          </div>
          <div class="form-col-container">
            <div>
              <div>
                <span class="title-text">รหัส</span>
                <span class="txt-required"> *</span>
              </div>
              <input
                type="text"
                class="form-control"
                :class="form.code ? `` : `bg-warning`"
                v-model="form.code"
                required
              />
            </div>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

const interfaceForm = {
  code: null
}

export default {
  components: {
    modal,
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  data() {
    return {
      isLoading: false,
      form: { ...interfaceForm }
    }
  },
  methods: {
    // ---------------- event
    closeModal() {
      this.$emit('closeModal', 'create')
    },
    onSubmit() {
      console.log('onSubmit')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
