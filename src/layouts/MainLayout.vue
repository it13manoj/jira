<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Enterprise Admin </q-toolbar-title>

        <q-space />

        <!-- User Profile & Top Bar Logout -->
        <q-btn flat round dense icon="account_circle">
          <q-menu>
            <q-list style="min-width: 140px">
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section class="text-negative text-weight-medium"
                  >Logout</q-item-section
                >
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Sidebar Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="column justify-between"
    >
      <q-list>
        <q-item-label header class="text-weight-bold text-uppercase">
          Navigation
        </q-item-label>

        <!-- Sidebar Links -->
        <EssentialLink />
      </q-list>

      <!-- Bottom Sidebar Logout Button -->
      <div class="q-pa-md border-top">
        <q-btn
          outline
          color="negative"
          icon="logout"
          label="Logout"
          class="full-width text-weight-bold"
          @click="handleLogout"
        />
      </div>
    </q-drawer>

    <!-- Dynamic Page Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import EssentialLink from '../components/EssentialLink.vue'

const router = useRouter()
const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Practical Logout Handler
function handleLogout() {
  // 1. Clear stored tokens / session data
  localStorage.removeItem('token')
  sessionStorage.clear()

  // 2. Display a success feedback notification
  Notify.create({
    type: 'info',
    message: 'You have been logged out successfully.',
    position: 'top'
  })

  // 3. Redirect to login page
  router.push('/login')
}
</script>

<style scoped>
.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
