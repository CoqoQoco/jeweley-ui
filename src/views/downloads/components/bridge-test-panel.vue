<template>
  <div class="bridge-test">
    <div v-if="phase === 'running'" class="bridge-test-loading">
      <i class="bi bi-arrow-repeat spin"></i>
      <span>{{ $t('view.downloads.bridgeTest.running') }}</span>
    </div>

    <template v-else-if="phase === 'done'">
      <div v-if="health !== 'ok'" class="bridge-test-block">
        <div class="bridge-test-line">
          <span class="chip chip-bad"><i class="bi bi-x-circle-fill"></i> {{ failTitle }}</span>
        </div>
        <p class="bridge-test-hint">{{ failHint }}</p>
        <div v-if="health === 'blocked'">
          <ButtonGeneric
            variant="green"
            icon="bi-box-arrow-up-right"
            :label="$t('view.downloads.bridgeTest.openBridge')"
            @click="openBridgePage"
          />
        </div>
      </div>

      <div v-else class="bridge-test-block">
        <div class="bridge-test-line">
          <span class="chip chip-ok">
            <i class="bi bi-check-circle-fill"></i>
            {{ runningText }}
          </span>
          <span v-if="versionState === 'latest'" class="chip chip-ok">{{ $t('view.downloads.bridgeTest.latest') }}</span>
          <span v-else-if="versionState === 'outdated'" class="chip chip-warn">
            {{ $t('view.downloads.bridgeTest.shouldUpdate', { latest: latestVersion }) }}
          </span>
        </div>

        <div class="bridge-test-printers-title">{{ $t('view.downloads.bridgeTest.printers') }}</div>
        <p v-if="!printers.length" class="bridge-test-hint">{{ $t('view.downloads.bridgeTest.noPrinters') }}</p>
        <ul v-else class="bridge-test-printers">
          <li v-for="p in printers" :key="p.name" class="bridge-test-printer">
            <div class="bridge-test-printer-main">
              <span class="dot" :class="`dot-${p.level}`"></span>
              <span class="printer-name">{{ p.name }}</span>
              <span class="chip" :class="`chip-${p.level}`">{{ p.text }}</span>
            </div>
            <div v-if="p.isBarcode || p.isDefault" class="bridge-test-tags">
              <span v-if="p.isBarcode" class="tag">{{ $t('view.downloads.bridgeTest.tagBarcode') }}</span>
              <span v-if="p.isDefault" class="tag">{{ $t('view.downloads.bridgeTest.tagDefault') }}</span>
            </div>
          </li>
        </ul>
        <p v-if="printers.length && !hasState" class="bridge-test-hint">{{ $t('common.printer.needBridgeUpdate') }}</p>
      </div>

      <div class="mt-2">
        <ButtonGeneric
          variant="outline"
          icon="bi-arrow-clockwise"
          :label="$t('view.downloads.bridgeTest.retry')"
          @click="run"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { checkBridgeHealth, getBridgeConfig, getPrinterState } from '@/services/api/print-bridge-service.js'
import { fetchPrinterList, PRINT_BRIDGE_BASE_URL } from '@/services/api/printer-config-service.js'
import { getBarcodePrinterName } from '@/services/api/barcode-printer-config.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

function parseVersion(text) {
  const nums = String(text || '').match(/\d+/g)
  return nums ? nums.map(Number) : []
}

function compareVersion(a, b) {
  const x = parseVersion(a)
  const y = parseVersion(b)
  const len = Math.max(x.length, y.length)
  for (let i = 0; i < len; i++) {
    const diff = (x[i] || 0) - (y[i] || 0)
    if (diff !== 0) return diff < 0 ? -1 : 1
  }
  return 0
}

export default {
  name: 'BridgeTestPanel',

  components: { ButtonGeneric },

  props: {
    latestVersion: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      phase: 'idle',
      health: 'ok',
      version: '',
      printers: []
    }
  },

  computed: {
    runningText() {
      return this.version
        ? this.$t('view.downloads.bridgeTest.runningOk', { version: this.version })
        : this.$t('view.downloads.bridgeTest.runningUnknownVersion')
    },

    versionState() {
      if (!this.version || !this.latestVersion) return ''
      return compareVersion(this.version, this.latestVersion) < 0 ? 'outdated' : 'latest'
    },

    hasState() {
      return this.printers.some((p) => p.hasState)
    },

    failTitle() {
      return this.health === 'blocked'
        ? this.$t('view.downloads.bridgeTest.blockedTitle')
        : this.$t('view.downloads.bridgeTest.unreachableTitle')
    },

    failHint() {
      return this.health === 'blocked'
        ? this.$t('view.downloads.bridgeTest.blockedHint')
        : this.$t('view.downloads.bridgeTest.unreachableHint')
    }
  },

  mounted() {
    this.run()
  },

  methods: {
    async run() {
      this.phase = 'running'
      this.printers = []
      this.version = ''

      const healthy = await checkBridgeHealth()
      if (!healthy) {
        const probe = await fetchPrinterList()
        this.health = probe.status === 'blocked' ? 'blocked' : 'unreachable'
        this.phase = 'done'
        return
      }

      this.health = 'ok'
      const [config, list] = await Promise.all([getBridgeConfig(), fetchPrinterList()])
      this.version = config?.version ? String(config.version).replace(/^v/i, '') : ''

      const names = list.status === 'ok' ? list.printers.map((p) => p.name) : []
      const barcodeName = getBarcodePrinterName()
      const defaultName = config?.defaultPrinterName || ''
      const states = await Promise.all(names.map((name) => getPrinterState(name)))

      this.printers = names.map((name, i) => this.buildPrinter(name, states[i], barcodeName, defaultName))
      this.phase = 'done'
    },

    buildPrinter(name, state, barcodeName, defaultName) {
      const base = { name, isBarcode: name === barcodeName, isDefault: name === defaultName, hasState: !!state }
      if (!state) return { ...base, level: 'neutral', text: this.$t('view.downloads.bridgeTest.stateUnknown') }
      if (state.offline) return { ...base, level: 'bad', text: this.$t('view.downloads.bridgeTest.stateOffline') }
      if (state.paused) return { ...base, level: 'bad', text: this.$t('view.downloads.bridgeTest.statePaused') }
      if (state.error) return { ...base, level: 'bad', text: this.$t('view.downloads.bridgeTest.stateError') }
      const jobs = Number(state.jobs) || 0
      if (jobs > 0) return { ...base, level: 'warn', text: this.$t('view.downloads.bridgeTest.stateJobs', { n: jobs }) }
      return { ...base, level: 'ok', text: this.$t('view.downloads.bridgeTest.stateReady') }
    },

    openBridgePage() {
      window.open(`${PRINT_BRIDGE_BASE_URL}/health`, '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.bridge-test {
  margin-top: var(--sp-lg);
  padding-top: var(--sp-lg);
  border-top: 1px solid var(--color-border);
}

.bridge-test-loading {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  color: var(--base-font-color);
  font-size: var(--fs-base);
}

.bridge-test-block {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.bridge-test-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.bridge-test-hint {
  margin: 0;
  font-size: var(--fs-sm);
  line-height: var(--lh-md);
  color: var(--base-font-color);
  opacity: 0.75;
}

.bridge-test-printers-title {
  margin-top: var(--sp-sm);
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
}

.bridge-test-printers {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.bridge-test-printer {
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
}

.bridge-test-printer-main {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.printer-name {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--base-font-color);
}

.bridge-test-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-md);
  margin-top: var(--sp-xs);
}

.tag {
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  opacity: 0.75;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--status-closed);

  &.dot-ok {
    background: var(--base-green);
  }

  &.dot-warn {
    background: var(--base-warning);
  }

  &.dot-bad {
    background: var(--base-red);
  }
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  padding: 2px var(--sp-sm);
  border: 1px solid var(--status-closed);
  border-radius: var(--radius-sm);
  background: var(--status-closed-bg);
  color: var(--status-closed);
  font-size: var(--fs-sm);
  font-weight: 600;

  &.chip-ok {
    border-color: var(--status-resolved);
    background: var(--status-resolved-bg);
    color: var(--status-resolved);
  }

  &.chip-warn {
    border-color: var(--status-open);
    background: var(--status-open-bg);
    color: var(--base-font-color);
  }

  &.chip-bad {
    border-color: var(--status-cancelled);
    background: var(--status-cancelled-bg);
    color: var(--status-cancelled);
  }
}
</style>
