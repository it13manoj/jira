<template>
  <q-page class="q-pa-lg bg-slate-900 text-white min-h-screen">
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-bold q-ma-none text-white">
          Git Integration Configuration
        </h1>
        <p class="text-caption text-grey-4 q-mb-none">
          Connect your Git repositories to automate deployments and
          synchronizations.
        </p>
      </div>
      <div>
        <q-chip
          :color="isconnected ? 'positive' : 'negative'"
          text-color="white"
          icon="fiber_manual_record"
          dense
          class="q-px-sm"
        >
          {{ isconnected ? 'Connected' : 'Disconnected' }}
        </q-chip>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Left Column: Provider & Authentication Settings -->
      <div class="col-12 col-lg-8">
        <q-card
          class="bg-slate-800 text-white border-glass rounded-card q-mb-md"
        >
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-md"
              >Select Git Provider</div
            >

            <!-- Git Provider Tabs -->
            <q-tabs
              v-model="config.provider"
              dense
              class="text-grey-4 bg-slate-900 rounded-borders q-mb-lg"
              active-color="primary"
              indicator-color="primary"
              align="justify"
            >
              <q-tab name="github" icon="code" label="GitHub" />
              <q-tab name="gitlab" icon="account_tree" label="GitLab" />
              <q-tab name="bitbucket" icon="token" label="Bitbucket" />
            </q-tabs>

            <!-- Authentication Form -->
            <q-form @submit.prevent="testConnection" class="q-gutter-y-md">
              <div class="text-subtitle1 text-weight-medium"
                >Authentication Method</div
              >

              <div class="row q-gutter-x-md">
                <q-radio
                  dark
                  v-model="config.authType"
                  val="pat"
                  label="Personal Access Token (PAT)"
                />
                <q-radio
                  dark
                  v-model="config.authType"
                  val="oauth"
                  label="OAuth Web App"
                />
              </div>

              <!-- Host URL (For Self-Hosted Enterprise Git) -->
              <q-input
                v-if="config.provider !== 'github' || config.isSelfHosted"
                dark
                outlined
                dense
                v-model="config.hostUrl"
                label="Git Host URL *"
                hint="e.g., https://gitlab.mycompany.com"
                :rules="[val => !!val || 'Host URL is required']"
              />

              <!-- PAT Input -->
              <!-- PAT Input -->
              <template v-if="config.authType === 'pat'">
                <q-input
                  dark
                  outlined
                  dense
                  v-model="config.token"
                  :type="showToken ? 'text' : 'password'"
                  label="GitHub Personal Access Token *"
                  hint="Requires repo access to fetch diffs"
                  :rules="[val => !!val || 'Token is required']"
                  class="q-mb-md"
                >
                  <template #append>
                    <q-icon
                      :name="showToken ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showToken = !showToken"
                    />
                  </template>
                </q-input>

                <!-- Gemini API Key Input -->
                <q-input
                  dark
                  outlined
                  dense
                  v-model="config.geminiApiKey"
                  :type="showGeminiKey ? 'text' : 'password'"
                  label="Gemini API Key *"
                  hint="Used to power automated AI code reviews"
                  :rules="[val => !!val || 'Gemini API Key is required']"
                >
                  <template #append>
                    <q-icon
                      :name="showGeminiKey ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showGeminiKey = !showGeminiKey"
                    />
                  </template>
                </q-input>
              </template>

              <!-- OAuth Connect Button -->
              <template v-else>
                <div
                  class="q-my-md bg-slate-900 q-pa-md rounded-borders text-center"
                >
                  <p class="text-caption text-grey-4">
                    Authorize your panel to read repositories directly via
                    {{ config.provider.toUpperCase() }} OAuth.
                  </p>
                  <q-btn
                    color="primary"
                    icon="login"
                    :label="`Connect with ${config.provider}`"
                    no-caps
                    unelevated
                    @click="triggerOAuth"
                  />
                </div>
              </template>

              <!-- Repository & Branch Settings -->
              <div class="text-subtitle1 text-weight-medium q-pt-sm"
                >Repository Settings</div
              >

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-select
                    dark
                    outlined
                    dense
                    v-model="config.repository"
                    :options="repositoryOptions"
                    label="Default Repository"
                    hint="Select from accessible repositories"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dark
                    outlined
                    dense
                    v-model="config.defaultBranch"
                    label="Default Branch"
                    placeholder="main"
                  />
                </div>
              </div>

              <!-- Form Actions -->
              <div class="row justify-end q-gutter-x-sm q-pt-md">
                <q-btn
                  outline
                  color="white"
                  label="Test Connection"
                  :loading="testing"
                  @click="testConnection"
                  no-caps
                />
                <q-btn
                  color="primary"
                  label="Save Configuration"
                  type="submit"
                  unelevated
                  no-caps
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Column: Status & Webhook Helper -->
      <div class="col-12 col-lg-4">
        <!-- Automation Settings -->
        <q-card
          class="bg-slate-800 text-white border-glass rounded-card q-mb-md"
        >
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-sm"
              >Automation & Sync</div
            >

            <q-list dark separator class="rounded-borders">
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Auto-Deploy on Push</q-item-label>
                  <q-item-label caption class="text-grey-4">
                    Trigger panel builds automatically when code is pushed.
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle dark color="positive" v-model="config.autoDeploy" />
                </q-item-section>
              </q-item>

              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Sync Commit Logs</q-item-label>
                  <q-item-label caption class="text-grey-4">
                    Display recent commit history inside project details.
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle dark color="positive" v-model="config.syncLogs" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Webhook Information Card -->
        <q-card class="bg-slate-800 text-white border-glass rounded-card">
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-xs"
              >Webhook Payload URL</div
            >
            <p class="text-caption text-grey-4">
              Add this URL to your repository webhook settings to enable instant
              trigger events.
            </p>

            <q-input
              dark
              readonly
              outlined
              dense
              v-model="webhookUrl"
              class="q-mb-sm"
            >
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  icon="content_copy"
                  @click="copyWebhook"
                />
              </template>
            </q-input>

            <div
              class="text-caption text-grey-5 row items-center q-gutter-x-xs"
            >
              <q-icon name="info" size="16px" color="amber" />
              <span>Secret Header Signature is required for security.</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { Notify, copyToClipboard } from 'quasar'
import { api } from '@/boot/axios' // <--- Using your Boot Axios instance

const isconnected = ref(false)
const testing = ref(false)
const loadingPrs = ref(false)
const showToken = ref(false)
const showGeminiKey = ref(false)

const webhookUrl = ref('https://your-domain.com/api/v1/users/git/webhook')

const config = ref({
  userId: 'user_123', // Can be populated dynamically from user state
  provider: 'github',
  authType: 'pat',
  hostUrl: 'https://github.com',
  token: '',
  geminiApiKey: '',
  repository: 'it13manoj/batohi',
  defaultBranch: 'main',
  autoDeploy: true,
  syncLogs: true,
  isSelfHosted: false
})

const repositoryOptions = ref([
  'it13manoj/batohi',
  'acme-org/backend-api',
  'acme-org/infrastructure-terraform'
])

/**
 * 1. Save Git & Gemini API Keys to Database and Auto-Register Webhook
 */
const saveConfiguration = async () => {
  try {
    testing.value = true

    const payload = {
      userId: config.value.userId,
      repoPath: config.value.repository,
      gitToken: config.value.token,
      geminiApiKey: config.value.geminiApiKey
    }

    // Auth token is automatically attached by @/boot/axios
    const response = await api.post('/users/git/save-config', payload)

    if (response.data?.success) {
      isconnected.value = true
      Notify.create({
        type: 'positive',
        message:
          response.data.message || 'Configuration & Keys saved successfully!',
        position: 'top'
      })
    }
  } catch (error) {
    isconnected.value = false
    const errorMessage =
      error.response?.data?.error || 'Failed to save configuration.'
    Notify.create({
      type: 'negative',
      message: errorMessage,
      position: 'top'
    })
  } finally {
    testing.value = false
  }
}

/**
 * 2. Manually Trigger AI Code Review for a Pull Request
 */
const triggerPrReview = async prNumber => {
  try {
    loadingPrs.value = true

    const payload = {
      userId: config.value.userId,
      prNumber: prNumber
    }

    const response = await api.post('/users/git/review-pr', payload)

    if (response.data?.success) {
      Notify.create({
        type: 'positive',
        message: 'PR Review generated successfully!',
        position: 'top'
      })
      console.log('AI Review Result:', response.data.review)
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || 'Failed to generate PR review.'
    Notify.create({
      type: 'negative',
      message: errorMessage,
      position: 'top'
    })
  } finally {
    loadingPrs.value = false
  }
}

const testConnection = () => {
  saveConfiguration()
}

const triggerOAuth = () => {
  Notify.create({
    type: 'info',
    message: `Redirecting to ${config.value.provider.toUpperCase()} authorization...`,
    position: 'top'
  })
}

const copyWebhook = () => {
  copyToClipboard(webhookUrl.value)
    .then(() => {
      Notify.create({
        type: 'positive',
        message: 'Webhook URL copied to clipboard',
        position: 'top'
      })
    })
    .catch(() => {
      Notify.create({
        type: 'negative',
        message: 'Failed to copy',
        position: 'top'
      })
    })
}
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
.bg-slate-900 {
  background-color: #0f172a;
}
.bg-slate-800 {
  background-color: #1e293b;
}

.border-glass {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.rounded-card {
  border-radius: 12px;
}
</style>
