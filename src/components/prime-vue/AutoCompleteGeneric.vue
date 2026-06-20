<template>
  <div @keydown.enter.prevent="handleEnterKey">
    <AutoComplete
      v-model="localValue"
      :suggestions="displaySuggestions"
      @complete="onSearch"
      :placeholder="placeholder"
      :optionLabel="effectiveOptionLabel"
      :forceSelection="forceSelection"
      :minLength="minLength"
      :disabled="disabled"
      :class="customClass"
      :style="customStyle"
      @item-select="onItemSelect"
    >
      <template #option="slotProps" v-if="hasOptionSlot">
        <slot name="option" :option="slotProps.option">
          <div class="flex align-options-center">
            <div>{{ slotProps.option[optionLabel] }}</div>
          </div>
        </slot>
      </template>
    </AutoComplete>
  </div>
</template>

<script>
import AutoComplete from 'primevue/autocomplete'
import api from '@/axios/axios-helper.js'

export default {
  name: 'AutoCompleteGeneric',

  components: {
    AutoComplete
  },

  props: {
    modelValue: {
      type: [Object, String],
      default: null
    },
    // API mode props
    apiEndpoint: {
      type: String,
      default: ''
    },
    searchField: {
      type: String,
      default: 'text'
    },
    additionalSearchParams: {
      type: Object,
      default: () => ({})
    },
    // Static list mode props
    staticOptions: {
      type: Array,
      default: () => []
    },
    useStaticList: {
      type: Boolean,
      default: false
    },
    // Common props
    placeholder: {
      type: String,
      default: 'ค้นหา...'
    },
    optionLabel: {
      type: String,
      default: 'name'
    },
    forceSelection: {
      type: Boolean,
      default: false
    },
    minLength: {
      type: Number,
      default: 1
    },
    disabled: {
      type: Boolean,
      default: false
    },
    customClass: {
      type: String,
      default: ''
    },
    customStyle: {
      type: [String, Object],
      default: ''
    },
    skipLoading: {
      type: Boolean,
      default: true
    },
    suggestions: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:modelValue', 'item-select', 'search-complete', 'complete'],

  data() {
    return {
      internalSuggestions: [],
      localValue: this.modelValue
    }
  },

  computed: {
    hasOptionSlot() {
      return !!this.$slots.option
    },

    displaySuggestions() {
      return this.apiEndpoint || this.useStaticList ? this.internalSuggestions : this.suggestions
    },

    effectiveOptionLabel() {
      const list = this.displaySuggestions
      if (Array.isArray(list) && list.length > 0 && typeof list[0] === 'string') {
        return null
      }
      return this.optionLabel
    }
  },

  watch: {
    modelValue(newVal) {
      this.localValue = newVal
    },
    localValue(newVal) {
      this.$emit('update:modelValue', newVal)
    }
  },

  methods: {
    async onSearch(event) {
      // Static list mode
      if (this.useStaticList) {
        this.internalSuggestions = this.filterStaticList(event.query)
        this.$emit('search-complete', this.internalSuggestions)
        return
      }

      // Passthrough mode — let parent handle the search
      if (!this.apiEndpoint) {
        this.$emit('complete', event)
        return
      }

      // API mode
      try {
        const params = {
          take: 0,
          skip: 0,
          search: {
            [this.searchField]: event.query ?? null,
            ...this.additionalSearchParams
          }
        }

        const res = await api.jewelry.post(this.apiEndpoint, params, {
          skipLoading: this.skipLoading
        })

        if (res) {
          this.internalSuggestions = Array.isArray(res) ? [...res] : res.data ? [...res.data] : []
          this.$emit('search-complete', this.internalSuggestions)
        }
      } catch (error) {
        console.error('Error in AutoCompleteGeneric search:', error)
        this.internalSuggestions = []
      }
    },

    filterStaticList(query) {
      if (!query) {
        return this.staticOptions
      }

      const lowerQuery = query.toLowerCase()
      return this.staticOptions.filter((option) => {
        const labelValue = option[this.optionLabel]
        if (typeof labelValue === 'string') {
          return labelValue.toLowerCase().includes(lowerQuery)
        }
        return false
      })
    },

    onItemSelect(event) {
      this.$emit('item-select', event)
    },

    handleEnterKey(event) {
      // Prevent form submission when pressing Enter in AutoComplete
      event.preventDefault()
      event.stopPropagation()
    }
  }
}
</script>

<style scoped>
:deep(.p-autocomplete .p-component) {
  margin-top: 0px !important;
}
</style>
