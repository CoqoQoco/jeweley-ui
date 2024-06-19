<template>
  <div class="app-container">
    <div class="box-center">
      <stepperStatus :events="events"></stepperStatus>
    </div>
    <form @submit="onSubmit"></form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const stepperStatus = defineAsyncComponent(() => import('@/components/prime-vue/StepperStatus.vue'))

export default {
  components: {
    stepperStatus
  },
  data() {
    return {
      events: [
        { name: 'ออกเเบบเเละขึ้น 3D', id: 1 },
        { name: 'ปริ้นเรซิ่น', id: 2 }
      ]
    }
  },
  methods: {
    onSubmit() {
      console.log('submit')
    }
  }
}
</script>

<style lang="scss" scoped>
.box-center {
  display: grid;
  place-items: center;
  width: 100%;
}
</style>
