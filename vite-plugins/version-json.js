const THAI_OFFSET_MS = 7 * 60 * 60 * 1000

export const VERSION_PATTERN = /^\d{4}\.\d{2}\.\d{2}\.\d{4}$/

export function formatBuildVersion(date = new Date()) {
  const t = new Date(date.getTime() + THAI_OFFSET_MS)
  const pad = (n) => String(n).padStart(2, '0')
  return `${t.getUTCFullYear()}.${pad(t.getUTCMonth() + 1)}.${pad(t.getUTCDate())}.${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}`
}

export function versionJsonPlugin(version) {
  return {
    name: 'version-json',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version })
      })
    }
  }
}
