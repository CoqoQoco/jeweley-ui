<template>
  <div class="app-container">
  
    <div class="title-text-lg-header mb-2">
      <span>{{ $t('view.production.planPrice.pageTitle') }}</span>
      <span class="bi bi-arrow-right ml-1"></span>
      <span class="ml-1">{{ `${$t('view.production.planPrice.pageBreadcrumb')} ${plan[0]}-${plan[1]}` }}</span>
    </div>
    <form @submit.prevent="onSubmit">
      <!-- transection -->
      <div>
        <DataTable
          :value="tranItems"
          rowGroupMode="subheader"
          groupRowsBy="nameGroup"
          stripedRows
          showGridlines
        >
          <ColumnGroup type="header">
            <Row>
              <Column :header="$t('view.production.planPrice.colWorkDetail')" :colspan="3" />
              <Column :header="$t('view.production.planPrice.colDate')" />
              <Column :header="$t('common.field.quantity')" />
              <Column :header="$t('common.field.price')" />
            </Row>
          </ColumnGroup>

          <Column field="nameGroup"> </Column>
          <Column field="index" style="width: 10px">
            <template #body="slotProps">
              <span>{{ slotProps.index + 1 }}</span>
            </template>
          </Column>
          <Column field="action" style="width: 10px">
            <template #body="slotProps">
              <button
                class="btn btn-sm btn-red"
                type="button"
                title="ลบ"
                @click="delItem(slotProps.index)"
              >
                <span class="bi bi-trash"></span>
              </button>
            </template>
          </Column>
          <Column field="nameDescription">
            <template #body="slotProps">
              <div v-if="slotProps.data.nameGroup === 'ETC'">
                <input
                  type="text"
                  style="background-color: #b5dad4"
                  class="form-control"
                  v-model="slotProps.data.nameDescription"
                  required
                />
              </div>
              <div v-else>
                <span>{{ slotProps.data.nameDescription }}</span>
              </div>
            </template>
          </Column>
          <Column field="date" style="width: 100px">
            <template #body="slotProps">
              <span>{{ formatDate(slotProps.data.date) }}</span>
            </template>
          </Column>
          <Column field="qty" style="width: 130px">
            <template #body="slotProps">
              <div class="text-right">
                <span>{{ slotProps.data.qty }}</span>
              </div>
            </template>
          </Column>
          <Column field="price" style="width: 130px">
            <template #body="slotProps">
              <div>
                <input
                  style="background-color: #b5dad4"
                  v-model="slotProps.data.price"
                  type="number"
                  class="form-control text-right"
                  step="any"
                  min="0"
                  required
                  @blur="onBluePrice(slotProps.data, slotProps.index)"
                />
              </div>
            </template>
          </Column>

          <template #groupheader="slotProps">
            <div class="flex align-items-center gap-2 type-container">
              <span><i class="bi bi-clipboard2-check-fill mr-2"></i></span>
              <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
            </div>
          </template>
          <ColumnGroup type="footer">
            <Row>
              <column :colspan="5">
                <template #footer>
                  <div class="text-right">
                    <span>{{ $t('view.production.planPrice.priceBeforeDiscount') }}</span>
                  </div>
                </template>
              </column>
              <column :colspan="1">
                <template #footer>
                  <div class="text-right">
                    <span>{{ caltotalPrice(tranItems) }}</span>
                  </div>
                </template>
              </column>
            </Row>
          </ColumnGroup>
        </DataTable>
      </div>

      <!-- discounr -->
      <DataTable :value="tranDiscount" stripedRows showGridlines>
        <ColumnGroup type="header">
          <Row>
            <Column :header="$t('view.production.planPrice.colDiscountDetail')" :colspan="3" />
            <Column :header="$t('view.production.planPrice.colDate')" />
            <Column :header="$t('common.field.quantity')" />
            <Column :header="$t('common.field.price')" />
          </Row>
        </ColumnGroup>
        <Column field="index" style="width: 10px">
          <template #body="slotProps">
            <span>{{ slotProps.index + 1 }}</span>
          </template>
        </Column>
        <Column field="del" style="width: 10px">
          <template #body="slotProps">
            <button
              class="btn btn-sm btn-red"
              type="button"
              title="ลบ"
              @click="delItemDiscount(slotProps.index)"
            >
              <span class="bi bi-trash"></span>
            </button>
          </template>
        </Column>
        <Column field="nameDescription">
          <template #body="slotProps">
            <input
              type="text"
              style="background-color: #b5dad4"
              class="form-control"
              v-model="slotProps.data.nameDescription"
              required
            />
          </template>
        </Column>
        <Column field="date" style="width: 100px">
          <template #body="slotProps">
            <span>{{ formatDate(slotProps.data.date) }}</span>
          </template>
        </Column>
        <Column field="qty" style="width: 130px">
          <template #body="slotProps">
            <div class="text-right">
              <span>{{ slotProps.data.qty }}</span>
            </div>
          </template>
        </Column>
        <Column field="price" style="width: 130px">
          <template #body="slotProps">
            <div>
              <input
                style="background-color: #b5dad4"
                v-model="slotProps.data.price"
                type="number"
                class="form-control text-right"
                step="any"
                min="0"
                required
                @blur="onBlueDiscount(slotProps.data, slotProps.index)"
              />
            </div>
          </template>
        </Column>

        <template #groupheader="slotProps">
          <div class="flex align-items-center gap-2 type-container">
            <span><i class="bi bi-clipboard2-check-fill mr-2"></i></span>
            <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
          </div>
        </template>
        <ColumnGroup type="footer">
          <Row>
            <column :colspan="5">
              <template #footer>
                <div class="text-right">
                  <span>{{ $t('view.production.planPrice.priceAfterDiscount') }}</span>
                </div>
              </template>
            </column>
            <column :colspan="1">
              <template #footer>
                <div class="text-right">
                  <span>{{ caltotalPriceAfterDiscount(tranItems, tranDiscount) }}</span>
                </div>
              </template>
            </column>
          </Row>
        </ColumnGroup>
      </DataTable>
      <div></div>

      <div class="text-right mt-2">
        <button type="button" class="btn btn-green mr-2" title="เพิ่มรายการ" @click="addItem">
          <span><i class="bi bi-plus"></i></span>
        </button>
        <button
          type="button"
          class="btn btn-green mr-2"
          title="เพิ่มส่วนลด"
          @click="addItemDiscount"
        >
          <span><i class="bi bi-cash-coin"></i></span>
        </button>
        <button type="button" class="btn btn-main" title="บันทึก">
          <span><i class="bi bi-calendar-check"></i></span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
// eslint-disable-next-line no-restricted-imports -- DataTable+ColumnGroup+rowGroupMode exception
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports -- DataTable+ColumnGroup exception
import Column from 'primevue/column'
// eslint-disable-next-line no-restricted-imports -- DataTable+ColumnGroup exception
import ColumnGroup from 'primevue/columngroup'
// eslint-disable-next-line no-restricted-imports -- DataTable+ColumnGroup exception
import Row from 'primevue/row'
import _ from 'lodash'

import moment from 'dayjs'
import api from '@/axios/axios-helper.js'
import { confirmSubmit } from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs'

export default {
  components: {
    DataTable,
    Column,
    ColumnGroup,
    Row
  },
  props: {},
  watch: {},
  data() {
    return {
      autoId: 0,

      plan: [],

      // --- from --- //
      form: {
        // ...interfaceForm
      },

      tranItems: [],
      tranDiscount: []
    }
  },
  methods: {
    // ------ helper ------//
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },
    showDate(date) {
      return date ? moment(date).format('DD/MM/yyyy') : ''
    },

    // --- event
    caltotalPrice(data) {
      let total = 0
      data.forEach((item) => {
        total += Number(item.price)
      })
      return total.toFixed(2)
    },
    caltotalPriceAfterDiscount(data, discount) {
      let total = 0
      let totalDiscount = 0
      data.forEach((item) => {
        total += Number(item.price)
      })
      discount.forEach((item) => {
        totalDiscount += Number(item.price)
      })
      return total > 0 ? (total - totalDiscount).toFixed(2) : Number(0).toFixed(2)
    },
    truncateName(name, maxLength) {
      if (name.length <= maxLength) {
        return name
      }
      return name.slice(0, maxLength) + '...'
    },
    checkOutbound(data) {
      return !_.isEmpty(data.outboundRunning) ? true : false
    },

    onSubmit() {
      if (this.validateForm()) {
        confirmSubmit(
          this.$t('view.production.planPrice.confirmEditGem'),
          `${this.model.wo}-${this.model.woNumber}`,
          async () => {
            await this.submit()
          }
        )
      }
    },
    validateForm() {
      //   if (!this.form.mold) {
      //     this.val = {
      //       isValMold: true
      //     }
      //     return false
      //   }

      return true
    },
    onBluePrice(item, index) {
      this.tranItems[index] = {
        ...item,
        price: item.price ? Number(item.price).toFixed(2) : '0.00'
      }
    },
    onBlueDiscount(item, index) {
      this.tranDiscount[index] = {
        ...item,
        price: item.price ? Number(item.price).toFixed(2) : '0.00'
      }
    },
    addItem() {
      this.tranItems.push({
        nameGroup: 'ETC',
        nameDescription: '',
        date: new Date(),
        qty: 1,
        price: 0
      })
    },
    addItemDiscount() {
      this.tranDiscount.push({
        nameGroup: 'Discount',
        nameDescription: '',
        date: new Date(),
        qty: 1,
        price: 0
      })
    },
    delItem(index) {
      this.tranItems.splice(index, 1)
    },
    delItemDiscount(index) {
      this.tranDiscount.splice(index, 1)
    },
    getGroupName(id) {
      switch (id) {
        case 'Gold':
          return this.$t('view.production.planPrice.groupGold')
        case 'Gem':
          return this.$t('view.production.planPrice.groupMaterial')
        case 'Worker':
          return this.$t('view.production.planPrice.groupWorker')
        default:
          return this.$t('view.production.planPrice.groupEtc')
      }
    },

    // --- APIs --- //

    async fetchAllTransection(wo, woNumber) {
      const res = await api.jewelry.get('ProductionPlan/GetAllTransectionPrice', {
        wo: wo,
        woNumber: woNumber
      })
      if (res) {
        this.tranItems = res.items.map((item) => {
          return {
            ...item,
            price: item.price ? Number(item.price).toFixed(2) : '0.00'
          }
        })

        this.addItemDiscount()
      }
    }
  },
  created() {
    this.$nextTick(() => {
      let id = this.$route.params.id
      this.plan = id.split('-')
      this.fetchAllTransection(this.plan[0], this.plan[1])
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

// ** ------ overide primevue style ------
.custom-input {
  margin-top: 5px !important;
}
input {
  margin-top: 0px !important;
}
:deep(.p-autocomplete .p-component) {
  margin-top: 0px !important;
  //background-color: #dad4b5;
}

.type-container {
  font-size: 15px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;
  //margin: 0px 0px 10px 0px;
}
</style>
