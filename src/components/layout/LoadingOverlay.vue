<template>
  <div>
    <loading
      :active="isLoading"
      :height="25"
      :width="25"
      :is-full-page="fullPage"
      :can-cancel="true"
      :z-index="1100"
      :color="'#921313'"
    >
      <template v-slot:after>
        <!-- <div v-if="timeCounting > seconds" class="cancel-loading-container">
          <div class="font-weight-bold">
            เนื่องจากการดำเนินการใช้เวลา เกินกว่า
            {{ convertToMinute(seconds) }} นาที
          </div>
          <div class="font-weight-bold">คุณต้องการปิดหน้าต่างหรือไม่?</div>
          <button class="mt-2 btn btn-sm btn-primary" @click="onCancel">ปิดหน้าต่าง</button>
        </div> -->
      </template>
    </loading>
  </div>
</template>

<script>
import { useLoadingStore } from '@/stores/modules/master/loading-store'
import { storeToRefs } from 'pinia'

import Loading from 'vue3-loading-overlay'
import 'vue3-loading-overlay/dist/vue3-loading-overlay.css'
import _ from 'lodash'

export default {
  name: 'BaseLoading',

  components: {
    loading: Loading
  },
  props: {
    showText: {
      type: Boolean,
      default: true
    },
    fullPage: {
      type: Boolean,
      default: true
    }
  },

  setup() {
    const loadingStore = useLoadingStore()
    const { isLoading } = storeToRefs(loadingStore)

    return {
      isLoading
    }
  }
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-text {
  color: white;
  font-size: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #921313;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
