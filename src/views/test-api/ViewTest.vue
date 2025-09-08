<template>
  <div class="app-container">
    <form @submit.prevent="onCallApi">
      <div>
        <div class="border-container">
          <div class="">
            <div>
              <label class="label-subject">API Path</label>
              <input
                type="text"
                class="form-control"
                v-model.trim="from.pathUrl"
                placeholder="typing the your api path "
              />
            </div>
          </div>
          <div class="btn-box">
            <button class="btn btn-sm btn-success mr-2" type="submit">CALL API</button>
            <button class="btn btn-sm btn-secondary" type="submit">CLEAR</button>
          </div>
        </div>
      </div>
    </form>
    <div class="border-container" style="margin-top: 10px">
      <label class="label-subject">Response</label>
      <textarea class="text-area-box"></textarea>
    </div>
  </div>
</template>

<script>
import api from '@/axios/axios-helper.js'
export default {
  components: {},
  data() {
    return {
      from: {
        pathUrl: 'ReceiptProduction/Transfer/18K'
      },
      data: {}
    }
  },
  methods: {
    async onCallApi() {
      try {
        console.log(this.from.pathUrl)

        const res = await api.jewelry.get(this.from.pathUrl)
        console.log(res)
      } catch (error) {
        console.log(error)
      }
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
.text-area-box {
  width: 100%;
  height: calc(100vh - 300px);
}
</style>
