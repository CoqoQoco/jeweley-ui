<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loader-container">
      <div class="loader">
        <div style="--i: 1; --inset: 30%" class="box">
          <div class="logo">
            <img src="@/assets/duangkaew-logo.png" alt="DK Logo" class="svg" />
          </div>
        </div>
        <div style="--i: 2; --inset: 28%" class="box"></div>
        <div style="--i: 3; --inset: 22%" class="box"></div>
        <!-- <div style="--i: 3; --inset: 36%" class="box"></div>
        <div style="--i: 4; --inset: 32%" class="box"></div>
        <div style="--i: 5; --inset: 28%" class="box"></div>
        <div style="--i: 6; --inset: 24%" class="box"></div>
        <div style="--i: 7; --inset: 20%" class="box"></div>
        <div style="--i: 8; --inset: 16%" class="box"></div>
        <div style="--i: 9; --inset: 13%" class="box"></div>
        <div style="--i: 10; --inset: 10%" class="box"></div>
        <div style="--i: 11; --inset: 15%" class="box"></div> -->
      </div>

      <div v-if="showTimeoutWarning" class="cancel-loading-container">
        <div class="font-weight-bold">
          เนื่องจากการดำเนินการใช้เวลา เกินกว่า {{ convertToMinute(timeoutSeconds) }} นาที
        </div>
        <div class="font-weight-bold">คุณต้องการปิดหน้าต่างหรือไม่?</div>
        <button class="mt-2 btn-cancel" @click="onCancel">ปิดหน้าต่าง</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useLoadingStore } from '@/stores/modules/master/loading-store'
import { storeToRefs } from 'pinia'

export default {
  name: 'BaseLoading',

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
      default: 30
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

    return {
      isLoading,
      showTimeoutWarning,
      timeElapsed,
      onCancel,
      convertToMinute
    }
  }
}
</script>

<style lang="scss" scoped>
// @import '@/assets/scss/custom-style/standard-form';

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(17, 17, 17, 0.7); // ปรับสีพื้นฐานเป็น #921313 พร้อมความโปร่งใส
  z-index: 9999;
}

.loader-container {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loader {
  --size: 400px;
  --duration: 2.5s;
  --logo-color: #ffff; // ปรับสีโลโก้เป็น #921313
  --background: linear-gradient(
    0deg,
    rgba(146, 19, 19, 0.1) 0%,
    rgba(146, 19, 19, 0.2) 100%
  ); // ปรับสีพื้นหลังให้เข้ากับ theme
  height: var(--size);
  aspect-ratio: 1;
  position: relative;
  pointer-events: none;
}

.loader .box {
  position: absolute;
  background: #faf8f8ab ;
  border-radius: 50%;
  box-shadow:
    rgba(0, 0, 0, 0.3) 0px 10px 10px 0,
    inset rgba(230, 24, 24, 0.5) 0px 5px 10px -7px; // ปรับสีเงาให้เข้ากับ theme แดง
  animation: ripple var(--duration) infinite ease-in-out;
  inset: var(--inset);
  animation-delay: calc(var(--i) * 0.15s);
  z-index: calc(var(--i) * -1);
  pointer-events: all;
  transition: all 0.3s ease;
}

.loader .box:last-child {
  filter: blur(30px);
}

.loader .box:not(:last-child):hover {
  filter: brightness(2.5) blur(5px);
}

.loader .logo {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  padding: 30%;
}

.svg {
  width: 150px;
  height: 100%;
}

.cancel-loading-container {
  background-color: rgba(146, 19, 19, 0.9); // ปรับสีเป็น #921313
  padding: 1.5rem;
  border-radius: 0.75rem;
  text-align: center;
  margin-top: 2rem;
  color: white;
  font-size: 16px;
  max-width: 350px;
}

.btn-cancel {
  background-color: white;
  color: #921313; // ปรับสีข้อความปุ่มเป็น #921313
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.btn-cancel:hover {
  background-color: #f0f0f0;
}

.font-weight-bold {
  font-weight: bold;
  margin-bottom: 8px;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    box-shadow:
      rgba(0, 0, 0, 0.3) 0px 10px 10px 0,
      inset rgba(143, 132, 132, 0.5) 0px 5px 10px -7px;
  }
  65% {
    transform: scale(1.4);
    box-shadow: rgba(0, 0, 0, 0) 0px 0 0 0;
  }
  100% {
    transform: scale(1);
    box-shadow:
      rgba(0, 0, 0, 0.3) 0px 10px 10px 0,
      inset rgba(175, 158, 158, 0.5) 0px 5px 10px -7px;
  }
}
</style>
