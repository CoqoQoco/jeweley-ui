<template>
  <LabelStationBoard
    v-if="hasKey"
    @changeKey="onChangeKey"
    @keyRejected="onKeyRejected"
  />
  <DeviceKeyForm v-else :message="rejectedMessage" @save="onSaveKey" />
</template>

<script>
import { storage } from '@/services/storage.js'
import { LABEL_STATION_DEVICE_KEY_STORAGE_KEY } from '@/stores/modules/api/print/label-print-job-store.js'

import LabelStationBoard from './components/label-station-board.vue'
import DeviceKeyForm from './components/device-key-form.vue'

// หน้า public (ไม่ต้อง login) — ใช้คีย์เครื่องที่ Dev ออกให้จากหน้า /label-station-key แทน JWT
export default {
  name: 'LabelStationIndexView',

  components: { LabelStationBoard, DeviceKeyForm },

  data() {
    return {
      hasKey: !!storage.getItem(LABEL_STATION_DEVICE_KEY_STORAGE_KEY, ''),
      rejectedMessage: ''
    }
  },

  methods: {
    onSaveKey(key) {
      storage.setItem(LABEL_STATION_DEVICE_KEY_STORAGE_KEY, key)
      this.rejectedMessage = ''
      this.hasKey = true
    },

    onChangeKey() {
      storage.removeItem(LABEL_STATION_DEVICE_KEY_STORAGE_KEY)
      this.rejectedMessage = ''
      this.hasKey = false
    },

    onKeyRejected() {
      this.rejectedMessage = this.$t('view.labelStation.keyRejectedMsg')
      this.hasKey = false
    }
  }
}
</script>
