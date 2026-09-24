<template>
  <div class="q-pa-sm q-pa-md-md bg-grey-1 min-height-screen">
    <!-- Header Controls & Navigation -->
    <div class="row items-center justify-between q-col-gutter-y-sm q-mb-md">
      <!-- Title & View Switcher -->
      <div
        class="col-12 col-md-auto row items-center justify-between justify-md-start q-gutter-x-sm q-gutter-y-xs"
      >
        <q-btn
          outline
          color="primary"
          icon="arrow_back"
          :label="$q.screen.gt.xs ? 'Back to Board' : ''"
          @click="goBackToBoard"
        >
          <q-tooltip>Return to Task Board List</q-tooltip>
        </q-btn>

        <h5 class="text-h6 text-md-h5 q-my-none text-weight-bold">
          Task Management Board
        </h5>

        <q-btn-toggle
          v-model="viewMode"
          toggle-color="primary"
          flat
          dense
          :options="[
            { value: 'board', icon: 'dashboard' },
            { value: 'list', icon: 'format_list_bulleted' }
          ]"
        />
      </div>

      <!-- Actions & Filters -->
      <div
        class="col-12 col-md-auto row items-center justify-end q-gutter-x-sm"
      >
        <q-btn
          color="primary"
          icon="add"
          :label="$q.screen.gt.xs ? 'Add Custom List' : 'Add List'"
          unelevated
          class="col-grow col-sm-auto"
          @click="openAddStageDialog"
        />

        <q-select
          v-model="selectedProjectFilter"
          :options="projectFilterOptions"
          label="Filter by Project"
          dense
          outlined
          bg-color="white"
          class="col-grow col-sm-auto"
          style="min-width: 160px; max-width: 220px"
        />
      </div>
    </div>

    <!-- Active Task Banner -->
    <q-banner
      v-if="activeTaskId"
      class="bg-primary text-white q-mb-md rounded-borders shadow-1"
      dense
    >
      <template #avatar>
        <q-icon name="info" color="white" />
      </template>
      <span>
        Viewing Task: <strong>{{ activeTaskId }}</strong> (Project:
        <strong>{{ activeProjectId }}</strong
        >)
      </span>
      <template #action>
        <q-btn flat color="white" dense label="Clear" @click="goBackToBoard" />
      </template>
    </q-banner>

    <!-- VIEW 1: DYNAMIC KANBAN BOARD WITH RESPONSIVE COLUMNS -->
    <div
      v-if="viewMode === 'board'"
      class="board-scroll-container row no-wrap q-gutter-x-md q-pb-md"
    >
      <div
        v-for="stage in stages"
        :key="stage.name"
        class="board-column col-auto"
      >
        <q-card flat bordered class="bg-grey-2 column-card">
          <!-- Column Header -->
          <q-card-section
            class="row items-center justify-between q-py-sm q-px-md"
          >
            <div class="row items-center q-gutter-x-xs">
              <span class="text-subtitle2 text-bold">{{ stage.name }}</span>
              <q-badge
                :color="stage.color"
                rounded
                :label="getTasksByStage(stage.name).length"
              />
            </div>

            <!-- Options dropdown to remove custom stage -->
            <q-btn
              v-if="stage.isCustom"
              flat
              round
              dense
              icon="more_vert"
              size="sm"
            >
              <q-menu>
                <q-list dense style="min-width: 120px">
                  <q-item
                    clickable
                    v-close-popup
                    @click="removeCustomStage(stage.name)"
                  >
                    <q-item-section class="text-negative"
                      >Delete List</q-item-section
                    >
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-card-section>

          <!-- Cards List inside Column -->
          <q-card-section class="q-pa-xs column-body q-gutter-y-sm">
            <q-card
              v-for="task in getTasksByStage(stage.name)"
              :key="task.id"
              flat
              bordered
              class="bg-white q-pa-sm shadow-1 cursor-pointer task-card"
              :class="{
                'active-task-card': String(task.id) === String(activeTaskId)
              }"
              @click="navigateToTask(task.id)"
            >
              <div class="row items-center justify-between q-mb-xs">
                <span class="text-caption text-weight-bolder text-grey-8">{{
                  task.key
                }}</span>
                <q-chip
                  size="xs"
                  dense
                  :color="getPriorityColor(task.priority)"
                  text-color="white"
                >
                  {{ task.priority }}
                </q-chip>
              </div>

              <div class="text-subtitle2 q-mb-sm text-wrap">{{
                task.title
              }}</div>

              <div
                class="row items-center justify-between text-caption text-grey-7"
              >
                <div class="row items-center q-gutter-x-xs">
                  <q-avatar size="20px" color="primary" text-color="white">
                    {{ task.assignee.charAt(0) }}
                  </q-avatar>
                  <span class="ellipsis max-width-name">{{
                    task.assignee
                  }}</span>
                </div>

                <!-- Move Task Dropdown -->
                <q-btn-dropdown
                  dense
                  flat
                  size="sm"
                  :color="getStageBadgeColor(task.status)"
                  :label="task.status"
                  @click.stop
                >
                  <q-list dense>
                    <q-item
                      v-for="targetStage in stages"
                      :key="targetStage.name"
                      clickable
                      v-close-popup
                      @click="changeTaskStage(task, targetStage)"
                    >
                      <q-item-section>
                        <q-item-label>{{ targetStage.name }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>
            </q-card>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Add New Column Placeholder Button -->
      <div class="col-auto">
        <q-btn
          outline
          color="primary"
          icon="add"
          label="Add Another List"
          class="add-column-btn bg-white"
          @click="openAddStageDialog"
        />
      </div>
    </div>

    <!-- VIEW 2: LIST VIEW (HORIZONTAL SCROLL ON MOBILE) -->
    <div v-else class="table-scroll-wrapper">
      <q-table
        :rows="allTasks"
        :columns="taskColumns"
        row-key="id"
        flat
        bordered
        class="bg-white shadow-1"
        :grid="$q.screen.lt.sm"
      >
        <!-- Mobile Card View Override -->
        <template #item="props">
          <div class="q-pa-xs col-12">
            <q-card flat bordered class="q-pa-sm">
              <div class="row items-center justify-between">
                <q-btn
                  flat
                  dense
                  color="primary"
                  class="text-weight-bold"
                  :label="props.row.key"
                  @click="navigateToTask(props.row.id)"
                />
                <q-chip
                  dense
                  size="sm"
                  :color="getPriorityColor(props.row.priority)"
                  text-color="white"
                >
                  {{ props.row.priority }}
                </q-chip>
              </div>
              <div class="text-subtitle2 q-my-xs">{{ props.row.title }}</div>
              <div
                class="row items-center justify-between text-caption text-grey-7 q-mt-sm"
              >
                <div>Assignee: {{ props.row.assignee }}</div>
                <q-badge :color="getStageBadgeColor(props.row.status)">
                  {{ props.row.status }}
                </q-badge>
              </div>
            </q-card>
          </div>
        </template>

        <!-- Desktop Table Cell Customization -->
        <template #body-cell-key="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              color="primary"
              class="text-weight-bold"
              :label="props.row.key"
              @click="navigateToTask(props.row.id)"
            />
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-select
              v-model="props.row.status"
              :options="stageNames"
              dense
              outlined
              options-dense
              style="min-width: 130px"
              @update:model-value="val => onStatusChange(props.row, val)"
            >
              <template #selected>
                <q-badge :color="getStageBadgeColor(props.row.status)">
                  {{ props.row.status }}
                </q-badge>
              </template>
            </q-select>
          </q-td>
        </template>

        <template #body-cell-priority="props">
          <q-td :props="props">
            <q-chip
              dense
              size="sm"
              :color="getPriorityColor(props.row.priority)"
              text-color="white"
            >
              {{ props.row.priority }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              round
              icon="visibility"
              color="primary"
              @click="navigateToTask(props.row.id)"
            >
              <q-tooltip>View Task Route</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>

  <!-- Custom Add List Modal -->
  <q-dialog v-model="showAddStageModal" persistent>
    <q-card style="width: 90vw; max-width: 400px">
      <q-card-section>
        <div class="text-h6">Create Custom Task List</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="newStageInput"
          dense
          autofocus
          outlined
          placeholder="e.g. Blocked, On Hold, QA Review"
          @keyup.enter="confirmAddStage"
        />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup @click="newStageInput = ''" />
        <q-btn
          color="primary"
          label="Add List"
          unelevated
          @click="confirmAddStage"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify, useQuasar } from 'quasar'
import { api } from '@/boot/axios'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const activeProjectId = computed(() => route.params.projectId || '1')
const activeTaskId = computed(() => route.params.taskId || null)

const viewMode = ref('board')
const selectedProjectFilter = ref('All Projects')

// Modal State
const showAddStageModal = ref(false)
const newStageInput = ref('')

const stages = ref([])
const fetchDate = async () => {
  try {
    const stagesResponse = await api.get('/users/stage/get-stages')
    stages.value = stagesResponse.data.map(item => ({
      value: item.Id,
      name: item.stagesName
    }))
  } catch (error) {
    console.error('Error fetching stages:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to fetch stages from the server'
    })
  }
}

onMounted(() => {
  fetchDate()
})

const stageNames = computed(() => stages.value.map(s => s.name))

const projectFilterOptions = [
  'All Projects',
  'NextGen Web App',
  'Spring Boot Migration'
]

const tasks = ref([])

const taskColumns = [
  { name: 'key', label: 'Key', field: 'key', align: 'left', sortable: true },
  {
    name: 'title',
    label: 'Summary',
    field: 'title',
    align: 'left',
    sortable: true
  },
  { name: 'project', label: 'Project', field: 'project', align: 'left' },
  { name: 'assignee', label: 'Assignee', field: 'assignee', align: 'left' },
  { name: 'priority', label: 'Priority', field: 'priority', align: 'center' },
  { name: 'status', label: 'Stage / Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Action', field: 'actions', align: 'center' }
]

const openAddStageDialog = () => {
  newStageInput.value = ''
  showAddStageModal.value = true
}

const confirmAddStage = async () => {
  const trimmedName = newStageInput.value.trim()

  if (!trimmedName) {
    Notify.create({ type: 'warning', message: 'Please enter a list name' })
    return
  }

  if (
    stages.value.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())
  ) {
    Notify.create({
      type: 'warning',
      message: 'This stage list already exists'
    })
    return
  }

  stages.value.splice(stages.value.length - 1, 0, {
    name: trimmedName,
    color: 'teal',
    isCustom: true
  })
  await api.post('/users/stage/create', {
    stagesName: newStageInput.value.trim(),
    types: true
  })
  Notify.create({
    type: 'positive',
    message: `Custom list "${trimmedName}" added successfully`
  })

  showAddStageModal.value = false
  newStageInput.value = ''
}

const removeCustomStage = stageName => {
  const tasksInStage = tasks.value.filter(t => t.status === stageName)
  if (tasksInStage.length > 0) {
    Notify.create({
      type: 'negative',
      message: `Cannot delete "${stageName}" while it contains tasks. Move tasks first.`
    })
    return
  }

  stages.value = stages.value.filter(s => s.name !== stageName)
  Notify.create({ type: 'info', message: `Custom list "${stageName}" removed` })
}

const navigateToTask = taskId => {
  const pId = activeProjectId.value || '1'
  router.push(`/project/${pId}/view/tasks/${taskId}`)
}

const goBackToBoard = () => {
  //router.push(`/project/${activeProjectId.value}/view/tasks`)
  router.push(`/projects`)
}

const allTasks = computed(() => {
  if (selectedProjectFilter.value === 'All Projects') return tasks.value
  return tasks.value.filter(t => t.project === selectedProjectFilter.value)
})

const getTasksByStage = stageName => {
  return allTasks.value.filter(t => t.status === stageName)
}

const changeTaskStage = async (task, newStage) => {
  const oldStage = task.status

  await api.patch(`/users/tasks/change-stage/${task.id}`, {
    Id: newStage.value
  })
  task.status = newStage.name
  Notify.create({
    type: 'positive',
    message: `${task.key} moved from "${oldStage}" to "${newStage.name}"`
  })
}

const onStatusChange = (task, newStage) => {
  Notify.create({
    type: 'positive',
    message: `Updated ${task.key} status to ${newStage}`
  })
}

const getStageBadgeColor = stageName => {
  const match = stages.value.find(s => s.name === stageName)
  return match ? match.color : 'grey'
}

const getPriorityColor = priority => {
  switch (priority) {
    case 'Highest':
      return 'negative'
    case 'High':
      return 'deep-orange'
    case 'Medium':
      return 'warning'
    case 'Low':
      return 'info'
    default:
      return 'grey'
  }
}

const fetchTasksFromAPI = async () => {
  try {
    const response = await api.get('/users/tasks/assign-to')

    // Check if the response is an array or wrapped object
    const rawData = Array.isArray(response.data)
      ? response.data
      : response.data.tasks || response.data.content || [response.data]

    // Map fields dynamically based on your exact JSON structure
    tasks.value = rawData.map(task => {
      const projectKey = task.projects?.projectKey || 'TASK'
      const taskId = task.Id || task.id

      return {
        id: taskId,
        key: `${projectKey}-${taskId}`, // Generates 'BPS-1'
        project: task.projects?.projectName || 'N/A', // Extracts 'BPSC'
        title: task.Summary || task.description || 'No Summary', // Extracts 'test'
        assignee:
          task.assignTo?.username || // Extracts 'newadmin'
          `${task.assignTo?.firstName || ''} ${task.assignTo?.lastName || ''}`.trim() ||
          'Unassigned',
        priority: task.priority?.priority || 'Medium', // Extracts 'Highest'
        status: task.stages?.stagesName || 'To Do', // Extracts 'In Progress'

        // Optional extra fields if needed in your UI
        description: task.description,
        dueDate: task.dueDate,
        environment: task.environment,
        components: task.components,
        storyPoint: task.storyPoint
      }
    })
  } catch (error) {
    console.error('Fetch tasks error:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to fetch tasks from the server'
    })
  }
}

onMounted(() => {
  fetchTasksFromAPI()
})
</script>

<style scoped>
.min-height-screen {
  min-height: 100vh;
}

/* Scrollable Container for Kanban Board */
.board-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  min-height: calc(100vh - 200px);
  -webkit-overflow-scrolling: touch;
}

/* Responsive Column Widths */
.board-column {
  width: 82vw;
  max-width: 300px;
}

@media (min-width: 600px) {
  .board-column {
    width: 280px;
  }
}

.column-card {
  height: 100%;
  border-radius: 8px;
}

.column-body {
  min-height: 350px;
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.add-column-btn {
  height: 100px;
  width: 200px;
  border-style: dashed;
}

.task-card {
  transition: all 0.2s ease;
  border-radius: 6px;
}

.task-card:hover {
  border-color: #1976d2;
}

.active-task-card {
  border: 2px solid #1976d2 !important;
  background-color: #e3f2fd !important;
}

.max-width-name {
  max-width: 90px;
}

.table-scroll-wrapper {
  overflow-x: auto;
}
</style>
