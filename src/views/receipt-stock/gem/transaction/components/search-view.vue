<template>
  <div class="filter-container-searchBar">
    <pageTitle
      title="การเคลื่อนไหว วัถุดิบ"
      description="ตรวจรายการเคลื่อนไหว รับ/จ่าย ยืม/คืน เเละใบเบิก วัถุดิบ"
      :isShowBtnClose="false"
      :isShowRightSlot="false"
    >
      <template #rightSlot>
        <div>
          <button class="btn btn-sm btn-main" @click="onShowCreate">
            <i class="bi bi-pencil"></i>
            <span class="ml-2">สร้างข้อมูลวัถุดิบ</span>
          </button>
        </div>
      </template>
    </pageTitle>
    <form @submit.prevent="onSubmit">
      <div class="form-col-container">
        <!-- requestDate -->
        <div>
          <span class="title-text">{{ $t('view.receiptStock.gem.transaction.transactionDate') }}</span>
          <div class="flex-group">
            <CalendarGeneric
              class="w-100"
              v-model="form.requestDateStart"
              :max-date="form.requestDateEnd"
              :manualInput="false"
              dateFormat="dd/mm/yy"
              :showIcon="true"
              :placeholder="$t('common.label.start')"
            />
            <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
            <CalendarGeneric
              class="w-100"
              v-model="form.requestDateEnd"
              :min-date="form.requestDateStart"
              :manualInput="false"
              dateFormat="dd/mm/yy"
              :showIcon="true"
              :placeholder="$t('common.label.end')"
            />
          </div>
        </div>

        <div class="form-col-container">
          <!-- type -->
          <div>
            <div>
              <span class="title-text">{{ $t('view.receiptStock.gem.transaction.transactionType') }}</span>
              <span class="txt-required"> *</span>
            </div>
            <MultiSelectGeneric
              v-model="form.type"
              :options="masterType"
              optionLabel="description"
              optionValue="id"
            />
          </div>

          <!-- code -->
          <div>
            <span class="title-text">{{ $t('common.field.code') }}</span>
            <InputTextGeneric v-model="form.code" />
          </div>
        </div>
      </div>

      <dialogView
        :isShow="isShow.dialog"
        @closeDialog="closeDialog"
        @search="dialogSearch"
        txtHeader="ค้นหาเพิ่มเติม"
      >
        <template #content>
          <div class="form-col-container">
            <!-- groupName -->
            <div>
              <span class="title-text">{{ $t('view.receiptStock.gem.transaction.groupName') }}</span>
              <MultiSelectGeneric
                v-model="form.groupName"
                :options="groupOptions"
                optionLabel="value"
                optionValue="value"
              />
            </div>

            <!-- shape -->
            <div>
              <span class="title-text">{{ $t('view.receiptStock.gem.transaction.shape') }}</span>
              <MultiSelectGeneric
                v-model="form.shape"
                :options="shapeOptions"
                optionLabel="value"
                optionValue="value"
              />
            </div>

            <!-- size -->
            <div>
              <span class="title-text">{{ $t('view.receiptStock.gem.transaction.size') }}</span>
              <MultiSelectGeneric
                v-model="form.size"
                :options="sizeOptions"
                optionLabel="value"
                optionValue="value"
              />
            </div>

            <!-- grade -->
            <div>
              <span class="title-text">{{ $t('view.receiptStock.gem.transaction.grade') }}</span>
              <MultiSelectGeneric
                v-model="form.grade"
                :options="gradeOptions"
                optionLabel="value"
                optionValue="value"
              />
            </div>

            <!-- job/po -->
            <div>
              <span class="title-text">{{ $t('view.receiptStock.gem.transaction.invoiceRef') }}</span>
              <InputTextGeneric v-model="form.jobOrPo" />
            </div>

            <!-- running -->
            <div>
              <span class="title-text">{{ $t('view.receiptStock.gem.transaction.refNo') }}</span>
              <InputTextGeneric v-model="form.running" />
            </div>
          </div>
        </template>
      </dialogView>

      <div class="btn-submit-container">
        <button class="btn btn-sm btn-main mr-2" type="submit" title="ค้นหา">
          <span><i class="bi bi-search"></i></span>
          <!-- <span>ค้นหา</span> -->
        </button>
        <button
          class="btn btn-sm btn-sub-main mr-2"
          type="button"
          title="เพิ่มเติม"
          @click="onShowDialog"
        >
          <span><i class="bi bi-zoom-in"></i></span>
          <!-- <span>ค้นหา</span> -->
        </button>
        <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" title="ล้าง">
          <span><i class="bi bi-x-circle"></i></span>
          <!-- <span>ล้าง</span> -->
        </button>
        <button
          class="btn btn-sm btn-green"
          type="button"
          :disabled="!isExportData"
          @click="onSubmitExport"
          title="ออกเอกสาร"
        >
          <span><i class="bi bi-filetype-csv"></i></span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import api from '@/axios/axios-helper.js'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

const interfaceIsShow = {
  isCreate: false,
  dialog: false
}
export default {
  components: {
    pageTitle,
    CalendarGeneric,
    MultiSelectGeneric,
    InputTextGeneric,
    dialogView
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    isExport: {
      type: Boolean,
      default: false
    },
    modelMasterType: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },
  computed: {
    isExportData() {
      return this.isExport
    },
    masterType() {
      return this.modelMasterType
    }
  },
  data() {
    return {
      form: { ...this.modelForm },
      isShow: { ...interfaceIsShow },
      groupOptions: [],
      gradeOptions: [],
      shapeOptions: [],
      sizeOptions: [],
      masterGemShape: [],
      masterGrade: []
    }
  },
  methods: {
    // ---------------- event
    onSubmit() {
      this.$emit('search', this.form)
    },
    dialogSearch() {
      this.isShow.dialog = false
      this.$emit('search', this.form)
    },
    onSubmitExport() {
      this.$emit('export', true)
    },
    onClear() {
      this.$emit('clear')
    },
    onCloseModal() {
      this.isShow = { ...interfaceIsShow }
    },
    onShowCreate() {
      this.isShow.isCreate = true
    },
    onShowDialog() {
      this.isShow.dialog = true
    },
    closeDialog() {
      this.isShow.dialog = false
    },

    async fetchMasterData(type) {
      let params = null
      let url = null
      let res = null

      switch (type) {
        case 'GROUPGEM':
          params = { type: 'GROUPGEM', Value: null }
          url = 'StockGem/GroupGemData'
          break
        case 'SIZE':
          params = { type: 'SIZE', Value: null }
          url = 'StockGem/GroupGemData'
          break
        case 'GRADE':
          params = { type: 'GRADE', Value: null }
          url = 'StockGem/GroupGemData'
          break
        case 'SHAPE':
          params = { type: 'SHAPE', Value: null }
          url = 'StockGem/GroupGemData'
          break
        case 'MASTERGEMSHAPE':
          url = 'Master/MasterGemShape'
          break
      }

      if (type === 'MASTERGEMSHAPE') {
        res = await api.jewelry.get(url)
      } else {
        res = await api.jewelry.post(url, params)
      }

      if (res) {
        switch (type) {
          case 'GROUPGEM':
            this.groupOptions = [...res]
            break
          case 'SIZE':
            this.sizeOptions = [...res]
            break
          case 'GRADE':
            this.gradeOptions = [...res]
            break
          case 'SHAPE':
            this.shapeOptions = [...res]
            break
          case 'MASTERGEMSHAPE':
            this.masterGemShape = [...res]
            break
        }
      }
    }
  },
  created() {
    this.$nextTick(() => {
      this.fetchMasterData('GROUPGEM')
      this.fetchMasterData('SIZE')
      this.fetchMasterData('GRADE')
      this.fetchMasterData('SHAPE')
      this.fetchMasterData('MASTERGEMSHAPE')
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';

.header-bar-container {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 2fr;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
