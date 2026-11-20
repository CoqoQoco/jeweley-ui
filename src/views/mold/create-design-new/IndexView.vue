<template>
  <div class="app-container">
    <div class="box-center">
      <stepperStatus :events="events" :eventsIdActive="1"></stepperStatus>
    </div>
    <div id="step1" class="filter-container mt-2">
      <div>
        <span class="title-text-lg mb-2">{{ $t('view.mold.createDesign.titleNew') }}</span>
      </div>
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
          <div></div>
        </div>

        <!-- resin -->
        <div class="form-col-container mt-2">
          <div>
            <span>
              <span class="title-text">{{ $t('view.mold.createDesign.fieldDesignBy') }}</span>
              <span class="txt-required"> *</span>
            </span>
            <input type="text" required class="form-control" v-model="form.designBy" />
          </div>
          <div>
            <span>
              <span class="title-text">{{ $t('view.mold.createDesign.fieldResinBy') }}</span>
              <span class="txt-required"> *</span>
            </span>
            <input type="text" required class="form-control" v-model="form.ResinBy" />
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
              :value="form.gems"
              dataKey="id"
              :pt="{ table: { style: 'min-width: 50rem' } }"
            >
              <Column style="width: 60px">
                <template #body="{ data }">
                  <ButtonGeneric
                    variant="red"
                    type="button"
                    icon="bi-trash-fill"
                    class="w-100"
                    :title="$t('common.btn.delete')"
                    @click="onDelGems(data)"
                  />
                </template>
              </Column>

              <Column :field="'gem'" :header="$t('view.mold.createDesign.colGemType')" style="min-width: 150px">
                <template #body="{ data }">
                  <DropdownGeneric
                    v-model="data.gem"
                    :options="masterGem"
                    optionLabel="description"
                    :placeholder="$t('view.mold.gems.selectGem')"
                    :ariaLabel="$t('view.mold.createDesign.colGemType')"
                    :showClear="data.gem ? true : false"
                  />
                </template>
              </Column>
              <Column :field="'gemShape'" :header="$t('view.mold.createDesign.colGemShape')" style="min-width: 150px">
                <template #body="{ data }">
                  <DropdownGeneric
                    v-model="data.gemShape"
                    :options="masterGemShape"
                    optionLabel="description"
                    :placeholder="$t('view.mold.gems.selectShape')"
                    :ariaLabel="$t('view.mold.createDesign.colGemShape')"
                    :showClear="data.gemShape ? true : false"
                  />
                </template>
              </Column>
              <Column :field="'size'" :header="$t('view.mold.createDesign.colSize')" style="width: 200px">
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model="data.size"
                    type="text"
                    :aria-label="$t('view.mold.createDesign.colSize')"
                  />
                </template>
              </Column>
              <Column :field="'qty'" :header="$t('view.mold.createDesign.colQty')" style="width: 200px">
                <template #body="{ data }">
                  <InputTextGeneric
                    v-model.number="data.qty"
                    type="number"
                    min="1"
                    :aria-label="$t('view.mold.createDesign.colQty')"
                  />
                </template>
              </Column>
              <template #footer>
                <div class="d-flex justify-content-between">
                  <div>{{ $t('view.mold.gems.totalItems', { count: form.gems.length }) }}</div>
                  <ButtonGeneric
                    variant="main"
                    type="button"
                    icon="bi-plus"
                    :title="$t('common.btn.add')"
                    @click="onAddGems"
                  />
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
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

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
  ResinBy: null,
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
    ButtonGeneric,
    InputTextGeneric
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

    onDelGems(item) {
      const byRef = this.form.gems.indexOf(item)
      const index =
        byRef >= 0 ? byRef : item?.id != null ? this.form.gems.findIndex((x) => x.id === item.id) : -1
      if (index < 0) return
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
      params.append('qtySend', 0)
      params.append('qtyReceive', 0)
      params.append('remark', this.form.remark)
      params.append('Catagory', this.form.category?.code)
      params.append('designBy', this.form.designBy)
      params.append('ResinBy', this.form.ResinBy)

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
      const res = await api.jewelry.post('Mold/NewPlanDesign', params, options)
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
