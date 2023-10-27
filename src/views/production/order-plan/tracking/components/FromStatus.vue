<template>
  <div class="from-status-container">
    <loading :isLoading="isLoading"></loading>
    <div class="data-container">
      <div class="data-header">
        <div
          class="mr-2 p-1 text-center bg-dark text-white"
          style="height: 31px; width: 250px"
          disable
        >
          รายละเอียดสถานะงาน
        </div>
        <button
          class="btn btn-sm btn-warning"
          style="height: 31px; width: 250px"
          @click="onAddUpdate"
        >
          <span class="mr-1"><i class="bi bi-gem"></i></span>
          <span>บันทึกสถานะงาน</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
export default {
  components: {
    loading
  },
  data() {
    return {
      isLoading: false
    }
  },
  methods: {
    onAddUpdate() {
      this.$emit('showModalAddUpdate')
    }
  }
}
</script>

<style lang="scss" scoped>
.data-container {
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  //background-color: var(--base-color);
  padding: 20px 40px;
  margin-bottom: 20px;
}
.data-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
