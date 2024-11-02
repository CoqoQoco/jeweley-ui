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
      @before-open="beforeOpen"
      @before-close="beforeClose"
    >
      <template v-slot:after>
        <div v-if="showTimeoutWarning" class="cancel-loading-container">
          <div class="font-weight-bold">
            เนื่องจากการดำเนินการใช้เวลา เกินกว่า {{ convertToMinute(timeoutSeconds) }} นาที
          </div>
          <div class="font-weight-bold">คุณต้องการปิดหน้าต่างหรือไม่?</div>
          <button class="mt-2 btn btn-sm btn-primary" @click="onCancel">ปิดหน้าต่าง</button>
        </div>
      </template>
    </loading>
  </div>
</template>

<script>
import { ref, watch, onBeforeUnmount } from 'vue'
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
    },
    timeoutSeconds: {
      type: Number,
      default: 30 // 30 seconds default timeout
    }
  },

  setup(props) {
    const loadingStore = useLoadingStore()
    const { isLoading } = storeToRefs(loadingStore)

    // Timer state
    const loadingTimer = ref(null)
    const timeElapsed = ref(0)
    const showTimeoutWarning = ref(false)

    // Start timer when loading begins
    const startTimer = () => {
      timeElapsed.value = 0
      showTimeoutWarning.value = false

      loadingTimer.value = setInterval(() => {
        timeElapsed.value += 1

        // Show warning if time exceeds timeout
        if (timeElapsed.value >= props.timeoutSeconds) {
          showTimeoutWarning.value = true
        }
      }, 1000)
    }

    // Stop and reset timer
    const stopTimer = () => {
      if (loadingTimer.value) {
        clearInterval(loadingTimer.value)
        loadingTimer.value = null
      }
      timeElapsed.value = 0
      showTimeoutWarning.value = false
    }

    // Watch loading state changes
    watch(
      () => isLoading.value,
      (newValue, oldValue) => {
        if (newValue && !oldValue) {
          // Loading started
          startTimer()
        } else if (!newValue && oldValue) {
          // Loading stopped
          stopTimer()
        }
      }
    )

    // Lifecycle hooks and utility functions
    const beforeOpen = () => {
      startTimer()
    }

    const beforeClose = () => {
      stopTimer()
    }

    const onCancel = () => {
      loadingStore.hideLoading()
      stopTimer()
    }

    const convertToMinute = (seconds) => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    // Cleanup on component unmount
    onBeforeUnmount(() => {
      stopTimer()
    })

    // Debug loading state changes
    watch(
      () => isLoading.value,
      (newValue) => {
        console.log('Loading state changed:', newValue)
        console.log('Current time elapsed:', timeElapsed.value)
      },
      { immediate: true }
    )

    return {
      isLoading,
      showTimeoutWarning,
      timeElapsed,
      beforeOpen,
      beforeClose,
      onCancel,
      convertToMinute
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

.cancel-loading-container {
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  margin-top: 1rem;
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
