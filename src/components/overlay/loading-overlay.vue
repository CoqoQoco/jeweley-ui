<!-- ref:: https://www.npmjs.com/package/vue3-loading-overlay -->
<template>
  <div>
    <loading
      :active="isLoadingActiveColse"
      :height="25"
      :width="25"
      :is-full-page="fullPage"
      :can-cancel="true"
      :z-index="1100"
      :color="'#921313'"
    >
      <template v-slot:after>
        <div v-if="timeCounting > seconds" class="cancel-loading-container">
          <div class="font-weight-bold">
            เนื่องจากการดำเนินการใช้เวลา เกินกว่า
            {{ convertToMinute(seconds) }} นาที
          </div>
          <div class="font-weight-bold">คุณต้องการปิดหน้าต่างหรือไม่?</div>
          <button class="mt-2 btn btn-sm btn-primary" @click="onCancel">
            ปิดหน้าต่าง
          </button>
        </div>
      </template>
    </loading>
  </div>
</template>

<script>
import Loading from "vue3-loading-overlay";
import "vue3-loading-overlay/dist/vue3-loading-overlay.css";
import _ from "lodash";

export default {
  components: {
    loading: Loading,
  },
  props: {
    isLoading: {
      type: Boolean,
      required: true,
      default: false,
    },
    fullPage: {
      type: Boolean,
      default: true,
    },
    loader: {
      type: String,
      default: "dots",
    },
    seconds: {
      type: Number,
      default: 300, // 5 minutes
    },
  },
  data() {
    return {
      isLoadingActive: false,
      isLoadingActiveColse: false,
      interval: null,
      timeCounting: 0,
    };
  },
  watch: {
    async isLoading(value) {
      if (value) {
        await this.setTimerAndInterval();
      } else {
        await this.clearTimerAndInterval();
      }
      this.isLoadingActive = value;
    },
  },
  methods: {
    convertToMinute(time) {
      const minutes = Math.floor(time / 60);
      const seconds = time - minutes * 60;
      return `${minutes}:${_.padStart(seconds, 2, "0")}`;
    },
    async onCancel() {
      this.isLoadingActive = false;
      await this.clearTimerAndInterval();
    },
    async setTimerAndInterval() {
      this.interval = setInterval(() => {
        this.timeCounting = this.timeCounting + 1;
      }, 1000);
    },
    async clearTimerAndInterval() {
      this.timeCounting = 0;
      clearInterval(this.interval);
    },
  },
  created() {
    this.isLoadingActive = this.isLoading;
  },
  async unmounted() {
    await this.clearTimerAndInterval();
  },
};
</script>

<style>
.vld-overlay .vld-icon,
.vld-parent {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cancel-loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
