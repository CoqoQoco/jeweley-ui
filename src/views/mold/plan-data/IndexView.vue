<template>
  <div class="app-container">
    <loading :isLoading="isLoading"> </loading>
    <div class="filter-container">
      <pageTitle
        :title="`รายละเอียดตั้งเเม่พิมพ์`"
        description=""
        :isShowBtnClose="false"
        :isShowRightSlot="true"
      >
        <template #rightSlot>
          <div v-if="!getMeltingStatus(data.status)" class="d-flex">
            <div :class="data.status === 60 ? 'box-status-success' : 'box-status-show'">
              {{ data.statusName }}
            </div>
            <div v-if="data.status === 100" class="box-status-process ml-2" @click="onMelting">
              <span><i class="bi bi-x-lg mr-2"></i></span>
              <span>หลอมเเม่พิมพ์</span>
            </div>
          </div>
          <div v-if="getMeltingStatus(data.status)" class="d-flex">
            <div class="box-status-process">
              {{ data.statusName }}
            </div>
          </div>
        </template>
      </pageTitle>

      <!-- header -->
      <div class="form-col-sm-container">
        <div class="d-flex flex-column">
          <span class="title-text">รหัสตั้งเเม่พิมพ์</span>
          <span class="desc-text">{{ data?.design?.moldCode }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text">ประเภท</span>
          <span class="desc-text">{{ data?.design?.catagoryName }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text">วันที่สร้าง</span>
          <span class="desc-text">{{ formatDate(data.createDate) }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text">วันที่เเก้ไขล่าสุด</span>
          <span class="desc-text">{{ formatDate(data.updateDate) }}</span>
        </div>
      </div>
    </div>
    <!-- gems -->
    <div class="mt-2 mb-2">
      <form @submit.prevent="onUpdateGems">
        <div class="title-text-lg-header">
          <div class="d-flex justify-content-between">
            <span>ส่วนประกอบเพชร/พลอย</span>
            <button
              v-if="!getMeltingStatus(data.status)"
              class="btn btn-sm"
              :class="[this.data?.gems?.length ? 'btn-outline-warning' : 'btn-secondary']"
              :disabled="!this.data?.gems?.length"
              type="submit"
            >
              <span><i class="bi bi-gem mr-2"></i></span>
              <span>เเก้ไขเพชร/พลอย</span>
            </button>
          </div>
        </div>
        <div>
          <DataTable
            class="p-datatable-sm"
            showGridlines
            v-model:editingRows="editingRows"
            :value="data.gems"
            :editMode="!getMeltingStatus(data.status) ? 'row' : ''"
            dataKey="id"
            @row-edit-save="onRowEditSave"
            :pt="{
              table: { style: 'min-width: 50rem' },
              column: {
                bodycell: ({ state }) => ({
                  style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                })
              }
            }"
          >
            <Column
              v-if="!getMeltingStatus(data.status)"
              :rowEditor="true"
              style="width: 100px"
              bodyStyle="text-align:center"
            >
            </Column>
            <Column v-if="!getMeltingStatus(data.status)" style="width: 60px">
              <template #body="prop">
                <div class="btn btn-danger text-center w-100" @click="onDelGems(prop.data)">
                  <i class="bi bi-trash-fill"></i>
                </div>
              </template>
            </Column>

            <Column field="gem" header="ประเภทเพชร/พลอย" style="min-width: 150px">
              <template #body="slotProps">
                <span>{{ slotProps.data.gem?.description }}</span>
              </template>
              <template #editor="{ data, field }">
                <Dropdown
                  v-model="data[field]"
                  :options="masterGem"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  placeholder="เลือกพลอย"
                  :showClear="data[field] ? true : false"
                >
                </Dropdown>
              </template>
            </Column>
            <Column field="gemShape" header="รูปร่างพลอย" style="min-width: 150px">
              <template #body="slotProps">
                <span>{{ slotProps.data.gemShape?.description }}</span>
              </template>
              <template #editor="{ data, field }">
                <Dropdown
                  v-model="data[field]"
                  :options="masterGemShape"
                  optionLabel="description"
                  class="w-full md:w-14rem"
                  placeholder="เลือกรูปร่าง"
                  :showClear="data[field] ? true : false"
                >
                </Dropdown>
              </template>
            </Column>
            <Column field="size" header="ขนาด" style="width: 200px">
              <template #editor="{ data, field }">
                <input
                  type="text"
                  min="1"
                  :class="data[field] ? `` : `bg-warning`"
                  class="form-control"
                  v-model="data[field]"
                />
              </template>
            </Column>
            <Column field="qty" header="จำนวน" style="width: 200px">
              <template #editor="{ data, field }">
                <input
                  type="number"
                  min="1"
                  :class="data[field] ? `` : `bg-warning`"
                  class="form-control"
                  v-model="data[field]"
                />
              </template>
            </Column>
            <template #footer>
              <div class="d-flex justify-content-between">
                <div>ทั้งหมด {{ this.data?.gems?.length }} รายการ</div>
                <div
                  v-if="!getMeltingStatus(data.status)"
                  class="btn btn-sm btn-warning"
                  @click="onAddGems"
                >
                  <span class="text-center">
                    <i class="bi bi-plus"></i>
                  </span>
                </div>
              </div>
            </template>
          </DataTable>
        </div>
      </form>
    </div>
    <div v-if="data.store" class="mt-2">
      <statusStore :modelValue="data"></statusStore>
    </div>
    <div v-if="data.cutting" class="mt-2">
      <statusCutting :modelValue="data"></statusCutting>
    </div>
    <div v-if="data.casting" class="mt-2">
      <statusCasting :modelValue="data"></statusCasting>
    </div>
    <div v-if="data.castingSilver" class="mt-2">
      <statusCastingSilver :modelValue="data"></statusCastingSilver>
    </div>
    <div v-if="data.resin" class="mt-2">
      <statusResin :modelValue="data"></statusResin>
    </div>
    <div class="mt-2">
      <statusDesign :modelValue="data" />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import api from '@/axios/axios-config.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

import statusDesign from './components/statusDesignView.vue'
import statusResin from './components/statusResinView.vue'
import statusCastingSilver from './components/statusCastingSilverView.vue'
import statusCasting from './components/statusCastingView.vue'
import statusCutting from './components/statusCuttingView.vue'
import statusStore from './components/statusStoreView.vue'

import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import swAlert from '@/services/alert/sweetAlerts.js'
//import api from '@/axios/axios-config.js'

const interfaceGem = {
  gem: null,
  gemShape: null,
  size: null,
  qty: null
}

export default {
  components: {
    pageTitle,
    loading,
    statusDesign,
    statusResin,
    statusCastingSilver,
    statusCasting,
    statusCutting,
    statusStore,
    DataTable,
    Column,
    Dropdown
  },
  data() {
    return {
      isLoading: false,
      id: null,
      data: {},
      masterGem: [],
      masterGemShape: [],

      // ---- datatable ---- //
      editingRows: [],
      autoId: 0
    }
  },
  methods: {
    // ------- helper ------- //
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },
    getGemsName(type) {
      if (type === 'diamond') {
        return 'เพชร'
      }
      if (type === 'gem') {
        return 'พลอย'
      }
    },
    getMeltingStatus(status) {
      if (status === 500) {
        return true
      }
      return false
    },

    // --- datatable --- //
    onRowEditSave(event) {
      let { newData, index } = event
      this.data.gems[index] = newData
    },
    onDelGems(item) {
      const index = this.data.gems.indexOf(item)
      this.data.gems.splice(index, 1)
    },
    onAddGems() {
      const addGem = {
        id: ++this.autoId,
        ...interfaceGem
      }
      this.data.gems.push(addGem)
    },

    // --- event --- //
    onUpdateGems() {
      const updateGems = {
        id: this.data.id,
        gems: this.data.gems
          .filter((item) => item.gem?.code && item.gemShape?.code) // กรองเฉพาะ items ที่มีทั้ง gemCode และ gemShapeCode
          .map((item) => {
            return {
              gemCode: item.gem.code,
              gemShapeCode: item.gemShape.code,
              size: item.size,
              qty: item.qty
            }
          })
      }

      if (updateGems.gems?.length) {
        console.log('update gems', updateGems)
        swAlert.confirmSubmit('เเก้ไขข้อมูลเพชร/พลอย', 'คุณต้องการเเก้ไขข้อมูลใช่หรือไม่', () => {
          this.fetchUpdateGems(updateGems)
        })
      } else {
        swAlert.warning('กรุณากรอกข้อมูลให้ครบถ้วน')
      }
    },
    onMelting() {
      swAlert.confirmSubmit(
        'เเม่พิมพ์ที่ถูกหลอมจะไม่สามารถเเก้ไขหรือใช้งานได้อีก',
        'หลอมเเม่พิมพ์',
        async () => {
          console.log('melting')
          await this.fetchMelting()
        }
      )
    },

    // ----- APIs ----- //
    async fetchData() {
      try {
        this.isLoading = true
        //console.log('fetchdata', id)

        const param = {
          id: this.id
        }
        const res = await api.jewelry.get('Mold/PlanGet', param)
        if (res) {
          this.data = {
            ...res,
            gems: res.gems.map((item) => {
              return {
                ...item,
                gem: this.masterGem.find((gem) => gem.code === item.gemCode),
                gemShape: this.masterGemShape.find((shape) => shape.code === item.gemShapeCode)
              }
            })
          }
        }

        console.log(this.data)
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },
    async fetchUpdateGems(gems) {
      try {
        this.isLoading = true
        //console.log('fetchdata', id)

        const res = await api.jewelry.post('Mold/PlanGems', gems)
        if (res) {
          this.fetchData()
        }

        console.log(this.data)
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },
    async fetchMasterGem() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGem')
        if (res) {
          this.masterGem = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMasterGemShape() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('Master/MasterGemShape')
        if (res) {
          this.masterGemShape = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchMelting() {
      try {
        this.isLoading = true

        const param = {
          id: this.id
        }
        const res = await api.jewelry.post('Mold/PlanMelting', param)
        if (res) {
          this.fetchData()
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  },
  async created() {
    //get id from route
    this.id = this.$route.params.id
    //console.log(this.id)
    //this.fetchData()
    this.$nextTick(async () => {
      this.fetchMasterGem(), this.fetchMasterGemShape(), this.fetchData()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
