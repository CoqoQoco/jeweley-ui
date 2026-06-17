<template>
  <div>
    <div class="filter-container-searchBar">
      <pageTitle
        :title="$t('view.stock.cost.title')"
        :description="$t('view.stock.cost.searchDesc')"
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
              <span class="title-text">{{ $t('view.stock.cost.wo') }}</span>
              <input type="text" class="form-control" v-model="form.code" />
            </div>
            <div>
              <span class="title-text">{{ $t('view.stock.cost.woNo') }}</span>
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

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

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
    modal
  },
  data() {
    return {
      // -------obj
      isShow: { ...interfaceIsShow },
      form: { ...interfaceForm },

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
