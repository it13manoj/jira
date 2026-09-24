<template>
  <div class="q-pa-md bg-grey-1 min-height-screen">
    <div class="max-width-container">
      <!-- TOP NAVIGATION / BACK BUTTON -->
      <div class="row items-center q-mb-md">
        <q-btn
          outline
          color="primary"
          icon="arrow_back"
          label="Back to Task Board"
          class="bg-white"
          @click="goBackToBoard"
        >
          <q-tooltip>Return to Task Board List</q-tooltip>
        </q-btn>
      </div>

      <div class="row q-col-gutter-md">
        <!-- LEFT COLUMN: Task Main Details & Comments -->
        <div class="col-12 col-md-8">
          <q-card flat bordered class="q-pa-md shadow-1 bg-white">
            <!-- Task Header & Title -->
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center q-gutter-x-xs">
                <q-icon name="check_box" color="primary" size="24px" />
                <span class="text-subtitle1 text-weight-bold text-grey-8">{{
                  task.key
                }}</span>
              </div>
              <q-badge
                :color="getStatusColor(task.status)"
                class="q-pa-xs text-capitalize"
              >
                {{ task.status }}
              </q-badge>
            </div>

            <div class="text-h5 text-weight-bold q-mb-md">{{ task.title }}</div>

            <!-- Description Section -->
            <div class="q-mb-xl">
              <div class="text-subtitle2 text-bold text-grey-8 q-mb-xs">
                Description
              </div>
              <div
                class="text-body2 text-grey-9 bg-grey-2 q-pa-md rounded-borders"
              >
                {{ task.description || 'No description provided.' }}
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Activity / Comment Section -->
            <div class="text-h6 text-bold q-mb-md">Activity & Comments</div>

            <!-- Add New Comment Box (Jira Rich Style) -->
            <q-card flat bordered class="q-mb-lg bg-grey-1">
              <q-card-section class="q-pa-sm">
                <q-input
                  v-model="newComment.text"
                  type="textarea"
                  autogrow
                  dense
                  borderless
                  placeholder="Add a comment... (Type @ to mention team members)"
                  class="bg-white q-pa-xs rounded-borders"
                />

                <!-- Preview Uploaded Image Attachment -->
                <div
                  v-if="newComment.imagePreview"
                  class="q-mt-sm relative-position inline-block"
                >
                  <img
                    :src="newComment.imagePreview"
                    class="rounded-borders image-preview"
                  />
                  <q-btn
                    round
                    dense
                    color="negative"
                    icon="close"
                    size="xs"
                    class="absolute-top-right q-ma-xs"
                    @click="removeImage"
                  />
                </div>

                <!-- Preview Added Link -->
                <div v-if="newComment.link" class="q-mt-sm">
                  <q-chip
                    removable
                    color="blue-1"
                    text-color="primary"
                    icon="link"
                    @remove="newComment.link = ''"
                  >
                    {{ newComment.link }}
                  </q-chip>
                </div>

                <!-- Mention Bar / Selector -->
                <div
                  v-if="showMentionOptions"
                  class="q-mt-xs bg-white border-grey q-pa-xs rounded-borders shadow-2"
                >
                  <div class="text-caption text-grey-7 q-px-sm">
                    Select member to mention:
                  </div>
                  <q-list dense>
                    <q-item
                      v-for="user in teamMembers"
                      :key="user.value"
                      clickable
                      v-close-popup
                      @click="insertMention(user.label)"
                    >
                      <q-item-section avatar>
                        <q-avatar
                          size="24px"
                          color="primary"
                          text-color="white"
                        >
                          {{ user.label.charAt(0) }}
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>{{ user.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </q-card-section>

              <!-- Editor Toolbar Options (Photo, Link, Mention) -->
              <q-card-actions
                class="row items-center justify-between bg-white q-px-sm"
              >
                <div class="row items-center q-gutter-x-xs">
                  <!-- Image Attachment Button -->
                  <q-btn
                    flat
                    round
                    dense
                    icon="photo_camera"
                    color="grey-7"
                    @click="triggerFileInput"
                  >
                    <q-tooltip>Attach Image</q-tooltip>
                  </q-btn>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileUpload"
                  />

                  <!-- Add Hyperlink Button -->
                  <q-btn
                    flat
                    round
                    dense
                    icon="link"
                    color="grey-7"
                    @click="promptAddLink"
                  >
                    <q-tooltip>Add Link</q-tooltip>
                  </q-btn>

                  <!-- Tag / Mention Member -->
                  <q-btn
                    flat
                    round
                    dense
                    icon="alternate_email"
                    color="grey-7"
                    @click="showMentionOptions = !showMentionOptions"
                  >
                    <q-tooltip>Mention Assignee/Reporter</q-tooltip>
                  </q-btn>
                </div>

                <q-btn
                  color="primary"
                  label="Save Comment"
                  unelevated
                  size="sm"
                  @click="addComment"
                />
              </q-card-actions>
            </q-card>

            <!-- Multiple Comments Thread List -->
            <div class="q-gutter-y-md">
              <div
                v-for="comment in task.comments"
                :key="comment.id"
                class="row q-col-gutter-x-sm"
              >
                <div class="col-auto">
                  <q-avatar color="primary" text-color="white" size="36px">
                    {{ comment.author.charAt(0) }}
                  </q-avatar>
                </div>

                <div class="col">
                  <q-card flat bordered class="bg-white">
                    <q-card-section class="q-pa-sm">
                      <div class="row items-center justify-between q-mb-xs">
                        <span class="text-weight-bold text-caption text-grey-9">
                          {{ comment.author }}
                        </span>
                        <span class="text-caption text-grey-6">
                          {{ comment.timestamp }}
                        </span>
                      </div>

                      <!-- Comment Body -->
                      <div
                        class="text-body2 text-grey-9 q-mb-xs"
                        style="white-space: pre-line"
                      >
                        {{ comment.text }}
                      </div>

                      <!-- Comment External Link -->
                      <div v-if="comment.link" class="q-my-xs">
                        <a
                          :href="comment.link"
                          target="_blank"
                          class="text-primary text-caption row items-center"
                        >
                          <q-icon
                            name="open_in_new"
                            size="14px"
                            class="q-mr-xs"
                          />
                          {{ comment.link }}
                        </a>
                      </div>

                      <!-- Comment Photo Attachment -->
                      <div v-if="comment.image" class="q-mt-xs">
                        <q-img
                          :src="comment.image"
                          class="comment-image rounded-borders"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </q-card>
        </div>

        <!-- RIGHT COLUMN: Task Attributes (Assignee, Reporter, Priority) -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="q-pa-md shadow-1 bg-white">
            <div class="text-subtitle1 text-bold q-mb-md">Details</div>

            <div class="q-gutter-y-md">
              <!-- Assignee Selection -->
              <div>
                <div class="text-caption text-grey-7">Assignee</div>
                <q-select
                  v-model="task.assignee"
                  :options="teamMembers"
                  emit-value
                  map-options
                  dense
                  outlined
                  options-dense
                >
                  <template #option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-avatar
                          size="24px"
                          color="primary"
                          text-color="white"
                        >
                          {{ scope.opt.label.charAt(0) }}
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Reporter Selection -->
              <div>
                <div class="text-caption text-grey-7">Reporter</div>
                <q-select
                  v-model="task.reporter"
                  :options="teamMembers"
                  emit-value
                  map-options
                  dense
                  outlined
                  options-dense
                />
              </div>

              <!-- Priority -->
              <div>
                <div class="text-caption text-grey-7">Priority</div>
                <q-select
                  v-model="task.priority"
                  :options="['Highest', 'High', 'Medium', 'Low']"
                  dense
                  outlined
                  options-dense
                />
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify, Dialog } from 'quasar'

const route = useRoute()
const router = useRouter()

// Get current projectId from route params (/project/:projectId/view/tasks/:taskId)
const activeProjectId = computed(() => route.params.projectId || '1')

// Navigation Handler to return to the board list
const goBackToBoard = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    // Fallback directly to board route if arriving via direct link/refresh
    router.push(`/project/${activeProjectId.value}/view/tasks`)
  }
  Notify.create({
    type: 'info',
    message: 'Returned to Task Board'
  })
}

const fileInput = ref(null)
const showMentionOptions = ref(false)

const teamMembers = [
  { label: 'John Doe (Backend Lead)', value: 'John Doe' },
  { label: 'Sarah Smith (Frontend Lead)', value: 'Sarah Smith' },
  { label: 'Alex Johnson (DevOps)', value: 'Alex Johnson' },
  { label: 'Michael Brown (QA Tester)', value: 'Michael Brown' }
]

const task = ref({
  key: 'NWA-102',
  title: 'Implement Jira-Style Task Detail & Activity View',
  description:
    'Create a full task management layout allowing team members to add inline comments, upload screenshots, attach reference links, and tag assignee/reporter members directly.',
  status: 'In Progress',
  assignee: 'Sarah Smith',
  reporter: 'John Doe',
  priority: 'High',
  comments: [
    {
      id: 1,
      author: 'John Doe',
      text: 'Please ensure we support multiple image uploads and link tagging for QA reports.',
      timestamp: 'Today at 10:15 AM',
      image: null,
      link: 'https://jira.atlassian.com'
    }
  ]
})

const newComment = ref({
  text: '',
  imagePreview: null,
  link: ''
})

const getStatusColor = status => {
  switch (status) {
    case 'Done':
      return 'positive'
    case 'In Progress':
      return 'warning'
    case 'To Do':
      return 'blue-grey'
    default:
      return 'grey'
  }
}

// Media & Attachment Handlers
const triggerFileInput = () => fileInput.value.click()

const handleFileUpload = event => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = e => {
      newComment.value.imagePreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  newComment.value.imagePreview = null
}

const promptAddLink = () => {
  Dialog.create({
    title: 'Add External Link',
    message: 'Enter URL (e.g., https://github.com or Figma link):',
    prompt: { model: '', type: 'url' },
    cancel: true,
    persistent: true
  }).onOk(data => {
    if (data) newComment.value.link = data
  })
}

const insertMention = userName => {
  newComment.value.text += ` @${userName} `
  showMentionOptions.value = false
}

// Save Comment
const addComment = () => {
  if (!newComment.value.text && !newComment.value.imagePreview) {
    Notify.create({ type: 'warning', message: 'Comment cannot be empty' })
    return
  }

  task.value.comments.unshift({
    id: Date.now(),
    author: 'John Doe', // Current logged-in user
    text: newComment.value.text,
    timestamp: 'Just now',
    image: newComment.value.imagePreview,
    link: newComment.value.link
  })

  // Reset Form
  newComment.value = { text: '', imagePreview: null, link: '' }
  Notify.create({ type: 'positive', message: 'Comment posted successfully' })
}
</script>

<style scoped>
.max-width-container {
  max-width: 1200px;
  margin: 0 auto;
}
.image-preview {
  max-height: 120px;
  object-fit: cover;
}
.comment-image {
  max-width: 300px;
  max-height: 200px;
  border-radius: 6px;
}
.border-grey {
  border: 1px solid #e0e0e0;
}
.min-height-screen {
  min-height: 100vh;
}
</style>
