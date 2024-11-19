<!-- src/views/login/IndexView.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Left Section -->
      <div v-if="stage.isLogin" class="login-form-section">
        <div class="login-header">
          <h2>ล ง ชื่ อ เ ข้ า ใ ช้ ง า น</h2>
          <!-- <div class="social-links">
            <a href="#" class="social-icon">
              <i class="bi bi-facebook"></i>
            </a>
            <a href="#" class="social-icon">
              <i class="bi bi-twitter"></i>
            </a>
          </div> -->
        </div>

        <form @submit.prevent="handleSubmitLogin">
          <div class="form-group">
            <div class="input-with-icon-box">
              <div class="icon-box">
                <i class="bi bi-person"></i>
              </div>
              <input
                v-model="formLogin.username"
                type="text"
                placeholder="ชื่อผู้ใช้งาน"
                required
              />
            </div>

            <div class="input-with-icon-box mt-2">
              <div class="icon-box">
                <i class="bi bi-key"></i>
              </div>
              <input v-model="formLogin.password" type="password" placeholder="รหัสผ่าน" required />
            </div>
          </div>

          <button type="submit" class="sign-in-button">เข้าสู่ระบบ</button>

          <div class="form-footer">
            <label class="remember-me">
              <Checkbox v-model="formLogin.rememberMe" :binary="true" />
              <span>จดจำรหัส</span>
            </label>
            <div>
              <!-- <a href="#" class="forgot-password">Forgot Password</a> -->
              <span>version 1.0.0</span>
            </div>
          </div>
        </form>
      </div>

      <div v-if="stage.isRegister" class="login-form-section">
        <div class="login-header">
          <h2>ล ง ท ะ เ บี ย น</h2>
        </div>

        <form @submit.prevent="handleSubmitRegister">
          <div class="form-group">
            <div class="input-with-icon-box">
              <div class="icon-box">
                <i class="bi bi-person"></i>
              </div>
              <input
                v-model="formRegister.username"
                type="text"
                placeholder="ชื่อผู้ใช้งาน (USERNAME)"
                required
              />
            </div>

            <div class="input-with-icon-box mt-2">
              <div class="icon-box">
                <i class="bi bi-key"></i>
              </div>
              <input
                v-model="formRegister.password"
                type="password"
                placeholder="รหัสผ่าน"
                required
              />
            </div>

            <div class="input-with-icon-box mt-2">
              <div class="icon-box">
                <i class="bi bi-key"></i>
              </div>
              <input
                v-model="formRegister.confirmPassword"
                type="password"
                placeholder="ยืนยันรหัสผ่าน"
                required
              />
            </div>

            <div class="input-with-icon-box mt-2">
              <div class="icon-box">
                <i class="bi bi-person-lines-fill"></i>
              </div>
              <input v-model="formRegister.firstnameTH" type="text" placeholder="ชื่อ" required />
            </div>

            <div class="input-with-icon-box mt-2">
              <div class="icon-box">
                <i class="bi bi-person-lines-fill"></i>
              </div>
              <input v-model="formRegister.lastnameTh" type="text" placeholder="นามสกุล" required />
            </div>
          </div>

          <button type="submit" class="sign-in-button">ลงทะเบียน</button>
        </form>
      </div>

      <!-- Right Section -->
      <div class="welcome-section">
        <img src="@/assets/duangkaew-logo.png" />
        <!-- <h2>Welcome to login</h2> -->
        <!-- <p>Don't have an account?</p> -->
        <button class="sign-up-button" type="button" @click="handleAction">
          <!-- <span v-if="stage.isRegister" class="bi bi-login"></span> -->
          <span>{{ stage.isLogin ? `ลงทะเบียน` : `เข้าสู่ระบบ` }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Checkbox from 'primevue/checkbox'

import { useAuthStore } from '@/stores/modules/authen/authen-store.js'

const interfaceFormLogin = {
  username: '',
  password: '',
  rememberMe: false
}
const interfaceFormRegister = {
  username: '',
  password: '',
  confirmPassword: '',

  firstnameTH: '',
  lastnameTh: ''
}
const interfaceStage = {
  isLogin: true,
  isRegister: false
}

export default {
  name: 'LoginView',
  components: {
    Checkbox
  },

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  data() {
    return {
      formLogin: { ...interfaceFormLogin },
      formRegister: { ...interfaceFormRegister },
      stage: { ...interfaceStage },
      loading: false
    }
  },

  methods: {
    handleAction() {
      this.stage.isLogin = !this.stage.isLogin
      this.stage.isRegister = !this.stage.isRegister
    },
    async handleSubmitLogin() {
      console.log('formLogin', this.formLogin)
      const res = await this.authStore.login({
        username: this.formLogin.username,
        password: this.formLogin.password
      })

      if (res) {
        console.log('Login success')
        const redirectPath = this.$route.query.redirect
        this.$router.push(redirectPath || '/dashboard') // เปลี่ยนเป็น /dashboard แทน /
      }
    },
    async handleSubmitRegister() {
      console.log('formRegister', this.formRegister)
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  color: #921313;
  //background-color: #921313;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 1rem;
}

.login-card {
  display: flex;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  width: 100%;
  max-width: 1000px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.login-form-section {
  flex: 1;
  padding: 2.5rem;

  .login-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    margin-top: 1rem;

    h1 {
      font-size: 1.5rem;
      color: #333;
      font-weight: 500;
    }
  }

  .social-links {
    display: flex;
    gap: 1rem;

    .social-icon {
      color: #666;
      font-size: 1.2rem;
      transition: color 0.2s;

      &:hover {
        color: #921313;
      }
    }
  }
}

input {
  margin-top: 0px !important;
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-size: 0.9rem;
    color: #921313;
    margin-bottom: 0.1rem;
    text-transform: uppercase;
  }

  .input-with-icon-box {
    display: flex;
    align-items: stretch;
    border-radius: 4px;
    overflow: hidden;
    background: #e0e0e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

    .icon-box {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #921313; // สีเหลือง
      padding: 0.75rem;
      width: 45px;

      i {
        color: #fff;
        font-size: 1.2rem;
      }
    }

    input {
      flex: 1;
      padding: 0.75rem 1rem;
      padding-right: 2.5rem; // เพิ่มพื้นที่สำหรับปุ่ม toggle
      border: none;
      outline: none;
      font-size: 1rem;

      &::placeholder {
        color: #999;
      }

      &:focus {
        background-color: #e0e0e0;
      }
    }

    &:focus-within {
      background-color: #e0e0e0;
      box-shadow: 0 0 0 2px rgba(146, 19, 19, 0.5);
    }
  }
}

.sign-in-button {
  width: 100%;
  padding: 0.8rem;
  background: #921313;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: darken(#921313, 5%);
  }
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;

  .remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
    font-size: 0.9rem;

    input[type='checkbox'] {
      accent-color: #921313;
    }
  }

  .forgot-password {
    color: #666;
    font-size: 0.9rem;
    text-decoration: none;

    &:hover {
      color: #921313;
    }
  }
}

.welcome-section {
  background: #e0e0e0;
  padding: 2.5rem;
  color: #921313;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 50%;

  h2 {
    font-size: 2rem;
    //margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1.5rem;
    //opacity: 0.9;
  }

  .sign-up-button {
    padding: 0.8rem 2rem;
    border: 2px solid #921313;
    background: transparent;
    color: #921313;
    border-radius: 25px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #921313;
      color: #e0e0e0;
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
  }

  .welcome-section {
    width: 100%;
    padding: 2rem;
  }

  .login-form-section {
    padding: 2rem;
  }
}
</style>
