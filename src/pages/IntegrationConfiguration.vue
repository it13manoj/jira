<template>
  <q-page class="q-pa-lg bg-slate-900 text-white min-h-screen">
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-bold q-ma-none text-white">
          Git Integration Configuration
        </h1>
        <p class="text-caption text-grey-4 q-mb-none">
          Connect your Git repositories to automate deployments,
          synchronizations, and AI-powered code reviews.
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

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- Row 1 — Configuration Panel                              -->
    <!-- ══════════════════════════════════════════════════════════ -->

    <!-- Loading saved config skeleton -->
    <div v-if="loadingConfig" class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-lg-8">
        <q-card class="bg-slate-800 border-glass rounded-card">
          <q-card-section class="q-gutter-sm">
            <q-skeleton dark type="text" width="40%" height="24px" />
            <q-skeleton dark type="rect" height="48px" />
            <q-skeleton dark type="rect" height="48px" />
            <q-skeleton dark type="rect" height="48px" />
            <q-skeleton dark type="rect" height="48px" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-lg-4">
        <q-card class="bg-slate-800 border-glass rounded-card">
          <q-card-section class="q-gutter-sm">
            <q-skeleton dark type="text" width="60%" height="24px" />
            <q-skeleton dark type="rect" height="80px" />
            <q-skeleton dark type="rect" height="60px" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else class="row q-col-gutter-lg q-mb-lg">
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
            <q-form
              ref="configFormRef"
              @submit.prevent="saveConfiguration"
              class="q-gutter-y-md"
            >
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
                  <q-input
                    dark
                    outlined
                    dense
                    v-model="config.repository"
                    label="Repository (owner/repo)"
                    placeholder="e.g. it13manoj/batohi"
                    hint="Type any GitHub/GitLab/Bitbucket repository path"
                    :rules="[
                      val => !!val || 'Repository path is required',
                      val =>
                        /^[^/]+\/[^/]+$/.test(val?.trim()) ||
                        'Format must be owner/repo'
                    ]"
                    clearable
                  >
                    <template #prepend>
                      <q-icon name="source" color="grey-5" />
                    </template>
                  </q-input>
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
                  :loading="saving"
                  unelevated
                  no-caps
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Column: Automation + Webhook -->
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

              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>AI Review on PR Open</q-item-label>
                  <q-item-label caption class="text-grey-4">
                    Auto-trigger Gemini review when a new PR is opened via
                    webhook.
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle dark color="positive" v-model="config.autoReview" />
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

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- Row 2 — Git Merge Code Review Panel                      -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <div class="row q-col-gutter-lg">
      <!-- ── Pull Requests List ── -->
      <div class="col-12 col-lg-5">
        <q-card
          class="bg-slate-800 text-white border-glass rounded-card full-height-card"
        >
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div class="text-h6 text-weight-bold">Open Pull Requests</div>
            <q-btn
              flat
              round
              dense
              color="white"
              icon="refresh"
              :loading="loadingPrs"
              @click="fetchPullRequests"
            >
              <q-tooltip class="bg-slate-900 text-white">Refresh PRs</q-tooltip>
            </q-btn>
          </q-card-section>

          <!-- Empty / not connected state -->
          <q-card-section v-if="!isconnected" class="text-center q-py-xl">
            <q-icon name="link_off" size="48px" color="grey-6" />
            <p class="text-grey-5 q-mt-sm">
              Save your configuration first to load Pull Requests.
            </p>
          </q-card-section>

          <!-- Loading skeleton -->
          <q-card-section v-else-if="loadingPrs" class="q-gutter-sm">
            <q-skeleton
              dark
              type="rect"
              height="60px"
              v-for="n in 3"
              :key="n"
            />
          </q-card-section>

          <!-- Empty PRs -->
          <q-card-section
            v-else-if="pullRequests.length === 0"
            class="text-center q-py-xl"
          >
            <q-icon name="check_circle_outline" size="48px" color="positive" />
            <p class="text-grey-5 q-mt-sm">No open pull requests found.</p>
          </q-card-section>

          <!-- PR List -->
          <q-list v-else dark separator>
            <q-item
              v-for="pr in pullRequests"
              :key="pr.number"
              clickable
              v-ripple
              :active="selectedPr?.number === pr.number"
              active-class="bg-blue-10"
              @click="selectPr(pr)"
              class="rounded-sm q-mb-xs"
            >
              <q-item-section avatar>
                <q-avatar
                  size="36px"
                  color="indigo-8"
                  text-color="white"
                  font-size="14px"
                >
                  {{ pr.number }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium ellipsis" lines="1">
                  {{ pr.title }}
                </q-item-label>
                <q-item-label caption class="text-grey-5">
                  <q-icon name="person" size="12px" /> {{ pr.author }}
                  &nbsp;·&nbsp;
                  <q-icon name="merge_type" size="12px" /> {{ pr.head }} →
                  {{ pr.base }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge
                  :color="prStatusColor(pr.status)"
                  :label="pr.status || 'open'"
                  class="text-capitalize"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- ── Code Review + Merge Panel ── -->
      <div class="col-12 col-lg-7">
        <q-card
          class="bg-slate-800 text-white border-glass rounded-card full-height-card"
        >
          <!-- No PR selected placeholder -->
          <template v-if="!selectedPr">
            <q-card-section class="text-center q-py-xl">
              <q-icon name="rate_review" size="56px" color="grey-6" />
              <p class="text-grey-5 q-mt-sm text-subtitle1">
                Select a Pull Request to review or merge
              </p>
            </q-card-section>
          </template>

          <!-- PR detail view -->
          <template v-else>
            <!-- PR Header -->
            <q-card-section class="q-pb-sm">
              <div class="row items-start justify-between">
                <div>
                  <div class="text-h6 text-weight-bold">
                    <q-chip
                      dense
                      color="indigo-8"
                      text-color="white"
                      class="q-mr-xs"
                    >
                      #{{ selectedPr.number }}
                    </q-chip>
                    {{ selectedPr.title }}
                  </div>
                  <div
                    class="text-caption text-grey-5 q-mt-xs row items-center q-gutter-x-sm"
                  >
                    <span
                      ><q-icon name="person" size="14px" />
                      {{ selectedPr.author }}</span
                    >
                    <span
                      ><q-icon name="merge_type" size="14px" />
                      {{ selectedPr.head }} → {{ selectedPr.base }}</span
                    >
                    <span v-if="selectedPr.createdAt">
                      <q-icon name="schedule" size="14px" />
                      {{ formatDate(selectedPr.createdAt) }}
                    </span>
                  </div>
                </div>
                <q-badge
                  :color="prStatusColor(selectedPr.status)"
                  :label="selectedPr.status || 'open'"
                  class="text-capitalize q-mt-xs"
                  style="font-size: 12px; padding: 4px 8px"
                />
              </div>

              <!-- PR Description -->
              <div
                v-if="selectedPr.description"
                class="bg-slate-900 q-pa-sm rounded-borders q-mt-sm text-caption text-grey-4"
              >
                {{ selectedPr.description }}
              </div>
            </q-card-section>

            <q-separator dark />

            <!-- Changed Files Summary -->
            <q-card-section
              v-if="selectedPr.changedFiles?.length"
              class="q-pb-sm"
            >
              <div
                class="text-subtitle2 text-weight-medium q-mb-xs row items-center q-gutter-x-xs"
              >
                <q-icon name="difference" color="amber" />
                <span
                  >Changed Files ({{ selectedPr.changedFiles.length }})</span
                >
              </div>
              <div class="changed-files-list q-gutter-xs">
                <q-chip
                  v-for="file in selectedPr.changedFiles.slice(0, 12)"
                  :key="file"
                  dense
                  color="slate-900"
                  text-color="grey-4"
                  class="bg-slate-900 text-mono"
                  style="font-size: 11px"
                >
                  {{ file }}
                </q-chip>
                <q-chip
                  v-if="selectedPr.changedFiles.length > 12"
                  dense
                  color="grey-8"
                  text-color="white"
                >
                  +{{ selectedPr.changedFiles.length - 12 }} more
                </q-chip>
              </div>
            </q-card-section>

            <q-separator dark v-if="selectedPr.changedFiles?.length" />

            <!-- Action Buttons -->
            <q-card-section class="q-pb-sm">
              <div class="row q-gutter-sm">
                <!-- Review Only -->
                <q-btn
                  unelevated
                  color="indigo-7"
                  icon="psychology"
                  label="Review with Gemini AI"
                  no-caps
                  :loading="reviewingPr"
                  :disable="
                    merging ||
                    rejecting ||
                    ['merged', 'closed', 'rejected'].includes(selectedPr.status)
                  "
                  @click="reviewPr('review')"
                />

                <!-- Review & Merge -->
                <q-btn
                  unelevated
                  :color="canMerge ? 'positive' : 'grey-7'"
                  icon="merge"
                  label="Review & Merge"
                  no-caps
                  :loading="merging"
                  :disable="
                    reviewingPr ||
                    rejecting ||
                    ['merged', 'closed', 'rejected'].includes(selectedPr.status)
                  "
                  @click="confirmMerge"
                >
                  <q-tooltip
                    v-if="!canMerge && !reviewingPr"
                    class="bg-slate-900 text-white"
                  >
                    Run an AI review first before merging.
                  </q-tooltip>
                </q-btn>

                <!-- Reject Merge Request -->
                <q-btn
                  unelevated
                  color="negative"
                  icon="do_not_disturb_on"
                  label="Reject"
                  no-caps
                  :loading="rejecting"
                  :disable="
                    reviewingPr ||
                    merging ||
                    ['merged', 'closed', 'rejected'].includes(selectedPr.status)
                  "
                  @click="confirmReject"
                >
                  <q-tooltip class="bg-slate-900 text-white">
                    Close this PR without merging and leave a rejection comment.
                  </q-tooltip>
                </q-btn>

                <!-- Dismiss / clear selection -->
                <q-btn
                  flat
                  color="grey-5"
                  icon="close"
                  label="Dismiss"
                  no-caps
                  @click="clearReview"
                />
              </div>

              <!-- Already-closed status notice -->
              <div
                v-if="
                  ['merged', 'closed', 'rejected'].includes(selectedPr.status)
                "
                class="row items-center q-gutter-x-xs q-mt-sm"
              >
                <q-icon
                  :name="
                    selectedPr.status === 'merged' ? 'check_circle' : 'cancel'
                  "
                  :color="
                    selectedPr.status === 'merged' ? 'positive' : 'negative'
                  "
                  size="16px"
                />
                <span class="text-caption text-grey-4 text-capitalize">
                  This PR is already <strong>{{ selectedPr.status }}</strong> —
                  no further actions available.
                </span>
              </div>
            </q-card-section>

            <q-separator dark />

            <!-- AI Review Output -->
            <q-card-section>
              <!-- Loading state -->
              <div v-if="reviewingPr" class="text-center q-py-lg">
                <q-spinner-dots color="indigo-4" size="40px" />
                <p class="text-grey-5 q-mt-sm">Gemini is analysing the diff…</p>
              </div>

              <!-- No review yet -->
              <div
                v-else-if="!reviewResult"
                class="text-center q-py-lg text-grey-6"
              >
                <q-icon name="auto_awesome" size="40px" color="grey-7" />
                <p class="q-mt-sm"
                  >Click <strong>Review with Gemini AI</strong> to get an
                  automated code review for this PR.</p
                >
              </div>

              <!-- Review result -->
              <div v-else>
                <!-- Summary badges -->
                <div class="row items-center q-gutter-sm q-mb-md">
                  <div class="text-subtitle2 text-weight-bold">
                    <q-icon name="auto_awesome" color="amber" class="q-mr-xs" />
                    Gemini AI Review
                  </div>
                  <q-chip
                    dense
                    :color="reviewResult.approved ? 'positive' : 'warning'"
                    :icon="reviewResult.approved ? 'check_circle' : 'warning'"
                    text-color="white"
                  >
                    {{
                      reviewResult.approved
                        ? 'Looks Good to Merge'
                        : 'Needs Attention'
                    }}
                  </q-chip>
                  <q-chip
                    v-if="reviewResult.score != null"
                    dense
                    color="indigo-8"
                    text-color="white"
                  >
                    Score: {{ reviewResult.score }}/10
                  </q-chip>
                </div>

                <!-- Issues list -->
                <div v-if="reviewResult.issues?.length" class="q-mb-md">
                  <div
                    class="text-caption text-weight-medium text-grey-4 q-mb-xs"
                  >
                    <q-icon name="bug_report" color="negative" /> Issues Found
                    ({{ reviewResult.issues.length }})
                  </div>
                  <q-list dense dark class="bg-slate-900 rounded-borders">
                    <q-item
                      v-for="(issue, i) in reviewResult.issues"
                      :key="i"
                      dense
                    >
                      <q-item-section avatar>
                        <q-icon
                          :name="
                            issue.severity === 'error'
                              ? 'error'
                              : issue.severity === 'warning'
                                ? 'warning'
                                : 'info'
                          "
                          :color="
                            issue.severity === 'error'
                              ? 'negative'
                              : issue.severity === 'warning'
                                ? 'warning'
                                : 'info'
                          "
                          size="16px"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-caption">{{
                          issue.message
                        }}</q-item-label>
                        <q-item-label
                          v-if="issue.file"
                          caption
                          class="text-grey-6 text-mono"
                        >
                          {{ issue.file
                          }}<span v-if="issue.line">:{{ issue.line }}</span>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <!-- Suggestions -->
                <div v-if="reviewResult.suggestions?.length" class="q-mb-md">
                  <div
                    class="text-caption text-weight-medium text-grey-4 q-mb-xs"
                  >
                    <q-icon name="lightbulb" color="amber" /> Suggestions
                  </div>
                  <ul class="suggestion-list q-ma-none q-pl-md">
                    <li
                      v-for="(s, i) in reviewResult.suggestions"
                      :key="i"
                      class="text-caption text-grey-3 q-mb-xs"
                    >
                      {{ s }}
                    </li>
                  </ul>
                </div>

                <!-- Full raw feedback collapsible -->
                <q-expansion-item
                  dark
                  dense
                  icon="article"
                  label="Full Review Details"
                  class="bg-slate-900 rounded-borders q-mt-sm"
                  header-class="text-caption text-grey-4"
                >
                  <q-card dark class="bg-slate-900">
                    <q-card-section>
                      <pre class="review-pre text-grey-3">{{
                        reviewResult.rawFeedback
                      }}</pre>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>

                <!-- Merge result banner -->
                <q-banner
                  v-if="mergeResult"
                  :class="mergeResult.success ? 'bg-positive' : 'bg-negative'"
                  text-color="white"
                  rounded
                  class="q-mt-md"
                >
                  <template #avatar>
                    <q-icon
                      :name="mergeResult.success ? 'check_circle' : 'error'"
                    />
                  </template>
                  {{ mergeResult.message }}
                </q-banner>

                <!-- Reject result banner -->
                <q-banner
                  v-if="rejectResult"
                  :class="
                    rejectResult.success ? 'bg-deep-orange-9' : 'bg-negative'
                  "
                  text-color="white"
                  rounded
                  class="q-mt-md"
                >
                  <template #avatar>
                    <q-icon
                      :name="
                        rejectResult.success ? 'do_not_disturb_on' : 'error'
                      "
                    />
                  </template>
                  {{ rejectResult.message }}
                </q-banner>
              </div>
            </q-card-section>
          </template>
        </q-card>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- Merge Confirmation Dialog                                 -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showMergeDialog" persistent>
      <q-card class="bg-slate-800 text-white" style="min-width: 380px">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar icon="merge" color="positive" text-color="white" />
          <span class="q-ml-sm text-h6">Confirm Merge</span>
        </q-card-section>

        <q-card-section class="text-grey-3">
          You are about to merge PR <strong>#{{ selectedPr?.number }}</strong>
          <em>{{ selectedPr?.title }}</em> into
          <strong>{{ selectedPr?.base }}</strong
          >. <br /><br />
          This action cannot be undone. Proceed?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-5" v-close-popup no-caps />
          <q-btn
            unelevated
            color="positive"
            icon="merge"
            label="Merge Pull Request"
            no-caps
            :loading="merging"
            @click="reviewPr('merge')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- Reject Confirmation Dialog                                -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showRejectDialog" persistent>
      <q-card
        class="bg-slate-800 text-white"
        style="min-width: 420px; max-width: 520px"
      >
        <q-card-section class="row items-center q-pb-none">
          <q-avatar
            icon="do_not_disturb_on"
            color="negative"
            text-color="white"
          />
          <span class="q-ml-sm text-h6">Reject Pull Request</span>
        </q-card-section>

        <q-card-section class="text-grey-3">
          You are about to
          <strong class="text-negative">reject and close</strong> PR
          <strong>#{{ selectedPr?.number }}</strong>
          <em>{{ selectedPr?.title }}</em> on branch
          <strong>{{ selectedPr?.head }}</strong
          >. <br /><br />
          A rejection comment will be posted to the PR before it is closed.
        </q-card-section>

        <!-- Rejection Reason -->
        <q-card-section class="q-pt-none">
          <q-input
            dark
            outlined
            dense
            autogrow
            v-model="rejectReason"
            type="textarea"
            label="Rejection Reason *"
            placeholder="e.g. Code quality issues found in the diff — see AI review comments above."
            hint="This message will be posted as a comment on the PR."
            :rules="[val => !!val?.trim() || 'A rejection reason is required']"
            counter
            maxlength="500"
            ref="rejectReasonRef"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none q-px-md q-pb-md">
          <q-btn
            flat
            label="Cancel"
            color="grey-5"
            v-close-popup
            no-caps
            :disable="rejecting"
          />
          <q-btn
            unelevated
            color="negative"
            icon="do_not_disturb_on"
            label="Confirm Reject"
            no-caps
            :loading="rejecting"
            @click="rejectPr"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify, copyToClipboard } from 'quasar'
import { api } from '@/boot/axios'

// ─── UI state ──────────────────────────────────────────────────────────────
const isconnected = ref(false)
const loadingConfig = ref(false) // true while fetching saved config on mount
const testing = ref(false)
const saving = ref(false)
const loadingPrs = ref(false)
const reviewingPr = ref(false)
const merging = ref(false)
const rejecting = ref(false)
const showToken = ref(false)
const showGeminiKey = ref(false)
const showMergeDialog = ref(false)
const showRejectDialog = ref(false)

// ─── Config ────────────────────────────────────────────────────────────────
const configFormRef = ref(null)
const rejectReasonRef = ref(null)
const webhookUrl = ref('https://api.wdpcare.com/api/v1/users/git/webhook')

// userId read from localStorage (set during login)
const userId =
  localStorage.getItem('userId') ||
  localStorage.getItem('user_id') ||
  'user_123'

const config = ref({
  userId,
  provider: 'github',
  authType: 'pat',
  hostUrl: 'https://github.com',
  token: '', // pre-filled from DB on mount
  geminiApiKey: '', // pre-filled from DB on mount
  repository: '', // pre-filled from DB on mount (blank if new)
  defaultBranch: 'main',
  autoDeploy: true,
  syncLogs: true,
  autoReview: false,
  isSelfHosted: false
})

// ─── Pull Request state ────────────────────────────────────────────────────
const pullRequests = ref([])
const selectedPr = ref(null)
const reviewResult = ref(null)
const mergeResult = ref(null)
const rejectResult = ref(null)
const rejectReason = ref('')

/** A review must have been run and the PR must still be open before allowing merge */
const canMerge = computed(
  () =>
    !!reviewResult.value &&
    !['merged', 'closed', 'rejected'].includes(selectedPr.value?.status)
)

// ─── Helpers ───────────────────────────────────────────────────────────────
const prStatusColor = status => {
  const map = {
    open: 'positive',
    merged: 'purple-7',
    closed: 'negative',
    rejected: 'deep-orange-7',
    draft: 'grey-6'
  }
  return map[status] ?? 'grey-6'
}

const formatDate = iso => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const selectPr = pr => {
  if (selectedPr.value?.number === pr.number) return
  selectedPr.value = pr
  reviewResult.value = null
  mergeResult.value = null
  rejectResult.value = null
  rejectReason.value = ''
}

const clearReview = () => {
  selectedPr.value = null
  reviewResult.value = null
  mergeResult.value = null
  rejectResult.value = null
  rejectReason.value = ''
}

// ─── 5b. Reject Confirmation ──────────────────────────────────────────────
/**
 * Opens the reject dialog. No pre-conditions needed —
 * a reviewer can reject without first running AI review.
 */
const confirmReject = () => {
  if (!selectedPr.value) return
  rejectReason.value = ''
  rejectResult.value = null
  showRejectDialog.value = true
}

// ─── 5c. Reject PR ────────────────────────────────────────────────────────
/**
 * Validates the rejection reason, then calls POST /users/git/reject-pr.
 * The backend is expected to:
 *   1. Post the rejection reason as a comment on the PR.
 *   2. Close the PR without merging.
 * Falls back to just closing if comment posting fails.
 */
const rejectPr = async () => {
  // Validate textarea inside dialog
  const valid = await rejectReasonRef.value?.validate()
  if (valid === false) return

  showRejectDialog.value = false
  rejecting.value = true
  rejectResult.value = null

  try {
    const { data } = await api.post('/users/git/reject-pr', {
      userId: config.value.userId,
      gitToken: config.value.token,
      repoPath: config.value.repository?.trim(),
      pullNumber: selectedPr.value.number,
      rejectReason: rejectReason.value.trim()
    })

    if (data.success) {
      rejectResult.value = {
        success: true,
        message:
          data.message ||
          `PR #${selectedPr.value.number} has been rejected and closed.`
      }
      // Update status locally
      const idx = pullRequests.value.findIndex(
        p => p.number === selectedPr.value.number
      )
      if (idx !== -1) {
        pullRequests.value[idx].status = 'rejected'
        selectedPr.value = { ...selectedPr.value, status: 'rejected' }
      }
      Notify.create({
        type: 'warning',
        icon: 'do_not_disturb_on',
        message: `PR #${selectedPr.value.number} rejected and closed.`,
        position: 'top'
      })
    } else {
      rejectResult.value = {
        success: false,
        message: data.error || 'Failed to reject the pull request.'
      }
      Notify.create({
        type: 'negative',
        message: data.error || 'Reject operation failed.',
        position: 'top'
      })
    }
  } catch (error) {
    const msg =
      error.response?.data?.message || error.message || 'Reject failed'
    rejectResult.value = { success: false, message: msg }
    Notify.create({ type: 'negative', message: msg, position: 'top' })
  } finally {
    rejecting.value = false
  }
}

// ─── 0. Load Saved Configuration from DB (on mount) ───────────────────────
/**
 * Fetches the user's saved git token, gemini key, and repo from the backend.
 * If a record exists, pre-fills the form fields.
 * If no record exists (new user), leaves fields blank.
 */
// ─── 0. Load Saved Configuration from DB (on mount) ───────────────────────
const loadSavedConfig = async () => {
  try {
    loadingConfig.value = true
    const { data } = await api.get('/users/git/config')

    // Handle both wrapped response ({ success: true, config: {} }) and raw entity response
    const saved = data?.config || data

    if (
      saved &&
      (saved.repoPath || saved.gitToken || saved.encryptedGitToken)
    ) {
      // Map API values into Vue form model
      if (saved.gitToken) {
        config.value.token = saved.gitToken
      }
      if (saved.geminiApiKey) {
        config.value.geminiApiKey = saved.geminiApiKey
      }
      if (saved.repoPath) {
        config.value.repository = saved.repoPath
      }
      if (saved.userId) {
        config.value.userId = String(saved.userId)
      }

      // Mark connected if core values exist
      if (config.value.token && config.value.repository) {
        isconnected.value = true
        await fetchPullRequests()
      }
    }
  } catch (err) {
    if (err.response?.status !== 404) {
      console.warn('Could not load saved git config:', err.message)
    }
  } finally {
    loadingConfig.value = false
  }
}
// ─── 1. Save Configuration ─────────────────────────────────────────────────
const saveConfiguration = async () => {
  const valid = await configFormRef.value?.validate()
  if (valid === false) return

  try {
    saving.value = true

    const payload = {
      userId: config.value.userId,
      repoPath: config.value.repository?.trim(),
      gitToken: config.value.token,
      geminiApiKey: config.value.geminiApiKey,
      provider: config.value.provider,
      defaultBranch: config.value.defaultBranch
    }

    const response = await api.post('/users/git/save-config', payload)

    if (response.data?.success) {
      isconnected.value = true
      Notify.create({
        type: 'positive',
        message:
          response.data.message || 'Configuration & Keys saved successfully!',
        position: 'top'
      })
      // Auto-load PRs after saving
      await fetchPullRequests()
    }
  } catch (error) {
    isconnected.value = false
    Notify.create({
      type: 'negative',
      message: error.response?.data?.error || 'Failed to save configuration.',
      position: 'top'
    })
  } finally {
    saving.value = false
  }
}

// ─── 2. Test Connection ────────────────────────────────────────────────────
const testConnection = async () => {
  if (!config.value.token) {
    Notify.create({
      type: 'warning',
      message: 'Enter a token first.',
      position: 'top'
    })
    return
  }
  if (!config.value.repository?.trim()) {
    Notify.create({
      type: 'warning',
      message: 'Enter a repository path first.',
      position: 'top'
    })
    return
  }
  try {
    testing.value = true
    const response = await api.post('/users/git/save-config', {
      userId: config.value.userId,
      repoPath: config.value.repository?.trim(),
      gitToken: config.value.token,
      geminiApiKey: config.value.geminiApiKey,
      provider: config.value.provider,
      defaultBranch: config.value.defaultBranch
    })

    if (response.data?.success) {
      isconnected.value = true
      Notify.create({
        type: 'positive',
        message: 'Connection verified!',
        position: 'top'
      })
      await fetchPullRequests()
    }
  } catch (error) {
    isconnected.value = false
    Notify.create({
      type: 'negative',
      message: error.response?.data?.error || 'Connection test failed.',
      position: 'top'
    })
  } finally {
    testing.value = false
  }
}

// ─── 3. Fetch Open Pull Requests ───────────────────────────────────────────
const fetchPullRequests = async () => {
  if (!isconnected.value && !config.value.token) {
    Notify.create({
      type: 'warning',
      message: 'Save your configuration first.',
      position: 'top'
    })
    return
  }

  try {
    loadingPrs.value = true

    const { data } = await api.post('/users/git/pull-requests', {
      userId: config.value.userId,
      gitToken: config.value.token,
      repoPath: config.value.repository?.trim()
    })

    if (data.success) {
      pullRequests.value = data.pullRequests ?? []
      if (pullRequests.value.length === 0) {
        Notify.create({
          type: 'info',
          message: 'No open PRs found.',
          position: 'top'
        })
      } else {
        Notify.create({
          type: 'positive',
          message: `${pullRequests.value.length} Pull Request(s) loaded.`,
          position: 'top'
        })
      }
    } else {
      Notify.create({
        type: 'negative',
        message: data.error || 'Failed to fetch Pull Requests.',
        position: 'top'
      })
    }
  } catch (error) {
    Notify.create({
      type: 'negative',
      message:
        error.response?.data?.message || error.message || 'Failed to load PRs.',
      position: 'top'
    })
  } finally {
    loadingPrs.value = false
  }
}

// ─── 4. AI Code Review (and optional Merge) ────────────────────────────────
const reviewPr = async action => {
  if (!selectedPr.value) return

  showMergeDialog.value = false // close dialog if open

  const isMerge = action === 'merge'
  if (isMerge) {
    merging.value = true
  } else {
    reviewingPr.value = true
  }

  reviewResult.value = null
  mergeResult.value = null

  try {
    const { data } = await api.post('/users/git/review-and-merge', {
      userId: config.value.userId,
      gitToken: config.value.token,
      geminiKey: config.value.geminiApiKey,
      repoPath: config.value.repository?.trim(),
      pullNumber: selectedPr.value.number,
      action
    })

    if (data.success) {
      reviewResult.value = parseReview(data.reviewFeedback ?? data.review)

      if (isMerge) {
        mergeResult.value = {
          success: true,
          message:
            data.mergeMessage ||
            `PR #${selectedPr.value.number} merged successfully into ${selectedPr.value.base}!`
        }
        const idx = pullRequests.value.findIndex(
          p => p.number === selectedPr.value.number
        )
        if (idx !== -1) {
          pullRequests.value[idx].status = 'merged'
          selectedPr.value = { ...selectedPr.value, status: 'merged' }
        }
        Notify.create({
          type: 'positive',
          message: 'Pull Request merged!',
          position: 'top'
        })
      } else {
        Notify.create({
          type: 'positive',
          message: 'AI review complete!',
          position: 'top'
        })
      }
    } else {
      const msg = data.error || 'Operation failed'
      if (isMerge) {
        mergeResult.value = { success: false, message: msg }
      } else {
        Notify.create({ type: 'negative', message: msg, position: 'top' })
      }
    }
  } catch (error) {
    const msg =
      error.response?.data?.message || error.message || 'Processing failed'
    if (isMerge) {
      mergeResult.value = { success: false, message: msg }
    } else {
      Notify.create({ type: 'negative', message: msg, position: 'top' })
    }
  } finally {
    reviewingPr.value = false
    merging.value = false
  }
}

/**
 * Parse the backend review response into a structured object.
 * Backend may return a plain string or a JSON object.
 */
const parseReview = raw => {
  if (!raw) return null

  if (typeof raw === 'object') {
    return {
      approved: raw.approved ?? (raw.score != null ? raw.score >= 7 : false),
      score: raw.score ?? null,
      issues: raw.issues ?? [],
      suggestions: raw.suggestions ?? [],
      rawFeedback:
        raw.rawFeedback ?? raw.feedback ?? JSON.stringify(raw, null, 2)
    }
  }

  const text = String(raw)
  const approved = /looks? good|approve|LGTM/i.test(text)
  return {
    approved,
    score: null,
    issues: [],
    suggestions: [],
    rawFeedback: text
  }
}

// ─── 5. Merge Confirmation ────────────────────────────────────────────────
const confirmMerge = () => {
  if (!canMerge.value) {
    Notify.create({
      type: 'warning',
      message: 'Please run an AI Review before merging.',
      position: 'top'
    })
    return
  }
  showMergeDialog.value = true
}

// ─── 6. OAuth placeholder ────────────────────────────────────────────────
const triggerOAuth = () => {
  Notify.create({
    type: 'info',
    message: `Redirecting to ${config.value.provider.toUpperCase()} authorization…`,
    position: 'top'
  })
}

// ─── 7. Copy Webhook URL ──────────────────────────────────────────────────
const copyWebhook = () => {
  copyToClipboard(webhookUrl.value)
    .then(() =>
      Notify.create({
        type: 'positive',
        message: 'Webhook URL copied to clipboard',
        position: 'top'
      })
    )
    .catch(() =>
      Notify.create({
        type: 'negative',
        message: 'Failed to copy',
        position: 'top'
      })
    )
}

// ─── Lifecycle ───────────────────────────────────────────────────────────
onMounted(() => {
  loadSavedConfig()
})
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
.full-height-card {
  height: 100%;
}
.text-mono {
  font-family: 'Courier New', Courier, monospace;
}
.review-pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}
.suggestion-list li {
  list-style: disc;
  line-height: 1.7;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}
</style>
