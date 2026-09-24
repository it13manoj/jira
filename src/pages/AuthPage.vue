<template>
  <div class="auth-wrapper full-width">
    <!-- Segmented Tab Switcher -->
    <q-tabs
      v-model="tab"
      dense
      no-caps
      class="auth-tabs text-grey-4 rounded-borders bg-slate-800 q-pa-xs q-mb-lg"
      active-color="white"
      active-bg-color="primary"
      indicator-color="transparent"
      align="justify"
    >
      <q-tab name="login" label="Sign In" class="tab-pill" />
      <q-tab name="register" label="Create Account" class="tab-pill" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="bg-transparent text-white">
      <!-- LOGIN PANEL -->
      <q-tab-panel name="login" class="q-pa-none">
        <div class="text-h5 text-weight-bold text-white q-mb-xs"
          >Welcome back</div
        >
        <div class="text-caption text-grey-4 q-mb-lg">
          Please enter your credentials to access your account.
        </div>

        <q-form @submit.prevent="handleLogin" class="q-gutter-y-md">
          <div>
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs"
              >Username</div
            >
            <q-input
              v-model="loginForm.email"
              dark
              outlined
              dense
              type="text"
              placeholder="name@company.com"
              lazy-rules
              :rules="[val => !!val || 'Email is required']"
              class="custom-field"
            >
              <template v-slot:prepend>
                <q-icon name="mail_outline" size="18px" color="grey-5" />
              </template>
            </q-input>
          </div>

          <div>
            <div class="flex justify-between items-center q-mb-xs">
              <span class="text-caption text-weight-medium text-grey-3"
                >Password</span
              >
              <a
                href="#"
                class="text-caption text-primary text-none hover-underline"
                >Forgot password?</a
              >
            </div>
            <q-input
              v-model="loginForm.password"
              dark
              outlined
              dense
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              lazy-rules
              :rules="[val => !!val || 'Password is required']"
              class="custom-field"
            >
              <template v-slot:prepend>
                <q-icon name="lock_open" size="18px" color="grey-5" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  size="18px"
                  class="cursor-pointer text-grey-5 hover-white"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>

          <q-btn
            label="Sign In"
            type="submit"
            color="primary"
            class="full-width text-weight-bold q-py-sm rounded-btn"
            unelevated
            :loading="loading"
          />

          <div class="row items-center q-my-md">
            <q-separator class="col bg-slate-700" />
            <span class="q-px-sm text-caption text-grey-5">or</span>
            <q-separator class="col bg-slate-700" />
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-btn
                outline
                dark
                no-caps
                class="full-width btn-social"
                icon="g_mobiledata"
                label="Google"
              />
            </div>
            <div class="col-6">
              <q-btn
                outline
                dark
                no-caps
                class="full-width btn-social"
                icon="code"
                label="GitHub"
              />
            </div>
          </div>
        </q-form>
      </q-tab-panel>

      <!-- REGISTER PANEL -->
      <q-tab-panel name="register" class="q-pa-none">
        <div class="text-h5 text-weight-bold text-white q-mb-xs"
          >Create account</div
        >
        <div class="text-caption text-grey-4 q-mb-lg">
          Start your 30-day free trial. No credit card required.
        </div>

        <q-form @submit.prevent="handleRegister" class="q-gutter-y-sm">
          <div>
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs"
              >Full Name</div
            >
            <q-input
              v-model="registerForm.fullName"
              dark
              outlined
              dense
              placeholder="John Doe"
              lazy-rules
              :rules="[val => !!val || 'Full Name is required']"
              class="custom-field"
            >
              <template v-slot:prepend>
                <q-icon name="person_outline" size="18px" color="grey-5" />
              </template>
            </q-input>
          </div>

          <div>
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs"
              >Email Address</div
            >
            <q-input
              v-model="registerForm.email"
              dark
              outlined
              dense
              type="email"
              placeholder="name@company.com"
              lazy-rules
              :rules="[val => !!val || 'Email is required']"
              class="custom-field"
            >
              <template v-slot:prepend>
                <q-icon name="mail_outline" size="18px" color="grey-5" />
              </template>
            </q-input>
          </div>

          <div>
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs"
              >Password</div
            >
            <q-input
              v-model="registerForm.password"
              dark
              outlined
              dense
              :type="showPassword ? 'text' : 'password'"
              placeholder="At least 6 characters"
              lazy-rules
              :rules="[
                val => !!val || 'Password is required',
                val =>
                  val.length >= 6 || 'Password must be at least 6 characters'
              ]"
              class="custom-field"
            >
              <template v-slot:prepend>
                <q-icon name="lock_open" size="18px" color="grey-5" />
              </template>
            </q-input>
          </div>

          <div>
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs"
              >Confirm Password</div
            >
            <q-input
              v-model="registerForm.confirmPassword"
              dark
              outlined
              dense
              :type="showPassword ? 'text' : 'password'"
              placeholder="Confirm password"
              lazy-rules
              :rules="[
                val => !!val || 'Confirming password is required',
                val => val === registerForm.password || 'Passwords do not match'
              ]"
              class="custom-field"
            >
              <template v-slot:prepend>
                <q-icon name="lock_open" size="18px" color="grey-5" />
              </template>
            </q-input>
          </div>

          <q-btn
            label="Create Account"
            type="submit"
            color="primary"
            class="full-width text-weight-bold q-py-sm rounded-btn q-mt-md"
            unelevated
            :loading="loading"
          />
        </q-form>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from '@/boot/axios'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'

import { getUserRole } from '../utils/auth'
const userRole = ref('')

const router = useRouter()

const tab = ref('login')
const showPassword = ref(false)
const loading = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleLogin = async () => {
  loading.value = true
  try {
    const response = await api.post('/auth/login', {
      username: loginForm.email,
      password: loginForm.password
    })

    localStorage.setItem('token', response.data.token)
    userRole.value = getUserRole()
    console.log('User role after login:', userRole.value) // Debugging line
    localStorage.setItem('role', userRole.value)
    Notify.create({
      type: 'positive',
      message: 'Login successful!',
      position: 'top'
    })

    router.push('/dashboard')
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Authentication failed',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  loading.value = true
  try {
    await api.post('/auth/register', {
      firstName: registerForm.fullName.split(' ')[0],
      lastName: registerForm.fullName.split(' ').slice(1).join(' '),
      username: registerForm.email,
      password: registerForm.password
    })

    Notify.create({
      type: 'positive',
      message: 'Registration successful! Please sign in.',
      position: 'top'
    })

    tab.value = 'login'
  } catch (error) {
    Notify.create({
      type: 'negative',
      message:
        error.response?.data?.message || 'Registration failed. chaeck again',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-wrapper {
  max-width: 380px;
  margin: 0 auto;
}

/* Tab Switcher Styling */
.auth-tabs {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.tab-pill {
  border-radius: 8px;
  min-height: 36px;
  font-weight: 500;
}

/* Form Input Override Fix */
.custom-field :deep(.q-field__control) {
  background: #0f172a !important;
  border-radius: 8px !important;
}
.custom-field :deep(.q-field__native),
.custom-field :deep(.q-field__input) {
  color: #ffffff !important;
}

/* Button Formatting */
.rounded-btn {
  border-radius: 8px;
}
.btn-social {
  border-radius: 8px;
  border-color: rgba(255, 255, 255, 0.15);
}
.bg-slate-700 {
  background-color: rgba(255, 255, 255, 0.1);
}
.bg-slate-800 {
  background-color: #0f172a;
}
.hover-underline:hover {
  text-decoration: underline;
}
</style>
