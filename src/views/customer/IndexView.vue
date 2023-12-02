<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <pageTitle
      title="รายชื่อลูกค้า"
      description="รายชื่อลูกค้า เเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
      isShowRightSlot
    >
    </pageTitle>
    <form @submit.prevent="onSearch">
      <div class="filter-container">
        <div class="search-bar-container">
          <div>
            <span class="text-titel">ค้นหาลูกค้า</span>
            <div class="input-group input-group-inner">
              <input
                id="inputStockID"
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="search.text"
                placeholder="พิมพ์บางอย่างเพื่อค้นหา"
                required
              />
              <div class="input-group-append">
                <span class="input-group-text">
                  <i class="bi bi-person-fill-gear"></i>
                </span>
              </div>
            </div>
          </div>
          <div class="btn-container">
            <button type="submit" class="btn btn-sm btn-main mr-2">
              <span class="mr-2">
                <i class="bi bi-search"></i>
              </span>
              <span>ค้นหา</span>
            </button>
            <button type="button" @click="onClear" class="ms-2 btn btn-sm btn-dark">
              <span class="mr-2">
                <i class="bi bi-x-circle"></i>
              </span>
              <span>ล้างคำค้นหา</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

const interfaceSearch = {
  text: null
}

export default {
  components: {
    loading,
    pageTitle
  },
  data() {
    return {
      // ----- flag --------
      isLoading: false,

      // ------ param -------- //
      search: {
        ...interfaceSearch
      }
    }
  },
  methods: {
    // ------------------ APIs -------------------- //
    onSearch() {},
    onClear() {
      this.search = {
        ...interfaceSearch
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/search-bar.scss';

.search-bar-container {
  display: grid;
  grid-template-columns: 500px auto;
  gap: 10px;
  margin-bottom: 10px;
}

:deep(.input-group-append) {
  height: 40px;
  padding-top: 5px;
}
</style>
