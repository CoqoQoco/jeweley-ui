<template>
  <div class="form-container">
    <loading :isLoading="isLoading"></loading>
    <modal :showModal="isShow" @closeModal="closeModal" width="1400px">
      <template v-slot:content>
        <div class="form-content-container">
          <div class="mb-2">
            <span class="txt-title-modal">เพิ่มสถานะการผลิต</span>
          </div>
          <div class="form-content-row-container mb-3">
            <div>
              <span class="txt-title">เลือกสถานะงานผลิต</span>
              <Dropdown
                v-model="form.status"
                :options="modelMasterStatus"
                optionLabel="nameTh"
                optionValue="id"
                placeholder="เลือกสถานะงาน"
                class="w-full md:w-14rem"
                :class="val.isValStatus === true ? `p-invalid` : ``"
                @change="onSelectType()"
              />
              <small v-if="val.isValStatus" class="p-error">Status is required.</small>
            </div>
          </div>
          <form v-if="showType === 1" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลจ่ายงาน</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันที่จ่ายงาน</span>
                <Calendar
                  class="w-100"
                  :class="val.isValAssignDate === true ? `p-invalid` : ``"
                  v-model="form.assignDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
              </div>
              <div>
                <span class="txt-title">ผู้จ่ายงาน</span>
                <input type="text" class="form-control" v-model="form.assignBy" required />
              </div>
            </div>
            <!-- <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลรับงาน</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันที่รับงาน</span>
                <Calendar
                  class="w-100"
                  :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                  v-model="form.receiveDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
              </div>
              <div>
                <span class="txt-title">ผู้รับงาน</span>
                <input type="text" class="form-control" v-model="form.receiveBy" />
              </div>
            </div> -->
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุรายละเอียด</span>
            </div>
            <div class="form-content-row-grid-container">
              <DataTable
                class="p-datatable-sm"
                showGridlines
                dataKey="id"
                v-model:editingRows="editingRows"
                :value="matAssign"
                editMode="row"
                scrollable
                resizableColumns
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
                <Column style="min-width: 50px">
                  <template #body="prop">
                    <div
                      class="btn btn-sm btn-danger text-center w-100"
                      @click="onDelGold(prop.data)"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </div>
                  </template>
                </Column>
                <!-- <Column field="id" header="ID" style="width: 10%">
                    <template #editor="{ data, field }">
                      <input type="number" class="form-control" v-model="data[field]" disabled />
                    </template>
                  </Column> -->
                <Column field="gold" header="ทอง" style="min-width: 80px">
                  <template #editor="{ data, field }">
                    <!-- <input type="text" class="form-control" v-model="data[field]" /> -->
                    <Dropdown
                      v-model="data[field]"
                      :options="masterGold"
                      optionLabel="code"
                      optionValue="code"
                      class="w-full md:w-14rem"
                      placeholder="เลือกทอง"
                    >
                      <!-- :showClear="data[field] ? true : false" -->
                      <!-- <template #option="slotProps">
                          <Tag
                            :value="slotProps.option.value"
                            :severity="getStatusLabel(slotProps.option.value)"
                          />
                        </template> -->
                    </Dropdown>
                  </template>
                </Column>
                <!-- column request date -->
                <Column field="requestDate" header="วันที่" style="min-width: 120px">
                  <template #editor="{ data, field }">
                    <div>
                      <Calendar
                        class="w-100"
                        v-model="data[field]"
                        dateFormat="dd/mm/yy"
                        showIcon
                        showButtonBar
                      />
                    </div>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.requestDate">
                      {{ formatDate(slotProps.data.requestDate) }}
                    </div>
                  </template>
                </Column>

                <Column field="goldQTYSend" header="จำนวนจ่าย">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="goldWeightSend" header="น้ำหนักจ่าย">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="goldQTYCheck" header="จำนวนรับ">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                      @change="calTotalWages(data)"
                    />
                  </template>
                </Column>
                <Column field="wages" header="ค่าเเรงต่อชิ้น" style="min-width: 100px">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      class="form-control"
                      v-model="data[field]"
                      :disabled="!data.goldQTYCheck"
                      @change="calTotalWages(data)"
                    />
                  </template>
                </Column>
                <Column field="goldWeightCheck" header="น้ำหนักรับ">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="description" header="รายละเอียด" style="min-width: 150px">
                  <template #editor="{ data, field }">
                    <input
                      type="text"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column
                  field="workers"
                  :header="form.status === 90 ? `ช่างขัด` : `ช่างรับงาน`"
                  style="min-width: 150px"
                >
                  <template #editor="{ data, field }">
                    <!-- <input
                      type="text"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    /> -->
                    <AutoComplete
                      v-model="data[field]"
                      :suggestions="workerItemSearch"
                      @complete="onSearchWorker"
                      placeholder="กรอกรหัส/ชื่อช่าง...."
                      :class="data[field] ? `` : `bg-warning`"
                      optionLabel="code"
                      forceSelection
                    >
                      <template #option="slotProps">
                        <div class="flex align-options-center">
                          <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
                        </div>
                      </template>
                    </AutoComplete>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.workers">
                      {{ `${slotProps.data.workers.code} - ${slotProps.data.workers.nameTh}` }}
                    </div>
                  </template>
                </Column>
                <Column
                  v-if="form.status === 90"
                  field="workersSub"
                  header="ช่างชุบ"
                  style="min-width: 150px"
                >
                  <template #editor="{ data, field }">
                    <!-- <input
                      type="text"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    /> -->
                    <AutoComplete
                      v-model="data[field]"
                      :suggestions="workerItemSearch"
                      @complete="onSearchWorker"
                      placeholder="กรอกรหัส/ชื่อช่าง...."
                      :class="data[field] ? `` : `bg-warning`"
                      optionLabel="code"
                      forceSelection
                    >
                      <template #option="slotProps">
                        <div class="flex align-options-center">
                          <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
                        </div>
                      </template>
                    </AutoComplete>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.workersSub">
                      {{
                        `${slotProps.data.workersSub.code} - ${slotProps.data.workersSub.nameTh}`
                      }}
                    </div>
                  </template>
                </Column>
                <Column field="totalWages" header="รวมค่าแรงช่าง" style="min-width: 100px">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      class="form-control"
                      v-model="data[field]"
                      disabled
                    />
                  </template>
                </Column>
                <Column :rowEditor="true" bodyStyle="text-align:center"> </Column>
                <template #footer>
                  <div class="d-flex justify-content-between">
                    <div>ทั้งหมด {{ this.matAssign.length }} รายการ</div>
                    <div @click="addMat">
                      <i class="bi bi-plus-square-fill"></i>
                    </div>
                  </div>
                </template>
              </DataTable>
            </div>
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลเพิ่มเติม</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
                ยกเลิกเพิ่มสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเพิ่มสถานะการผลิต
              </button>
            </div>
          </form>
          <form v-if="showType === 2" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลคัดพลอย</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันคัดพลอย</span>
                <Calendar
                  class="w-100"
                  :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                  v-model="form.receiveDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
              </div>
              <div>
                <span class="txt-title">ผู้คัดพลอย</span>
                <input type="text" class="form-control" v-model="form.receiveBy" />
              </div>
            </div>
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุรายละเอียดทอง</span>
            </div>
            <div class="form-content-row-grid-container">
              <DataTable
                class="p-datatable-sm"
                showGridlines
                v-model:editingRows="editingRows"
                :value="matAssign"
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
                <Column style="width: 20px">
                  <template #body="prop">
                    <div
                      class="btn btn-sm btn-danger text-center w-100"
                      @click="onDelGold(prop.data)"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </div>
                  </template>
                </Column>
                <Column field="gold" header="ทอง">
                  <template #editor="{ data, field }">
                    <Dropdown
                      v-model="data[field]"
                      :options="masterGold"
                      optionLabel="code"
                      optionValue="code"
                      class="w-full md:w-14rem"
                      placeholder="เลือกทอง"
                    >
                    </Dropdown>
                  </template>
                </Column>
                <Column field="requestDate" header="วันที่">
                  <template #editor="{ data, field }">
                    <div>
                      <Calendar
                        class="w-100"
                        v-model="data[field]"
                        dateFormat="dd/mm/yy"
                        showIcon
                        showButtonBar
                      />
                    </div>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.requestDate">
                      {{ formatDate(slotProps.data.requestDate) }}
                    </div>
                  </template>
                </Column>
                <Column field="goldQTYCheck" header="จำนวน">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="goldWeightCheck" header="น้ำหนัก">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="workers" header="ช่างคัดพลอย">
                  <template #editor="{ data, field }">
                    <AutoComplete
                      v-model="data[field]"
                      :suggestions="workerItemSearch"
                      @complete="onSearchWorker"
                      placeholder="กรอกรหัส/ชื่อช่าง...."
                      :class="data[field] ? `` : `bg-warning`"
                      optionLabel="code"
                      forceSelection
                    >
                      <template #option="slotProps">
                        <div class="flex align-options-center">
                          <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
                        </div>
                      </template>
                    </AutoComplete>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.workers">
                      {{ `${slotProps.data.workers.code} - ${slotProps.data.workers.nameTh}` }}
                    </div>
                  </template>
                </Column>
                <Column field="workersSub" header="ช่างคัดเพชร">
                  <template #editor="{ data, field }">
                    <!-- <input
                      type="text"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    /> -->
                    <AutoComplete
                      v-model="data[field]"
                      :suggestions="workerItemSearch"
                      @complete="onSearchWorker"
                      placeholder="กรอกรหัส/ชื่อช่าง...."
                      :class="data[field] ? `` : `bg-warning`"
                      optionLabel="code"
                      forceSelection
                    >
                      <template #option="slotProps">
                        <div class="flex align-options-center">
                          <div>{{ `${slotProps.option.code} - ${slotProps.option.nameTh}` }}</div>
                        </div>
                      </template>
                    </AutoComplete>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.workersSub">
                      {{
                        `${slotProps.data.workersSub.code} - ${slotProps.data.workersSub.nameTh}`
                      }}
                    </div>
                  </template>
                </Column>
                <Column
                  :rowEditor="true"
                  style="width: 10%; min-width: 8rem"
                  bodyStyle="text-align:center"
                ></Column>
                <template #footer>
                  <div class="d-flex justify-content-between">
                    <div>ทั้งหมด {{ this.matAssign.length }} รายการ</div>
                    <div @click="addMat">
                      <i class="bi bi-plus-square-fill"></i>
                    </div>
                  </div>
                </template>
              </DataTable>
            </div>

            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุรายละเอียดพลอย</span>
            </div>
            <div class="form-content-row-grid-container">
              <DataTable
                class="p-datatable-sm"
                showGridlines
                v-model:editingRows="editingGemRows"
                :value="gemAssign"
                editMode="row"
                dataKey="id"
                @row-edit-save="onGemRowEditSave"
                :pt="{
                  table: { style: 'min-width: 50rem' },
                  column: {
                    bodycell: ({ state }) => ({
                      style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                    })
                  }
                }"
              >
                <Column style="width: 20px">
                  <template #body="prop">
                    <div
                      class="btn btn-sm btn-danger text-center w-100"
                      @click="onDelGem(prop.data)"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </div>
                  </template>
                </Column>
                <Column field="gem" header="พลอย">
                  <template #editor="{ data, field }">
                    <AutoComplete
                      v-model="data[field]"
                      :suggestions="gemItemSearch"
                      @complete="onSearchGem"
                      placeholder="กรอกรหัสพลอย...."
                      :class="data[field] ? `` : `bg-warning`"
                      optionLabel="name"
                      forceSelection
                      :minLength="4"
                    >
                      <template #option="slotProps">
                        <div class="flex align-options-center">
                          <div>{{ `${slotProps.option.name}` }}</div>
                        </div>
                      </template>
                    </AutoComplete>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.gem">
                      {{ `${slotProps.data.gem.name}` }}
                    </div>
                  </template>
                </Column>
                <Column field="gem" header="ราคา" style="min-width: 150px">
                  <template #editor="{ data, field }">
                    {{
                      data[field] ? Number(data[field].price).toFixed(2).toLocaleString() : '0.00'
                    }}
                  </template>
                  <template #body="slotProps">
                    {{
                      slotProps.data && slotProps.data.gem
                        ? Number(slotProps.data.gem.price).toFixed(2).toLocaleString()
                        : '0.00'
                    }}
                  </template>
                </Column>
                <Column field="QTY" header="จำนวน" style="width: 200px">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="weight" header="น้ำหนัก" style="width: 200px">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column
                  :rowEditor="true"
                  style="width: 10%; min-width: 8rem"
                  bodyStyle="text-align:center"
                ></Column>
                <template #footer>
                  <div class="d-flex justify-content-between">
                    <div>ทั้งหมด {{ this.gemAssign.length }} รายการ</div>
                    <div @click="addGem">
                      <i class="bi bi-plus-square-fill"></i>
                    </div>
                  </div>
                </template>
              </DataTable>
            </div>

            <!-- <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุค่าเเรง</span>
            </div>
            <div class="form-content-row-price-container">
              <div>
                <span class="txt-title">ค่าเเรงคัดพลอย</span>
                <input type="number" step="any" class="form-control" v-model="form.totalWages" />
              </div>
            </div> -->
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลเพิ่มเติม</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
                ยกเลิกเพิ่มสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเพิ่มสถานะการผลิต
              </button>
            </div>
          </form>
          <form v-if="showType === 3" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลตรวจ CVD</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันตรวจ CVD</span>
                <Calendar
                  class="w-100"
                  :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                  v-model="form.receiveDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
              </div>
              <div>
                <span class="txt-title">ผู้ตรวจ CVD</span>
                <input type="text" class="form-control" v-model="form.receiveBy" />
              </div>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
                ยกเลิกเพิ่มสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเพิ่มสถานะการผลิต
              </button>
            </div>
          </form>
          <form v-if="showType === 4" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลงานหล่อเสร็จ</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันที่หล่อ</span>
                <Calendar
                  class="w-100"
                  :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                  v-model="form.receiveDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
              </div>
              <div>
                <span class="txt-title">ช่างหล่อ</span>
                <input type="text" class="form-control" v-model="form.receiveBy" />
              </div>
            </div>
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุรายละเอียด</span>
            </div>
            <div class="form-content-row-grid-container">
              <DataTable
                class="p-datatable-sm"
                showGridlines
                v-model:editingRows="editingRows"
                :value="matAssign"
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
                <Column style="width: 20px">
                  <template #body="prop">
                    <div
                      class="btn btn-sm btn-danger text-center w-100"
                      @click="onDelGold(prop.data)"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </div>
                  </template>
                </Column>
                <Column field="gold" header="ทอง">
                  <template #editor="{ data, field }">
                    <Dropdown
                      v-model="data[field]"
                      :options="masterGold"
                      optionLabel="code"
                      optionValue="code"
                      class="w-full md:w-14rem"
                      placeholder="เลือกทอง"
                    >
                    </Dropdown>
                  </template>
                </Column>
                <Column field="requestDate" header="วันที่">
                  <template #editor="{ data, field }">
                    <div>
                      <Calendar
                        class="w-100"
                        v-model="data[field]"
                        dateFormat="dd/mm/yy"
                        showIcon
                        showButtonBar
                      />
                    </div>
                  </template>
                  <template #body="slotProps">
                    <div v-if="slotProps.data.requestDate">
                      {{ formatDate(slotProps.data.requestDate) }}
                    </div>
                  </template>
                </Column>
                <Column field="goldQTYCheck" header="จำนวน">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column field="goldWeightCheck" header="น้ำหนัก">
                  <template #editor="{ data, field }">
                    <input
                      type="number"
                      step="any"
                      :class="data[field] ? `` : `bg-warning`"
                      class="form-control"
                      v-model="data[field]"
                    />
                  </template>
                </Column>
                <Column
                  :rowEditor="true"
                  style="width: 10%; min-width: 8rem"
                  bodyStyle="text-align:center"
                ></Column>
                <template #footer>
                  <div class="d-flex justify-content-between">
                    <div>ทั้งหมด {{ this.matAssign.length }} รายการ</div>
                    <div @click="addMat">
                      <i class="bi bi-plus-square-fill"></i>
                    </div>
                  </div>
                </template>
              </DataTable>
            </div>
            <!-- <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุค่าเเรง</span>
            </div>
            <div class="form-content-row-price-container">
              <div>
                <span class="txt-title">ค่าเเรงคัดพลอย</span>
                <input type="number" step="any" class="form-control" v-model="form.totalWages" />
              </div>
            </div> -->
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลเพิ่มเติม</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
                ยกเลิกเพิ่มสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเพิ่มสถานะการผลิต
              </button>
            </div>
          </form>
          <form v-if="showType === 5" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลประเมินราคา</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันประเมินราคา</span>
                <Calendar
                  class="w-100"
                  :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                  v-model="form.receiveDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
              </div>
              <div>
                <span class="txt-title">ผู้ประเมินราคา</span>
                <input type="text" class="form-control" v-model="form.receiveBy" />
              </div>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
                ยกเลิกเพิ่มสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเพิ่มสถานะการผลิต
              </button>
            </div>
          </form>
          <form v-if="showType === 6" @submit.prevent="onSubmit">
            <div class="mb-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>แผนงานผลิตเสร็จสิ้น</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">วันที่</span>
                <Calendar
                  class="w-100"
                  :class="val.isValReceiveDate === true ? `p-invalid` : ``"
                  v-model="form.receiveDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                />
              </div>
              <div>
                <span class="txt-title">ชื่อผู้ปิดแผนงานผลิต</span>
                <input type="text" class="form-control" v-model="form.receiveBy" required />
              </div>
            </div>
            <div class="mb-2 mt-2 txt-title-part">
              <span><i class="bi bi-clipboard2-plus-fill mr-2"></i></span>
              <span>ระบุข้อมูลเพิ่มเติม</span>
            </div>
            <div class="form-content-row-container">
              <div>
                <span class="txt-title">หมายเหตุ - 1</span>
                <textarea class="form-control" v-model="form.remark1" style="height: 50px">
                </textarea>
              </div>
              <div>
                <span class="txt-title">หมายเหตุ - 2</span>
                <textarea class="form-control" v-model="form.remark2" style="height: 50px">
                </textarea>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button class="btn btn-sm btn-dark btn-custom mr-2" type="button" @click="closeModal">
                ยกเลิกเพิ่มสถานะการผลิต
              </button>
              <button class="btn btn-sm btn-warning btn-custom" type="submit">
                ยืนยันเพิ่มสถานะการผลิต
              </button>
            </div>
          </form>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import AutoComplete from 'primevue/autocomplete'

import swAlert from '@/services/alert/sweetAlerts.js'
import api from '@/axios/axios-config.js'
import { formatISOString, formatDate } from '@/services/utils/dayjs'

const interfaceForm = {
  status: null,
  assignDate: null,
  assignBy: null,
  receiveDate: null,
  receiveBy: null,
  assignTo: null,
  //wages: null,
  remark1: null,
  remark2: null,
  totalWages: null
}
const interfaceMat = {
  //id: null,
  //gold: null,
  goldQTYSend: null,
  goldWeightSend: null,
  goldQTYCheck: null,
  goldWeightCheck: null,
  workers: null,
  workersSub: null,
  description: null,
  wages: null
}
const interfaceVal = {
  isValStatus: false,
  isValAssignDate: false,
  isValReceiveDate: false,
  isValGemAssignDate: false,
  isValCVDAssignDate: false
}

export default {
  components: {
    modal,
    loading,
    Dropdown,
    Calendar,
    DataTable,
    Column,
    AutoComplete
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    masterStatus: {
      type: Array,
      required: true,
      default: () => []
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    modelMatValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    masterGold: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    modelMasterStatus() {
      const disStatus = [10, 70, 50, 500]
      return this.masterStatus.filter((x) => disStatus.includes(x.id) === false)
    },
    model() {
      return this.modelValue
    }
  },
  watch: {
    modelMatValue(value) {
      console.log('new mat')
      this.autoId = 0
      this.tempMatAssign = value.map((thing) => {
        return {
          id: ++this.autoId,
          gold: thing.gold,
          ...interfaceMat
        }
      })
      this.matAssign = [...this.tempMatAssign]
    }
  },
  data() {
    return {
      // --- flag --- //
      isLoading: false,
      showType: 0,
      autoId: 0,
      autoIdGem: 0,

      // --- form --- //
      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceVal
      },
      tempMatAssign: [],
      matAssign: [],
      editingRows: [],
      gemAssign: [],
      editingGemRows: [],
      workerItemSearch: [],
      gemItemSearch: []
    }
  },
  methods: {
    // --- controller --- //
    closeModal() {
      this.form = {
        ...interfaceForm
      }
      this.val = {
        ...interfaceVal
      }
      this.matAssign = [...this.tempMatAssign]
      this.showType = 0
      this.$emit('closeModal')
    },
    onSelectType() {
      this.form.assignDate = null
      this.form.assignBy = null
      this.form.receiveDate = null
      this.form.receiveBy = null
      this.form.assignTo = null
      this.form.remark1 = null
      this.form.remark2 = null

      this.matAssign = [...this.tempMatAssign]
      if (this.form.status) {
        if (
          this.form.status === 50 ||
          this.form.status === 60 ||
          this.form.status === 80 ||
          this.form.status === 90
        ) {
          this.showType = 1
        } else if (this.form.status === 70) {
          this.showType = 2
        } else if (this.form.status === 85) {
          this.showType = 3
        } else if (this.form.status === 55) {
          this.showType = 4
        } else if (this.form.status === 95) {
          this.showType = 5
        } else if (this.form.status === 100) {
          this.showType = 6
        }
      } else {
        this.showType = 0
      }
    },
    onSubmit() {
      swAlert.confirmSubmit(
        ``,
        '',
        async () => {
          this.submit()
        },
        null,
        null
      )
    },
    calTotalWages(data) {
      data.totalWages = data.wages * (data.goldQTYCheck ?? 0)
      //console.log(data.totalWages)
    },

    // ----------- Grid -------------------//
    onRowEditSave(event) {
      let { newData, index } = event
      this.matAssign[index] = newData
    },
    onGemRowEditSave(event) {
      let { newData, index } = event
      this.gemAssign[index] = newData
    },
    onDelGold(item) {
      const index = this.matAssign.indexOf(item)
      this.matAssign.splice(index, 1)
    },
    onDelGem(item) {
      const index = this.gemAssign.indexOf(item)
      this.gemAssign.splice(index, 1)
    },
    addMat() {
      const add = {
        id: ++this.autoId,
        gold: 'YG',
        goldQTYSend: null,
        goldWeightSend: null,
        goldQTYCheck: null,
        goldWeightCheck: null,
        worker: null,
        workerSub: null,
        wages: null
      }
      this.matAssign.push(add)
    },
    addGem() {
      const add = {
        id: ++this.autoIdGem,
        gem: null,
        qty: null,
        weight: null
      }
      this.gemAssign.push(add)
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },

    // --- APIs --- //
    async submit() {
      try {
        this.isLoading = true
        this.matAssign = this.matAssign.map((item) => {
          return {
            ...item,
            worker: item.workers?.code,
            workerSub: item.workersSub?.code
          }
        })
        this.gemAssign = this.gemAssign.map((item) => {
          return {
            id: item.gem?.id,
            code: item.gem?.code,
            name: item.gem?.name,
            QTY: item.QTY,
            weight: item.weight
          }
        })
        const param = {
          wo: this.model.wo,
          woNumber: this.model.woNumber,
          productionPlanId: this.model.id,

          status: this.form.status,
          sendName: this.form.assignBy,
          sendDate: this.form.assignDate ? formatISOString(this.form.assignDate) : null,
          checkName: this.form.receiveBy,
          checkDate: this.form.receiveDate ? formatISOString(this.form.receiveDate) : null,
          remark1: this.form.remark1,
          remark2: this.form.remark2,
          totalWages: this.form.totalWages,
          golds: [...this.matAssign],
          gems: [...this.gemAssign]
        }
        //console.log(param)
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanAddStatusDetail', param)
        if (res) {
          swAlert.success(
            ``,
            '',
            () => {
              this.form = {
                ...interfaceForm
              }
              this.val = {
                ...interfaceVal
              }
              this.matAssign = [...this.tempMatAssign]
              this.gemAssign = []
              this.showType = 0
              this.$emit('fetch')
            },
            null,
            null
          )
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },
    async onSearchWorker(e) {
      try {
        //this.isLoading = true
        //console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null,
            type: this.form.status,
            active: 1
          }
        }
        const res = await api.jewelry.post('Worker/Search', params)
        if (res) {
          //console.log(res)
          this.workerItemSearch = [...res.data]
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    },
    async onSearchGem(e) {
      try {
        //this.isLoading = true
        //console.log(this.formValue)
        const params = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null
          }
        }
        const res = await api.jewelry.post('StockGem/Search', params)
        if (res) {
          //console.log(res)
          this.gemItemSearch = [...res]
          //this.workerItemSearch = res.data.map((x) => `${x.code} : ${x.nameTh}`)
        }
        //this.isLoading = false
      } catch (error) {
        console.log(error)
        //this.isLoading = false
      }
    }
    // onGetItem(e) {
    //   console.log(e)
    // }
  },
  mounted() {
    this.autoId = 0
    this.tempMatAssign = this.modelMatValue.map((thing) => {
      return {
        id: ++this.autoId,
        gold: thing.gold,
        ...interfaceMat
      }
    })
    this.matAssign = [...this.tempMatAssign]
  }
}
</script>

<style lang="scss" scoped>
:deep(input) {
  margin-top: 0px !important;
}
:deep(.p-dropdown) {
  height: 35px !important;
  padding-left: 5px;
  width: 100% !important;
  margin-top: 0px !important;
}
:deep(.p-calendar) {
  height: 35px;
  margin-top: 0px !important;
}
.form-content-container {
  padding: 20px 20px;
  overflow: auto;
  //height: 650px;
}
.form-content-row-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  padding: 0px 30px;
}
.form-content-row-grid-container {
  display: grid;
  //grid-template-columns: 1fr;
  //gap: 50px;
  padding: 0px 30px;
}
.form-content-row-price-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 50px;
  padding: 0px 30px;
}
.txt-title-part {
  padding-left: 30px;
  padding-top: 10px;
  font-size: 14px;
  color: var(--base-font-color);
}
.txt-title-modal {
  padding: 30px;
  font-size: 20px;
  color: var(--base-font-color);
}
.txt-title {
  font-size: 12px;
}
</style>
