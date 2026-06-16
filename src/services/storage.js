// จุดเดียวสำหรับเข้าถึง localStorage — ห้ามเรียก localStorage ตรงในที่อื่น
const storage = {
  getItem(key, fallback = null) {
    const value = localStorage.getItem(key)
    return value !== null ? value : fallback
  },

  setItem(key, value) {
    localStorage.setItem(key, String(value))
  },

  removeItem(key) {
    localStorage.removeItem(key)
  },

  getJSON(key, fallback = null) {
    const value = localStorage.getItem(key)
    if (value === null) return fallback
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  },

  setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export { storage }
