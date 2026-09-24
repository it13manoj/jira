<template>
  <q-page class="q-pa-lg bg-slate-900 text-white min-h-screen">
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-bold q-ma-none text-white">
          Reports & Analytics Panel
        </h1>
        <p class="text-caption text-grey-4 q-mb-none">
          Generate, schedule, and download automated panel performance reports.
        </p>
      </div>
      <div>
        <q-btn
          color="teal-6"
          icon="add"
          label="Generate Report"
          unelevated
          class="rounded-btn"
          no-caps
          @click="showGenerateModal = true"
        />
      </div>
    </div>

    <!-- Overview Stat Cards -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card bg-slate-800 text-white border-glass">
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <span class="text-caption text-weight-medium text-grey-4"
                >Total Generated</span
              >
              <q-avatar size="36px" class="bg-teal-500-10 text-teal-4">
                <q-icon name="analytics" size="20px" />
              </q-avatar>
            </div>
            <div class="text-h5 text-weight-bold q-mb-xs">1,204</div>
            <div class="text-caption text-grey-4">+48 this week</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card bg-slate-800 text-white border-glass">
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <span class="text-caption text-weight-medium text-grey-4"
                >Scheduled Tasks</span
              >
              <q-avatar size="36px" class="bg-blue-500-10 text-blue-4">
                <q-icon name="update" size="20px" />
              </q-avatar>
            </div>
            <div class="text-h5 text-weight-bold q-mb-xs">12 Active</div>
            <div class="text-caption text-positive">Next: Tonight at 00:00</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card bg-slate-800 text-white border-glass">
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <span class="text-caption text-weight-medium text-grey-4"
                >Storage Used</span
              >
              <q-avatar size="36px" class="bg-purple-500-10 text-purple-4">
                <q-icon name="cloud_queue" size="20px" />
              </q-avatar>
            </div>
            <div class="text-h5 text-weight-bold q-mb-xs">4.2 GB</div>
            <div class="text-caption text-grey-4">Out of 20 GB allocated</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card bg-slate-800 text-white border-glass">
          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <span class="text-caption text-weight-medium text-grey-4"
                >Export Failures</span
              >
              <q-avatar size="36px" class="bg-amber-500-10 text-amber-4">
                <q-icon name="warning_amber" size="20px" />
              </q-avatar>
            </div>
            <div class="text-h5 text-weight-bold q-mb-xs">0.02%</div>
            <div class="text-caption text-positive">99.98% Success Rate</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main Section: History Table -->
    <q-card class="bg-slate-800 text-white border-glass rounded-card">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="text-h6 text-weight-bold">Generated Reports Log</div>
        <div class="row q-gutter-x-sm">
          <q-input
            dark
            dense
            outlined
            v-model="filter"
            placeholder="Search reports..."
            class="bg-slate-900 rounded-borders"
          >
            <template #append>
              <q-icon name="search" size="20px" />
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-card-section>
        <q-table
          flat
          dark
          dense
          :rows="reports"
          :columns="columns"
          row-key="id"
          :filter="filter"
          class="bg-transparent text-grey-3"
          :pagination="{ rowsPerPage: 6 }"
        >
          <!-- Format Badge Column -->
          <template #body-cell-format="props">
            <q-td :props="props">
              <q-chip
                size="sm"
                :color="props.row.format === 'PDF' ? 'red-9' : 'teal-9'"
                text-color="white"
                dense
              >
                {{ props.row.format }}
              </q-chip>
            </q-td>
          </template>

          <!-- Status Column -->
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-chip
                size="sm"
                :color="props.row.status === 'Ready' ? 'positive' : 'warning'"
                text-color="white"
                dense
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
          </template>

          <!-- Actions Column -->
          <template #body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-xs">
              <q-btn
                flat
                round
                dense
                icon="download"
                color="teal-4"
                @click="downloadReport(props.row)"
              >
                <q-tooltip>Download File</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="deleteReport(props.row.id)"
              >
                <q-tooltip>Delete Record</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal: Generate New Report -->
    <q-dialog v-model="showGenerateModal" persistent>
      <q-card class="bg-slate-800 text-white border-glass style-modal">
        <q-card-section class="row items-center justify-between border-bottom">
          <div class="text-h6 row items-center q-gutter-x-sm">
            <q-icon name="insert_chart" color="teal-4" />
            <span>Generate New Report</span>
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="generateReport" class="q-gutter-y-md">
            <q-input
              dark
              outlined
              dense
              v-model="newReport.title"
              label="Report Title *"
              :rules="[val => !!val || 'Title is required']"
            />

            <q-select
              dark
              outlined
              dense
              v-model="newReport.category"
              :options="[
                'User Analytics',
                'Project Performance',
                'System Infrastructure',
                'Financial Metrics'
              ]"
              label="Report Category"
            />

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-select
                  dark
                  outlined
                  dense
                  v-model="newReport.format"
                  :options="['PDF', 'CSV', 'XLSX']"
                  label="Format"
                />
              </div>
              <div class="col-6">
                <q-select
                  dark
                  outlined
                  dense
                  v-model="newReport.range"
                  :options="[
                    'Last 7 Days',
                    'Last 30 Days',
                    'Quarter to Date',
                    'Year to Date'
                  ]"
                  label="Date Range"
                />
              </div>
            </div>

            <div class="row justify-end q-gutter-x-sm q-pt-md">
              <q-btn flat label="Cancel" color="grey-5" v-close-popup />
              <q-btn
                type="submit"
                label="Start Export"
                color="teal-6"
                :loading="exporting"
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
import { ref } from 'vue'
import { Notify } from 'quasar'

const filter = ref('')
const showGenerateModal = ref(false)
const exporting = ref(false)

const newReport = ref({
  title: '',
  category: 'User Analytics',
  format: 'PDF',
  range: 'Last 30 Days'
})

const columns = [
  {
    name: 'title',
    label: 'Report Name',
    field: 'title',
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
  {
    name: 'date',
    label: 'Generated Date',
    field: 'date',
    align: 'left',
    sortable: true
  },
  { name: 'size', label: 'File Size', field: 'size', align: 'center' },
  { name: 'format', label: 'Format', field: 'format', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const reports = ref([
  {
    id: 1,
    title: 'Monthly Active Users Summary',
    category: 'User Analytics',
    date: '2026-08-31 14:20',
    size: '2.4 MB',
    format: 'PDF',
    status: 'Ready'
  },
  {
    id: 2,
    title: 'Sprint 24 Velocity & Capacity',
    category: 'Project Performance',
    date: '2026-08-28 09:15',
    size: '1.1 MB',
    format: 'CSV',
    status: 'Ready'
  },
  {
    id: 3,
    title: 'Q3 Financial & Client Billing',
    category: 'Financial Metrics',
    date: '2026-08-25 18:40',
    size: '5.8 MB',
    format: 'PDF',
    status: 'Ready'
  },
  {
    id: 4,
    title: 'Cloud Infrastructure Usage Audit',
    category: 'System Infrastructure',
    date: '2026-08-20 11:05',
    size: '850 KB',
    format: 'CSV',
    status: 'Ready'
  }
])

const generateReport = () => {
  exporting.value = true
  setTimeout(() => {
    reports.value.unshift({
      id: Date.now(),
      title: newReport.value.title,
      category: newReport.value.category,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      size: '1.5 MB',
      format: newReport.value.format,
      status: 'Ready'
    })
    exporting.value = false
    showGenerateModal.value = false
    newReport.value.title = ''
    Notify.create({
      type: 'positive',
      message: 'Report generated successfully!',
      position: 'top'
    })
  }, 1000)
}

const downloadReport = row => {
  Notify.create({
    type: 'info',
    message: `Downloading ${row.title}...`,
    position: 'top'
  })
}

const deleteReport = id => {
  reports.value = reports.value.filter(r => r.id !== id)
  Notify.create({
    type: 'negative',
    message: 'Report removed',
    position: 'top'
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

.border-glass {
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-card {
  transition: transform 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
}

.rounded-btn {
  border-radius: 8px;
}
.rounded-card {
  border-radius: 12px;
}

.style-modal {
  width: 100%;
  min-width: 320px;
  max-width: 500px;
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
</style>
