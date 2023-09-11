<template>
  <div class="app-container">
    <div class="message-boxes">
      <message-box>
        <p>กล่องข้อความที่ 1</p>
      </message-box>
      <message-box>
        <p>กล่องข้อความที่ 2</p>
      </message-box>
      <message-box>
        <p>กล่องข้อความที่ 3</p>
      </message-box>
      <message-box>
        <p>กล่องข้อความที่ 4</p>
      </message-box>
    </div>
    <JewelryDashboard />
  </div>
</template>

<script>
import JewelryDashboard from './components/JewelryDashboard.vue'
import MessageBox from './components/MessageBox.vue'

export default {
  components: {
    JewelryDashboard,
    'message-box': MessageBox
  }
}
</script>

<style>
.message-boxes {
  display: flex;
}
</style>
