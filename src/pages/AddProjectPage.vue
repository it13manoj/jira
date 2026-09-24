<template>
  <q-page class="q-pa-lg bg-slate-900 text-white min-h-screen">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-bold q-ma-none text-white"
          >Create Project</h1
        >
        <p class="text-caption text-grey-4 q-mb-none"
          >Configure your project details, workflow, and access lead.</p
        >
      </div>
      <q-btn
        outline
        color="grey-4"
        label="Cancel"
        to="/projects"
        class="rounded-btn"
        no-caps
      />
    </div>

    <!-- Form Container Card -->
    <q-card class="bg-slate-800 border-glass rounded-card q-pa-md">
      <q-form @submit.prevent="handleSubmit" class="q-gutter-y-md">
        <div class="row q-col-gutter-md">
          <!-- Project Name -->
          <div class="col-12 col-md-8">
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs">
              Project Name <span class="text-negative">*</span>
            </div>
            <q-input
              v-model="form.name"
              dark
              outlined
              dense
              placeholder="e.g. NextGen Web App"
              :rules="[val => !!val || 'Project name is required']"
              class="custom-field"
              @update:model-value="generateProjectKey"
            />
          </div>

          <!-- Project Key (Auto-generated like Jira) -->
          <div class="col-12 col-md-4">
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs">
              Key <span class="text-negative">*</span>
              <q-icon
                name="help_outline"
                size="14px"
                class="q-ml-xs text-grey-5"
              >
                <q-tooltip
                  >Short uppercase prefix for issue keys (e.g.,
                  NWA-101)</q-tooltip
                >
              </q-icon>
            </div>
            <q-input
              v-model="form.key"
              dark
              outlined
              dense
              placeholder="e.g. NWA"
              :rules="[
                val => !!val || 'Key is required',
                val =>
                  /^[A-Z0-9]{2,10}$/.test(val) ||
                  '2-10 uppercase alphanumeric chars'
              ]"
              class="custom-field"
            />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <!-- Project Type -->
          <div class="col-12 col-md-6">
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs">
              Project Type <span class="text-negative">*</span>
            </div>
            <q-select
              v-model="form.type"
              :options="typeOptions"
              dark
              outlined
              dense
              emit-value
              map-options
              class="custom-field"
            />
          </div>

          <!-- Template -->
          <div class="col-12 col-md-6">
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs">
              Template <span class="text-negative">*</span>
            </div>
            <q-select
              v-model="form.template"
              :options="templateOptions"
              dark
              outlined
              dense
              emit-value
              map-options
              class="custom-field"
            />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <!-- Project Lead -->
          <div class="col-12 col-md-6">
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs">
              Project Lead <span class="text-negative">*</span>
            </div>
            <q-select
              v-model="form.lead"
              :options="userOptions"
              dark
              outlined
              dense
              emit-value
              map-options
              class="custom-field"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar size="24px" color="primary" text-color="white">
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

          <!-- Default Assignee -->
          <div class="col-12 col-md-6">
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs"
              >Default Assignee</div
            >
            <q-select
              v-model="form.defaultAssignee"
              :options="assigneeOptions"
              dark
              outlined
              dense
              emit-value
              map-options
              class="custom-field"
            />
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <!-- Category -->
          <div class="col-12 col-md-6">
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs"
              >Project Category</div
            >
            <q-select
              v-model="form.category"
              :options="categoryOptions"
              dark
              outlined
              dense
              emit-value
              map-options
              class="custom-field"
            />
          </div>

          <!-- Access / Security Level -->
          <div class="col-12 col-md-6">
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs"
              >Access Level</div
            >
            <q-select
              v-model="form.access"
              :options="accessOptions"
              dark
              outlined
              dense
              emit-value
              map-options
              class="custom-field"
            />
          </div>
        </div>
        <div class="row q-col-gutter-md">
          <!-- Category -->
          <div class="col-12 col-md-4">
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs"
              >Project Stage</div
            >
            <q-select
              v-model="form.stage"
              :options="stages"
              dark
              outlined
              dense
              emit-value
              map-options
              class="custom-field"
            />
          </div>

          <!-- Access / Security Level -->
          <div class="col-12 col-md-4">
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs"
              >Project Priority</div
            >
            <q-select
              v-model="form.priority"
              :options="priorities"
              dark
              outlined
              dense
              emit-value
              map-options
              class="custom-field"
            />
          </div>
          <div class="col-12 col-md-4">
            <div class="text-caption text-weight-medium text-grey-3 q-mb-xs"
              >Project Permission</div
            >
            <q-select
              v-model="form.permission"
              :options="permissions"
              dark
              outlined
              dense
              emit-value
              map-options
              class="custom-field"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <div class="text-caption text-weight-medium text-grey-3 q-mb-xs"
            >Description</div
          >
          <q-input
            v-model="form.description"
            dark
            outlined
            type="textarea"
            rows="4"
            placeholder="Write a brief overview of the project scope, goals, and target release date..."
            class="custom-field"
          />
        </div>

        <!-- Submit Button Group -->
        <div class="row justify-end q-gutter-x-sm q-mt-lg">
          <q-btn flat dark label="Cancel" to="/projects" no-caps />
          <q-btn
            label="Create Project"
            type="submit"
            color="primary"
            class="rounded-btn text-weight-bold"
            unelevated
            :loading="loading"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

const router = useRouter()
const loading = ref(false)

const permissions = ref([])
const stages = ref([])
const priorities = ref([])

const form = reactive({
  name: '',
  key: '',
  type: '',
  template: '',
  lead: '',
  defaultAssignee: '',
  category: '',
  access: '',
  description: ''
})

// Auto-generate Jira Key from Name
const generateProjectKey = val => {
  if (!val) {
    form.key = ''
    return
  }
  const words = val.trim().split(/\s+/)
  if (words.length === 1) {
    form.key = words[0].substring(0, 3).toUpperCase()
  } else {
    form.key = words
      .map(w => w[0])
      .join('')
      .substring(0, 4)
      .toUpperCase()
  }
}

// Jira Dropdown Options
const typeOptions = ref([{ label: 'Select Project Type', value: '' }])

const templateOptions = ref([{ label: 'Select Template', value: '' }])

const categoryOptions = ref([{ label: 'Select Category', value: '' }])

const accessOptions = [
  { label: 'Private (Restricted Access)', value: true },
  { label: 'Open (Any Team Member)', value: false }
]

const assigneeOptions = [
  { label: 'Project Lead', value: 'project_lead' },
  { label: 'Unassigned', value: 'unassigned' }
]

const userOptions = ref([{ label: 'Select Lead', value: '' }])

const projectTypes = async () => {
  try {
    const response = await api.get('/users/project-type/find')
    typeOptions.value.push(
      ...response.data.map(type => ({
        label: type.typeName,
        value: type.Id
      }))
    )
    console.log('Fetched Project Types:', typeOptions.value)
  } catch (error) {
    console.error('Failed to fetch project types:', error)
    return []
  }
}

const templatesOptions = async () => {
  try {
    const response = await api.get('/users/template/find')
    templateOptions.value.push(
      ...response.data.map(template => ({
        label: template.templateName,
        value: template.id
      }))
    )
    console.log('Fetched Project Templates:', templateOptions.value)
  } catch (error) {
    console.error('Failed to fetch project templates:', error)
    return []
  }
}

const leadsOptions = async () => {
  try {
    const response = await api.get('/users')
    userOptions.value.push(
      ...response.data.map(lead => ({
        label: lead.username,
        value: lead.Id
      }))
    )
    console.log('Fetched Project Leads:', userOptions.value)
  } catch (error) {
    console.error('Failed to fetch project leads:', error)
    return []
  }
}

const categoriesOptions = async () => {
  try {
    const response = await api.get('/users/categories/find')
    categoryOptions.value.push(
      ...response.data.map(category => ({
        label: category.categoryName,
        value: category.Id
      }))
    )
    console.log('Fetched Project Categories:', categoryOptions.value)
  } catch (error) {
    console.error('Failed to fetch project categories:', error)
    return []
  }
}

onMounted(async () => {
  const types = await projectTypes()
  const templates = await templatesOptions()
  const leads = await leadsOptions()
  const categories = await categoriesOptions()
})

const fetchDate = async () => {
  try {
    const response = await api.get('/users/permission/find')
    permissions.value = response.data.map(item => ({
      value: item.Id,
      label: item.permissions
    }))
    permissions.value = permissions.value.sort((a, b) =>
      a.label.localeCompare(b.label)
    )

    const stagesResponse = await api.get('/users/stage/find')
    stages.value = stagesResponse.data.map(item => ({
      value: item.Id,
      label: item.stagesName
    }))

    stages.value = stages.value.sort((a, b) => a.order - b.order)

    const prioritiesResponse = await api.get('/users/priority/find')
    priorities.value = prioritiesResponse.data.map(item => ({
      value: item.Id,
      label: item.priority
    }))
    priorities.value = priorities.value.sort((a, b) => a.level - b.level)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(async () => {
  await fetchDate()
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const payload = {
      projectName: form.name,
      projectKey: form.key,
      projectTypes: {
        Id: Number(form.type)
      },
      template: {
        id: Number(form.template) // Match the exact ID field capitalization used by your Template entity
      },
      leads: {
        Id: Number(form.lead)
      },
      assignee: form.defaultAssignee,
      accessLevel: Boolean(form.access),
      categories: {
        Id: Number(form.category)
      },
      permission: {
        Id: Number(form.permission)
      },
      Priority: {
        Id: Number(form.priority)
      },
      stages: {
        Id: Number(form.stage)
      },
      description: form.description
    }

    // ✅ CORRECT: Pass payload directly
    const response = await api.post('/users/projects/create', payload)

    Notify.create({
      type: 'positive',
      message: `Project "${form.name}" (${form.key}) created successfully!`,
      position: 'top'
    })

    router.push('/projects')
  } catch (error) {
    console.error('Project creation error:', error)
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to create project',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
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

/* Custom Quasar Input Styling Overrides */
.custom-field :deep(.q-field__control) {
  background: #0f172a !important;
  border-radius: 8px !important;
}
.custom-field :deep(.q-field__native),
.custom-field :deep(.q-field__input) {
  color: #ffffff !important;
}
</style>
