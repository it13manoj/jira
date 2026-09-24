<template>
  <q-page class="q-pa-lg bg-slate-900 text-white min-h-screen">
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-bold q-ma-none text-white">
          Dashboard Overview
        </h1>
        <p class="text-caption text-grey-4 q-mb-none">
          Welcome back! Here is what's happening today.
        </p>
      </div>
      <div>
        <q-btn
          color="primary"
          icon="add"
          label="Projects"
          to="/projects"
          unelevated
          class="rounded-btn"
          no-caps
        />
      </div>
    </div>

    <!-- 5 Overview Stat Cards -->
    <div class="row q-col-gutter-md q-mb-xl">
      <!-- 1. Users Card -->
      <div class="col-12 col-sm-6 col-md-4 col-lg-2-4">
        <q-card class="stat-card bg-slate-800 text-white border-glass">
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <span class="text-caption text-weight-medium text-grey-4"
                >Total Users</span
              >
              <q-avatar size="36px" class="bg-blue-500-10 text-blue-4">
                <q-icon name="people" size="20px" />
              </q-avatar>
            </div>
            <div class="text-h5 text-weight-bold q-mb-xs">2,845</div>
            <div class="row items-center text-caption text-positive">
              <q-icon name="arrow_upward" size="14px" class="q-mr-xs" />
              <span>+12.5% this month</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 2. Projects Card -->
      <div class="col-12 col-sm-6 col-md-4 col-lg-2-4">
        <q-card class="stat-card bg-slate-800 text-white border-glass">
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <span class="text-caption text-weight-medium text-grey-4"
                >Active Projects</span
              >
              <q-avatar size="36px" class="bg-purple-500-10 text-purple-4">
                <q-icon name="assignment" size="20px" />
              </q-avatar>
            </div>
            <div class="text-h5 text-weight-bold q-mb-xs">148</div>
            <div class="row items-center text-caption text-positive">
              <q-icon name="arrow_upward" size="14px" class="q-mr-xs" />
              <span>8 ongoing sprint</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 3. Reports Card -->
      <div class="col-12 col-sm-6 col-md-4 col-lg-2-4">
        <q-card class="stat-card bg-slate-800 text-white border-glass">
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <span class="text-caption text-weight-medium text-grey-4"
                >Generated Reports</span
              >
              <q-avatar size="36px" class="bg-teal-500-10 text-teal-4">
                <q-icon name="bar_chart" size="20px" />
              </q-avatar>
            </div>
            <div class="text-h5 text-weight-bold q-mb-xs">1,204</div>
            <div class="row items-center text-caption text-grey-4">
              <q-icon name="schedule" size="14px" class="q-mr-xs" />
              <span>Updated 2h ago</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 4. Clients Card -->
      <div class="col-12 col-sm-6 col-md-4 col-lg-2-4">
        <q-card class="stat-card bg-slate-800 text-white border-glass">
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <span class="text-caption text-weight-medium text-grey-4"
                >Active Clients</span
              >
              <q-avatar size="36px" class="bg-amber-500-10 text-amber-4">
                <q-icon name="business_center" size="20px" />
              </q-avatar>
            </div>
            <div class="text-h5 text-weight-bold q-mb-xs">96</div>
            <div class="row items-center text-caption text-positive">
              <q-icon name="arrow_upward" size="14px" class="q-mr-xs" />
              <span>+4 new clients</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 5. Teams Card -->
      <div class="col-12 col-sm-6 col-md-4 col-lg-2-4">
        <q-card class="stat-card bg-slate-800 text-white border-glass">
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <span class="text-caption text-weight-medium text-grey-4"
                >Total Teams</span
              >
              <q-avatar size="36px" class="bg-indigo-500-10 text-indigo-4">
                <q-icon name="groups" size="20px" />
              </q-avatar>
            </div>
            <div class="text-h5 text-weight-bold q-mb-xs">18</div>
            <div class="row items-center text-caption text-grey-4">
              <q-icon name="person" size="14px" class="q-mr-xs" />
              <span>Avg 12 members</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Secondary Dashboard Content -->
    <div class="row q-col-gutter-lg">
      <!-- Recent Activity Table -->
      <div class="col-12 col-lg-8">
        <q-card
          class="bg-slate-800 text-white border-glass rounded-card full-height"
        >
          <q-card-section class="row items-center justify-between">
            <div class="text-h6 text-weight-bold">Recent Projects Overview</div>
            <q-btn flat round dense icon="more_vert" color="grey-4" />
          </q-card-section>

          <q-table
            flat
            dark
            dense
            :rows="projects"
            :columns="columns"
            row-key="id"
            class="bg-transparent text-grey-3"
            :pagination="{ rowsPerPage: 5 }"
          >
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  size="sm"
                  :color="
                    props.row.status === 'Completed' ? 'positive' : 'warning'
                  "
                  text-color="white"
                  dense
                >
                  {{ props.row.status }}
                </q-chip>
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>

      <!-- Working Quick Actions Panel -->
      <div class="col-12 col-lg-4">
        <q-card
          class="bg-slate-800 text-white border-glass rounded-card full-height"
        >
          <q-card-section class="q-pa-md">
            <div class="text-h6 text-weight-bold q-mb-md">Quick Actions</div>

            <div class="column q-gutter-y-md">
              <q-btn
                outline
                color="white"
                icon="person_add"
                label="Add New User"
                class="full-width action-btn"
                no-caps
                @click="openQuickAction('add-user')"
              />
              <q-btn
                outline
                color="white"
                icon="create_new_folder"
                label="Create Project"
                class="full-width action-btn"
                no-caps
                @click="openQuickAction('create-project')"
              />
              <q-btn
                outline
                color="white"
                icon="group_add"
                label="Create Team"
                class="full-width action-btn"
                no-caps
                @click="openQuickAction('create-team')"
              />
              <q-btn
                outline
                color="white"
                icon="download"
                label="Export Monthly Report"
                class="full-width action-btn"
                no-caps
                @click="openQuickAction('export-report')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- QUICK ACTION MODAL DIALOG -->
    <q-dialog v-model="actionModalOpen" persistent>
      <q-card class="bg-slate-800 text-white border-glass style-modal">
        <!-- Action 1: Add User -->
        <template v-if="activeAction === 'add-user'">
          <q-card-section
            class="row items-center justify-between border-bottom"
          >
            <div class="text-h6 row items-center q-gutter-x-sm">
              <q-icon name="person_add" color="primary" />
              <span>Add New User</span>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section>
            <q-form
              @submit.prevent="submitAction('User added successfully')"
              class="q-gutter-y-sm"
            >
              <q-input
                dark
                v-model="userForm.name"
                label="Full Name *"
                outlined
                dense
                :rules="[val => !!val || 'Required']"
              />
              <q-input
                dark
                v-model="userForm.email"
                label="Email *"
                type="email"
                outlined
                dense
                :rules="[val => !!val || 'Required']"
              />
              <div class="row justify-end q-gutter-x-sm q-mt-md">
                <q-btn flat label="Cancel" color="grey-5" v-close-popup />
                <q-btn
                  type="submit"
                  label="Save User"
                  color="primary"
                  unelevated
                />
              </div>
            </q-form>
          </q-card-section>
        </template>

        <!-- Action 2: Create Project -->
        <template v-if="activeAction === 'create-project'">
          <q-card-section
            class="row items-center justify-between border-bottom"
          >
            <div class="text-h6 row items-center q-gutter-x-sm">
              <q-icon name="create_new_folder" color="purple-4" />
              <span>Create Project</span>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section>
            <q-form
              @submit.prevent="submitAction('Project created successfully')"
              class="q-gutter-y-sm"
            >
              <q-input
                dark
                v-model="projectForm.name"
                label="Project Name *"
                outlined
                dense
                :rules="[val => !!val || 'Required']"
              />
              <q-input
                dark
                v-model="projectForm.client"
                label="Client Name"
                outlined
                dense
              />
              <div class="row justify-end q-gutter-x-sm q-mt-md">
                <q-btn flat label="Cancel" color="grey-5" v-close-popup />
                <q-btn
                  type="submit"
                  label="Create Project"
                  color="purple"
                  unelevated
                />
              </div>
            </q-form>
          </q-card-section>
        </template>

        <!-- Action 3: Create Team -->
        <template v-if="activeAction === 'create-team'">
          <q-card-section
            class="row items-center justify-between border-bottom"
          >
            <div class="text-h6 row items-center q-gutter-x-sm">
              <q-icon name="group_add" color="indigo-4" />
              <span>Create Team</span>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section>
            <q-form
              @submit.prevent="submitAction('Team created successfully')"
              class="q-gutter-y-sm"
            >
              <q-input
                dark
                v-model="teamForm.name"
                label="Team Name *"
                outlined
                dense
                :rules="[val => !!val || 'Required']"
              />
              <div class="row justify-end q-gutter-x-sm q-mt-md">
                <q-btn flat label="Cancel" color="grey-5" v-close-popup />
                <q-btn
                  type="submit"
                  label="Create Team"
                  color="indigo"
                  unelevated
                />
              </div>
            </q-form>
          </q-card-section>
        </template>

        <!-- Action 4: Export Report -->
        <template v-if="activeAction === 'export-report'">
          <q-card-section
            class="row items-center justify-between border-bottom"
          >
            <div class="text-h6 row items-center q-gutter-x-sm">
              <q-icon name="download" color="teal-4" />
              <span>Export Monthly Report</span>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section>
            <q-form
              @submit.prevent="submitAction('Report download started')"
              class="q-gutter-y-sm"
            >
              <q-select
                dark
                v-model="reportForm.format"
                :options="['PDF Document (.pdf)', 'Excel Spreadsheet (.xlsx)']"
                label="Format"
                outlined
                dense
              />
              <div class="row justify-end q-gutter-x-sm q-mt-md">
                <q-btn flat label="Cancel" color="grey-5" v-close-popup />
                <q-btn type="submit" label="Export" color="teal" unelevated />
              </div>
            </q-form>
          </q-card-section>
        </template>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { Notify } from 'quasar'

// Quick Actions State
const actionModalOpen = ref(false)
const activeAction = ref(null)

const userForm = ref({ name: '', email: '' })
const projectForm = ref({ name: '', client: '' })
const teamForm = ref({ name: '' })
const reportForm = ref({ format: 'PDF Document (.pdf)' })

const openQuickAction = key => {
  activeAction.value = key
  actionModalOpen.value = true
}

const submitAction = msg => {
  actionModalOpen.value = false
  Notify.create({ type: 'positive', message: msg, position: 'top' })
}

const columns = [
  {
    name: 'name',
    label: 'Project Name',
    field: 'name',
    align: 'left',
    sortable: true
  },
  { name: 'client', label: 'Client', field: 'client', align: 'left' },
  { name: 'team', label: 'Assigned Team', field: 'team', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' }
]

const projects = ref([
  {
    id: 1,
    name: 'Spring Boot Migration',
    client: 'Acme Corp',
    team: 'Backend Core',
    status: 'In Progress'
  },
  {
    id: 2,
    name: 'Quasar Dashboard UI',
    client: 'TechStart Inc',
    team: 'Frontend UI',
    status: 'Completed'
  },
  {
    id: 3,
    name: 'Security Audit & RBAC',
    client: 'Global Finance',
    team: 'DevOps',
    status: 'In Progress'
  },
  {
    id: 4,
    name: 'Mobile API Integration',
    client: 'Retail Plus',
    team: 'Backend Core',
    status: 'Completed'
  },
  {
    id: 5,
    name: 'Cloud Infrastructure Setup',
    client: 'Nexus Tech',
    team: 'DevOps',
    status: 'In Progress'
  }
])
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
  border-radius: 12px;
}
.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.rounded-btn {
  border-radius: 8px;
}
.rounded-card {
  border-radius: 12px;
}

.action-btn {
  min-height: 48px;
  height: auto;
  border-color: rgba(255, 255, 255, 0.2);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 8px 16px;
}
.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.style-modal {
  width: 100%;
  min-width: 320px;
  max-width: 480px;
}

.bg-blue-500-10 {
  background: rgba(59, 130, 246, 0.15);
}
.bg-purple-500-10 {
  background: rgba(168, 85, 247, 0.15);
}
.bg-teal-500-10 {
  background: rgba(20, 184, 166, 0.15);
}
.bg-amber-500-10 {
  background: rgba(245, 158, 11, 0.15);
}
.bg-indigo-500-10 {
  background: rgba(99, 102, 241, 0.15);
}

@media (min-width: 1200px) {
  .col-lg-2-4 {
    width: 20%;
    flex: 0 0 20%;
  }
}
</style>
