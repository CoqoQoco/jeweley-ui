<template>
  <button v-if="value" type="button" class="gem-doc-link" @click.stop="$emit('open', value)">
    {{ value }}
  </button>
  <span v-else>-</span>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  emits: ['open']
}
</script>

<style lang="scss" scoped>
.gem-doc-link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--base-font-color);
  text-decoration: underline;
  cursor: pointer;
  font: inherit;

  &:focus-visible {
    outline: 2px solid var(--base-font-color);
    outline-offset: 2px;
  }
}
</style>
