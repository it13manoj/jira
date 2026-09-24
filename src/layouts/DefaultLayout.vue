<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="row min-h-screen bg-grey-10 text-white">
        <!-- Left Side: Brand & Hero Banner (Hidden on Mobile) -->
        <div class="col-12 col-md-6 gt-sm flex flex-center q-pa-xl bg-gradient">
          <div class="max-w-md">
            <div class="flex items-center q-gutter-sm q-mb-xl">
              <q-avatar
                size="48px"
                color="primary"
                text-color="white"
                icon="space_dashboard"
              />
              <div class="text-h5 text-weight-bolder tracking-wide"
                >Enterprise Core</div
              >
            </div>

            <div class="text-h3 text-weight-bold q-mb-md leading-tight">
              Manage your business with clarity.
            </div>

            <p class="text-subtitle1 text-grey-4 q-mb-xl">
              Access real-time analytics, user management, and seamless Spring
              Boot integrations in one unified dashboard.
            </p>

            <!-- Feature Bullet List -->
            <div class="q-gutter-y-md">
              <div class="flex items-center q-gutter-x-md">
                <q-icon name="check_circle" color="primary" size="24px" />
                <span class="text-body1 text-grey-3"
                  >Role-based Access Control (RBAC)</span
                >
              </div>
              <div class="flex items-center q-gutter-x-md">
                <q-icon name="check_circle" color="primary" size="24px" />
                <span class="text-body1 text-grey-3"
                  >Spring Security & JWT Authentication</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Auth Form Container -->
        <div class="col-12 col-md-6 flex flex-center q-pa-lg">
          <div class="full-width max-w-sm">
            <!-- Mobile Logo Display -->
            <div class="lt-md text-center q-mb-lg">
              <q-avatar
                size="40px"
                color="primary"
                text-color="white"
                icon="space_dashboard"
                class="q-mb-xs"
              />
              <div class="text-h6 text-weight-bold">Enterprise Core</div>
            </div>

            <router-view />
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
.max-w-md {
  max-width: 480px;
}
.max-w-sm {
  max-width: 400px;
}
.bg-gradient {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
