<template>
  <div class="q-pa-md row justify-center bg-grey-10 min-height-screen">
    <!-- QUICK ACTIONS CONTAINER CARD -->
    <q-card
      flat
      bordered
      class="bg-dark text-white rounded-borders quick-actions-card col-12 col-sm-8 col-md-5 col-lg-4"
    >
      <q-card-section>
        <div class="text-h6 text-weight-bold q-mb-md">Quick Actions</div>

        <div class="column q-gutter-y-sm">
          <!-- 1. Add New User -->
          <q-btn
            outline
            color="white"
            icon="person_add"
            label="Add New User"
            class="full-width action-btn text-capitalize"
            @click="openModal('add-user')"
          />

          <!-- 2. Create Project -->
          <q-btn
            outline
            color="white"
            icon="create_new_folder"
            label="Create Project"
            class="full-width action-btn text-capitalize"
            @click="openModal('create-project')"
          />

          <!-- 3. Create Team -->
          <q-btn
            outline
            color="white"
            icon="group_add"
            label="Create Team"
            class="full-width action-btn text-capitalize"
            @click="openModal('create-team')"
          />

          <!-- 4. Export Monthly Report -->
          <q-btn
            outline
            color="white"
            icon="file_download"
            label="Export Monthly Report"
            class="full-width action-btn text-capitalize"
            @click="openModal('export-report')"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- DYNAMIC MODAL / PAGE DIALOG -->
    <q-dialog v-model="dialogOpen" persistent max-width="500px">
      <q-card class="bg-dark text-white responsive-modal">
        <!-- ================= 1. ADD NEW USER PAGE ================= -->
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

          <q-card-section class="q-pa-md">
            <q-form
              @submit.prevent="handleSave('User added successfully')"
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
                label="Email Address *"
                type="email"
                outlined
                dense
                :rules="[val => !!val || 'Required']"
              />
              <q-select
                dark
                v-model="userForm.role"
                :options="['Admin', 'Manager', 'Developer', 'Designer']"
                label="User Role"
                outlined
                dense
              />

              <div class="row justify-end q-gutter-x-sm q-mt-md">
                <q-btn flat label="Cancel" color="grey-5" v-close-popup />
                <q-btn
                  type="submit"
                  label="Add User"
                  color="primary"
                  unelevated
                />
              </div>
            </q-form>
          </q-card-section>
        </template>

        <!-- ================= 2. CREATE PROJECT PAGE ================= -->
        <template v-if="activeAction === 'create-project'">
          <q-card-section
            class="row items-center justify-between border-bottom"
          >
            <div class="text-h6 row items-center q-gutter-x-sm">
              <q-icon name="create_new_folder" color="amber-7" />
              <span>Create Project</span>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-pa-md">
            <q-form
              @submit.prevent="handleSave('Project created successfully')"
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
                v-model="projectForm.description"
                label="Description"
                type="textarea"
                outlined
                dense
                rows="2"
              />
              <q-select
                dark
                v-model="projectForm.priority"
                :options="['Low', 'Medium', 'High', 'Critical']"
                label="Priority"
                outlined
                dense
              />

              <div class="row justify-end q-gutter-x-sm q-mt-md">
                <q-btn flat label="Cancel" color="grey-5" v-close-popup />
                <q-btn
                  type="submit"
                  label="Create Project"
                  color="amber-8"
                  text-color="black"
                  unelevated
                />
              </div>
            </q-form>
          </q-card-section>
        </template>

        <!-- ================= 3. CREATE TEAM PAGE ================= -->
        <template v-if="activeAction === 'create-team'">
          <q-card-section
            class="row items-center justify-between border-bottom"
          >
            <div class="text-h6 row items-center q-gutter-x-sm">
              <q-icon name="group_add" color="teal-4" />
              <span>Create Team</span>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-pa-md">
            <q-form
              @submit.prevent="handleSave('Team created successfully')"
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
              <q-select
                dark
                v-model="teamForm.department"
                :options="['Engineering', 'Product', 'Marketing', 'Sales']"
                label="Department"
                outlined
                dense
              />
              <q-select
                dark
                v-model="teamForm.lead"
                :options="['John Doe', 'Jane Smith', 'Robert Paulson']"
                label="Team Lead"
                outlined
                dense
              />

              <div class="row justify-end q-gutter-x-sm q-mt-md">
                <q-btn flat label="Cancel" color="grey-5" v-close-popup />
                <q-btn
                  type="submit"
                  label="Create Team"
                  color="teal"
                  unelevated
                />
              </div>
            </q-form>
          </q-card-section>
        </template>

        <!-- ================= 4. EXPORT MONTHLY REPORT PAGE ================= -->
        <template v-if="activeAction === 'export-report'">
          <q-card-section
            class="row items-center justify-between border-bottom"
          >
            <div class="text-h6 row items-center q-gutter-x-sm">
              <q-icon name="file_download" color="purple-4" />
              <span>Export Monthly Report</span>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-pa-md">
            <q-form
              @submit.prevent="handleSave('Report export initiated')"
              class="q-gutter-y-sm"
            >
              <q-select
                dark
                v-model="reportForm.month"
                :options="[
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December'
                ]"
                label="Select Month"
                outlined
                dense
              />
              <q-select
                dark
                v-model="reportForm.format"
                :options="[
                  'PDF Document (.pdf)',
                  'Excel Spreadsheet (.xlsx)',
                  'CSV File (.csv)'
                ]"
                label="Export Format"
                outlined
                dense
              />

              <div class="row justify-end q-gutter-x-sm q-mt-md">
                <q-btn flat label="Cancel" color="grey-5" v-close-popup />
                <q-btn
                  type="submit"
                  label="Export"
                  icon="download"
                  color="purple-6"
                  unelevated
                />
              </div>
            </q-form>
          </q-card-section>
        </template>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Notify } from 'quasar'

const dialogOpen = ref(false)
const activeAction = ref(null)

// Forms State
const userForm = ref({ name: '', email: '', role: 'Developer' })
const projectForm = ref({ name: '', description: '', priority: 'Medium' })
const teamForm = ref({ name: '', department: 'Engineering', lead: 'John Doe' })
const reportForm = ref({ month: 'September', format: 'PDF Document (.pdf)' })

const openModal = actionKey => {
  activeAction.value = actionKey
  dialogOpen.value = true
}

const handleSave = successMessage => {
  dialogOpen.value = false
  Notify.create({
    type: 'positive',
    message: successMessage,
    position: 'top'
  })
}
</script>

<style scoped>
.min-height-screen {
  min-height: 100vh;
}

.quick-actions-card {
  border-color: #2c384a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.action-btn {
  height: 48px;
  border-color: #3b485d;
  font-weight: 600;
  letter-spacing: 0.3px;
  justify-content: center;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.responsive-modal {
  width: 100%;
  max-width: clamp(300px, 90vw, 480px);
  border: 1px solid #3b485d;
}

.border-bottom {
  border-bottom: 1px solid #2c384a;
}
</style>
