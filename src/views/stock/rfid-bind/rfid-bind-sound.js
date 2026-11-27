/**
 * rfid-bind-sound — เสียงติ๊ดด้วย WebAudio (ไม่ต้องมีไฟล์เสียง)
 * ต้องเรียก unlockAudio() จาก user gesture (คลิก/กดคีย์) ก่อน เบราว์เซอร์จึงยอมให้เล่นเสียง
 */
let ctx = null

export function unlockAudio() {
  if (typeof window === 'undefined') return
  const Ctor = window.AudioContext || window.webkitAudioContext
  if (!Ctor) return
  if (!ctx) ctx = new Ctor()
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
}

function tone(freq, duration, volume = 0.15) {
  if (!ctx || ctx.state !== 'running') return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.value = volume
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

export function playSuccess() {
  tone(1200, 0.12)
}

export function playWarning() {
  tone(300, 0.35)
}
