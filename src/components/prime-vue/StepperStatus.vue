<template>
  <div>
    <Steps :model="events" />
  </div>
</template>

<script>
import Steps from 'primevue/steps'
//import StepPanels from 'primevue/steppanels';
//import StepItem from 'primevue/stepitem';
//import Step from 'primevue/step';
//import StepPanel from 'primevue/steppanel';

export default {
  components: {
    Steps
  },
  props: {
    events: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped></style>
