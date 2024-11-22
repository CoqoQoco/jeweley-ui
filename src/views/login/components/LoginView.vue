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
            <!-- username -->
            <div class="input-with-icon-box">
              <div class="icon-box">
                <i class="bi bi-person"></i>
              </div>
              <input
                v-model="formLogin.username"
                type="text"
                placeholder="ชื่อผู้ใช้งาน"
                @paste.prevent
                @copy.prevent
                @cut.prevent
                required
              />
            </div>

            <!-- password -->
            <div class="input-with-icon-box mt-2">
              <div class="icon-box">
                <i class="bi bi-key"></i>
              </div>
              <input
                v-model="formLogin.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="รหัสผ่าน"
                @paste.prevent
                @copy.prevent
                @cut.prevent
                required
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                <i :class="['bi', showPassword ? 'bi-eye-slash' : 'bi-eye']"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="sign-in-button">เข้าสู่ระบบ</button>

          <div class="form-footer">
            <label class="remember-me">
              <!-- <Checkbox v-model="formLogin.rememberMe" :binary="true" />
              <span>จดจำรหัส</span> -->
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
            <!-- username -->
            <div class="input-with-icon-box">
              <div class="icon-box">
                <i class="bi bi-person"></i>
              </div>
              <input
                v-model="formRegister.username"
                type="text"
                placeholder="ชื่อผู้ใช้งาน (USERNAME)"
                @input="validateUsername"
                @paste.prevent
                @copy.prevent
                @cut.prevent
                autocomplete="off"
                required
              />
            </div>
            <!-- Username Validation Messages -->
            <div class="validation-messages" v-if="formRegister.username">
              <div
                v-for="(check, index) in usernameChecks"
                :key="index"
                class="validation-item"
                :class="[check.isValid ? 'valid' : 'invalid']"
              >
                <i :class="['bi', check.isValid ? 'bi-check-circle' : 'bi-x-circle']"></i>
                {{ check.message }}
              </div>

              <div
                v-if="isCheckingDuplicate && !isDuplicateChecked"
                class="validation-item checking"
              >
                <i class="bi bi-hourglass-split"></i>
                กำลังตรวจสอบชื่อผู้ใช้...
              </div>

              <div
                v-if="isDuplicateChecked"
                class="validation-item"
                :class="[!isDuplicate ? 'valid' : 'invalid']"
              >
                <i :class="['bi', !isDuplicate ? 'bi-check-circle' : 'bi-x-circle']"></i>
                {{ !isDuplicate ? 'สามารถใช้ชื่อผู้ใช้นี้ได้' : 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' }}
              </div>
            </div>

            <!-- password -->
            <div class="input-with-icon-box mt-2">
              <div class="icon-box">
                <i class="bi bi-key"></i>
              </div>
              <input
                v-model="formRegister.password"
                :type="showRegisterPassword ? 'text' : 'password'"
                placeholder="รหัสผ่าน (PASSWORD)"
                @input="validatePassword"
                autocomplete="new-password"
                @paste.prevent
                @copy.prevent
                @cut.prevent
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showRegisterPassword = !showRegisterPassword"
              >
                <i :class="['bi', showRegisterPassword ? 'bi-eye-slash' : 'bi-eye']"></i>
              </button>
            </div>
            <!-- Password Validation Messages -->
            <div class="password-validation" v-if="formRegister.password">
              <div
                v-for="(check, index) in passwordChecks"
                :key="index"
                :class="['validation-item', check.isValid ? 'valid' : 'invalid']"
              >
                <i :class="['bi', check.isValid ? 'bi-check-circle' : 'bi-x-circle']"></i>
                {{ check.message }}
              </div>
            </div>

            <!-- confirm password -->
            <div class="input-with-icon-box mt-2">
              <div class="icon-box">
                <i class="bi bi-check2-all"></i>
              </div>
              <input
                v-model="formRegister.confirmPassword"
                :type="showConfirmRegisterPassword ? 'text' : 'password'"
                placeholder="ยืนยันรหัสผ่าน"
                @input="validateConfirmPassword"
                autocomplete="new-password"
                @paste.prevent
                @copy.prevent
                @cut.prevent
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showConfirmRegisterPassword = !showConfirmRegisterPassword"
              >
                <i :class="['bi', showConfirmRegisterPassword ? 'bi-eye-slash' : 'bi-eye']"></i>
              </button>
            </div>
            <!-- Confirm Password Validation Message -->
            <div v-if="formRegister.confirmPassword" class="password-validation">
              <div class="validation-item" :class="[isConfirmPasswordValid ? 'valid' : 'invalid']">
                <i :class="['bi', isConfirmPasswordValid ? 'bi-check-circle' : 'bi-x-circle']"></i>
                รหัสผ่านตรงกัน
              </div>
            </div>

            <!-- firstname -->
            <div class="input-with-icon-box mt-2">
              <div class="icon-box">
                <i class="bi bi-person-lines-fill"></i>
              </div>
              <input
                v-model="formRegister.firstname"
                type="text"
                placeholder="ชื่อ"
                autocomplete="off"
                required
              />
            </div>

            <!-- lastname -->
            <div class="input-with-icon-box mt-2">
              <div class="icon-box">
                <i class="bi bi-person-lines-fill"></i>
              </div>
              <input
                v-model="formRegister.lastname"
                type="text"
                placeholder="นามสกุล"
                autocomplete="off"
                required
              />
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
//import Checkbox from 'primevue/checkbox'
import { debounce } from 'lodash'

import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import swAlert from '@/services/alert/sweetAlerts.js'

const interfaceFormLogin = {
  username: '',
  password: '',
  rememberMe: false
}
const interfaceFormRegister = {
  username: '',
  password: '',
  confirmPassword: '',

  firstname: '',
  lastname: ''
}
const interfaceStage = {
  isLogin: true,
  isRegister: false
}

export default {
  name: 'LoginView',
  components: {
    //Checkbox
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

      showPassword: false,
      showRegisterPassword: false,
      showConfirmRegisterPassword: false,

      isCheckingDuplicate: true,
      isDuplicateChecked: false,
      isDuplicate: false,
      usernameChecks: [
        { message: 'ความยาว 8-20 ตัวอักษร', isValid: false },
        { message: 'ต้องเป็นภาษาอังกฤษหรือตัวเลขเท่านั้น', isValid: false },
        { message: 'ต้องขึ้นต้นด้วยตัวอักษร', isValid: false }
        // เพิ่ม condition อื่นๆ ได้ที่นี่
      ],
      passwordChecks: [
        { message: 'ความยาว 8-20 ตัวอักษร', isValid: false },
        { message: 'ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว', isValid: false },
        { message: 'ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว', isValid: false },
        { message: 'ต้องมีตัวเลขอย่างน้อย 1 ตัว', isValid: false },
        { message: 'ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว', isValid: false },
        { message: 'ต้องมีตัวอักษรที่ไม่ซ้ำกันอย่างน้อย 4 ตัว', isValid: false },
        { message: 'ห้ามมีตัวอักษรซ้ำติดกันเกิน 2 ตัว', isValid: false },
        { message: 'ห้ามมีตัวเลขเรียงกัน', isValid: false }
      ],
      isConfirmPasswordValid: false
    }
  },

  watch: {
    // ถ้า password เปลี่ยน ให้เคลียร์ confirmPassword
    'formRegister.password'() {
      this.formRegister.confirmPassword = ''
      this.isConfirmPasswordValid = false
    }
  },

  computed: {
    isPasswordValid() {
      return this.passwordChecks.every((check) => check.isValid)
    },
    isUsernameValid() {
      return this.usernameChecks.every((check) => check.isValid) && !this.isDuplicate
    },
    inFormValid() {
      return this.isPasswordValid && this.isConfirmPasswordValid && this.isUsernameValid
    }
  },

  methods: {
    handleAction() {
      this.stage.isLogin = !this.stage.isLogin
      this.stage.isRegister = !this.stage.isRegister

      if (this.stage.isLogin) {
        this.formRegister = { ...interfaceFormRegister }
      }
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
      if (this.inFormValid) {
        console.log('formRegister', this.formRegister)

        const response = await this.authStore.register({
          form: this.formRegister
        })

        if (response) {
          console.log('Register success')
          this.stage.isLogin = true
          this.stage.isRegister = false
          this.formRegister = { ...interfaceFormRegister }

          swAlert.success('ผู้ดูเเลจะดำเนินการตรวจสอบโดยไว', 'ลงทะเบียนสำเร็จ')
        }
      }
    },

    validatePassword() {
      const password = this.formRegister.password

      // Length check
      this.passwordChecks[0].isValid = password.length >= 8 && password.length <= 20

      // Uppercase check
      this.passwordChecks[1].isValid = /[A-Z]/.test(password)

      // Lowercase check
      this.passwordChecks[2].isValid = /[a-z]/.test(password)

      // Number check
      this.passwordChecks[3].isValid = /[0-9]/.test(password)

      // Special char check
      this.passwordChecks[4].isValid = /[!@#$%^&*(),.?":{}|<>]/.test(password)

      // Unique chars check
      const uniqueChars = new Set(password).size
      this.passwordChecks[5].isValid = uniqueChars >= 4

      // Repeating chars check
      this.passwordChecks[6].isValid = !/(.)\1{2,}/.test(password)

      // Sequential numbers check
      this.passwordChecks[7].isValid = !this.hasSequentialNumbers(password)
    },
    hasSequentialNumbers(str) {
      const numbers = str.match(/\d+/g) || []
      for (const numStr of numbers) {
        if (numStr.length >= 3) {
          const num = parseInt(numStr)
          const strNum = num.toString()

          // Check ascending
          let isAscending = true
          for (let i = 0; i < strNum.length - 1; i++) {
            if (parseInt(strNum[i]) + 1 !== parseInt(strNum[i + 1])) {
              isAscending = false
              break
            }
          }

          // Check descending
          let isDescending = true
          for (let i = 0; i < strNum.length - 1; i++) {
            if (parseInt(strNum[i]) - 1 !== parseInt(strNum[i + 1])) {
              isDescending = false
              break
            }
          }

          if (isAscending || isDescending) return true
        }
      }
      return false
    },
    validateConfirmPassword() {
      this.isConfirmPasswordValid =
        this.formRegister.password === this.formRegister.confirmPassword &&
        this.formRegister.confirmPassword !== ''
    },
    validateUsername() {
      const username = this.formRegister.username

      // เช็คความยาว
      this.usernameChecks[0].isValid = username.length >= 8 && username.length <= 20

      // เช็คภาษาอังกฤษหรือตัวเลข
      this.usernameChecks[1].isValid = /^[a-zA-Z0-9]+$/.test(username)

      // เช็คขึ้นต้นด้วยตัวอักษร
      this.usernameChecks[2].isValid = /^[a-zA-Z]/.test(username)

      // Reset duplicate check
      this.isDuplicateChecked = false
      this.isDuplicate = false

      // เรียก API check duplicate ถ้าผ่านทุก validation
      if (this.usernameChecks.every((check) => check.isValid)) {
        this.debouncedCheckDuplicate()
      }
    },

    async checkDuplicateUsername() {
      if (!this.formRegister.username) return

      //this.isCheckingDuplicate = true
      try {
        const response = await this.authStore.checkDupUsername({
          username: this.formRegister.username
        })
        console.log('response', response)
        this.isDuplicate = response
      } catch (error) {
        console.error('Failed to check username:', error)
        this.isDuplicate = true
      } finally {
        //this.isCheckingDuplicate = false
        this.isDuplicateChecked = true
      }
    },

    debouncedCheckDuplicate: debounce(function () {
      this.checkDuplicateUsername()
    }, 500)
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
    position: relative; // เพิ่มเพื่อให้จัดตำแหน่งปุ่ม toggle ได้
    display: flex;
    align-items: stretch;
    border-radius: 4px;
    overflow: hidden;
    background: #e0e0e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

    input[type='password']::-ms-reveal,
    input[type='password']::-ms-clear,
    input[type='password']::-webkit-contacts-auto-fill-button,
    input[type='password']::-webkit-credentials-auto-fill-button {
      display: none !important;
      visibility: hidden;
      pointer-events: none;
      position: absolute;
      right: 0;
    }

    input {
      &:-webkit-autofill {
        box-shadow: 0 0 0 30px #e0e0e0 inset;
      }
    }

    .toggle-password {
      z-index: 2; // เพิ่ม z-index ให้ปุ่มของเราอยู่ด้านบน
    }

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
      //font-size: 1rem;

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

    .toggle-password {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #921313;
      cursor: pointer;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: darken(#921313, 10%);
      }

      i {
        font-size: 1.2rem;
      }
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

.password-validation {
  margin-top: 10px;
  font-size: 0.85rem;
}

.validation-item {
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.valid {
  color: #2ecc71;
}

.invalid {
  color: #e74c3c;
}

.bi {
  font-size: 0.8rem;
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
