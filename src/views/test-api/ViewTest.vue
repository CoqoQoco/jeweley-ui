<template>
  <div class="app-container">
    <!-- Transfer Stock Section -->
    <div class="border-container">
      <label class="label-subject">Transfer Stock</label>

      <div class="form-row">
        <div class="form-group">
          <label>ประเภท</label>
          <select v-model="form.type" class="form-control">
            <option value="18K">18K</option>
            <option value="9K">9K</option>
          </select>
        </div>
        <div class="form-group">
          <label>จำนวน (Take)</label>
          <input
            type="number"
            class="form-control"
            v-model.number="form.take"
            min="1"
            max="10000"
            placeholder="จำนวนที่ต้องการ transfer"
          />
        </div>
      </div>

      <div class="btn-box">
        <button
          class="btn btn-sm btn-success mr-2"
          :disabled="isLoading"
          @click="onTransfer"
        >
          <span v-if="isLoading">กำลังทำงาน...</span>
          <span v-else>TRANSFER {{ form.type }}</span>
        </button>
        <button class="btn btn-sm btn-secondary" @click="onClear" :disabled="isLoading">CLEAR</button>
      </div>
    </div>

    <!-- Custom API Section -->
    <div class="border-container mt-2">
      <label class="label-subject">Custom API</label>
      <div class="form-row">
        <div class="form-group" style="flex: 0 0 120px">
          <label>Method</label>
          <select v-model="customApi.method" class="form-control">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
        <div class="form-group" style="flex: 1">
          <label>API Path</label>
          <input
            type="text"
            class="form-control"
            v-model.trim="customApi.path"
            placeholder="e.g. ReceiptProduction/Transfer/18K"
            @keyup.enter="onCallCustomApi"
          />
        </div>
      </div>
      <div class="form-group">
        <label>Body (JSON)</label>
        <textarea
          class="form-control"
          v-model="customApi.body"
          rows="3"
          placeholder='e.g. { "take": 100 }'
        ></textarea>
      </div>
      <div class="btn-box">
        <button
          class="btn btn-sm btn-main mr-2"
          :disabled="isLoading"
          @click="onCallCustomApi"
        >
          <span v-if="isLoading">กำลังทำงาน...</span>
          <span v-else>CALL API</span>
        </button>
      </div>
    </div>

    <!-- Response Section -->
    <div class="border-container mt-2">
      <div class="response-header">
        <label class="label-subject">Response</label>
        <span v-if="responseTime" class="response-time">{{ responseTime }} ms</span>
      </div>
      <textarea class="text-area-box" :value="responseText" readonly></textarea>
    </div>
  </div>
</template>

<script>
import api from '@/axios/axios-helper.js'

export default {
  data() {
    return {
      form: {
        type: '18K',
        take: 500
      },
      customApi: {
        method: 'POST',
        path: '',
        body: ''
      },
      isLoading: false,
      responseText: '',
      responseTime: null
    }
  },

  methods: {
    async onTransfer() {
      const path = `ReceiptProduction/Transfer/${this.form.type}`
      const body = { take: this.form.take }

      await this.callApi('POST', path, body)
    },

    async onCallCustomApi() {
      if (!this.customApi.path) return

      let body = null
      if (this.customApi.method === 'POST' && this.customApi.body) {
        try {
          body = JSON.parse(this.customApi.body)
        } catch {
          this.responseText = 'Error: Invalid JSON body'
          return
        }
      }

      await this.callApi(this.customApi.method, this.customApi.path, body)
    },

    async callApi(method, path, body) {
      this.isLoading = true
      this.responseText = `Calling ${method} ${path} ...\n`
      this.responseTime = null

      const startTime = Date.now()

      try {
        let res
        if (method === 'POST') {
          res = await api.jewelry.post(path, body)
        } else {
          res = await api.jewelry.get(path, body)
        }

        this.responseTime = Date.now() - startTime
        this.responseText = JSON.stringify(res, null, 2)
      } catch (error) {
        this.responseTime = Date.now() - startTime
        this.responseText = `Error: ${error.message || error}\n\n${JSON.stringify(error.response?.data, null, 2) || ''}`
      } finally {
        this.isLoading = false
      }
    },

    onClear() {
      this.responseText = ''
      this.responseTime = null
    }
  }
}
</script>

<style lang="scss" scoped>
.border-container {
  border: 1px solid var(--base-font-color);
  border-radius: 5px;
  background-color: #f7f7f7;
  padding: 10px;

  .btn-box {
    padding-top: 10px;
    display: flex;
    justify-content: end;
  }
}

.mt-2 {
  margin-top: 10px;
}

.form-row {
  display: flex;
  gap: 10px;
}

.form-group {
  flex: 1;
  margin-bottom: 8px;

  label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #555;
    margin-bottom: 4px;
    display: block;
  }
}

.label-subject {
  font-weight: 700;
  color: var(--base-font-color);
  font-size: 1rem;
  margin-bottom: 10px;
  display: block;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.response-time {
  font-size: 0.85rem;
  font-weight: 600;
  color: #28a745;
}

.text-area-box {
  width: 100%;
  height: calc(100vh - 500px);
  min-height: 200px;
  font-family: monospace;
  font-size: 0.85rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  background: #fff;
}
</style>
