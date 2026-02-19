<template>
  <QrCodeScanner
    :fps="10"
    :qrbox-width="300"
    :qrbox-height="150"
    :clear-on-scan="true"
    @scan="onScan"
  />
</template>

<script>
import QrCodeScanner from '@/components/prime-vue/qr-code-scanner.vue'

export default {
  name: 'QrScanner',

  components: {
    QrCodeScanner
  },

  methods: {
    onScan(decodedText, decodedResult) {
      this.$emit('scan', decodedText, decodedResult)
    }
  }
}
</script>
