/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },

  // Global warn rules (ทั้งโปรเจกต์)
  rules: {
    'no-alert': 'warn'
  },

  overrides: [
    {
      // Guardrail rules สำหรับ src/views เท่านั้น — warn-only ไม่ block build
      files: ['src/views/**/*.vue'],
      rules: {
        // ห้าม import PrimeVue component ตรงๆ ใน views — ใช้ generic wrapper แทน
        'no-restricted-imports': [
          'warn',
          {
            paths: [
              {
                name: 'primevue/dropdown',
                message: 'ใช้ generic wrapper แทน — ดู native-call-policy skill: import DropdownGeneric from @/components/prime-vue/DropdownGeneric.vue'
              },
              {
                name: 'primevue/datatable',
                message: 'ใช้ generic wrapper แทน — ดู native-call-policy skill: import DataTableWithPaging from @/components/prime-vue/DataTableWithPaging.vue'
              },
              {
                name: 'primevue/dialog',
                message: 'ใช้ generic wrapper แทน — ดู native-call-policy skill: import ModalView from @/components/modal/modal-view.vue'
              },
              {
                name: 'primevue/multiselect',
                message: 'ใช้ generic wrapper แทน — ดู native-call-policy skill: import MultiSelectGeneric from @/components/prime-vue/MultiSelectGeneric.vue'
              },
              {
                name: 'primevue/calendar',
                message: 'ใช้ generic wrapper แทน — ดู native-call-policy skill: import CalendarGeneric from @/components/prime-vue/CalendarGeneric.vue'
              },
              {
                name: 'primevue/checkbox',
                message: 'ใช้ generic wrapper แทน — ดู native-call-policy skill: import CheckboxGeneric from @/components/prime-vue/CheckboxGeneric.vue'
              },
              {
                name: 'primevue/autocomplete',
                message: 'ใช้ generic wrapper แทน — ดู native-call-policy skill: import AutoCompleteGeneric from @/components/prime-vue/AutoCompleteGeneric.vue'
              }
            ]
          }
        ],

        // ห้ามใช้ <table> ตรงๆ ใน views — ใช้ DataTableWithPaging แทน
        // TODO: เพิ่ม @intlify/vue-i18n/no-raw-text เมื่อแก้ peer dep conflict ได้
        //       (ต้องการ vue-eslint-parser@10 แต่ eslint-plugin-vue@9 lock ที่ ≤9)
        'vue/no-restricted-syntax': [
          'warn',
          {
            selector: "VElement[name='table']",
            message: 'ห้ามใช้ <table> ตรงๆ ใน views — ใช้ DataTableWithPaging แทน ดู generic-components skill'
          }
        ]
      }
    }
  ]
}
