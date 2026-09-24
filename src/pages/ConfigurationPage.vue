<template>
  <q-page class="q-pa-md dark-page-bg">
    <!-- Header Section -->
    <div class="q-mb-md">
      <h5 class="text-h5 text-weight-bold q-my-none text-slate-100"
        >System Configurations</h5
      >
      <p class="text-caption text-slate-400">
        Manage roles, permissions, workflow stages, priority levels, and user
        password resets.
      </p>
    </div>

    <!-- Main Card Shell -->
    <q-card flat class="dark-card-surface shadow-2">
      <!-- Top Navigation Tabs -->
      <q-tabs
        v-model="activeTab"
        dense
        class="dark-tabs"
        active-color="primary-accent"
        indicator-color="primary-accent"
        align="left"
        narrow-indicator
      >
        <q-tab name="permissions" icon="lock_open" label="Permissions" />
        <q-tab name="stages" icon="linear_scale" label="Stages" />
        <q-tab name="priority" icon="low_priority" label="Priority" />
        <q-tab name="reset-password" icon="lock_reset" label="Reset Password" />
      </q-tabs>

      <q-separator color="slate-border" />

      <!-- Tab Content Panels -->
      <q-tab-panels v-model="activeTab" animated class="q-pa-md dark-panels">
        <!-- 1. ROLES TAB -->

        <!-- 2. PERMISSIONS TAB -->
        <q-tab-panel name="permissions">
          <div class="row justify-between items-center q-mb-md">
            <div class="text-h6 text-weight-medium text-slate-100"
              >Permission Rules</div
            >
            <q-btn
              class="btn-primary-gradient"
              icon="add"
              label="Add Permission"
              unelevated
              @click="openPermissionDialog()"
            />
          </div>

          <q-table
            flat
            class="dark-table"
            :rows="permissions"
            :columns="permissionColumns"
            row-key="id"
          >
            <template #body-cell-actions="props">
              <q-td :props="props" class="q-gutter-xs">
                <q-btn
                  flat
                  round
                  size="sm"
                  icon="edit"
                  class="action-btn-edit"
                  @click="openPermissionDialog(props.row)"
                />
                <q-btn
                  flat
                  round
                  size="sm"
                  icon="delete"
                  color="negative"
                  @click="deleteItem('permission', props.row)"
                />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- 3. STAGES TAB -->
        <q-tab-panel name="stages">
          <div class="row justify-between items-center q-mb-md">
            <div class="text-h6 text-weight-medium text-slate-100"
              >Workflow Stages</div
            >
            <q-btn
              class="btn-primary-gradient"
              icon="add"
              label="Add Stage"
              unelevated
              @click="openStageDialog()"
            />
          </div>

          <q-table
            flat
            class="dark-table"
            :rows="stages"
            :columns="stageColumns"
            row-key="id"
          >
            <template #body-cell-color="props">
              <q-td :props="props">
                <q-chip
                  dense
                  class="text-weight-bold"
                  :style="{ backgroundColor: props.row.color, color: '#fff' }"
                >
                  {{ props.row.color }}
                </q-chip>
              </q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td :props="props" class="q-gutter-xs">
                <q-btn
                  flat
                  round
                  size="sm"
                  icon="edit"
                  class="action-btn-edit"
                  @click="openStageDialog(props.row)"
                />
                <q-btn
                  flat
                  round
                  size="sm"
                  icon="delete"
                  color="negative"
                  @click="deleteItem('stage', props.row)"
                />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- 4. PRIORITY TAB -->
        <q-tab-panel name="priority">
          <div class="row justify-between items-center q-mb-md">
            <div class="text-h6 text-weight-medium text-slate-100"
              >Priority Levels</div
            >
            <q-btn
              class="btn-primary-gradient"
              icon="add"
              label="Add Priority"
              unelevated
              @click="openPriorityDialog()"
            />
          </div>

          <q-table
            flat
            class="dark-table"
            :rows="priorities"
            :columns="priorityColumns"
            row-key="id"
          >
            <template #body-cell-badge="props">
              <q-td :props="props">
                <q-chip
                  dense
                  :color="props.row.color"
                  text-color="white"
                  class="text-weight-medium"
                >
                  {{ props.row.name }}
                </q-chip>
              </q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td :props="props" class="q-gutter-xs">
                <q-btn
                  flat
                  round
                  size="sm"
                  icon="edit"
                  class="action-btn-edit"
                  @click="openPriorityDialog(props.row)"
                />
                <q-btn
                  flat
                  round
                  size="sm"
                  icon="delete"
                  color="negative"
                  @click="deleteItem('priority', props.row)"
                />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- 5. RESET PASSWORD TAB -->
        <q-tab-panel name="reset-password">
          <div class="row justify-between items-center q-mb-md">
            <div>
              <div class="text-h6 text-weight-medium text-slate-100"
                >Admin Reset Password</div
              >
              <div class="text-caption text-slate-400">
                Trigger a forced password reset or issue temporary access for
                users.
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <!-- Reset Form Card -->
            <div class="col-12 col-md-5">
              <q-card flat class="dark-inner-card q-pa-md">
                <div
                  class="text-subtitle1 text-weight-bold text-slate-100 q-mb-md"
                >
                  Issue Password Reset
                </div>
                <q-form @submit="handleResetPassword" class="q-gutter-md">
                  <q-select
                    v-model="resetForm.selectedUser"
                    :options="userOptions"
                    label="Select Target User *"
                    outlined
                    dense
                    dark
                    emit-value
                    map-options
                    lazy-rules
                    class="dark-input"
                    :rules="[val => !!val || 'Please select a user']"
                  />

                  <q-input
                    v-model="resetForm.newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    label="New Temporary Password *"
                    outlined
                    dense
                    dark
                    lazy-rules
                    class="dark-input"
                    :rules="[
                      val => !!val || 'Password is required',
                      val => val.length >= 6 || 'Min 6 characters'
                    ]"
                  >
                    <template #append>
                      <q-icon
                        :name="
                          showNewPassword ? 'visibility_off' : 'visibility'
                        "
                        class="cursor-pointer text-slate-400"
                        @click="showNewPassword = !showNewPassword"
                      />
                    </template>
                  </q-input>

                  <q-checkbox
                    v-model="resetForm.requireChangeOnLogin"
                    label="Force user to change password on next login"
                    dark
                    class="text-slate-300"
                  />

                  <div class="row justify-end q-mt-md">
                    <q-btn
                      label="Reset Password"
                      type="submit"
                      color="negative"
                      icon="lock_reset"
                      unelevated
                      :loading="resetLoading"
                    />
                  </div>
                </q-form>
              </q-card>
            </div>

            <!-- Recent Reset Audit Trail -->
            <div class="col-12 col-md-7">
              <q-card flat class="dark-inner-card q-pa-md">
                <div
                  class="text-subtitle1 text-weight-bold text-slate-100 q-mb-sm"
                >
                  Recent Reset History
                </div>
                <q-table
                  flat
                  dense
                  class="dark-table"
                  :rows="resetHistory"
                  :columns="resetColumns"
                  row-key="id"
                  :pagination="{ rowsPerPage: 5 }"
                >
                  <template #body-cell-status="props">
                    <q-td :props="props">
                      <q-chip
                        dense
                        size="sm"
                        :color="
                          props.row.status === 'Completed'
                            ? 'positive'
                            : 'warning'
                        "
                        text-color="white"
                        class="text-weight-medium"
                      >
                        {{ props.row.status }}
                      </q-chip>
                    </q-td>
                  </template>
                </q-table>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Dialog for CRUD operations -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dark-inner-card" style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-slate-100"
            >{{ isEdit ? 'Edit' : 'Add' }} {{ currentType }}</div
          >
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            class="text-slate-400"
            v-close-popup
          />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveForm" class="q-gutter-md">
            <q-input
              v-model="formData.name"
              label="Name *"
              outlined
              dense
              dark
              class="dark-input"
              lazy-rules
              :rules="[val => !!val || 'Field is required']"
            />

            <q-input
              v-if="currentType !== 'priority'"
              v-model="formData.description"
              label="Description"
              outlined
              dense
              dark
              type="textarea"
              rows="2"
              class="dark-input"
            />

            <q-select
              v-if="currentType === 'priority'"
              v-model="formData.color"
              :options="['negative', 'warning', 'positive', 'info', 'grey']"
              label="Color Tag"
              outlined
              dense
              dark
              class="dark-input"
            />

            <q-input
              v-if="currentType === 'stage'"
              v-model="formData.order"
              type="number"
              label="Sequence Order"
              outlined
              dense
              dark
              class="dark-input"
            />
            <q-select
              v-if="currentType === 'Stage'"
              v-model="formData.booleanValue"
              :options="[
                { label: 'True', value: true },
                { label: 'False', value: false }
              ]"
              emit-value
              map-options
              label="Boolean Value"
              outlined
              dense
              dark
              class="dark-input"
            />

            <div class="row justify-end q-mt-md">
              <q-btn
                label="Cancel"
                flat
                class="text-slate-400 q-mr-sm"
                v-close-popup
              />
              <q-btn
                label="Save"
                type="submit"
                class="btn-primary-gradient"
                unelevated
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Notify, Dialog } from 'quasar'
import { api } from '@/boot/axios'

// State variables
const activeTab = ref('permissions')
const showDialog = ref(false)
const isEdit = ref(false)
const currentType = ref('')
const formData = ref({
  name: '',
  description: '',
  color: 'info',
  order: 1,
  booleanValue: true
})

// Reset Password Tab States
const resetLoading = ref(false)
const showNewPassword = ref(false)
const resetForm = ref({
  selectedUser: null,
  newPassword: '',
  requireChangeOnLogin: true
})

const userOptions = [
  { label: 'admin (admin@example.com)', value: 1 },
  { label: 'John Doe (john@example.com)', value: 2 },
  { label: 'Sarah Smith (sarah@example.com)', value: 3 },
  { label: 'Alex Johnson (alex@example.com)', value: 4 }
]

const resetHistory = ref([
  {
    id: 101,
    username: 'John Doe',
    resetBy: 'admin',
    date: '2026-03-01 10:15',
    status: 'Completed'
  },
  {
    id: 102,
    username: 'Sarah Smith',
    resetBy: 'admin',
    date: '2026-03-02 14:40',
    status: 'Pending Login'
  }
])

const resetColumns = [
  {
    name: 'username',
    label: 'User',
    field: 'username',
    align: 'left',
    sortable: true
  },
  { name: 'resetBy', label: 'Reset By', field: 'resetBy', align: 'left' },
  {
    name: 'date',
    label: 'Date/Time',
    field: 'date',
    align: 'left',
    sortable: true
  },
  { name: 'status', label: 'Status', field: 'status', align: 'center' }
]

// Handlers for Reset Password
const handleResetPassword = () => {
  resetLoading.value = true

  setTimeout(() => {
    const userObj = userOptions.find(
      u => u.value === resetForm.value.selectedUser
    )

    resetHistory.value.unshift({
      id: Date.now(),
      username: userObj ? userObj.label.split(' ')[0] : 'User',
      resetBy: 'admin',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending Login'
    })

    Notify.create({
      type: 'positive',
      message: `Password reset successfully for selected user.`
    })

    resetForm.value = {
      selectedUser: null,
      newPassword: '',
      requireChangeOnLogin: true
    }
    resetLoading.value = false
  }, 800)
}

const permissions = ref([
  {
    id: 1,
    name: 'PROJECT_CREATE',
    description: 'Permission to create new projects'
  },
  {
    id: 2,
    name: 'USER_DELETE',
    description: 'Permission to delete user accounts'
  },
  { id: 3, name: 'TICKET_UPDATE', description: 'Permission to edit tickets' }
])

const stages = ref([
  { id: 1, name: 'Backlog', color: '#475569', order: 1 },
  { id: 2, name: 'In Progress', color: '#0288D1', order: 2 },
  { id: 3, name: 'In Review', color: '#ED6C02', order: 3 },
  { id: 4, name: 'Completed', color: '#2E7D32', order: 4 }
])

const priorities = ref([
  { id: 1, name: 'Highest', color: 'negative', level: 1 },
  { id: 2, name: 'High', color: 'warning', level: 2 },
  { id: 3, name: 'Medium', color: 'info', level: 3 },
  { id: 4, name: 'Low', color: 'grey-7', level: 4 }
])

// Table Columns Definitions
const roleColumns = [
  {
    name: 'name',
    label: 'Role Name',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'description',
    label: 'Description',
    field: 'description',
    align: 'left'
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]

const permissionColumns = [
  {
    name: 'name',
    label: 'Permission Key',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'description',
    label: 'Description',
    field: 'description',
    align: 'left'
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]

const stageColumns = [
  {
    name: 'order',
    label: 'Order',
    field: 'order',
    align: 'left',
    sortable: true
  },
  {
    name: 'name',
    label: 'Stage Name',
    field: 'name',
    align: 'left',
    sortable: true
  },
  { name: 'color', label: 'Color', field: 'color', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]

const priorityColumns = [
  {
    name: 'name',
    label: 'Priority Name',
    field: 'name',
    align: 'left',
    sortable: true
  },
  { name: 'badge', label: 'Badge Preview', field: 'badge', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]

const openPermissionDialog = (row = null) => openForm('Permission', row)
const openStageDialog = (row = null) => openForm('Stage', row)
const openPriorityDialog = (row = null) => openForm('Priority', row)

const openForm = (type, row) => {
  currentType.value = type
  isEdit.value = !!row
  formData.value = row
    ? { ...row }
    : { name: '', description: '', color: 'info', order: 1 }
  showDialog.value = true
}

const saveForm = async () => {
  if (currentType.value == 'Permission') {
    await api.post('/users/permission/create', {
      permissions: formData.value.name
    })
  } else if (currentType.value == 'Stage') {
    await api.post('/users/stage/create', {
      stagesName: formData.value.name,
      types: formData.value.booleanValue
    })
  } else if (currentType.value == 'Priority') {
    await api.post('/users/priority/create', { priority: formData.value.name })
  }
  fetchDate()
  console.log(currentType.value, formData.value.name)
  Notify.create({
    type: 'positive',
    message: `${currentType.value} ${isEdit.value ? 'updated' : 'created'} successfully.`
  })
  showDialog.value = false
}

const fetchDate = async () => {
  try {
    const response = await api.get('/users/permission/find')
    permissions.value = response.data.map(item => ({
      id: item.Id,
      name: item.permissions,
      description: item.description || 'No description'
    }))
    permissions.value = permissions.value.sort((a, b) =>
      a.name.localeCompare(b.name)
    )

    const stagesResponse = await api.get('/users/stage/find')
    stages.value = stagesResponse.data.map(item => ({
      id: item.Id,
      name: item.stagesName,
      color: item.color || '#0288D1',
      order: item.order || 1
    }))

    stages.value = stages.value.sort((a, b) => a.order - b.order)

    const prioritiesResponse = await api.get('/users/priority/find')
    priorities.value = prioritiesResponse.data.map(item => ({
      id: item.Id,
      name: item.priority,
      color: item.color || 'info',
      level: item.level || 3
    }))
    priorities.value = priorities.value.sort((a, b) => a.level - b.level)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(async () => {
  await fetchDate()
})

const deleteItem = (type, row) => {
  Dialog.create({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete "${row.name}"?`,
    cancel: true,
    persistent: true,
    dark: true
  }).onOk(() => {
    Notify.create({
      type: 'info',
      message: `${type.toUpperCase()} removed.`
    })
  })
}
</script>

<style scoped>
/* Color Palette Variables */
.dark-page-bg {
  background-color: #0b0f17;
  color: #f8fafc;
  min-height: 100vh;
}

.text-slate-100 {
  color: #f8fafc;
}
.text-slate-300 {
  color: #cbd5e1;
}
.text-slate-400 {
  color: #94a3b8;
}

/* Structural Dark Containers */
.dark-card-surface {
  background-color: #121824;
  border: 1px solid #1e293b;
  border-radius: 12px;
}

.dark-inner-card {
  background-color: #182232;
  border: 1px solid #1e293b;
  border-radius: 8px;
}

/* Tabs Styling */
.dark-tabs {
  background-color: #0f172a;
  color: #94a3b8;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

:deep(.q-tab--active) {
  color: #60a5fa !important;
}

:deep(.q-tab__indicator) {
  background: #3b82f6 !important;
  height: 3px;
}

.dark-panels {
  background-color: #121824;
}

/* Quasar Tables Dark Customization */
.dark-table {
  background-color: transparent !important;
  color: #e2e8f0 !important;
}

:deep(.dark-table thead tr th) {
  background-color: #0f172a;
  color: #94a3b8;
  font-weight: 600;
  border-bottom: 1px solid #1e293b;
}

:deep(.dark-table tbody tr td) {
  border-bottom: 1px solid #1e293b;
}

:deep(.dark-table tbody tr:hover) {
  background-color: #1e293b !important;
}

/* Buttons and Controls */
.btn-primary-gradient {
  background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.action-btn-edit {
  color: #60a5fa !important;
}

.action-btn-edit:hover {
  background-color: rgba(96, 165, 250, 0.1);
}

/* Dark Input Overrides */
.dark-input :deep(.q-field__control) {
  background-color: #0f172a !important;
  border-color: #334155;
}

.dark-input :deep(.q-field__control:hover) {
  border-color: #475569;
}
</style>
