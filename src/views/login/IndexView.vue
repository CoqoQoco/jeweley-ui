<template>
  <div class="login-container">
    <login></login>
  </div>
</template>

<script>
import login from './components/LoginView.vue'

export default {
  components: {
    login
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  // แบบที่ 1: ไล่สีจากแดงเข้มไปแดงอ่อน
  //background: linear-gradient(135deg, #921313 0%, #ff4757 100%);

  // แบบที่ 2: ไล่สีแบบมีสีกลาง
  //background: linear-gradient(135deg, #921313 0%, #c92a2a 50%, #ff4757 100%);

  // แบบที่ 3: ไล่สีแบบ Radial
  //background: radial-gradient(circle at center, #360505 0%, #921313 100%);

  // แบบที่ 4: ไล่สีแบบซ้อนกัน

  background: linear-gradient(135deg, rgba(241, 188, 188, 0.95) 0%, rgba(167, 17, 32, 0.95) 100%),
    linear-gradient(45deg, #921313 0%, #290407 100%);

  // เพิ่ม animation (optional)
  animation: gradientAnimation 15s ease infinite;

  // ถ้าต้องการเพิ่ม texture หรือ pattern
  //   &::before {
  //     content: '';
  //     position: absolute;
  //     top: 0;
  //     left: 0;
  //     right: 0;
  //     bottom: 0;
  //     background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.03'/%3E%3C/svg%3E");
  //   }
}

// ถ้าต้องการใช้ animation
@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

// ส่วนที่เหลือของ style คงเดิม...
</style>
