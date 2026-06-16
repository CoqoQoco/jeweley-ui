<template>
  <div class="app-container">
    <div class="box-center">
      <stepperStatus :events="events" :eventsIdActive="1"></stepperStatus>
    </div>
    <div id="step1" class="filter-container mt-2">
      <form @submit.prevent="onSubmit">
        <!-- mold code -->
        <div class="form-col-container">
          <div>
            <div>
              <span class="title-text">{{ $t('view.mold.createDesign.fieldMoldCode') }}</span>
              <span class="txt-required"> *</span>
            </div>
            <input
              type="text"
              class="form-control"
              :class="form.moldCode ? `` : `bg-warning`"
              v-model="form.moldCode"
              required
            />
          </div>
          <div>
            <div>
              <span class="title-text">{{ $t('view.mold.createDesign.fieldCategory') }}</span>
              <span class="txt-required"> *</span>
            </div>
            <DropdownGeneric
              :modelValue="form.category"
              :options="masterProduct"
              optionLabel="description"
              :showClear="!!form.category"
              :class="val.isValCategory === true ? `p-invalid` : ``"
              @update:modelValue="onCategoryChange"
            />
          </div>
          <div>
            <span>
              <span class="title-text">{{ $t('view.mold.createDesign.fieldDesignBy') }}</span>
              <span class="txt-required"> *</span>
            </span>
            <input type="text" required class="form-control" v-model="form.designBy" />
          </div>
        </div>

        <!-- qty -->
        <div class="form-col-container">
          <div>
            <div>
              <span class="title-text">{{ $t('view.mold.createDesign.fieldWeightReceive') }}</span>
              <span class="txt-required"> *</span>
            </div>
            <input
              type="number"
              step="any"
              class="form-control"
              required
              v-model="form.qtyBeforeCasting"
            />
          </div>
          <div>
            <div>
              <span class="title-text">{{ $t('view.mold.createDesign.fieldWeightSend') }}</span>
              <span class="txt-required"> *</span>
            </div>
            <input
              type="number"
              step="any"
              class="form-control"
              required
              v-model="form.qtyBeforeSend"
            />
          </div>
          <div></div>
        </div>

        <!-- remark -->
        <div class="form-col-container">
          <div>
            <span class="title-text">{{ $t('view.mold.createDesign.fieldRemark') }}</span>
            <textarea class="form-control" v-model="form.remark" style="height: 50px" />
          </div>
        </div>

        <!-- image -->
        <div class="mt-2">
          <uploadImages
            :title="$t('view.mold.createDesign.imgTitle')"
            @onUpdateFile="updateFile"
          ></uploadImages>
        </div>

        <!-- gems -->
        <div class="mt-4">
          <div class="title-text-lg-header">
            <span>{{ $t('view.mold.createDesign.gemsTitle') }}</span>
          </div>
          <div>
            <!-- eslint-disable-next-line no-restricted-imports -->
            <DataTable
              class="p-datatable-sm"
              showGridlines
              v-model:editingRows="editingRows"
              :value="form.gems"
              editMode="row"
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
              <!-- eslint-disable-next-line no-restricted-imports -->
              <Column :rowEditor="true" style="width: 100px" bodyStyle="text-align:center">
              </Column>
              <!-- eslint-disable-next-line no-restricted-imports -->
              <Column style="width: 60px">
                <template #body="prop">
                  <div class="btn btn-red text-center w-100" @click="onDelGems(prop.data)">
                    <i class="bi bi-trash-fill"></i>
                  </div>
                </template>
              </Column>

              <!-- eslint-disable-next-line no-restricted-imports -->
              <Column :field="'gem'" :header="$t('view.mold.createDesign.colGemType')" style="min-width: 150px">
                <template #body="slotProps">
                  <span>{{ slotProps.data.gem?.description }}</span>
                </template>
                <template #editor="{ data, field }">
                  <!-- eslint-disable-next-line no-restricted-imports -->
                  <Dropdown
                    v-model="data[field]"
                    :options="masterGem"
                    optionLabel="description"
                    class="w-full md:w-14rem"
                    :placeholder="$t('view.mold.gems.selectGem')"
                    :showClear="data[field] ? true : false"
                  />
                </template>
              </Column>
              <!-- eslint-disable-next-line no-restricted-imports -->
              <Column :field="'gemShape'" :header="$t('view.mold.createDesign.colGemShape')" style="min-width: 150px">
                <template #body="slotProps">
                  <span>{{ slotProps.data.gemShape?.description }}</span>
                </template>
                <template #editor="{ data, field }">
                  <!-- eslint-disable-next-line no-restricted-imports -->
                  <Dropdown
                    v-model="data[field]"
                    :options="masterGemShape"
                    optionLabel="description"
                    class="w-full md:w-14rem"
                    :placeholder="$t('view.mold.gems.selectShape')"
                    :showClear="data[field] ? true : false"
                  />
                </template>
              </Column>
              <!-- eslint-disable-next-line no-restricted-imports -->
              <Column :field="'size'" :header="$t('view.mold.createDesign.colSize')" style="width: 200px">
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
              <!-- eslint-disable-next-line no-restricted-imports -->
              <Column :field="'qty'" :header="$t('view.mold.createDesign.colQty')" style="width: 200px">
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
                  <div>{{ $t('view.mold.gems.totalItems', { count: form.gems.length }) }}</div>
                  <div class="btn btn-sm btn-main" @click="onAddGems">
                    <span class="text-center">
                      <i class="bi bi-plus"></i>
                    </span>
                  </div>
                </div>
              </template>
            </DataTable>
          </div>
        </div>

        <!-- btn -->
        <div class="d-flex justify-content-end mt-3">
          <button class="btn btn-sm btn-main" type="submit">
            <span class="mr-2">
              <i class="bi bi-gem"></i>
            </span>
            <span>{{ $t('view.mold.createDesign.btnSubmit') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { eventStatus, mateiralType } from './interface/data.js'

const stepperStatus = defineAsyncComponent(() => import('@/components/prime-vue/StepperStatus.vue'))
const uploadImages = defineAsyncComponent(() => import('@/components/prime-vue/UploadImages.vue'))

// eslint-disable-next-line no-restricted-imports
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'
// eslint-disable-next-line no-restricted-imports
import Dropdown from 'primevue/dropdown'

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-helper.js'

const interfaceForm = {
  images: [],
  moldCode: null,
  qtyBeforeCasting: null,
  qtyBeforeSend: null,
  remark: null,
  category: null,
  designBy: null,
  gems: []
}
const interfaceGem = {
  gem: null,
  gemShape: null,
  size: null,
  qty: null
}
const interfaceVal = {
  isValCategory: false
}
export default {
  components: {
    stepperStatus,
    uploadImages,
    DropdownGeneric,
    DataTable,
    Column,
    Dropdown
  },
  watch: {
    'form.category'() {
      if (this.form.category) {
        this.val.isValCategory = false
      }
    }
  },
  data() {
    return {
      events: [...eventStatus],
      mateiralType: [...mateiralType],
      form: { ...interfaceForm },
      val: { ...interfaceVal },

      masterProduct: [],
      masterGem: [],
      masterGemShape: [],

      editingRows: [],
      autoId: 0
    }
  },
  methods: {
    onCategoryChange(value) {
      this.form.category = value
      if (value) this.val.isValCategory = false
    },
    onSubmit() {
      if (this.VaidateForm()) {
        confirmSubmit(
          `${this.form.moldCode}`,
          this.$t('view.mold.createDesign.confirmTitle'),
          async () => {
            await this.submit()
          },
          null,
          null
        )
      }
    },
    onclear() {
      this.form = { ...interfaceForm }
    },
    updateFile(files) {
      this.form.images = files
    },
    VaidateForm() {
      if (!this.form.category) {
        this.val = { isValCategory: true }
        return false
      }
      return true
    },

    onRowEditSave(event) {
      let { newData, index } = event
      this.form.gems[index] = newData
    },
    onDelGems(item) {
      const index = this.form.gems.indexOf(item)
      this.form.gems.splice(index, 1)
    },
    onAddGems() {
      const addGem = {
        id: ++this.autoId,
        ...interfaceGem
      }
      this.form.gems.push(addGem)
    },

    async fetchMasterProductType() {
      const res = await api.jewelry.get('Master/MasterProductType')
      if (res) {
        this.masterProduct = [...res]
      }
    },
    async submit() {
      let params = new FormData()
      params.append('moldCode', this.form.moldCode)
      params.append('qtySend', this.form.qtyBeforeCasting)
      params.append('qtyReceive', this.form.qtyBeforeSend)
      params.append('remark', this.form.remark)
      params.append('Catagory', this.form.category?.code)
      params.append('designBy', this.form.designBy)

      this.form.images.forEach((file) => {
        params.append(`images`, file)
      })

      if (this.form.gems && this.form.gems.length > 0) {
        this.form.gems.forEach((item, index) => {
          if (item.gem && item.gemShape) {
            params.append(`gems[${index}][gemCode]`, item.gem.code)
            params.append(`gems[${index}][gemShapeCode]`, item.gemShape.code)
            params.append(`gems[${index}][size]`, item.size)
            params.append(`gems[${index}][qty]`, item.qty)
          }
        })
      }

      let options = {
        headers: {
          'Content-Type': `multipart/form-data`
        }
      }
      const res = await api.jewelry.post('Mold/PlanDesign', params, options)
      if (res) {
        success(``, '', () => {
          this.onclear()
          this.$router.push({ name: 'plan-list' })
        }, null, null)
      }
    },
    async fetchMasterGem() {
      const res = await api.jewelry.get('Master/MasterGem')
      if (res) {
        this.masterGem = [...res]
      }
    },
    async fetchMasterGemShape() {
      const res = await api.jewelry.get('Master/MasterGemShape')
      if (res) {
        this.masterGemShape = [...res]
      }
    }
  },
  created() {
    this.$nextTick(() => {
      this.fetchMasterProductType()
      this.fetchMasterGem()
      this.fetchMasterGemShape()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
