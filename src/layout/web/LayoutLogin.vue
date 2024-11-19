<template>
  <div class="layout-container">
    <router-view :key="$route.fullPath"></router-view>
  </div>
</template>

<script></script>

<style lang="scss" scoped>
.layout-container {
  //background-color: #921313;
}
</style>
