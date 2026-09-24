<template>
  <q-page class="q-pa-md q-pa-md-lg bg-slate-900 text-white min-h-screen">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg gap-md">
      <div>
        <h1 class="text-h4 text-weight-bold q-ma-none text-white">Projects</h1>
        <p class="text-caption text-grey-4 q-mb-none"
          >Manage projects, track initial tasks, and assign team members
          directly.</p
        >
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Create Project"
        to="/projects/create"
        unelevated
        class="rounded-btn text-weight-bold"
        no-caps
      />
    </div>

    <!-- Summary Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-slate-800 text-white border-glass rounded-card">
          <q-card-section class="row items-center justify-between q-py-sm">
            <div>
              <div class="text-caption text-grey-4">Total Projects</div>
              <div class="text-h5 text-weight-bold">{{ projects.length }}</div>
            </div>
            <q-avatar
              size="36px"
              color="blue-10"
              text-color="blue-2"
              icon="folder"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-slate-800 text-white border-glass rounded-card">
          <q-card-section class="row items-center justify-between q-py-sm">
            <div>
              <div class="text-caption text-grey-4">In Progress</div>
              <div class="text-h5 text-weight-bold text-warning">
                {{ projects.filter(p => p.status === 'In Progress').length }}
              </div>
            </div>
            <q-avatar
              size="36px"
              color="amber-10"
              text-color="amber-2"
              icon="sync"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-slate-800 text-white border-glass rounded-card">
          <q-card-section class="row items-center justify-between q-py-sm">
            <div>
              <div class="text-caption text-grey-4">Completed</div>
              <div class="text-h5 text-weight-bold text-positive">
                {{ projects.filter(p => p.status === 'Completed').length }}
              </div>
            </div>
            <q-avatar
              size="36px"
              color="green-10"
              text-color="green-2"
              icon="check_circle"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-slate-800 text-white border-glass rounded-card">
          <q-card-section class="row items-center justify-between q-py-sm">
            <div>
              <div class="text-caption text-grey-4">Total Assigned Tasks</div>
              <div class="text-h5 text-weight-bold text-primary">{{
                totalTaskCount
              }}</div>
            </div>
            <q-avatar
              size="36px"
              color="purple-10"
              text-color="purple-2"
              icon="assignment"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main Table Container -->
    <q-card class="bg-slate-800 border-glass rounded-card q-pa-sm">
      <!-- Search & Filters -->
      <div class="row items-center justify-between q-pa-md q-col-gutter-sm">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="filter"
            dark
            outlined
            dense
            placeholder="Search project name, key, or task..."
            class="custom-field"
          >
            <template #prepend>
              <q-icon name="search" color="grey-5" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="selectedCategory"
            :options="categoryFilterOptions"
            dark
            outlined
            dense
            options-dense
            emit-value
            map-options
            class="custom-field full-width"
          />
        </div>
      </div>

      <!-- Data Table -->
      <q-table
        v-model:expanded="expandedRows"
        flat
        dark
        dense
        :rows="filteredProjects"
        :columns="columns"
        row-key="id"
        :grid="$q.screen.lt.md"
        class="bg-transparent text-grey-3 projects-table"
        :pagination="{ rowsPerPage: 10 }"
      >
        <!-- Mobile Card View -->
        <template #item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6">
            <q-card class="bg-slate-900 border-glass rounded-card q-pa-sm">
              <q-card-section
                class="row items-center justify-between no-wrap q-pb-none"
              >
                <div class="row items-center q-gutter-x-sm">
                  <q-avatar
                    size="32px"
                    color="primary"
                    text-color="white"
                    class="text-weight-bold"
                  >
                    {{ props.row.key }}
                  </q-avatar>
                  <div>
                    <div class="text-weight-bold text-white">{{
                      props.row.name
                    }}</div>
                    <div class="text-caption text-grey-5">{{
                      props.row.category
                    }}</div>
                  </div>
                </div>
                <q-chip
                  size="xs"
                  :color="getStatusColor(props.row.status)"
                  text-color="white"
                  dense
                >
                  {{ props.row.status }}
                </q-chip>
              </q-card-section>

              <q-card-section class="q-py-sm">
                <div class="text-caption text-grey-4 q-mb-xs">
                  Lead: <strong>{{ props.row.lead }}</strong>
                </div>
                <div
                  class="text-caption text-grey-4 q-mb-xs row justify-between"
                >
                  <span>Tasks ({{ props.row.tasks.length }})</span>
                  <span>{{ props.row.progress }}%</span>
                </div>
                <q-linear-progress
                  :value="props.row.progress / 100"
                  color="primary"
                  track-color="slate-700"
                  style="height: 6px"
                  class="rounded-borders"
                />
              </q-card-section>

              <q-card-actions align="between">
                <q-btn
                  flat
                  dense
                  icon="add"
                  label="Task"
                  color="primary"
                  size="sm"
                  no-caps
                  @click="openAddTaskModal(props.row)"
                />
                <q-btn
                  flat
                  dense
                  icon="visibility"
                  label="Details"
                  color="grey-4"
                  size="sm"
                  no-caps
                  @click="viewProject(props.row.id)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </template>

        <!-- Desktop Columns -->
        <template #body-cell-expand="props">
          <q-td :props="props" auto-width>
            <q-btn
              flat
              round
              dense
              size="sm"
              :icon="props.expanded ? 'expand_less' : 'expand_more'"
              color="grey-4"
              @click="props.expanded = !props.expanded"
            />
          </q-td>
        </template>

        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-x-sm">
              <q-avatar
                size="32px"
                color="primary"
                text-color="white"
                class="text-weight-bold"
              >
                {{ props.row.key }}
              </q-avatar>
              <div>
                <div class="text-weight-medium text-white">{{
                  props.row.name
                }}</div>
                <div class="text-caption text-grey-5"
                  >{{ props.row.key }} • {{ props.row.template }}</div
                >
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-tasks="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-x-xs">
              <q-chip
                size="xs"
                color="slate-700"
                text-color="grey-3"
                class="text-weight-medium"
              >
                {{ props.row.tasks.length }} Tasks
              </q-chip>
              <!-- Team Member Avatars Stack -->
              <div class="row items-center">
                <q-avatar
                  v-for="(task, i) in props.row.tasks.slice(0, 3)"
                  :key="i"
                  size="22px"
                  color="indigo-7"
                  text-color="white"
                  class="overlapping-avatar"
                >
                  {{ task.assignee.charAt(0) }}
                  <q-tooltip
                    >{{ task.title }} (Assigned: {{ task.assignee }})</q-tooltip
                  >
                </q-avatar>
                <span
                  v-if="props.row.tasks.length > 3"
                  class="text-caption text-grey-5 q-ml-xs"
                >
                  +{{ props.row.tasks.length - 3 }}
                </span>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-progress="props">
          <q-td :props="props" style="min-width: 130px">
            <div class="row items-center justify-between text-caption q-mb-xs">
              <span>{{ props.row.progress }}%</span>
            </div>
            <q-linear-progress
              :value="props.row.progress / 100"
              color="primary"
              track-color="slate-700"
              style="height: 6px"
              class="rounded-borders"
            />
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-chip
              size="sm"
              :color="getStatusColor(props.row.status)"
              text-color="white"
              dense
              class="text-weight-medium q-px-sm"
            >
              {{ props.row.status }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <!-- NEW: View Task Icon -->
            <q-btn
              flat
              dense
              round
              icon="visibility"
              color="primary"
              to="/view/tasks"
            >
              <q-tooltip>View Tasks</q-tooltip>
            </q-btn>

            <q-btn
              flat
              dense
              round
              icon="add_task"
              color="secondary"
              @click="openAddTaskModal(props.row)"
            >
              <q-tooltip>Add Issue</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="warning"
              @click="editProject(props.row.id)"
            />
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              @click="deleteProject(props.row)"
            />

            <q-btn flat round dense icon="more_vert" color="grey-4">
              <q-menu auto-close dark class="bg-slate-800 border-glass">
                <q-list style="min-width: 140px">
                  <q-item clickable @click="viewProject(props.row.id)">
                    <q-item-section avatar
                      ><q-icon name="visibility" size="18px"
                    /></q-item-section>
                    <q-item-section>View Project</q-item-section>
                  </q-item>
                  <q-item clickable @click="editProject(props.row.id)">
                    <q-item-section avatar
                      ><q-icon name="edit" size="18px"
                    /></q-item-section>
                    <q-item-section>Edit Details</q-item-section>
                  </q-item>
                  <q-separator dark />
                  <q-item
                    clickable
                    class="text-negative"
                    @click="deleteProject(props.row)"
                  >
                    <q-item-section avatar
                      ><q-icon name="delete" color="negative" size="18px"
                    /></q-item-section>
                    <q-item-section>Delete</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>

        <!-- Expandable Sub-Table Row for Detailed Tasks -->
        <template #row-expansion="props">
          <q-td colspan="100%" class="bg-slate-900 q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2 text-weight-bold text-primary">
                Tasks Breakdown for {{ props.row.name }}
              </div>
              <q-btn
                size="sm"
                outline
                color="primary"
                icon="add"
                label="Assign New Task"
                no-caps
                class="rounded-btn"
                @click="openAddTaskModal(props.row)"
              />
            </div>

            <div
              v-if="!props.row.tasks || props.row.tasks.length === 0"
              class="text-caption text-grey-5 q-py-xs"
            >
              No tasks created yet for this project.
            </div>

            <div v-else class="row q-col-gutter-xs">
              <div
                v-for="task in props.row.tasks"
                :key="task.id"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-card
                  flat
                  class="bg-slate-800 border-glass q-pa-xs rounded-card"
                >
                  <q-card-section class="q-pa-xs">
                    <div class="row items-center justify-between no-wrap">
                      <div
                        class="text-weight-medium text-white text-caption ellipsis"
                        >{{ task.title }}</div
                      >
                      <q-chip
                        size="xs"
                        :color="task.status === 'Done' ? 'positive' : 'amber-9'"
                        text-color="white"
                        dense
                      >
                        {{ task.status }}
                      </q-chip>
                    </div>
                    <div
                      class="row items-center justify-between q-mt-xs text-caption text-grey-4"
                    >
                      <div class="row items-center q-gutter-x-xs">
                        <q-avatar
                          size="16px"
                          color="indigo"
                          text-color="white"
                          >{{ task.assignee.charAt(0) }}</q-avatar
                        >
                        <span>{{ task.assignee }}</span>
                      </div>
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        size="xs"
                        color="grey-6"
                        @click="removeTask(props.row.id, task.id)"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Quick Modal: Add & Assign Task -->
    <!-- Quick Modal: Add & Assign Jira Issue/Task -->
    <q-dialog v-model="showTaskModal" persistent>
      <q-card
        class="bg-slate-800 text-white border-glass rounded-card"
        style="width: 600px; max-width: 90vw"
      >
        <q-card-section class="row items-center justify-between border-b-glass">
          <div class="row items-center q-gutter-x-sm">
            <q-avatar
              size="28px"
              color="primary"
              text-color="white"
              class="text-weight-bold"
            >
              {{ activeProject?.key }}
            </q-avatar>
            <div class="text-h6 text-weight-bold">Create Issue</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup color="grey-4" />
        </q-card-section>

        <q-card-section
          class="q-pa-md q-gutter-y-md style-scrollbar"
          style="max-height: 75vh; overflow-y: auto"
        >
          <!-- Issue Type & Priority -->
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-4 q-mb-xs">Issue Type *</div>
              <q-select
                v-model="newTask.issueType"
                :options="issueTypeOptions"
                dark
                outlined
                dense
                emit-value
                map-options
                class="custom-field"
              >
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon
                        :name="scope.opt.icon"
                        :color="scope.opt.color"
                        size="18px"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-4 q-mb-xs">Priority *</div>
              <q-select
                v-model="newTask.priority"
                :options="priorityOptions"
                dark
                outlined
                dense
                emit-value
                map-options
                class="custom-field"
              />
            </div>
          </div>

          <!-- Summary / Title -->
          <div>
            <div class="text-caption text-grey-4 q-mb-xs"
              >Summary (Task Title) *</div
            >
            <q-input
              v-model="newTask.summary"
              dark
              outlined
              dense
              placeholder="e.g. Implement OAuth2 login flow"
              class="custom-field"
              :rules="[val => !!val || 'Summary is required']"
            />
          </div>

          <!-- Assignee & Reporter -->
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-4 q-mb-xs">Assignee *</div>
              <q-select
                v-model="newTask.assignee"
                :options="teamMembers"
                dark
                outlined
                dense
                emit-value
                map-options
                class="custom-field"
              />
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-4 q-mb-xs">Reporter</div>
              <q-select
                v-model="newTask.reporter"
                :options="teamMembers"
                dark
                outlined
                dense
                emit-value
                map-options
                class="custom-field"
              />
            </div>
          </div>

          <!-- Component & Story Points -->
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-4 q-mb-xs">Component</div>
              <q-select
                v-model="newTask.component"
                :options="componentOptions"
                dark
                outlined
                dense
                emit-value
                map-options
                class="custom-field"
              />
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-4 q-mb-xs">Story Points</div>
              <q-input
                v-model.number="newTask.storyPoints"
                type="number"
                dark
                outlined
                dense
                placeholder="1, 2, 3, 5, 8..."
                class="custom-field"
              />
            </div>
          </div>

          <!-- Due Date & Environment -->
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-4 q-mb-xs">Due Date</div>
              <q-input
                v-model="newTask.dueDate"
                dark
                outlined
                dense
                type="date"
                class="custom-field"
              />
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-4 q-mb-xs">Environment</div>
              <q-select
                v-model="newTask.environment"
                :options="['Development', 'Staging', 'Production']"
                dark
                outlined
                dense
                class="custom-field"
              />
            </div>
          </div>

          <!-- Description -->
          <div>
            <div class="text-caption text-grey-4 q-mb-xs">Description</div>
            <q-input
              v-model="newTask.description"
              dark
              outlined
              type="textarea"
              rows="3"
              placeholder="Detailed acceptance criteria or replication steps..."
              class="custom-field"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md border-t-glass">
          <q-btn flat label="Cancel" v-close-popup color="grey-4" no-caps />
          <q-btn
            label="Create Issue"
            color="primary"
            class="rounded-btn"
            unelevated
            no-caps
            @click="submitTask"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Notify, Dialog } from 'quasar'
import { api } from '@/boot/axios'

const router = useRouter()
const filter = ref('')
const selectedCategory = ref('all')
const expandedRows = ref([])
const showTaskModal = ref(false)
const activeProject = ref(null)
const loading = ref(false)

const categoryFilterOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'Web Development', value: 'Web Development' },
  { label: 'Mobile Apps', value: 'Mobile Apps' },
  { label: 'DevOps & Cloud', value: 'DevOps & Cloud' }
]

const teamMembers = [
  { label: 'John Doe (Backend)', value: 'John Doe' },
  { label: 'Sarah Smith (Frontend)', value: 'Sarah Smith' },
  { label: 'Alex Johnson (DevOps)', value: 'Alex Johnson' },
  { label: 'Michael Brown (QA)', value: 'Michael Brown' }
]

const issueTypeOptions = ref([
  { label: 'Task', value: 'Task', icon: 'check_box', color: 'blue' },
  { label: 'Bug', value: 'Bug', icon: 'bug_report', color: 'negative' },
  { label: 'Story', value: 'Story', icon: 'bookmark', color: 'positive' },
  { label: 'Epic', value: 'Epic', icon: 'flash_on', color: 'purple' }
])

const priorityOptions = [
  { label: 'Highest', value: 'Highest' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
  { label: 'Lowest', value: 'Lowest' }
]

const componentOptions = [
  { label: 'Frontend UI', value: 'Frontend UI' },
  { label: 'Backend API', value: 'Backend API' },
  { label: 'Database', value: 'Database' },
  { label: 'DevOps / Infra', value: 'DevOps / Infra' }
]

const columns = [
  { name: 'expand', label: '', field: 'expand', align: 'center' },
  {
    name: 'name',
    label: 'Project',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'category',
    label: 'Category',
    field: 'category',
    align: 'left',
    sortable: true
  },
  { name: 'lead', label: 'Project Lead', field: 'lead', align: 'left' },
  { name: 'tasks', label: 'Assigned Tasks', field: 'tasks', align: 'left' },
  {
    name: 'progress',
    label: 'Completion',
    field: 'progress',
    align: 'left',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]

// Project list state (initialized empty for API call)
const projects = ref([])

// Fetch and map projects from backend API
const fetchProjects = async () => {
  loading.value = true
  try {
    const response = await api.get('/users/projects/find')
    const rawData = response.data || []

    projects.value = rawData.map(item => ({
      id: item.Id ?? item.Id,
      key: item.projectKey || 'N/A',
      name: item.projectName || 'Untitled Project',
      template: item.template?.name || 'Scrum',
      category: item.categories?.categoryName || 'Uncategorized',
      lead: item.leads?.username || item.assignee || 'Unassigned',
      progress: item.progress ?? 0,
      status: item.isRestricted ? 'In Progress' : 'Active',
      tasks: Array.isArray(item.tasks) ? item.tasks : []
    }))
  } catch (error) {
    console.error('Failed to load projects:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to fetch project list'
    })
  } finally {
    loading.value = false
  }
}

// Trigger API call when component mounts
onMounted(() => {
  fetchProjects()
})

const fetchIssueTypes = async () => {
  try {
    const response = await api.get('/users/stage/issue-types')
    const issueTypesData = response.data || []

    issueTypeOptions.value = issueTypesData.map(type => ({
      label: type.stagesName,
      value: type.Id,
      icon: type.icon || 'check_box',
      color: type.color || 'blue'
    }))
  } catch (error) {
    console.error('Failed to load issue types:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to fetch issue types'
    })
  }
}

const fetchPriorityOptions = async () => {
  try {
    const response = await api.get('/users/priority/find')
    const priorityData = response.data || []

    priorityOptions.splice(
      0,
      priorityOptions.length,
      ...priorityData.map(p => ({
        label: p.priority,
        value: p.Id
      }))
    )
  } catch (error) {
    console.error('Failed to load priority options:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to fetch priority options'
    })
  }
}

const fetchAssigneeOptions = async () => {
  try {
    const response = await api.get('/users')
    const assigneeData = response.data || []

    teamMembers.splice(
      0,
      teamMembers.length,
      ...assigneeData.map(a => ({
        label: a.username,
        value: a.Id
      }))
    )
  } catch (error) {
    console.error('Failed to load assignee options:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to fetch assignee options'
    })
  }
}

onMounted(() => {
  fetchIssueTypes()
  fetchPriorityOptions()
  fetchAssigneeOptions()
})

// Reactive Task Form aligned with Jira fields
const newTask = ref()

// Corrected search logic to filter by search query & category
const filteredProjects = computed(() => {
  const query = filter.value.toLowerCase().trim()
  return projects.value.filter(p => {
    const matchesCat =
      selectedCategory.value === 'all' || p.category === selectedCategory.value
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.key.toLowerCase().includes(query) ||
      p.tasks.some(t =>
        (t.title || t.summary || '').toLowerCase().includes(query)
      )
    return matchesCat && matchesQuery
  })
})

const totalTaskCount = computed(() => {
  return projects.value.reduce(
    (total, p) => total + (p.tasks ? p.tasks.length : 0),
    0
  )
})

const getStatusColor = status => {
  switch (status) {
    case 'Completed':
      return 'positive'
    case 'In Progress':
    case 'Active':
      return 'warning'
    case 'On Hold':
      return 'negative'
    default:
      return 'grey-7'
  }
}

const openAddTaskModal = project => {
  activeProject.value = project
  newTask.value = {
    issueType: 'Task',
    summary: '',
    assignee: project.lead || 'John Doe',
    reporter: 'John Doe',
    priority: 'Medium',
    component: 'Frontend UI',
    storyPoints: 3,
    dueDate: '',
    environment: 'Development',
    description: ''
  }

  console.log(project)
  showTaskModal.value = true
}

const submitTask = async () => {
  if (!newTask.value.summary) {
    Notify.create({ type: 'warning', message: 'Summary is required' })
    return
  }

  const issueKey = `${activeProject.value.key}-${activeProject.value.tasks.length + 1}`

  console.log(newTask.value)

  activeProject.value.tasks.push({
    id: Date.now(),
    key: issueKey,
    title: newTask.value.summary,
    issueType: newTask.value.issueType,
    assignee: newTask.value.assignee,
    reporter: newTask.value.reporter,
    priority: newTask.value.priority,
    component: newTask.value.component,
    storyPoints: newTask.value.storyPoints,
    dueDate: newTask.value.dueDate,
    status: 'To Do'
  })

  const response = await api.post('/users/tasks/create', {
    projects: { Id: activeProject.value.id },
    stages: { Id: newTask.value.issueType },
    Summary: newTask.value.summary,
    assignTo: { Id: newTask.value.assignee },
    reporter: { Id: newTask.value.reporter },
    priority: { Id: newTask.value.priority },
    components: newTask.value.component,
    storyPoint: newTask.value.storyPoints,
    dueDate: newTask.value.dueDate,
    environment: newTask.value.environment,
    description: newTask.value.description,
    permissions: { Id: 1 }
  })

  Notify.create({
    type: 'positive',
    message: `Issue ${issueKey} created and assigned to ${newTask.value.assignee}`
  })
  showTaskModal.value = false
}

const removeTask = (projectId, taskId) => {
  const project = projects.value.find(p => p.id === projectId)
  if (project) {
    project.tasks = project.tasks.filter(t => t.id !== taskId)
    Notify.create({ type: 'info', message: 'Task removed' })
  }
}

const viewProject = id => router.push(`/projects/${id}`)
const editProject = id => router.push(`/projects/${id}/edit`)

const deleteProject = project => {
  Dialog.create({
    dark: true,
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${project.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    projects.value = projects.value.filter(p => p.id !== project.id)
    Notify.create({ type: 'positive', message: 'Project deleted successfully' })
  })
}
</script>

<style scoped>
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
.rounded-btn {
  border-radius: 8px;
}

.custom-field :deep(.q-field__control) {
  background: #0f172a !important;
  border-radius: 8px !important;
}
.custom-field :deep(.q-field__native),
.custom-field :deep(.q-field__input) {
  color: #ffffff !important;
}

.overlapping-avatar {
  margin-left: -6px;
  border: 2px solid #1e293b;
}
.projects-table :deep(th) {
  font-weight: 600;
  color: #94a3b8;
}
.border-b-glass {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.border-t-glass {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

/* Custom Dark Scrollbar for Modal Body */
.style-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.style-scrollbar::-webkit-scrollbar-track {
  background: #0f172a;
}
.style-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
</style>
