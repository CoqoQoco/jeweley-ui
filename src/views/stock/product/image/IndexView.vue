<template>
  <div class="app-container">
    <!-- <div class="filter-container-highlight">
      <div class="form-col-container">
        <div class="d-flex justify-content-between">
          <div>
            <span class="desc-text-white"><i class="bi bi-image"></i></span>
            <span class="desc-text-white ml-2">รุปสินค้า</span>
          </div>
        </div>
      </div>
    </div> -->

    <search></search>
    <imageView></imageView>
  </div>
</template>

<script>
import search from './components/create-view.vue'
import imageView from './components/image-view.vue'

export default {
  name: 'ProductImage',

  components: {
    search,
    imageView
  },

  data() {
    return {}
  }
}
</script>

<style  lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';
</style>
