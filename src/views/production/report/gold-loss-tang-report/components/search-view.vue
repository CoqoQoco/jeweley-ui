<template>
  <div class="filter-container-searchBar">
    <div>
      <pageTitle title="สร้างใบงาน Gold Loss" :isShowBtnClose="false" />
      <div class="form-col-container">
        <div>
          <span class="title-text">วันที่</span>
          <div class="flex-group">
            <Calendar
              class="w-100"
              v-model="form.start"
              :maxDate="form.end"
              :manualInput="true"
              showIcon
              placeholder="เริ่มต้น"
              dateFormat="dd/mm/yy"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <Calendar
              class="w-100"
              v-model="form.end"
              :minDate="form.start"
              showIcon
              :manualInput="true"
              placeholder="สิ้นสุด"
              dateFormat="dd/mm/yy"
            />
          </div>
        </div>

        <div>
          <span class="title-text">WO</span>
          <input
            class="form-control bg-input"
            type="text"
            v-model.trim="form.wo"
            placeholder="เลขที่ WO"
          />
        </div>

        <div>
          <span class="title-text">ช่าง</span>
          <Dropdown
            v-model="form.workerCode"
            :options="workerList"
            :optionLabel="option => `${option.code} - ${option.nameTh}`"
            optionValue="code"
            :showClear="true"
            :filter="true"
            placeholder="เลือกช่าง"
          />
        </div>

        <div>
          <span class="title-text">ประเภททอง</span>
          <Dropdown
            v-model="form.goldCode"
            :options="masterStore.gold"
            :optionLabel="option => `${option.code} - ${option.nameTh}`"
            optionValue="code"
            :showClear="true"
            :filter="true"
            placeholder="เลือกประเภททอง"
          />
        </div>
      </div>
      <div class="btn-submit-container">
        <div></div>
        <div class="d-flex gap-2">
          <button @click="$emit('viewJobs')" class="btn btn-sm btn-main mr-2">
            <i class="bi bi-list-ul"></i> ดูใบงาน
          </button>
          <button @click="onSearch" class="btn btn-sm btn-green">
            <i class="bi bi-search"></i> {{ $t('button.search') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import pageTitle from '@/components/custom/PageTitle.vue'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

export default {
  name: 'GoldLossTangSearchView',

  components: {
    Calendar,
    Dropdown,
    pageTitle
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  emits: ['search', 'viewJobs'],

  data() {
    return {
      form: {
        start: null,
        end: null,
        wo: '',
        workerCode: null,
        goldCode: null
      },
      workerList: []
    }
  },

  methods: {
    onSearch() {
      const startDate = this.form.start ? formatISOString(this.form.start) : null
      const endDate = this.form.end ? formatISOString(this.form.end) : null

      this.$emit('search', {
        startDate,
        endDate,
        wo: this.form.wo || null,
        workerCode: this.form.workerCode || null,
        goldCode: this.form.goldCode || null
      })
    }
  },

  async created() {
    this.masterStore.fetchGold()

    const res = await api.jewelry.post('Worker/Search', {
      take: 0,
      skip: 0,
      search: { text: null, type: null, active: 1 }
    }, { skipLoading: true })
    this.workerList = res?.data || []
  },

  mounted() {
    const now = new Date()
    this.form.start = new Date(now.getFullYear(), now.getMonth(), 1)
    this.form.end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    this.onSearch()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/responsive-style/web';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
