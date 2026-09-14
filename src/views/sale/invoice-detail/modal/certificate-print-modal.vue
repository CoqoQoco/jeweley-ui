<template>
  <DrawerGeneric
    :show="isShowModal"
    width="920px"
    :isShowActionPart="true"
    headerVariant="main"
    @close="closeModal"
  >
    <template #title>
      <span class="drawer-print-title">
        <i class="bi bi-award mr-2"></i>
        {{ $t('view.sale.certificate.title') }}
      </span>
    </template>

    <template #content>
      <div class="certificate-print-container p-3">
        <!-- Info Container -->
        <div class="filter-container-search mb-3">
          <div class="p-3">
            <div class="info-grid mb-2">
              <div>
                <span class="info-label-sm">{{ $t('view.sale.certificate.invoiceNumber') }}</span>
                <div class="info-value-sm">{{ invoiceData?.invoiceNumber || '-' }}</div>
              </div>
              <div>
                <span class="info-label-sm">{{ $t('view.sale.certificate.customer') }}</span>
                <div class="info-value-sm">{{ invoiceData?.customerName || '-' }}</div>
              </div>
              <div>
                <span class="info-label-sm">{{ $t('view.sale.certificate.itemsCount') }}</span>
                <div class="info-value-sm">{{ certificates.length }}</div>
              </div>
            </div>
            <div class="d-flex align-items-start">
              <i class="bi bi-info-circle text-info mr-2 info-icon"></i>
              <p class="mb-0 info-text">{{ $t('view.sale.certificate.hint') }}</p>
            </div>
          </div>
        </div>

        <!-- Brand Container -->
        <SectionCardGeneric
          headerStyle="legend"
          accent="main"
          icon="bi-building"
          :title="$t('view.sale.certificate.brand.title')"
          class="mb-3"
        >
          <RadioGroupGeneric
            :modelValue="brand.mode"
            :options="brandModeOptions"
            optionValue="value"
            optionLabel="label"
            :inline="true"
            class="mb-3"
            @update:modelValue="onBrandModeChange"
          />

          <template v-if="brand.mode === 'customer'">
            <FormFieldGeneric :label="$t('view.sale.certificate.brand.companyName')" inputId="certificate-brand-name">
              <InputTextGeneric id="certificate-brand-name" v-model.trim="brand.name" type="text" :maxlength="80" />
            </FormFieldGeneric>

            <FormFieldGeneric :label="$t('view.sale.certificate.brand.logo')" class="brand-logo-field">
              <UploadImage
                :modelValue="brand.logoFile"
                :previewUrl="brand.logoDataUrl"
                accept="image/png,image/jpeg"
                :maxSizeMB="5"
                :previewSize="70"
                :compact="true"
                :showClear="true"
                @update:modelValue="onBrandLogoSelected"
                @clear="onBrandLogoClear"
              />
            </FormFieldGeneric>
          </template>

          <div class="brand-options" :class="{ 'brand-options--spaced': brand.mode === 'customer' }">
            <CheckboxGeneric
              v-if="brand.mode === 'customer'"
              v-model="brand.showManufacturer"
              :label="$t('view.sale.certificate.brand.showManufacturer')"
            />

            <CheckboxGeneric
              v-model="brand.showQr"
              :label="$t('view.sale.certificate.brand.showQr')"
            />

            <CheckboxGeneric
              v-if="brand.mode === 'customer' && !isWalkIn && invoiceData?.customerCode"
              v-model="saveBrandAsCustomerDefault"
              :label="$t('view.sale.certificate.brand.saveAsDefault')"
            />
          </div>
        </SectionCardGeneric>

        <!-- History Container -->
        <SectionCardGeneric
          headerStyle="legend"
          accent="main"
          icon="bi-clock-history"
          :title="`${$t('view.sale.certificate.historyTitle')} (${historyGroups.length})`"
          class="mb-3"
        >
          <div v-if="historyGroups.length === 0" class="history-empty">
            {{ $t('view.sale.certificate.historyEmpty') }}
          </div>
          <div v-else class="history-list">
            <div v-for="round in historyGroups" :key="round.batch" class="history-round">
              <button type="button" class="history-round__header" @click="toggleRound(round.batch)">
                <i class="bi" :class="isRoundExpanded(round.batch) ? 'bi-caret-down-fill' : 'bi-caret-right-fill'"></i>
                <span class="history-round__label">
                  {{ $t('view.sale.certificate.historyRound', { round: round.round }) }}
                </span>
                <span class="history-round__meta">
                  {{ formatHistoryDate(round.printedAt) }} · {{ round.printedBy }} ·
                  {{ $t('view.sale.certificate.historyItems', { count: round.count }) }}
                  <template v-if="round.brandName"> · {{ round.brandName }}</template>
                </span>
              </button>

              <div v-if="isRoundExpanded(round.batch)" class="history-round__rows">
                <div v-for="row in round.rows" :key="row.running" class="history-row">
                  <div class="history-row__info">
                    <span class="history-row__cert">{{ row.certificateNo }}</span>
                    <span class="history-row__issue">
                      · {{ $t('view.sale.certificate.issueNo') }} {{ row.issueNo }}
                    </span>
                    <span v-if="row.isLegacy" class="history-row__legacy-badge">
                      {{ $t('view.sale.certificate.legacyRecord') }}
                    </span>
                  </div>
                  <div class="history-row__actions">
                    <ButtonGeneric
                      variant="outline"
                      icon="bi-eye"
                      :disabled="row.isLegacy"
                      :title="$t('view.sale.certificate.viewPdf')"
                      @click="viewPdfFromHistory(row)"
                    />
                    <ButtonGeneric
                      variant="green"
                      icon="bi-printer"
                      class="ml-2"
                      :disabled="row.isLegacy"
                      :title="$t('view.sale.certificate.reprintBtn')"
                      @click="reprintFromHistory(row)"
                    />
                    <ButtonGeneric
                      variant="dark"
                      icon="bi-pencil-square"
                      class="ml-2"
                      :disabled="row.isLegacy"
                      :title="$t('view.sale.certificate.loadForEditing')"
                      @click="loadForEditing(row, round.rows)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCardGeneric>

        <!-- Settings Container -->
        <div class="filter-container mb-3">
          <div class="p-3">
            <FormFieldGeneric :label="$t('view.sale.certificate.signerTitle')" inputId="certificate-signer-title">
              <InputTextGeneric id="certificate-signer-title" v-model="signerTitle" type="text" />
            </FormFieldGeneric>
          </div>
        </div>

        <!-- Selection Toolbar -->
        <div class="selection-toolbar mb-3">
          <span class="selection-count">
            {{ $t('view.sale.certificate.selectedCount', { selected: selectedCount, total: certificates.length }) }}
          </span>
          <div class="selection-actions">
            <ButtonGeneric variant="outline" :label="$t('view.sale.certificate.selectAll')" @click="selectAllCertificates" />
            <ButtonGeneric variant="dark" :label="$t('view.sale.certificate.selectNone')" @click="selectNoneCertificates" />
          </div>
        </div>

        <!-- Certificate Items -->
        <SectionCardGeneric
          v-for="(certificate, index) in certificates"
          :key="index"
          headerStyle="legend"
          accent="main"
          icon="bi-award"
          :title="certificateTitle(certificate, index)"
          class="mb-3"
        >
          <CheckboxGeneric
            v-model="certificate.selected"
            :label="$t('view.sale.certificate.printThisCertificate')"
            class="mb-2"
          />

          <div
            class="issue-badge mb-3"
            :class="getIssueStat(certificate.stockNumber).count > 0 ? 'issue-badge--issued' : 'issue-badge--never'"
          >
            <template v-if="getIssueStat(certificate.stockNumber).count > 0">
              {{ $t('view.sale.certificate.issuedCount', { count: getIssueStat(certificate.stockNumber).count }) }}
              <span class="mx-1">·</span>
              {{
                $t('view.sale.certificate.lastIssued', {
                  date: formatHistoryDate(getIssueStat(certificate.stockNumber).lastAt),
                  by: getIssueStat(certificate.stockNumber).lastBy
                })
              }}
            </template>
            <template v-else>{{ $t('view.sale.certificate.neverIssued') }}</template>
          </div>

          <div class="field-group-title">{{ $t('view.sale.certificate.photo.sectionTitle') }}</div>
          <div class="photo-row mb-3">
            <div class="photo-thumb">
              <img v-if="currentPhotoPreview(certificate)" :src="currentPhotoPreview(certificate)" alt="" />
              <i v-else class="bi bi-image photo-thumb-placeholder"></i>
            </div>
            <div class="photo-controls">
              <RadioGroupGeneric
                v-model="certificate.photoSource"
                :options="photoSourceOptions"
                optionValue="value"
                optionLabel="label"
                :inline="true"
                :disabled="!certificate.selected"
              />
              <div class="photo-actions mt-2">
                <UploadImage
                  :modelValue="certificate.newPhotoFile"
                  :previewUrl="null"
                  accept="image/*"
                  :maxSizeMB="5"
                  :compact="true"
                  :showClear="false"
                  @update:modelValue="onNewPhotoSelected(certificate, $event)"
                />
                <ButtonGeneric
                  v-if="certificate.photoSource === 'new' || certificate.customImagePath"
                  variant="dark"
                  icon="bi-arrow-counterclockwise"
                  :label="$t('view.sale.certificate.photo.backToStock')"
                  class="ml-2"
                  @click="resetToStockImage(certificate)"
                />
              </div>
            </div>
          </div>

          <div class="field-group-title">{{ $t('view.sale.certificate.groupItemInfo') }}</div>
          <div class="form-row two-col mb-3">
            <FormFieldGeneric :label="$t('view.sale.certificate.certificateNo')">
              <InputTextGeneric v-model="certificate.certificateNo" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.itemNo')">
              <InputTextGeneric v-model="certificate.itemNo" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.issueDate')">
              <InputTextGeneric v-model="certificate.issueDate" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.description')">
              <InputTextGeneric v-model="certificate.description" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.model')">
              <InputTextGeneric v-model="certificate.model" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.metal')">
              <InputTextGeneric v-model="certificate.metal" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.metalWeight')">
              <InputTextGeneric v-model="certificate.metalWeight" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.itemSize')">
              <InputTextGeneric v-model="certificate.itemSize" :disabled="!certificate.selected" />
            </FormFieldGeneric>
          </div>

          <template v-if="certificate.hasDiamond">
            <div class="field-group-title">{{ $t('view.sale.certificate.groupDiamond') }}</div>
            <div class="form-row two-col mb-3">
              <FormFieldGeneric :label="$t('view.sale.certificate.diamondPcs')">
                <InputTextGeneric v-model="certificate.diamondPcs" type="number" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.diamondWeight')">
                <InputTextGeneric v-model="certificate.diamondWeight" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.diamondQuality')">
                <InputTextGeneric v-model="certificate.diamondQuality" :disabled="!certificate.selected" />
              </FormFieldGeneric>
            </div>
          </template>

          <template v-if="certificate.hasGem">
            <div class="field-group-title">{{ $t('view.sale.certificate.groupGem') }}</div>
            <div class="form-row two-col mb-3">
              <FormFieldGeneric :label="$t('view.sale.certificate.gemVariety')">
                <InputTextGeneric v-model="certificate.gemVariety" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemSpecies')">
                <InputTextGeneric v-model="certificate.gemSpecies" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemOrigin')">
                <InputTextGeneric v-model="certificate.gemOrigin" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemWeight')">
                <InputTextGeneric v-model="certificate.gemWeight" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemMeasurement')">
                <InputTextGeneric v-model="certificate.gemMeasurement" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemShape')">
                <InputTextGeneric v-model="certificate.gemShape" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemCut')">
                <InputTextGeneric v-model="certificate.gemCut" :disabled="!certificate.selected" />
              </FormFieldGeneric>
              <FormFieldGeneric :label="$t('view.sale.certificate.gemColor')">
                <InputTextGeneric v-model="certificate.gemColor" :disabled="!certificate.selected" />
              </FormFieldGeneric>
            </div>
          </template>

          <div class="field-group-title">{{ $t('view.sale.certificate.groupRemark') }}</div>
          <div class="form-row two-col">
            <FormFieldGeneric :label="$t('view.sale.certificate.treatment')">
              <InputTextGeneric v-model="certificate.treatment" :disabled="!certificate.selected" />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.sale.certificate.comment')">
              <InputTextGeneric v-model="certificate.comment" :disabled="!certificate.selected" />
            </FormFieldGeneric>
          </div>
        </SectionCardGeneric>
      </div>
    </template>

    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-eye"
        :label="$t('view.sale.certificate.previewBtn')"
        class="mr-2"
        :disabled="selectedCount === 0"
        @click="onPreview"
      />

      <ButtonGeneric
        variant="green"
        icon="bi-download"
        :label="$t('view.sale.certificate.downloadBtnCount', { selected: selectedCount, total: certificates.length })"
        class="mr-2"
        :disabled="selectedCount === 0"
        @click="onDownload"
      />

      <ButtonGeneric
        variant="outline"
        icon="bi-x-circle"
        :label="$t('view.sale.certificate.cancelBtn')"
        @click="closeModal"
      />
    </template>
  </DrawerGeneric>
</template>

<script>
import dayjs from 'dayjs'
import { warning, success } from '@/services/alert/sweetAlerts.js'
import { useCertificateApiStore } from '@/stores/modules/api/sale/certificate-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { getAzureBlobAsBase64 } from '@/config/azure-storage-config.js'
import { compressImage } from '@/services/utils/image-compress.js'
import { prepareItemImages } from '@/services/helper/pdf/shared/pdf-images.js'
import {
  buildCertificatesFromItems,
  groupCertificateHistory,
  buildCertificateIssueStatsFromHistory,
  restoreCertificateFromSnapshot,
  isWalkInCustomer
} from '@/services/helper/pdf/certificate/certificate-data.js'
import DrawerGeneric from '@/components/generic/DrawerGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'
import UploadImage from '@/components/prime-vue/UploadImage.vue'

export default {
  name: 'CertificatePrintModal',

  components: {
    DrawerGeneric,
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric,
    CheckboxGeneric,
    RadioGroupGeneric,
    UploadImage
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    invoiceData: {
      type: Object,
      default: () => ({})
    },
    invoiceItems: {
      type: Array,
      default: () => []
    },
    defaultSignerTitle: {
      type: String,
      default: 'General Manager'
    },
    historyVersion: {
      type: Number,
      default: 0
    }
  },

  emits: ['close-modal', 'preview-print', 'confirm-print'],

  data() {
    return {
      productStore: usrStockProductApiStore(),
      certificateStore: useCertificateApiStore(),
      certificates: [],
      signerTitle: this.defaultSignerTitle,
      historyRows: [],
      expandedBatches: {},
      customImagePreviews: {},
      brand: {
        mode: 'dk',
        name: '',
        logoPath: null,
        logoFile: null,
        logoDataUrl: null,
        showManufacturer: true,
        showQr: true
      },
      saveBrandAsCustomerDefault: false
    }
  },

  computed: {
    selectedCount() {
      return this.certificates.filter((c) => c.selected === true).length
    },

    // WALKIN เป็นรหัสที่ลูกค้าหน้าร้านหลายคนใช้ร่วมกัน — ห้ามผูก/โหลดตราสินค้าเข้ากับรหัสนี้เด็ดขาด
    isWalkIn() {
      return isWalkInCustomer(this.invoiceData?.customerCode)
    },

    historyGroups() {
      return groupCertificateHistory(this.historyRows)
    },

    issueStats() {
      return buildCertificateIssueStatsFromHistory(this.certificates, this.historyRows)
    },

    brandModeOptions() {
      return [
        { value: 'dk', label: this.$t('view.sale.certificate.brand.modeDk') },
        { value: 'customer', label: this.$t('view.sale.certificate.brand.modeCustomer') }
      ]
    },

    photoSourceOptions() {
      return [
        { value: 'stock', label: this.$t('view.sale.certificate.photo.stockImage') },
        { value: 'new', label: this.$t('view.sale.certificate.photo.newPhoto') }
      ]
    }
  },

  watch: {
    isShowModal: {
      async handler(newVal) {
        if (newVal) {
          this.signerTitle = this.defaultSignerTitle
          this.resetBrand()
          this.saveBrandAsCustomerDefault = false
          this.expandedBatches = {}
          await this.buildCertificates()
          await this.buildBrandDefaults()
          this.loadHistory()
        }
      },
      immediate: true
    },

    historyVersion() {
      if (this.isShowModal) {
        this.loadHistory()
      }
    }
  },

  methods: {
    closeModal() {
      this.$emit('close-modal')
    },

    resetBrand() {
      this.brand = {
        mode: 'dk',
        name: '',
        logoPath: null,
        logoFile: null,
        logoDataUrl: null,
        showManufacturer: true,
        showQr: true
      }
    },

    async buildCertificates() {
      const enrichedItems = await this.enrichItemsTypeOrigin(this.invoiceItems)
      this.certificates = buildCertificatesFromItems(enrichedItems).map((c) => ({
        ...c,
        newPhotoFile: null,
        newPhotoDataUrl: null
      }))
      await prepareItemImages(this.certificates)
    },

    // typeOrigin ไม่มีใน snapshot ของ invoiceItem — enrich จาก StockProduct/Get ต่อชิ้น
    // ล้มเหลวทั้งก้อนหรือรายชิ้นก็ไม่พังหน้าจอ แค่ใช้ค่าจาก snapshot (fallback typeCode ใน certificate-data.js)
    async enrichItemsTypeOrigin(items) {
      const list = Array.isArray(items) ? items : []
      try {
        return await Promise.all(list.map((item) => this.enrichSingleItem(item)))
      } catch {
        return list
      }
    },

    async enrichSingleItem(item) {
      if (!item.stockNumber || !Array.isArray(item.materials) || !item.materials.length) return item

      try {
        const res = await this.productStore.fetchDataGet({
          formValue: { stockNumber: item.stockNumber },
          skipError: true
        })
        const liveMaterials = Array.isArray(res?.materials) ? res.materials : []

        const materials = item.materials.map((m, idx) => {
          const live = liveMaterials[idx]
          const typeOrigin = m.typeOrigin || (live && live.type === m.type ? live.typeOrigin : '') || m.typeCode
          return { ...m, typeOrigin }
        })

        return { ...item, materials }
      } catch {
        return item
      }
    },

    // ลูกค้ามีตราสินค้าที่บันทึกไว้ก่อน → default เป็นโหมด customer ล่วงหน้า ไม่มี → คงโหมด dk
    // WALKIN ห้ามโหลด/ผูกตราสินค้าเด็ดขาด (รหัสนี้ใช้ร่วมกันโดยลูกค้าหน้าร้านหลายคน) — ข้ามการเรียก API นี้ไปเลย
    async buildBrandDefaults() {
      const customerCode = this.invoiceData?.customerCode
      if (!customerCode || this.isWalkIn) return

      const res = await this.certificateStore.fetchCustomerBrand({ customerCode })
      if (res?.brandName) {
        this.brand.mode = 'customer'
        this.brand.name = res.brandName
        this.brand.logoPath = res.logoPath || null
        this.brand.showManufacturer = true
        this.brand.showQr = false

        if (this.brand.logoPath) {
          this.brand.logoDataUrl = await getAzureBlobAsBase64(this.brand.logoPath, 'certificate')
        }
      }
    },

    async loadHistory() {
      if (!this.invoiceData?.invoiceNumber) {
        this.historyRows = []
        return
      }

      const res = await this.certificateStore.fetchList({ invoiceNumber: this.invoiceData.invoiceNumber })
      this.historyRows = res?.data || []
    },

    formatHistoryDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    getIssueStat(stockNumber) {
      return this.issueStats[stockNumber] || { count: 0, lastAt: null, lastBy: '' }
    },

    // ล็อตเงิน qty > 1 → หลายใบใช้เลขเดียวกัน ใส่ "สำเนาที่ x/N" กันสับสนว่าเป็นใบเดียวกัน
    certificateTitle(certificate, index) {
      const sameStockCertificates = this.certificates.filter((c) => c.stockNumber === certificate.stockNumber)
      const base = `#${index + 1} ${certificate.stockNumber} · ${certificate.itemNo}`
      if (sameStockCertificates.length <= 1) return base
      const copyIndex = sameStockCertificates.indexOf(certificate) + 1
      return `${base} · ${this.$t('view.sale.certificate.copiesPerItem', { index: copyIndex, total: sameStockCertificates.length })}`
    },

    selectAllCertificates() {
      this.certificates.forEach((c) => {
        c.selected = true
      })
    },

    selectNoneCertificates() {
      this.certificates.forEach((c) => {
        c.selected = false
      })
    },

    fileToDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },

    onBrandModeChange(mode) {
      this.brand.mode = mode
      this.brand.showQr = mode !== 'customer'
    },

    async onBrandLogoSelected(file) {
      this.brand.logoFile = file
      this.brand.logoPath = null
      this.brand.logoDataUrl = file ? await this.fileToDataUrl(file) : null
    },

    onBrandLogoClear() {
      this.brand.logoFile = null
      this.brand.logoDataUrl = null
      this.brand.logoPath = null
    },

    async onNewPhotoSelected(certificate, file) {
      if (!file) return
      const compressed = await compressImage(file)
      certificate.newPhotoFile = compressed
      certificate.newPhotoDataUrl = await this.fileToDataUrl(compressed)
      certificate.photoSource = 'new'
      certificate.customImagePath = null
    },

    resetToStockImage(certificate) {
      certificate.photoSource = 'stock'
      certificate.newPhotoFile = null
      certificate.newPhotoDataUrl = null
      certificate.customImagePath = null
    },

    currentPhotoPreview(certificate) {
      if (certificate.photoSource === 'new') {
        if (certificate.newPhotoDataUrl) return certificate.newPhotoDataUrl
        if (certificate.customImagePath) return this.customImagePreviews[certificate.customImagePath] || null
      }
      return certificate.imageBase64 || null
    },

    loadCustomImagePreview(path) {
      if (!path || this.customImagePreviews[path]) return
      getAzureBlobAsBase64(path, 'certificate').then((base64) => {
        if (base64) this.customImagePreviews = { ...this.customImagePreviews, [path]: base64 }
      })
    },

    toggleRound(batch) {
      this.expandedBatches = { ...this.expandedBatches, [batch]: !this.expandedBatches[batch] }
    },

    isRoundExpanded(batch) {
      return !!this.expandedBatches[batch]
    },

    // ใช้ snapshot ของแถวประวัติสร้าง payload สำหรับ "ดู PDF" / "พิมพ์ซ้ำ" — ไม่แตะ state การ์ดปัจจุบันเลย
    buildHistoryPayload(row) {
      const restored = restoreCertificateFromSnapshot(row.snapshot, { resetIssueDate: false })
      const certificate = { ...restored, newPhotoFile: null, newPhotoDataUrl: null }

      const snapshotBrand = row.snapshot?.brand || {}
      const brand = {
        mode: snapshotBrand.mode || 'dk',
        name: snapshotBrand.name || '',
        logoPath: snapshotBrand.logoPath || null,
        logoFile: null,
        logoDataUrl: null,
        showManufacturer: snapshotBrand.showManufacturer !== false,
        showQr: snapshotBrand.showQr === true
      }

      return {
        certificates: [certificate],
        signerTitle: row.snapshot?.signerTitle || this.signerTitle,
        brand,
        saveBrandAsCustomerDefault: false
      }
    },

    viewPdfFromHistory(row) {
      this.$emit('preview-print', this.buildHistoryPayload(row))
    },

    reprintFromHistory(row) {
      this.$emit('confirm-print', this.buildHistoryPayload(row))
    },

    // โหลด snapshot ของแถวประวัติกลับเข้าการ์ดปัจจุบัน — สินค้าล็อตเงิน (stockNumber ซ้ำ) จับคู่ตามลำดับที่ปรากฏ
    // ในรอบพิมพ์เดิม (roundRows) กับลำดับการ์ดปัจจุบันที่ stockNumber เดียวกัน ไม่ใช่จับคู่ตาม index รวม
    loadForEditing(row, roundRows) {
      const sameStockRows = roundRows.filter((r) => r.stockNumber === row.stockNumber)
      const occurrenceIndex = sameStockRows.indexOf(row)

      const sameStockCards = this.certificates.filter((c) => c.stockNumber === row.stockNumber)
      const targetCard = sameStockCards[occurrenceIndex] ?? sameStockCards[0]

      if (!targetCard) {
        warning(this.$t('view.sale.certificate.loadEditNoMatch'), this.$t('view.sale.certificate.title'))
        return
      }

      const restored = restoreCertificateFromSnapshot(row.snapshot, { resetIssueDate: true })
      Object.assign(targetCard, restored, { newPhotoFile: null, newPhotoDataUrl: null })

      if (targetCard.customImagePath) {
        this.loadCustomImagePreview(targetCard.customImagePath)
      }

      const snapshotBrand = row.snapshot?.brand
      if (snapshotBrand) {
        this.brand.mode = snapshotBrand.mode || 'dk'
        this.brand.name = snapshotBrand.name || ''
        this.brand.logoPath = snapshotBrand.logoPath || null
        this.brand.logoFile = null
        this.brand.logoDataUrl = null
        this.brand.showManufacturer = snapshotBrand.showManufacturer !== false
        this.brand.showQr = snapshotBrand.showQr === true

        if (this.brand.logoPath) {
          getAzureBlobAsBase64(this.brand.logoPath, 'certificate').then((base64) => {
            if (base64) this.brand.logoDataUrl = base64
          })
        }
      }

      if (row.snapshot?.signerTitle) this.signerTitle = row.snapshot.signerTitle

      success(this.$t('view.sale.certificate.loadEditSuccess'), this.$t('view.sale.certificate.title'))
    },

    buildPayload() {
      const selectedCertificates = this.certificates.filter((c) => c.selected === true).map((c) => ({ ...c }))

      return {
        certificates: selectedCertificates,
        signerTitle: this.signerTitle.trim() || 'General Manager',
        brand: {
          mode: this.brand.mode,
          name: this.brand.name.trim(),
          logoPath: this.brand.logoPath,
          logoFile: this.brand.logoFile,
          logoDataUrl: this.brand.logoDataUrl,
          showManufacturer: this.brand.showManufacturer,
          showQr: this.brand.showQr
        },
        saveBrandAsCustomerDefault: this.isWalkIn ? false : this.saveBrandAsCustomerDefault
      }
    },

    validateBrand() {
      if (this.brand.mode === 'customer' && !this.brand.name.trim()) {
        warning(this.$t('view.sale.certificate.brand.validation.nameRequired'), this.$t('common.label.incompleteData'))
        return false
      }
      return true
    },

    validateSelection() {
      const hasSelected = this.certificates.some((c) => c.selected === true)
      if (!hasSelected) {
        warning(
          this.$t('view.sale.certificate.validation.noItemSelected'),
          this.$t('common.label.incompleteData')
        )
        return false
      }
      return true
    },

    onPreview() {
      if (!this.validateBrand()) return
      if (!this.validateSelection()) return
      this.$emit('preview-print', this.buildPayload())
    },

    onDownload() {
      if (!this.validateBrand()) return
      if (!this.validateSelection()) return
      this.$emit('confirm-print', this.buildPayload())
      this.closeModal()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/mixin.scss';

.certificate-print-container {
  // Component-specific styles only
}

.drawer-print-title {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: #ffffff;
}

.info-icon {
  font-size: var(--fs-lg);
}

.info-text {
  font-size: var(--fs-sm);
  color: #6c757d;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-md);
}

.info-label-sm {
  font-size: 0.7rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: block;
  margin-bottom: var(--sp-xs);
}

.info-value-sm {
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  font-weight: 600;
}

.field-group-title {
  font-size: 0.7rem;
  color: var(--base-green);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: var(--sp-sm);
}

.form-row {
  margin-bottom: var(--sp-lg);

  &.two-col {
    @include form-row-grid(2);
  }
}

// History section
.history-empty {
  padding: var(--sp-lg) var(--sp-md);
  text-align: center;
  color: #6c757d;
  font-size: var(--fs-sm);
}

.history-list {
  max-height: 320px;
  overflow-y: auto;
}

.history-round {
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
}

.history-round__header {
  display: flex;
  align-items: baseline;
  gap: var(--sp-sm);
  width: 100%;
  padding: var(--sp-sm) var(--sp-md);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: var(--fs-sm);

  i {
    color: var(--base-font-color);
    flex-shrink: 0;
  }
}

.history-round__label {
  font-weight: 700;
  color: var(--base-font-color);
  flex-shrink: 0;
}

.history-round__meta {
  font-size: 11px;
  color: #6c757d;
}

.history-round__rows {
  padding: 0 var(--sp-md) var(--sp-sm) var(--sp-lg);
}

.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
  padding: var(--sp-xs) 0;
  font-size: var(--fs-sm);
}

.history-row__cert {
  font-weight: 600;
  color: var(--base-font-color);
}

.history-row__issue {
  font-size: 11px;
  color: #6c757d;
}

.history-row__legacy-badge {
  margin-left: var(--sp-sm);
  padding: 2px var(--sp-xs);
  border-radius: var(--radius-sm);
  background: var(--color-highlight-bg);
  color: var(--base-red);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.history-row__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.selection-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-md);
  background: var(--color-highlight-bg);
  border-radius: var(--radius-sm);
}

.selection-count {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-font-color);
}

.selection-actions {
  display: flex;
  gap: var(--sp-sm);
}

// display:block (ไม่ใช่ inline-block) — checkbox ก่อนหน้าเป็น .checkbox-wrapper (inline-flex) ถ้า badge
// ยัง inline-block อยู่ทั้งสองจะลอยติดกันบนบรรทัดเดียว (margin-bottom ของ checkbox ไม่ตัดบรรทัดให้)
.issue-badge {
  display: block;
  width: fit-content;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;

  &--issued {
    background: var(--color-green-bg);
    color: var(--base-green);
  }

  &--never {
    background: var(--color-highlight-bg);
    color: #6c757d;
  }
}

// Brand checkboxes (showManufacturer / showQr / saveAsDefault) — CheckboxGeneric root คือ inline-flex
// ต้องบังคับคอลัมน์เอง ไม่งั้นเช็คบ็อกซ์ทั้งหมดจะลอยติดกันบรรทัดเดียว
.brand-options {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-sm);

  // โหมด customer ต่อจากปุ่ม "เลือกรูป"/"ลบรูป" ของ UploadImage ที่ไม่มี margin-bottom ของตัวเอง
  // (FormFieldGeneric ของ logo ไม่ได้อยู่ใน .form-row จึงไม่มี margin-bottom var(--sp-lg) แบบ field ทั่วไป)
  // เว้นเพิ่มเฉพาะโหมดนี้ — โหมด dk มี mb-3 ของ RadioGroupGeneric เว้นให้อยู่แล้ว ไม่ต้องเพิ่มซ้ำ
  &--spaced {
    margin-top: var(--sp-lg);
  }
}

// Photo section (per certificate card)
.photo-row {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-md);
}

.photo-thumb {
  width: 70px;
  height: 70px;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fafafa;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.photo-thumb-placeholder {
  font-size: 1.5rem;
  color: #ced4da;
}

.photo-controls {
  flex: 1;
  min-width: 0;
}

.photo-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

// UploadImage.vue มี global CSS ที่ centering ปุ่ม "เลือกรูป" กลางกล่อง (.upload-preview{display:grid;
// place-items:center} ชนกับ .upload-container.compact .upload-preview{display:block} ที่ specificity สูงกว่า
// .compact-container{display:flex}) — ห้ามแก้ UploadImage.vue (ใช้อยู่อีก 8 หน้า) จึงบังคับ layout ซ้าย
// เฉพาะภายใน scope นี้ด้วย :deep() ที่ specificity สูงพอชนะ global rule เดิม
.brand-logo-field,
.photo-actions {
  :deep(.upload-container.compact) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  :deep(.upload-preview.compact-container) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-items: start;
    place-items: start;
  }

  :deep(.compact-actions) {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
}
</style>
