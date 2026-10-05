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
              @update:model-value="onProviderChange"
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
                  :label="`${providerName} Access Token *`"
                  hint="Requires access to the selected repository and Git operations below."
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

              <q-banner dense rounded class="bg-slate-900 text-grey-3">
                <template #avatar>
                  <q-icon name="lock" color="amber" />
                </template>
                <div class="text-weight-medium text-white q-mb-xs">
                  Required provider access
                </div>
                {{ providerAccessGuidance }}
                <div class="text-caption text-grey-5 q-mt-xs">
                  Access is also subject to the token owner's permissions and
                  the target account, organization, or workspace policy.
                </div>
              </q-banner>

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
                    :options="filteredRepositories"
                    label="Select Repository *"
                    hint="Choose a repository from the connected provider or enter its path."
                    use-input
                    fill-input
                    hide-selected
                    input-debounce="0"
                    :loading="loadingRepositories"
                    :rules="[
                      val => !!val || 'Repository path is required',
                      val =>
                        /^[^/]+\/.+$/.test(val?.trim()) ||
                        'Use the namespace/repository format'
                    ]"
                    clearable
                    @filter="filterRepositories"
                    @new-value="addRepositoryOption"
                  >
                    <template #prepend>
                      <q-icon name="source" color="grey-5" />
                    </template>
                    <template #append>
                      <q-btn
                        flat
                        round
                        dense
                        icon="refresh"
                        aria-label="Refresh repositories"
                        :loading="loadingRepositories"
                        @click.stop="loadRepositories(true)"
                      >
                        <q-tooltip>Refresh repositories</q-tooltip>
                      </q-btn>
                    </template>
                  </q-select>
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
        <div class="row items-center justify-between q-mt-lg q-mb-sm">
          <div>
            <div class="text-h6 text-weight-bold">Pull Request Review</div>
            <div class="text-caption text-grey-4">
              Review changes, run an AI check, and merge when ready.
            </div>
          </div>
          <q-chip
            color="blue-grey-9"
            text-color="grey-3"
            icon="merge_type"
            :label="`${pullRequests.length} open`"
          />
        </div>
        <div class="row q-col-gutter-lg q-mb-lg">
          <!-- ── Pull Requests List ── -->
          <div class="col-12 col-lg-5">
            <q-card
              class="bg-slate-800 text-white border-glass rounded-card full-height-card pr-workspace-card"
            >
              <q-card-section class="row items-center justify-between q-pb-sm">
                <div>
                  <div class="text-h6 text-weight-bold">Open Pull Requests</div>
                  <div class="text-caption text-grey-5">
                    {{ pullRequests.length }} awaiting review
                  </div>
                </div>
                <q-btn
                  flat
                  round
                  dense
                  color="white"
                  icon="refresh"
                  :loading="loadingPrs"
                  @click="fetchPullRequests"
                >
                  <q-tooltip class="bg-slate-900 text-white"
                    >Refresh PRs</q-tooltip
                  >
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
                <q-icon
                  name="check_circle_outline"
                  size="48px"
                  color="positive"
                />
                <p class="text-grey-5 q-mt-sm">No open pull requests found.</p>
              </q-card-section>

              <!-- PR List -->
              <q-list v-else dark separator class="pr-list-scroll">
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
              class="bg-slate-800 text-white border-glass rounded-card full-height-card pr-workspace-card"
            >
              <!-- No PR selected placeholder -->
              <template v-if="!selectedPr">
                <q-card-section class="pr-empty-state">
                  <q-avatar
                    size="56px"
                    color="blue-grey-9"
                    text-color="blue-3"
                    icon="rate_review"
                  />
                  <div class="text-subtitle1 text-weight-medium q-mt-md">
                    Select a pull request
                  </div>
                  <div class="text-caption text-grey-5 q-mt-xs">
                    Choose one from the list to inspect its changes, run an AI
                    review, or merge it.
                  </div>
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
                      >Changed Files ({{
                        selectedPr.changedFiles.length
                      }})</span
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
                    <q-btn
                      outline
                      color="blue-3"
                      icon="code"
                      label="View Merge Code"
                      no-caps
                      :loading="loadingPullRequestDiff"
                      @click="loadPullRequestDiff"
                    />

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
                        ['merged', 'closed', 'rejected'].includes(
                          selectedPr.status
                        )
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
                        ['merged', 'closed', 'rejected'].includes(
                          selectedPr.status
                        )
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
                        ['merged', 'closed', 'rejected'].includes(
                          selectedPr.status
                        )
                      "
                      @click="confirmReject"
                    >
                      <q-tooltip class="bg-slate-900 text-white">
                        Close this PR without merging and leave a rejection
                        comment.
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

                  <div
                    v-if="selectedPr.status === 'merged'"
                    class="row items-center justify-between bg-slate-900 q-pa-sm q-mt-md rounded-borders"
                  >
                    <div class="text-caption text-grey-4">
                      This pull request is merged. Rollback creates a new
                      commit; it does not erase history.
                    </div>
                    <q-btn
                      outline
                      color="negative"
                      icon="history"
                      label="Apply Rollback"
                      no-caps
                      :loading="revertingPullRequest"
                      @click="confirmRevertPullRequest"
                    />
                  </div>

                  <!-- Already-closed status notice -->
                  <div
                    v-if="
                      ['merged', 'closed', 'rejected'].includes(
                        selectedPr.status
                      )
                    "
                    class="row items-center q-gutter-x-xs q-mt-sm"
                  >
                    <q-icon
                      :name="
                        selectedPr.status === 'merged'
                          ? 'check_circle'
                          : 'cancel'
                      "
                      :color="
                        selectedPr.status === 'merged' ? 'positive' : 'negative'
                      "
                      size="16px"
                    />
                    <span class="text-caption text-grey-4 text-capitalize">
                      This PR is already
                      <strong>{{ selectedPr.status }}</strong> — no further
                      actions available.
                    </span>
                  </div>
                </q-card-section>

                <q-separator dark />

                <!-- AI Review Output -->
                <q-card-section>
                  <!-- Loading state -->
                  <div v-if="reviewingPr" class="text-center q-py-lg">
                    <q-spinner-dots color="indigo-4" size="40px" />
                    <p class="text-grey-5 q-mt-sm"
                      >Gemini is analysing the diff…</p
                    >
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
                        <q-icon
                          name="auto_awesome"
                          color="amber"
                          class="q-mr-xs"
                        />
                        Gemini AI Review
                      </div>
                      <q-chip
                        dense
                        :color="reviewResult.approved ? 'positive' : 'warning'"
                        :icon="
                          reviewResult.approved ? 'check_circle' : 'warning'
                        "
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
                        <q-icon name="bug_report" color="negative" /> Issues
                        Found ({{ reviewResult.issues.length }})
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
                    <div
                      v-if="reviewResult.suggestions?.length"
                      class="q-mb-md"
                    >
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
                      :class="
                        mergeResult.success ? 'bg-positive' : 'bg-negative'
                      "
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
                        rejectResult.success
                          ? 'bg-deep-orange-9'
                          : 'bg-negative'
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

        <div class="row q-col-gutter-lg q-mt-md q-mb-lg">
          <div class="col-12">
            <q-card class="bg-slate-800 text-white border-glass rounded-card">
              <q-card-section class="row items-center justify-between q-pb-sm">
                <div>
                  <div class="text-h6 text-weight-bold">Repositories</div>
                  <div class="text-caption text-grey-4">
                    {{ repositoryItems.length }} available from
                    {{ providerName }}
                  </div>
                </div>
                <q-btn
                  flat
                  round
                  dense
                  icon="refresh"
                  aria-label="Refresh repositories"
                  :loading="loadingRepositories"
                  :disable="!config.token"
                  @click="loadRepositories(true)"
                >
                  <q-tooltip>Refresh repositories</q-tooltip>
                </q-btn>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-input
                  v-model="repositorySearch"
                  dark
                  outlined
                  dense
                  clearable
                  placeholder="Search repositories"
                  aria-label="Search repositories"
                  class="q-mb-sm"
                >
                  <template #prepend><q-icon name="search" /></template>
                </q-input>

                <div class="repository-list-scroll">
                  <q-list v-if="visibleRepositories.length" dark separator>
                    <q-item
                      v-for="repository in visibleRepositories"
                      :key="repository.path"
                      clickable
                      :active="config.repository === repository.path"
                      active-class="bg-slate-900"
                      @click="openRepository(repository)"
                    >
                      <q-item-section avatar>
                        <q-icon name="source" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">
                          {{ repository.name }}
                        </q-item-label>
                        <q-item-label caption class="text-grey-4">
                          {{ repository.path }}
                          <span v-if="repository.defaultBranch">
                            · Default branch: {{ repository.defaultBranch }}
                          </span>
                          <span v-if="repository.updatedAt">
                            · Updated {{ formatDateTime(repository.updatedAt) }}
                          </span>
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="row items-center q-gutter-sm">
                          <q-badge
                            v-if="repository.visibility"
                            :color="
                              repository.visibility === 'private'
                                ? 'amber-9'
                                : 'positive'
                            "
                            :label="repository.visibility"
                          />
                          <q-btn
                            flat
                            round
                            dense
                            :color="
                              config.repository === repository.path
                                ? 'positive'
                                : 'grey-4'
                            "
                            :icon="
                              config.repository === repository.path
                                ? 'check_circle'
                                : 'radio_button_unchecked'
                            "
                            :aria-label="`Select ${repository.path}`"
                            @click.stop="selectRepository(repository.path)"
                          >
                            <q-tooltip>
                              {{
                                config.repository === repository.path
                                  ? 'Selected'
                                  : 'Select repository'
                              }}
                            </q-tooltip>
                          </q-btn>
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div
                    v-else-if="loadingRepositories"
                    class="q-gutter-sm q-pa-md"
                  >
                    <q-skeleton dark type="text" />
                    <q-skeleton dark type="text" />
                    <q-skeleton dark type="text" />
                  </div>
                  <div v-else class="text-center text-grey-4 q-pa-lg">
                    <q-icon name="source" size="28px" class="q-mb-sm" />
                    <div>
                      {{
                        config.token
                          ? 'No repositories match this search.'
                          : 'Connect a provider token to load repositories.'
                      }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
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

        <!-- Branch Creation -->
        <q-card
          class="bg-slate-800 text-white border-glass rounded-card q-mb-md"
        >
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-xs">Create Branch</div>
            <p class="text-caption text-grey-4">
              Create a branch from the selected repository.
            </p>
            <q-form
              ref="createBranchFormRef"
              class="q-gutter-y-sm"
              @submit.prevent="createBranch"
            >
              <q-select
                v-model="config.repository"
                :options="branchRepositoryOptions"
                dark
                outlined
                dense
                emit-value
                map-options
                option-label="label"
                option-value="value"
                label="Repository *"
                :rules="[val => !!val || 'Select a repository']"
                @update:model-value="selectRepository"
              >
                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey-5">
                      No repositories loaded
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-input
                v-model="newBranch.name"
                dark
                outlined
                dense
                label="New branch name *"
                placeholder="feature/my-change"
                :rules="[
                  val => !!val?.trim() || 'Branch name is required',
                  val =>
                    !/\s|\.\.|~|\^|:|\?|\*|\[|\\/.test(val?.trim()) ||
                    'Branch name contains unsupported characters'
                ]"
              />
              <q-input
                v-model="newBranch.sourceBranch"
                dark
                outlined
                dense
                label="Create from branch *"
                :rules="[val => !!val?.trim() || 'Source branch is required']"
              />
              <div class="row justify-end q-pt-sm">
                <q-btn
                  color="primary"
                  icon="account_tree"
                  label="Create Branch"
                  type="submit"
                  unelevated
                  no-caps
                  :loading="creatingBranch"
                  :disable="!config.token || !config.repository"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Repository Creation -->
        <q-card
          class="bg-slate-800 text-white border-glass rounded-card q-mb-md"
        >
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-xs">
              Create Repository
            </div>
            <p class="text-caption text-grey-4">
              Create a repository in an account or namespace you can manage.
            </p>

            <q-form
              ref="createRepositoryFormRef"
              class="q-gutter-y-sm"
              @submit.prevent="createRepository"
            >
              <q-input
                v-model="newRepository.namespace"
                dark
                outlined
                dense
                :label="`${repositoryNamespaceLabel} *`"
                :hint="`For example: ${config.provider === 'bitbucket' ? 'my-workspace' : 'my-account or my-group/subgroup'}`"
                :rules="[
                  val => !!val?.trim() || 'Account or namespace is required',
                  val =>
                    /^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/.test(
                      val?.trim()
                    ) || 'Enter a valid account or namespace path'
                ]"
              />
              <q-input
                v-model="newRepository.name"
                dark
                outlined
                dense
                label="Repository name *"
                :rules="[
                  val => !!val?.trim() || 'Repository name is required',
                  val =>
                    /^[A-Za-z0-9._-]+$/.test(val?.trim()) ||
                    'Use letters, numbers, dots, underscores, or hyphens'
                ]"
              />
              <q-input
                v-model="newRepository.description"
                dark
                outlined
                dense
                type="textarea"
                autogrow
                label="Description"
              />
              <q-select
                v-model="newRepository.visibility"
                :options="repositoryVisibilityOptions"
                dark
                outlined
                dense
                emit-value
                map-options
                label="Visibility"
              />
              <q-toggle
                v-model="newRepository.initializeReadme"
                dark
                color="positive"
                label="Initialize with a README"
              />
              <div class="row justify-end q-pt-sm">
                <q-btn
                  color="primary"
                  icon="create_new_folder"
                  label="Create Repository"
                  type="submit"
                  unelevated
                  no-caps
                  :loading="creatingRepository"
                  :disable="!config.token"
                />
              </div>
              <div v-if="!config.token" class="text-caption text-amber">
                Connect with a token that has repository-creation access first.
              </div>
            </q-form>
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
    <q-dialog v-model="showRepositoryBrowser" maximized>
      <q-card class="bg-slate-900 text-white">
        <q-card-section class="row items-center justify-between q-pb-sm">
          <div>
            <div class="text-h6 text-weight-bold">
              {{ selectedRepository?.name || 'Repository files' }}
            </div>
            <div class="text-caption text-grey-4">
              {{ selectedRepository?.path }}
              <span v-if="selectedRepository?.updatedAt">
                · Updated {{ formatDateTime(selectedRepository.updatedAt) }}
              </span>
            </div>
          </div>
          <div class="row items-center q-gutter-sm">
            <q-btn
              color="primary"
              unelevated
              no-caps
              icon="note_add"
              label="New File"
              :disable="!config.token"
              @click="startNewRepositoryFile"
            />
            <q-btn
              flat
              round
              dense
              icon="refresh"
              aria-label="Refresh file list"
              :loading="loadingRepositoryTree"
              @click="loadRepositoryTree(repositoryTreePath)"
            >
              <q-tooltip>Refresh files</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="close"
              aria-label="Close repository files"
              v-close-popup
            />
          </div>
        </q-card-section>
        <q-separator dark />
        <q-card-section class="row items-center justify-between q-py-sm">
          <q-breadcrumbs class="text-grey-3">
            <q-breadcrumbs-el
              label="Repository"
              icon="source"
              class="cursor-pointer"
              @click="loadRepositoryTree('')"
            />
            <q-breadcrumbs-el
              v-for="(segment, index) in repositoryTreeSegments"
              :key="segment.path"
              :label="segment.name"
              class="cursor-pointer"
              @click="loadRepositoryTree(segment.path)"
            />
          </q-breadcrumbs>
          <q-btn
            v-if="repositoryTreePath"
            flat
            dense
            no-caps
            icon="arrow_upward"
            label="Up one level"
            @click="loadRepositoryTree(repositoryParentPath)"
          />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-list dark separator class="rounded-borders">
            <q-item
              v-for="entry in repositoryTreeEntries"
              :key="entry.path"
              clickable
              @click="openRepositoryTreeEntry(entry)"
            >
              <q-item-section avatar>
                <q-icon
                  :name="entry.type === 'tree' ? 'folder' : 'description'"
                  :color="entry.type === 'tree' ? 'amber' : 'grey-4'"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ entry.name }}</q-item-label>
                <q-item-label caption class="text-grey-5">
                  {{ entry.path }}
                </q-item-label>
              </q-item-section>
              <q-item-section side class="text-caption text-grey-5">
                {{ entry.size ? formatFileSize(entry.size) : '' }}
              </q-item-section>
            </q-item>
            <q-item v-if="loadingRepositoryTree">
              <q-item-section avatar
                ><q-spinner color="primary"
              /></q-item-section>
              <q-item-section>Loading repository files...</q-item-section>
            </q-item>
            <q-item
              v-else-if="!repositoryTreeEntries.length"
              class="text-grey-4"
            >
              <q-item-section>
                This folder is empty or the file list is unavailable.
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showRepositoryFileEditor" maximized>
      <q-card class="bg-slate-900 text-white column no-wrap">
        <q-card-section class="row items-center justify-between q-pb-sm">
          <div class="ellipsis">
            <div class="text-subtitle1 text-weight-bold ellipsis">
              {{ repositoryFile.isNew ? 'New Vue page' : repositoryFile.path }}
            </div>
            <div class="text-caption text-grey-5">
              {{ selectedRepository?.path }} · {{ repositoryFile.branch }}
              <q-badge
                v-if="isRepositoryFileDirty"
                color="amber-9"
                label="Unsaved changes"
                class="q-ml-sm"
              />
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            aria-label="Close source editor"
            :disable="loadingRepositoryFile || committingRepositoryFile"
            @click="closeRepositoryFileEditor"
          />
        </q-card-section>
        <q-separator dark />
        <q-card-section class="col column no-wrap q-gutter-y-sm">
          <q-input
            v-if="repositoryFile.isNew"
            v-model="repositoryFile.path"
            dark
            outlined
            dense
            label="File path *"
            placeholder="src/pages/NewPage.vue or src/Main.java"
            :rules="[
              val => !!val?.trim() || 'File path is required',
              val =>
                isValidRepositoryFilePath(val) ||
                'Use a repository-relative file path without ..'
            ]"
            :disable="committingRepositoryFile"
          />
          <q-input
            v-model="repositoryCommitMessage"
            dark
            outlined
            dense
            label="Commit message *"
            placeholder="Describe the change"
            :disable="loadingRepositoryFile || committingRepositoryFile"
          />
          <div v-if="loadingRepositoryFile" class="column items-center q-pa-xl">
            <q-spinner-dots color="primary" size="40px" />
            <div class="text-caption text-grey-5 q-mt-sm">
              Loading file from repository...
            </div>
          </div>
          <CodeEditor
            v-else
            v-model="repositoryFile.content"
            :language="repositoryFile.path"
            :readonly="committingRepositoryFile"
            aria-label="Repository file editor"
            class="col"
          />
        </q-card-section>
        <q-separator dark />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            color="grey-4"
            icon="undo"
            label="Discard Changes"
            no-caps
            :disable="!isRepositoryFileDirty || committingRepositoryFile"
            @click="discardRepositoryFileChanges"
          />
          <q-btn
            outline
            color="blue-3"
            icon="auto_fix_high"
            label="Format Code"
            no-caps
            :loading="formattingRepositoryFile"
            :disable="
              loadingRepositoryFile ||
              committingRepositoryFile ||
              !repositoryFile.content
            "
            @click="formatRepositoryFile"
          />
          <q-btn
            unelevated
            color="positive"
            icon="publish"
            label="Commit & Push"
            no-caps
            :loading="committingRepositoryFile"
            :disable="
              !isRepositoryFileDirty ||
              !repositoryCommitMessage.trim() ||
              (repositoryFile.isNew &&
                !isValidRepositoryFilePath(repositoryFile.path)) ||
              loadingRepositoryFile
            "
            @click="commitAndPushRepositoryFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDiscardRepositoryFileDialog" persistent>
      <q-card class="bg-slate-800 text-white" style="width: min(440px, 92vw)">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar icon="warning" color="warning" text-color="dark" />
          <span class="q-ml-sm text-h6">Discard unsaved changes?</span>
        </q-card-section>
        <q-card-section class="text-grey-3">
          Changes to <strong>{{ repositoryFile.path }}</strong> have not been
          committed. Discard them and close the editor?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Keep Editing"
            color="grey-4"
            no-caps
            v-close-popup
          />
          <q-btn
            unelevated
            color="negative"
            icon="delete_outline"
            label="Discard & Close"
            no-caps
            @click="discardRepositoryFileChanges(true)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showPullRequestDiff" maximized>
      <q-card class="bg-slate-900 text-white column no-wrap">
        <q-card-section class="row items-center justify-between q-pb-sm">
          <div>
            <div class="text-h6 text-weight-bold">Merge Code</div>
            <div class="text-caption text-grey-4">
              PR #{{ selectedPr?.number }} · {{ selectedPr?.title }}
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            aria-label="Close merge code"
            v-close-popup
          />
        </q-card-section>
        <q-separator dark />
        <div class="row col no-wrap diff-browser">
          <q-list dark separator class="diff-file-list">
            <q-item
              v-for="file in pullRequestDiffFiles"
              :key="file.path"
              clickable
              :active="selectedDiffFile?.path === file.path"
              active-class="bg-blue-grey-9"
              @click="selectedDiffFile = file"
            >
              <q-item-section avatar>
                <q-icon name="description" color="grey-4" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption text-weight-medium">
                  {{ file.path }}
                </q-item-label>
                <q-item-label caption>
                  <span class="text-positive">+{{ file.additions }}</span>
                  <span class="q-ml-sm text-negative"
                    >-{{ file.deletions }}</span
                  >
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="loadingPullRequestDiff">
              <q-item-section avatar
                ><q-spinner color="primary"
              /></q-item-section>
              <q-item-section>Loading merge code...</q-item-section>
            </q-item>
            <q-item
              v-else-if="!pullRequestDiffFiles.length"
              class="text-grey-5"
            >
              <q-item-section>No diff files are available.</q-item-section>
            </q-item>
          </q-list>
          <q-scroll-area class="col diff-code-pane">
            <pre v-if="selectedDiffFile?.patch" class="diff-code">{{
              selectedDiffFile.patch
            }}</pre>
            <div v-else class="text-grey-5 text-center q-pa-xl">
              Select a changed file to view its diff.
            </div>
          </q-scroll-area>
        </div>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showRevertPullRequestDialog" persistent>
      <q-card class="bg-slate-800 text-white" style="width: min(460px, 92vw)">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar icon="history" color="negative" text-color="white" />
          <span class="q-ml-sm text-h6">Apply Rollback</span>
        </q-card-section>
        <q-card-section class="text-grey-3">
          Create a new revert commit for merged PR
          <strong>#{{ selectedPr?.number }}</strong>
          <em>{{ selectedPr?.title }}</em> in
          <strong>{{ config.repository }}</strong
          >?
          <div class="text-caption text-amber q-mt-md">
            This adds a new commit to the target branch. Existing history is
            preserved.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="grey-5"
            v-close-popup
            no-caps
            :disable="revertingPullRequest"
          />
          <q-btn
            unelevated
            color="negative"
            icon="history"
            label="Confirm Rollback"
            no-caps
            :loading="revertingPullRequest"
            @click="revertMergedPullRequest"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
import CodeEditor from '@/components/CodeEditor.vue'

// ─── UI state ──────────────────────────────────────────────────────────────
const isconnected = ref(false)
const loadingConfig = ref(false) // true while fetching saved config on mount
const testing = ref(false)
const saving = ref(false)
const creatingRepository = ref(false)
const loadingRepositories = ref(false)
const loadingRepositoryTree = ref(false)
const loadingRepositoryFile = ref(false)
const committingRepositoryFile = ref(false)
const formattingRepositoryFile = ref(false)
const creatingBranch = ref(false)
const loadingPrs = ref(false)
const loadingPullRequestDiff = ref(false)
const revertingPullRequest = ref(false)
const reviewingPr = ref(false)
const merging = ref(false)
const rejecting = ref(false)
const showToken = ref(false)
const showGeminiKey = ref(false)
const showMergeDialog = ref(false)
const showRejectDialog = ref(false)
const showRepositoryBrowser = ref(false)
const showRepositoryFileEditor = ref(false)
const showDiscardRepositoryFileDialog = ref(false)
const showPullRequestDiff = ref(false)
const showRevertPullRequestDialog = ref(false)

// ─── Config ────────────────────────────────────────────────────────────────
const configFormRef = ref(null)
const createRepositoryFormRef = ref(null)
const createBranchFormRef = ref(null)
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

const providerName = computed(() => {
  const names = { github: 'GitHub', gitlab: 'GitLab', bitbucket: 'Bitbucket' }
  return names[config.value.provider] ?? 'Git'
})

const repositoryNamespaceLabel = computed(() => {
  const labels = {
    github: 'Owner',
    gitlab: 'Namespace',
    bitbucket: 'Workspace'
  }
  return labels[config.value.provider] ?? 'Owner or namespace'
})

const repositoryVisibilityOptions = [
  { label: 'Private', value: 'private' },
  { label: 'Public', value: 'public' }
]

const newRepository = ref({
  namespace: '',
  name: '',
  description: '',
  visibility: 'private',
  initializeReadme: true
})

const repositoryOptions = ref([])
const filteredRepositories = ref([])
const repositoryItems = ref([])
const repositorySearch = ref('')
const selectedRepository = ref(null)
const repositoryTreePath = ref('')
const repositoryTreeEntries = ref([])
const repositoryFile = ref({
  path: '',
  content: '',
  originalContent: '',
  sha: '',
  branch: '',
  isNew: false
})
const repositoryCommitMessage = ref('')
const newBranch = ref({ name: '', sourceBranch: 'main' })

const isValidRepositoryFilePath = pathValue => {
  const path = pathValue?.trim().replaceAll('\\', '/') || ''
  const segments = path.split('/')
  return (
    !!segments.at(-1) &&
    !path.startsWith('/') &&
    !segments.includes('..') &&
    !segments.includes('')
  )
}

const isRepositoryFileDirty = computed(
  () => repositoryFile.value.content !== repositoryFile.value.originalContent
)

const branchRepositoryOptions = computed(() =>
  repositoryItems.value.map(repository => ({
    label: `${repository.path}${repository.visibility ? ` (${repository.visibility})` : ''}`,
    value: repository.path
  }))
)

const repositoryTreeSegments = computed(() => {
  const segments = repositoryTreePath.value.split('/').filter(Boolean)
  return segments.map((name, index) => ({
    name,
    path: segments.slice(0, index + 1).join('/')
  }))
})

const repositoryParentPath = computed(() =>
  repositoryTreePath.value.split('/').filter(Boolean).slice(0, -1).join('/')
)

const visibleRepositories = computed(() => {
  const search = repositorySearch.value.trim().toLowerCase()
  if (!search) return repositoryItems.value
  return repositoryItems.value.filter(repository =>
    `${repository.name} ${repository.path}`.toLowerCase().includes(search)
  )
})

const providerAccessGuidance = computed(() => {
  const guidance = {
    github:
      'Grant access to the target repository, pull requests (read/write), and webhooks if managed from this panel. Creating repositories also requires repository-creation access for the selected account or organization.',
    gitlab:
      'Grant the api scope for repository/project, merge-request, and webhook API operations. Creating a repository requires project-creation permission in the target namespace.',
    bitbucket:
      'Grant repository read/write, pull-request read/write, and webhook access. Creating a repository also requires create-repository access in the target workspace or project.'
  }
  return guidance[config.value.provider] ?? guidance.github
})

// ─── Pull Request state ────────────────────────────────────────────────────
const pullRequests = ref([])
const selectedPr = ref(null)
const pullRequestDiffFiles = ref([])
const selectedDiffFile = ref(null)
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

const formatDateTime = value => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = bytes => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

// ─── Rejection confirmation & submission ──────────────────────────────────
const confirmReject = () => {
  if (!selectedPr.value) return
  rejectReason.value = ''
  rejectResult.value = null
  showRejectDialog.value = true
}

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

// ─── 0. Load Saved Configuration ───────────────────────────────────────────
const loadSavedConfig = async () => {
  try {
    loadingConfig.value = true
    const { data } = await api.get('/users/git/config', {
      params: { userId: config.value.userId }
    })

    if (data?.success && data.config) {
      const saved = data.config
      if (saved.gitToken) config.value.token = saved.gitToken
      if (saved.geminiApiKey) config.value.geminiApiKey = saved.geminiApiKey
      if (saved.repoPath) config.value.repository = saved.repoPath
      if (saved.provider) config.value.provider = saved.provider
      config.value.hostUrl =
        saved.hostUrl ||
        {
          github: 'https://github.com',
          gitlab: 'https://gitlab.com',
          bitbucket: 'https://bitbucket.org'
        }[config.value.provider] ||
        config.value.hostUrl
      if (saved.defaultBranch) config.value.defaultBranch = saved.defaultBranch
      newBranch.value.sourceBranch = saved.defaultBranch || 'main'

      if (saved.gitToken && saved.repoPath) {
        isconnected.value = true
        await loadRepositories()
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
      await loadRepositories()
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
      await loadRepositories()
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

const onProviderChange = provider => {
  config.value.repository = ''
  config.value.hostUrl =
    {
      github: 'https://github.com',
      gitlab: 'https://gitlab.com',
      bitbucket: 'https://bitbucket.org'
    }[provider] || ''
  isconnected.value = false
  pullRequests.value = []
  clearReview()
  repositoryOptions.value = []
  filteredRepositories.value = []
  if (config.value.token) loadRepositories()
}

const filterRepositories = (searchText, update) => {
  const search = searchText.trim().toLowerCase()
  update(() => {
    filteredRepositories.value = search
      ? repositoryOptions.value.filter(repository =>
          repository.toLowerCase().includes(search)
        )
      : [...repositoryOptions.value]
  })
}

const addRepositoryOption = (value, done) => {
  const repository = value.trim()
  if (!repository) {
    done()
    return
  }
  if (!repositoryOptions.value.includes(repository)) {
    repositoryOptions.value.unshift(repository)
  }
  filteredRepositories.value = [...repositoryOptions.value]
  done(repository, 'add-unique')
}

const loadRepositories = async (notifyOnSuccess = false) => {
  if (!config.value.token) return

  try {
    loadingRepositories.value = true
    const { data } = await api.post('/users/git/repositories', {
      userId: config.value.userId,
      provider: config.value.provider,
      hostUrl: config.value.hostUrl,
      gitToken: config.value.token
    })
    if (data?.success === false) {
      throw new Error(data?.error || 'Failed to load repositories.')
    }

    const repositoryResponse = Array.isArray(data)
      ? data
      : (data?.repositories ??
        data?.repos ??
        data?.data?.repositories ??
        data?.data?.repos ??
        data?.data ??
        data?.content ??
        [])
    if (!Array.isArray(repositoryResponse)) {
      throw new Error(
        'The repository response did not contain a repository list.'
      )
    }

    const repositories = repositoryResponse
      .map(repository => {
        if (typeof repository === 'string') {
          const path = repository.trim()
          return {
            path,
            name: path.split('/').filter(Boolean).at(-1) || path,
            visibility: '',
            defaultBranch: '',
            updatedAt: ''
          }
        }
        const fullPath =
          repository.fullName ||
          repository.full_name ||
          repository.pathWithNamespace ||
          repository.path_with_namespace ||
          repository.path ||
          repository.slug
        const namespace =
          repository.owner?.login ||
          repository.owner?.username ||
          repository.workspace?.slug ||
          repository.namespace?.path ||
          repository.namespace?.name ||
          (typeof repository.namespace === 'string' ? repository.namespace : '')
        const path = (
          fullPath || [namespace, repository.name].filter(Boolean).join('/')
        )?.trim()
        if (!path) return null
        const isPrivate =
          repository.private ?? repository.is_private ?? repository.isPrivate
        return {
          path,
          name: repository.name || path.split('/').filter(Boolean).at(-1),
          visibility:
            repository.visibility?.toLowerCase?.() ||
            (typeof isPrivate === 'boolean'
              ? isPrivate
                ? 'private'
                : 'public'
              : ''),
          defaultBranch:
            repository.defaultBranch ||
            repository.default_branch ||
            repository.mainbranch?.name ||
            '',
          updatedAt:
            repository.updatedAt ||
            repository.updated_at ||
            repository.pushed_at ||
            repository.lastActivityAt ||
            ''
        }
      })
      .filter(Boolean)

    if (
      config.value.repository &&
      !repositories.some(
        repository => repository.path === config.value.repository
      )
    ) {
      repositories.unshift({
        path: config.value.repository,
        name: config.value.repository.split('/').filter(Boolean).at(-1),
        visibility: '',
        defaultBranch: config.value.defaultBranch,
        updatedAt: ''
      })
    }
    repositoryItems.value = [
      ...new Map(
        repositories.map(repository => [repository.path, repository])
      ).values()
    ]
    repositoryOptions.value = repositoryItems.value.map(
      repository => repository.path
    )
    filteredRepositories.value = [...repositoryOptions.value]
    if (notifyOnSuccess) {
      Notify.create({
        type: 'positive',
        message: `${repositoryItems.value.length} repositories loaded.`,
        position: 'top'
      })
    }
  } catch (error) {
    Notify.create({
      type: 'negative',
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to load repositories.',
      position: 'top'
    })
  } finally {
    loadingRepositories.value = false
  }
}

const selectRepository = path => {
  config.value.repository = path
  const repository = repositoryItems.value.find(item => item.path === path)
  if (repository?.defaultBranch) {
    config.value.defaultBranch = repository.defaultBranch
    newBranch.value.sourceBranch = repository.defaultBranch
  }
}

const openRepository = async repository => {
  selectRepository(repository.path)
  selectedRepository.value = repository
  repositoryTreePath.value = ''
  repositoryTreeEntries.value = []
  showRepositoryBrowser.value = true
  await loadRepositoryTree('')
}

const startNewRepositoryFile = () => {
  if (!selectedRepository.value || !config.value.token) {
    Notify.create({
      type: 'warning',
      message: 'Select a repository and connect a provider token first.',
      position: 'top'
    })
    return
  }

  const currentFolder = repositoryTreePath.value.replace(/^\/+|\/+$/g, '')
  repositoryFile.value = {
    path: currentFolder ? `${currentFolder}/NewFile.txt` : 'NewFile.txt',
    content: '',
    originalContent: '',
    sha: '',
    branch:
      selectedRepository.value.defaultBranch || config.value.defaultBranch,
    isNew: true
  }
  repositoryCommitMessage.value = ''
  showRepositoryFileEditor.value = true
}

const loadRepositoryTree = async path => {
  if (!selectedRepository.value || !config.value.token) return

  try {
    loadingRepositoryTree.value = true
    repositoryTreePath.value = path
    const { data } = await api.post('/users/git/repository/tree', {
      userId: config.value.userId,
      provider: config.value.provider,
      hostUrl: config.value.hostUrl,
      gitToken: config.value.token,
      repoPath: selectedRepository.value.path,
      branch:
        selectedRepository.value.defaultBranch || config.value.defaultBranch,
      path,
      recursive: false
    })
    if (data?.success === false) {
      throw new Error(data?.error || 'Failed to load repository files.')
    }

    const entries = Array.isArray(data)
      ? data
      : (data?.tree ??
        data?.files ??
        data?.entries ??
        data?.data?.tree ??
        data?.data?.files ??
        data?.data ??
        data?.content ??
        [])
    if (!Array.isArray(entries)) {
      throw new Error('The repository response did not contain a file list.')
    }

    repositoryTreeEntries.value = entries
      .map(entry => {
        const rawPath = String(entry.path || entry.name || '').replace(
          /^\/+|\/+$/g,
          ''
        )
        const entryPath =
          path && rawPath !== path && !rawPath.startsWith(`${path}/`)
            ? `${path}/${rawPath}`
            : rawPath
        const entryType = String(
          entry.type || entry.kind || entry.objectType || ''
        ).toLowerCase()
        const isDirectory =
          ['tree', 'dir', 'directory', 'folder'].includes(entryType) ||
          entry.isDirectory === true ||
          entry.is_directory === true ||
          entry.isDirectory === 'true' ||
          entry.is_directory === 'true'
        return {
          path: entryPath,
          name: entry.name || entryPath.split('/').filter(Boolean).at(-1),
          type: isDirectory ? 'tree' : 'blob',
          size: Number(entry.size) || 0,
          content: entry.content ?? entry.decodedContent ?? null,
          encoding: entry.encoding || 'utf-8',
          sha: entry.sha || ''
        }
      })
      .filter(entry => entry.path && entry.name)
      .sort((left, right) => {
        if (left.type !== right.type) return left.type === 'tree' ? -1 : 1
        return left.name.localeCompare(right.name)
      })

    const updatedAt =
      data?.repository?.updatedAt ||
      data?.repository?.updated_at ||
      data?.updatedAt ||
      data?.updated_at
    if (updatedAt) selectedRepository.value.updatedAt = updatedAt
  } catch (error) {
    repositoryTreeEntries.value = []
    Notify.create({
      type: 'negative',
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to load repository files.',
      position: 'top'
    })
  } finally {
    loadingRepositoryTree.value = false
  }
}

const openRepositoryTreeEntry = entry => {
  if (entry?.type === 'tree') {
    loadRepositoryTree(entry.path)
    return
  }
  if (entry?.type === 'blob') openRepositoryFile(entry)
}

const resetRepositoryFileEditor = () => {
  showRepositoryFileEditor.value = false
  showDiscardRepositoryFileDialog.value = false
  repositoryFile.value = {
    path: '',
    content: '',
    originalContent: '',
    sha: '',
    branch: '',
    isNew: false
  }
  repositoryCommitMessage.value = ''
}

const closeRepositoryFileEditor = () => {
  if (isRepositoryFileDirty.value) {
    showDiscardRepositoryFileDialog.value = true
    return
  }
  resetRepositoryFileEditor()
}

const discardRepositoryFileChanges = (closeEditor = false) => {
  if (closeEditor || repositoryFile.value.isNew) {
    resetRepositoryFileEditor()
    return
  }
  repositoryFile.value.content = repositoryFile.value.originalContent
  repositoryCommitMessage.value = ''
}

const decodeRepositoryFile = (content, encoding) => {
  if (typeof content !== 'string' || encoding !== 'base64') return content || ''

  const binary = atob(content.replace(/\s/g, ''))
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

const openRepositoryFile = async entry => {
  if (!selectedRepository.value || !config.value.token) return
  if (isRepositoryFileDirty.value) {
    Notify.create({
      type: 'warning',
      message:
        'Commit or discard the current edits before opening another file.',
      position: 'top'
    })
    return
  }

  repositoryFile.value = {
    path: entry.path,
    content: '',
    originalContent: '',
    sha: entry.sha || '',
    branch:
      selectedRepository.value.defaultBranch || config.value.defaultBranch,
    isNew: false
  }
  repositoryCommitMessage.value = ''
  showRepositoryFileEditor.value = true

  try {
    loadingRepositoryFile.value = true
    let fileData = entry.content
    let encoding = entry.encoding
    let sha = entry.sha

    if (typeof fileData !== 'string') {
      const { data } = await api.post('/users/git/repository/file', {
        userId: config.value.userId,
        provider: config.value.provider,
        hostUrl: config.value.hostUrl,
        gitToken: config.value.token,
        repoPath: selectedRepository.value.path,
        branch: repositoryFile.value.branch,
        path: entry.path
      })
      if (data?.success === false) {
        throw new Error(data?.error || 'Failed to load repository file.')
      }
      const response = data?.file || data?.data || data
      fileData = response?.content ?? response?.fileContent ?? ''
      encoding = response?.encoding || encoding
      sha = response?.sha || sha
    }

    const content = decodeRepositoryFile(fileData, encoding)
    repositoryFile.value = {
      ...repositoryFile.value,
      content,
      originalContent: content,
      sha: sha || ''
    }
  } catch (error) {
    showRepositoryFileEditor.value = false
    Notify.create({
      type: 'negative',
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to load repository file.',
      position: 'top'
    })
  } finally {
    loadingRepositoryFile.value = false
  }
}

const formatRepositoryFile = async () => {
  const extension = repositoryFile.value.path.split('.').at(-1)?.toLowerCase()
  const parserByExtension = {
    vue: 'vue',
    js: 'babel',
    jsx: 'babel',
    mjs: 'babel',
    cjs: 'babel',
    ts: 'typescript',
    tsx: 'typescript',
    json: 'json',
    html: 'html',
    css: 'css',
    scss: 'scss',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml'
  }
  const parser = parserByExtension[extension]
  if (!parser) {
    Notify.create({
      type: 'warning',
      message: `Formatting is not configured for .${extension || 'unknown'} files.`,
      position: 'top'
    })
    return
  }

  try {
    formattingRepositoryFile.value = true
    const prettier = await import('prettier/standalone')
    const pluginImports = {
      vue: () => import('prettier/plugins/html'),
      babel: () =>
        Promise.all([
          import('prettier/plugins/babel'),
          import('prettier/plugins/estree')
        ]),
      typescript: () => import('prettier/plugins/typescript'),
      json: () =>
        Promise.all([
          import('prettier/plugins/babel'),
          import('prettier/plugins/estree')
        ]),
      html: () => import('prettier/plugins/html'),
      css: () => import('prettier/plugins/postcss'),
      scss: () => import('prettier/plugins/postcss'),
      markdown: () => import('prettier/plugins/markdown'),
      yaml: () => import('prettier/plugins/yaml')
    }
    const importedPlugins = await pluginImports[parser]()
    repositoryFile.value.content = await prettier.format(
      repositoryFile.value.content,
      {
        filepath: repositoryFile.value.path,
        parser,
        plugins: Array.isArray(importedPlugins)
          ? importedPlugins
          : [importedPlugins],
        semi: false,
        singleQuote: true,
        tabWidth: 2
      }
    )
    Notify.create({
      type: 'positive',
      message: 'Code formatted.',
      position: 'top'
    })
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.message || 'Could not format this file.',
      position: 'top'
    })
  } finally {
    formattingRepositoryFile.value = false
  }
}

const commitAndPushRepositoryFile = async () => {
  if (!isRepositoryFileDirty.value) return
  if (
    repositoryFile.value.isNew &&
    !isValidRepositoryFilePath(repositoryFile.value.path)
  ) {
    Notify.create({
      type: 'warning',
      message: 'Enter a valid repository-relative file path.',
      position: 'top'
    })
    return
  }
  if (!repositoryCommitMessage.value.trim()) {
    Notify.create({
      type: 'warning',
      message: 'Enter a commit message before pushing.',
      position: 'top'
    })
    return
  }

  try {
    committingRepositoryFile.value = true
    const { data } = await api.post('/users/git/repository/commit-push', {
      userId: config.value.userId,
      provider: config.value.provider,
      hostUrl: config.value.hostUrl,
      gitToken: config.value.token,
      repoPath: selectedRepository.value.path,
      branch: repositoryFile.value.branch,
      path: repositoryFile.value.path.trim().replaceAll('\\', '/'),
      content: repositoryFile.value.content,
      commitMessage: repositoryCommitMessage.value.trim(),
      sha: repositoryFile.value.isNew ? undefined : repositoryFile.value.sha,
      isNewFile: repositoryFile.value.isNew,
      operation: repositoryFile.value.isNew ? 'create' : 'update'
    })
    if (data?.success === false) {
      throw new Error(data?.error || 'Commit and push failed.')
    }

    repositoryFile.value.originalContent = repositoryFile.value.content
    repositoryFile.value.sha =
      data?.sha || data?.commit?.sha || repositoryFile.value.sha
    repositoryFile.value.isNew = false
    repositoryCommitMessage.value = ''
    const updatedAt = data?.updatedAt || new Date().toISOString()
    selectedRepository.value.updatedAt = updatedAt
    const repository = repositoryItems.value.find(
      item => item.path === selectedRepository.value.path
    )
    if (repository) repository.updatedAt = updatedAt
    Notify.create({
      type: 'positive',
      message:
        data?.message || `${repositoryFile.value.path} committed and pushed.`,
      timeout: 5000,
      position: 'top'
    })
    await loadRepositoryTree(repositoryTreePath.value)
  } catch (error) {
    Notify.create({
      type: 'negative',
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Commit and push failed.',
      position: 'top'
    })
  } finally {
    committingRepositoryFile.value = false
  }
}

// ─── 2. Create Repository ─────────────────────────────────────────────────
const createRepository = async () => {
  const valid = await createRepositoryFormRef.value?.validate()
  if (valid === false) return
  if (!config.value.token) {
    Notify.create({
      type: 'warning',
      message:
        'Connect a provider token with repository-creation access first.',
      position: 'top'
    })
    return
  }

  try {
    creatingRepository.value = true
    const { data } = await api.post('/users/git/create-repository', {
      userId: config.value.userId,
      provider: config.value.provider,
      hostUrl: config.value.hostUrl,
      gitToken: config.value.token,
      namespace: newRepository.value.namespace.trim(),
      repositoryName: newRepository.value.name.trim(),
      description: newRepository.value.description.trim(),
      visibility: newRepository.value.visibility,
      initializeReadme: newRepository.value.initializeReadme
    })

    if (data?.success === false) {
      throw new Error(data?.error || 'Repository creation failed.')
    }

    const repoPath =
      data?.repoPath ||
      data?.repository?.fullName ||
      data?.repository?.pathWithNamespace ||
      data?.repository?.full_name ||
      `${newRepository.value.namespace.trim()}/${newRepository.value.name.trim()}`
    config.value.repository = repoPath
    if (!repositoryOptions.value.includes(repoPath)) {
      repositoryOptions.value.unshift(repoPath)
    }
    if (
      !repositoryItems.value.some(repository => repository.path === repoPath)
    ) {
      repositoryItems.value.unshift({
        path: repoPath,
        name: repoPath.split('/').filter(Boolean).at(-1),
        visibility: newRepository.value.visibility,
        defaultBranch: config.value.defaultBranch,
        updatedAt: new Date().toISOString()
      })
    }
    filteredRepositories.value = [...repositoryOptions.value]
    Notify.create({
      type: 'positive',
      message: `${repoPath} created. Save Configuration to connect it to Git workflows.`,
      timeout: 5000,
      position: 'top'
    })
  } catch (error) {
    const status = error.response?.status
    const message =
      status === 403
        ? 'Repository creation was denied. Check the token and account or namespace permissions.'
        : error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Repository creation failed.'
    Notify.create({ type: 'negative', message, position: 'top' })
  } finally {
    creatingRepository.value = false
  }
}

const createBranch = async () => {
  const valid = await createBranchFormRef.value?.validate()
  if (valid === false) return
  if (!config.value.repository || !config.value.token) {
    Notify.create({
      type: 'warning',
      message: 'Select a repository and connect a provider token first.',
      position: 'top'
    })
    return
  }

  try {
    creatingBranch.value = true
    const { data } = await api.post('/users/git/create-branch', {
      userId: config.value.userId,
      provider: config.value.provider,
      hostUrl: config.value.hostUrl,
      gitToken: config.value.token,
      repoPath: config.value.repository.trim(),
      branchName: newBranch.value.name.trim(),
      sourceBranch: newBranch.value.sourceBranch.trim()
    })
    if (data?.success === false) {
      throw new Error(data?.error || 'Branch creation failed.')
    }

    Notify.create({
      type: 'positive',
      message:
        data?.message ||
        `Branch ${newBranch.value.name.trim()} created in ${config.value.repository}.`,
      position: 'top'
    })
    newBranch.value.name = ''
  } catch (error) {
    const message =
      error.response?.status === 403
        ? 'Branch creation was denied. Check that the token has write access to this repository.'
        : error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Branch creation failed.'
    Notify.create({ type: 'negative', message, position: 'top' })
  } finally {
    creatingBranch.value = false
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

const loadPullRequestDiff = async () => {
  if (!selectedPr.value) return

  try {
    loadingPullRequestDiff.value = true
    const { data } = await api.post('/users/git/pull-request-diff', {
      userId: config.value.userId,
      provider: config.value.provider,
      hostUrl: config.value.hostUrl,
      gitToken: config.value.token,
      repoPath: config.value.repository?.trim(),
      pullNumber: selectedPr.value.number
    })
    if (data?.success === false) {
      throw new Error(data?.error || 'Failed to load pull request diff.')
    }

    const files = Array.isArray(data)
      ? data
      : (data?.files ??
        data?.diffFiles ??
        data?.data?.files ??
        data?.data?.diffFiles ??
        [])
    if (Array.isArray(files) && files.length) {
      pullRequestDiffFiles.value = files.map((file, index) => ({
        path:
          file?.filename ||
          file?.fileName ||
          file?.path ||
          (typeof file === 'string' ? file : `Changed file ${index + 1}`),
        patch:
          file?.patch || file?.diff || file?.content || file?.changes || '',
        additions: Number(file?.additions) || 0,
        deletions: Number(file?.deletions) || 0
      }))
    } else {
      const patch =
        data?.diff || data?.patch || data?.data?.diff || data?.data?.patch || ''
      pullRequestDiffFiles.value = patch
        ? [
            {
              path: `PR-${selectedPr.value.number}.diff`,
              patch: String(patch),
              additions: 0,
              deletions: 0
            }
          ]
        : []
    }

    selectedDiffFile.value = pullRequestDiffFiles.value[0] ?? null
    showPullRequestDiff.value = true
  } catch (error) {
    Notify.create({
      type: 'negative',
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to load pull request diff.',
      position: 'top'
    })
  } finally {
    loadingPullRequestDiff.value = false
  }
}

const confirmRevertPullRequest = () => {
  if (selectedPr.value?.status !== 'merged') return
  showRevertPullRequestDialog.value = true
}

const revertMergedPullRequest = async () => {
  if (selectedPr.value?.status !== 'merged') return

  try {
    revertingPullRequest.value = true
    const { data } = await api.post('/users/git/revert-pr', {
      userId: config.value.userId,
      provider: config.value.provider,
      hostUrl: config.value.hostUrl,
      gitToken: config.value.token,
      repoPath: config.value.repository?.trim(),
      pullNumber: selectedPr.value.number
    })
    if (data?.success === false) {
      throw new Error(data?.error || 'Rollback failed.')
    }

    showRevertPullRequestDialog.value = false
    Notify.create({
      type: 'positive',
      message:
        data?.message ||
        `Rollback commit created for PR #${selectedPr.value.number}.`,
      timeout: 5000,
      position: 'top'
    })
    await fetchPullRequests()
  } catch (error) {
    Notify.create({
      type: 'negative',
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Rollback failed.',
      position: 'top'
    })
  } finally {
    revertingPullRequest.value = false
  }
}

// ─── 4. AI Code Review & Merge ─────────────────────────────────────────────
const reviewPr = async action => {
  if (!selectedPr.value) return

  showMergeDialog.value = false

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
 * Safely parse the backend review response.
 * Handles objects, standard text, and JSON string responses.
 */
const parseReview = raw => {
  if (!raw) return null

  let parsed = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch {
      // Not JSON string, fall through to raw string handling
    }
  }

  if (typeof parsed === 'object' && parsed !== null) {
    return {
      approved:
        parsed.approved ?? (parsed.score != null ? parsed.score >= 7 : false),
      score: parsed.score ?? null,
      issues: parsed.issues ?? [],
      suggestions: parsed.suggestions ?? [],
      rawFeedback:
        parsed.rawFeedback ?? parsed.feedback ?? JSON.stringify(parsed, null, 2)
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
.pr-workspace-card {
  min-height: 380px;
}
.pr-list-scroll {
  max-height: 460px;
  overflow-y: auto;
}
.pr-empty-state {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
}
.diff-browser {
  flex: 1;
  min-height: 0;
}
.diff-file-list {
  width: min(360px, 34vw);
  overflow-y: auto;
}
.diff-code-pane {
  height: calc(100vh - 88px);
  min-width: 0;
  background: #111827;
}
.diff-code {
  min-width: 100%;
  margin: 0;
  padding: 20px 24px;
  color: #d1d5db;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre;
}
.repository-list-scroll {
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
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
