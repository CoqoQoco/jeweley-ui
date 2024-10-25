<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <div class="filter-container-searchBar">
      <pageTitle
        :title="title"
        description="ตรวจสอบจำนวนคงคลัง ราคา รายละเอียดต่างๆ ของวัถุดิบ"
        :isShowBtnClose="false"
        :isShowRightSlot="true"
      >
        <template #rightSlot>
          <div v-if="isShow.searchBtn">
            <button class="btn btn-sm btn-main" title="ค้นหาสินค้า" @click="onShowSearch">
              <span class="bi bi-search"></span>
            </button>
          </div>
        </template>
      </pageTitle>
    </div>

    <!-- modal search -->
    <modal :showModal="isShow.searchModal" @closeModal="closeModal">
      <template v-slot:content>
        <form @submit.prevent="onSubmit">
          <div class="form-col-container">
            <!-- code -->
            <div>
              <span class="title-text">WO</span>
              <input type="text" class="form-control" v-model="form.code" />
            </div>
            <div>
              <span class="title-text">WO No.</span>
              <input type="text" class="form-control" v-model="form.code" />
            </div>
          </div>
        </form>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

const interfaceIsShow = {
  searchBtn: false,
  searchModal: false
}
const interfaceForm = {
  wo: null
}

export default {
  components: {
    pageTitle,
    loading,
    modal
  },
  data() {
    return {
      isLoading: false,

      // -------obj
      isShow: { ...interfaceIsShow },
      form: { ...interfaceForm },

      // ------- wording
      title: 'ประเมินราคาสินค้า'
    }
  },
  methods: {
    // ---------------- event --------
    onShowSearch() {
      this.isShow = { ...interfaceIsShow, searchModal: true }
    },
    closeModal() {
      this.isShow = { ...interfaceIsShow }
    },
    onSubmit() {
      console.log('onSubmit')
      this.$emit('onSearch', this.form)
      this.closeModal()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
