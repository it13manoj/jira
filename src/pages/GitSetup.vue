<template>
  <q-page class="q-pa-md" style="max-width: 900px; margin: auto">
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Git & Gemini Setup</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input
          v-model="gitToken"
          type="password"
          label="Git Personal Access Token (PAT)"
          outlined
          dense
        />
        <q-input
          v-model="geminiKey"
          type="password"
          label="Gemini API Key"
          outlined
          dense
        />
        <q-input
          v-model="repoPath"
          label="Repository Path (owner/repo)"
          outlined
          dense
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          label="Test Connection & Fetch PRs"
          color="primary"
          :loading="loading"
          @click="fetchPullRequests"
        />
      </q-card-actions>
    </q-card>

    <!-- Open Pull Requests List -->
    <q-card v-if="pullRequests.length > 0" flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Open Pull Requests</div>
      </q-card-section>
      <q-list separator>
        <q-item v-for="pr in pullRequests" :key="pr.number">
          <q-item-section>
            <q-item-label class="text-bold"
              >#{{ pr.number }} - {{ pr.title }}</q-item-label
            >
            <q-item-label caption>Author: {{ pr.author }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="q-gutter-xs">
              <q-btn
                dense
                color="secondary"
                label="Review with Gemini"
                @click="processPR(pr.number, 'review')"
              />
              <q-btn
                dense
                color="positive"
                label="Review & Merge"
                @click="processPR(pr.number, 'merge')"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Gemini AI Feedback Output -->
    <q-card v-if="reviewFeedback" flat bordered class="bg-grey-2">
      <q-card-section>
        <div class="text-h6">Gemini AI Review Output</div>
      </q-card-section>

      <q-card-section>
        <pre style="white-space: pre-wrap">{{ reviewFeedback }}</pre>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/boot/axios'

const $q = useQuasar()

const gitToken = ref('')
const geminiKey = ref('')
const repoPath = ref('acme-org/dashboard-core')
const loading = ref(false)
const pullRequests = ref([])
const reviewFeedback = ref('')

// Fetch PR list using configured Quasar Axios instance
const fetchPullRequests = async () => {
  if (!gitToken.value) {
    $q.notify({ type: 'negative', message: 'Git Token is required' })
    return
  }

  loading.value = true
  try {
    const { data } = await api.post('/users/git/pull-requests', {
      gitToken: gitToken.value,
      repoPath: repoPath.value
    })

    if (data.success) {
      pullRequests.value = data.pullRequests
      $q.notify({ type: 'positive', message: 'PRs fetched successfully' })
    } else {
      $q.notify({
        type: 'negative',
        message: data.error || 'Failed to fetch PRs'
      })
    }
  } catch (err) {
    const errorMsg =
      err.response?.data?.message ||
      err.message ||
      'Failed to connect to backend'
    $q.notify({ type: 'negative', message: errorMsg })
  } finally {
    loading.value = false
  }
}

// Trigger Gemini Code Review & Optional Merge via Axios
const processPR = async (pullNumber, action) => {
  if (!geminiKey.value) {
    $q.notify({ type: 'warning', message: 'Gemini API Key is required' })
    return
  }

  $q.loading.show({ message: `Executing Gemini review and ${action}...` })
  try {
    const { data } = await api.post('/users/git/review-and-merge', {
      gitToken: gitToken.value,
      geminiKey: geminiKey.value,
      repoPath: repoPath.value,
      pullNumber,
      action
    })

    if (data.success) {
      reviewFeedback.value = data.reviewFeedback
      $q.notify({
        type: 'positive',
        message:
          action === 'merge'
            ? 'PR reviewed and merged!'
            : 'Review posted to Git!'
      })
      await fetchPullRequests()
    } else {
      $q.notify({ type: 'negative', message: data.error || 'Operation failed' })
    }
  } catch (err) {
    const errorMsg =
      err.response?.data?.message || err.message || 'Processing failed'
    $q.notify({ type: 'negative', message: errorMsg })
  } finally {
    $q.loading.hide()
  }
}
</script>
