<template>
  <div class="flex justify-content-center w-100 filter-container">
    <pageTitle :title="eventsName" description="" :isShowBtnClose="false"> </pageTitle>
    <Stepper linear :activeStep="activeTab">
      <StepperPanel v-for="event in events" :key="event.id" :header="event.header">
        <!-- <template #header="{ index }">
          <div
            :class="[
              { 'bg-primary border-primary': index <= active, 'surface-border': index > active }
            ]"
          >
            <span>{{ event.header }}</span>
          </div>
        </template> -->
        <template v-if="isNextStatus" #content="{ prevCallback, nextCallback }">
          <div class="box-action">
            <button class="btn btn-sm btn-main" @click="prevCallback">
              <span>ก่อนหน้า</span>
            </button>
            <button class="btn btn-sm btn-main" @click="nextCallback">
              <span>ถัดไป</span>
            </button>
          </div>
        </template>
      </StepperPanel>
    </Stepper>
  </div>
</template>

<script>
import Stepper from 'primevue/stepper'

import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import StepperPanel from 'primevue/stepperpanel'

export default {
  components: {
    Stepper,
    StepperPanel,
    pageTitle
  },
  data() {
    return {}
  },
  computed: {
    activeTab() {
      //return index if active == true
      return this.events.findIndex((event) => event.id === this.eventsIdActive)
    }
  },
  props: {
    eventsName: {
      type: String,
      default: () => 'สถานะขั้นตอนการดำเนินงาน'
    },
    events: {
      type: Array,
      default: () => []
    },
    eventsIdActive: {
      type: Number,
      default: () => 0
    },
    isNextStatus: {
      type: Boolean,
      default: false
    }
  },
  methods: {},
  created() {
    console.log(this.events)
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  border: 1px solid #dddddd;
  border-radius: 5px;

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  //background-color: var(--base-color);
  padding: 10px;
}
.box-header {
  font-size: 15px;
  font-weight: 700;
  color: var(--base-font-color);
  margin: 10px 20px;
}
.box-action {
  display: flex;
  justify-content: space-between;
  padding: 0px 10px;
}
</style>
