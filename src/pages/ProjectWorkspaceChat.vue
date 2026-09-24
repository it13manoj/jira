<template>
  <q-page class="q-pa-lg bg-slate-900 text-white min-h-screen">
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-bold q-ma-none text-white">
          Project Workspace Chat
        </h1>
        <p class="text-caption text-grey-4 q-mb-none">
          Collaborate in real time with team members on ongoing projects.
        </p>
      </div>
      <div class="row items-center q-gutter-x-sm">
        <q-avatar size="32px" class="bg-indigo-500-10 text-indigo-4">
          <q-icon name="group" size="18px" />
        </q-avatar>
        <span class="text-caption text-grey-3"
          >{{ activeProject.members.length }} Active Team Members</span
        >
      </div>
    </div>

    <!-- Main Chat Workspace Layout -->
    <div class="row q-col-gutter-md style-chat-container">
      <!-- Left Sidebar: Project Channels List -->
      <div class="col-12 col-md-4 col-lg-3">
        <q-card
          class="bg-slate-800 text-white border-glass rounded-card full-height column"
        >
          <q-card-section class="q-pb-none">
            <div class="text-subtitle1 text-weight-bold q-mb-sm"
              >Select Project</div
            >
            <q-input
              dark
              dense
              outlined
              v-model="searchQuery"
              placeholder="Filter channels..."
              class="bg-slate-900 rounded-borders q-mb-md"
            >
              <template #append>
                <q-icon name="search" size="18px" />
              </template>
            </q-input>
          </q-card-section>

          <q-separator dark class="q-mb-sm" />

          <!-- Channel List -->
          <q-card-section class="col col-grow scroll q-pa-none">
            <q-list dark padding class="rounded-borders">
              <q-item
                v-for="project in filteredProjects"
                :key="project.id"
                clickable
                v-ripple
                :active="activeProject.id === project.id"
                active-class="active-channel"
                @click="selectProject(project)"
                class="rounded-borders q-mx-sm q-mb-xs"
              >
                <q-item-section avatar class="min-width-auto q-pr-sm">
                  <q-icon
                    name="hashtag"
                    size="18px"
                    :color="
                      activeProject.id === project.id ? 'indigo-4' : 'grey-5'
                    "
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium">{{
                    project.name
                  }}</q-item-label>
                  <q-item-label caption class="text-grey-4 text-truncate">
                    {{ project.lastMessage }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side v-if="project.unread > 0">
                  <q-badge color="indigo" rounded :label="project.unread" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Window: Active Chat Room -->
      <div class="col-12 col-md-8 col-lg-9">
        <q-card
          class="bg-slate-800 text-white border-glass rounded-card full-height column"
        >
          <!-- Chat Header -->
          <q-card-section
            class="row items-center justify-between border-bottom q-py-sm"
          >
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="hashtag" size="24px" color="indigo-4" />
              <div>
                <div class="text-subtitle1 text-weight-bold">{{
                  activeProject.name
                }}</div>
                <div class="text-caption text-grey-4"
                  >Client: {{ activeProject.client }}</div
                >
              </div>
            </div>

            <div class="row items-center q-gutter-x-xs">
              <q-btn flat round dense icon="search" color="grey-4" />
              <q-btn
                flat
                round
                dense
                icon="attach_file"
                color="grey-4"
                @click="triggerFileUpload"
              />
              <q-btn flat round dense icon="more_vert" color="grey-4" />
            </div>
          </q-card-section>

          <!-- Chat Message Thread Area -->
          <q-card-section
            ref="chatScrollArea"
            class="col col-grow scroll q-pa-md bg-slate-900-50"
          >
            <div
              v-for="msg in activeProject.messages"
              :key="msg.id"
              class="q-mb-md"
            >
              <q-chat-message
                :name="msg.sender"
                :avatar="msg.avatar"
                :text="[msg.text]"
                :stamp="msg.time"
                :sent="msg.isSelf"
                :bg-color="msg.isSelf ? 'indigo-9' : 'slate-700'"
                text-color="white"
              >
                <!-- Fallback Template for Avatars -->
                <template #avatar>
                  <q-avatar
                    size="38px"
                    class="q-message-avatar q-message-avatar--received q-mr-sm"
                  >
                    <img
                      :src="msg.avatar"
                      @error="e => handleImageError(e, msg.sender)"
                    />
                  </q-avatar>
                </template>
              </q-chat-message>
            </div>
          </q-card-section>

          <!-- Attachment Preview Bar -->
          <div
            v-if="attachment"
            class="q-px-md q-py-xs bg-slate-900 border-top row items-center justify-between"
          >
            <div
              class="row items-center q-gutter-x-xs text-caption text-indigo-3"
            >
              <q-icon name="insert_drive_file" size="16px" />
              <span>{{ attachment.name }}</span>
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              size="xs"
              color="grey-4"
              @click="attachment = null"
            />
          </div>

          <!-- Message Input Bar -->
          <q-card-section class="q-pa-sm border-top bg-slate-800">
            <q-form
              @submit.prevent="sendMessage"
              class="row items-center q-gutter-x-sm"
            >
              <q-input
                dark
                dense
                outlined
                v-model="newMessage"
                placeholder="Type your message here..."
                class="col bg-slate-900 rounded-borders"
                @keydown.enter.prevent="sendMessage"
              >
                <template #prepend>
                  <q-btn
                    flat
                    round
                    dense
                    icon="sentiment_satisfied_alt"
                    color="grey-4"
                  />
                </template>
                <template #append>
                  <q-btn
                    flat
                    round
                    dense
                    icon="attach_file"
                    color="grey-4"
                    @click="triggerFileUpload"
                  />
                </template>
              </q-input>

              <q-btn
                type="submit"
                color="indigo"
                icon="send"
                unelevated
                round
                :disabled="!newMessage.trim() && !attachment"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Hidden Input for File Attachments -->
    <input
      type="file"
      ref="fileInput"
      class="hidden"
      @change="handleFileSelected"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const searchQuery = ref('')
const newMessage = ref('')
const attachment = ref(null)
const fileInput = ref(null)
const chatScrollArea = ref(null)

// Fallback image generator function if the external network URL fails to load
const getInitialsAvatar = name => {
  const initial = name ? name.charAt(0).toUpperCase() : 'U'
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%236366f1"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="18" font-weight="bold">${initial}</text></svg>`
}

const handleImageError = (event, name) => {
  event.target.src = getInitialsAvatar(name)
}

const projects = ref([
  {
    id: 1,
    name: 'spring-boot-migration',
    client: 'Acme Corp',
    unread: 2,
    lastMessage: 'Updated the RBAC module endpoints.',
    members: ['Alex', 'Sarah', 'Devon'],
    messages: [
      {
        id: 101,
        sender: 'Alex Rivera',
        avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
        text: 'Hey team, did we push the migration scripts for Sprint 3?',
        time: '10:15 AM',
        isSelf: false
      },
      {
        id: 102,
        sender: 'You',
        avatar: 'https://cdn.quasar.dev/img/avatar1.jpg',
        text: 'Yes, the backend PR was merged an hour ago.',
        time: '10:18 AM',
        isSelf: true
      },
      {
        id: 103,
        sender: 'Sarah Chen',
        avatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
        text: 'Awesome! I will trigger the staging deployment now.',
        time: '10:20 AM',
        isSelf: false
      }
    ]
  },
  {
    id: 2,
    name: 'quasar-dashboard-ui',
    client: 'TechStart Inc',
    unread: 0,
    lastMessage: 'The new dark theme components look great!',
    members: ['You', 'Elena', 'Michael'],
    messages: [
      {
        id: 201,
        sender: 'Elena Rostova',
        avatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
        text: 'The new dark theme components look great!',
        time: 'Yesterday',
        isSelf: false
      }
    ]
  }
])

const activeProject = ref(projects.value[0])

const filteredProjects = computed(() => {
  if (!searchQuery.value) return projects.value
  return projects.value.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectProject = project => {
  activeProject.value = project
  project.unread = 0
  scrollToBottom()
}

const sendMessage = () => {
  if (!newMessage.value.trim() && !attachment.value) return

  let messageText = newMessage.value.trim()
  if (attachment.value) {
    messageText += ` [Attachment: ${attachment.value.name}]`
  }

  activeProject.value.messages.push({
    id: Date.now(),
    sender: 'You',
    avatar: 'https://cdn.quasar.dev/img/avatar1.jpg',
    text: messageText,
    time: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    isSelf: true
  })

  activeProject.value.lastMessage = messageText
  newMessage.value = ''
  attachment.value = null
  scrollToBottom()
}

const triggerFileUpload = () => {
  fileInput.value.click()
}

const handleFileSelected = event => {
  const file = event.target.files[0]
  if (file) {
    attachment.value = file
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatScrollArea.value && chatScrollArea.value.$el) {
      chatScrollArea.value.$el.scrollTop = chatScrollArea.value.$el.scrollHeight
    }
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
.bg-slate-900-50 {
  background-color: rgba(15, 23, 42, 0.6);
}

.border-glass {
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.border-top {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.rounded-card {
  border-radius: 12px;
}

.style-chat-container {
  height: calc(100vh - 160px);
}

.active-channel {
  background: rgba(99, 102, 241, 0.15) !important;
  border-left: 3px solid #6366f1;
}

.min-width-auto {
  min-width: auto;
}
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bg-indigo-500-10 {
  background: rgba(99, 102, 241, 0.15);
}
.hidden {
  display: none;
}
</style>
