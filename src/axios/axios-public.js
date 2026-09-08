import axios from 'axios'

// Axios instance สำหรับหน้าสาธารณะ (/p/:token) เท่านั้น — ห้ามใช้ instance นี้กับหน้าอื่น
//
// เหตุผลที่แยก instance: axios-helper.js (instance กลางของแอป) มี interceptor ที่
// - แสดง swAlert modal เมื่อ error (400/402/404/500/504/default)
// - เมื่อเจอ 401 จะ logout + redirect ไป /login
// ลูกค้าที่สแกน QR code เข้ามาดูสินค้าไม่ควรเห็น modal หรือถูกเด้งไปหน้า login เหล่านี้เด็ดขาด
// จึงสร้าง axios instance แยกที่ไม่มี interceptor และไม่แนบ Authorization header (endpoint เป็น public)
const axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_JEWELRY_API_URL || 'https://localhost:7001/',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 100000
})

export default axiosPublic
