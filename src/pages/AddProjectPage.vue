<template>
  <q-page class="q-pa-lg bg-slate-900 text-white min-h-screen">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-bold q-ma-none text-white">{{
          isEditing ? 'Edit Project' : 'Create Project'
        }}</h1>
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
              :rules="[val => !!val || 'Project type is required']"
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
              :rules="[val => !!val || 'Template is required']"
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
              :rules="[val => !!val || 'Project lead is required']"
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
            :label="isEditing ? 'Save Changes' : 'Create Project'"
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
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const isEditing = computed(() => Boolean(route.params.id))

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
  stage: '',
  priority: '',
  permission: '',
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
const typeOptions = ref([])

const templateOptions = ref([])

const categoryOptions = ref([])

const accessOptions = [
  { label: 'Private (Restricted Access)', value: true },
  { label: 'Open (Any Team Member)', value: false }
]

const assigneeOptions = [
  { label: 'Project Lead', value: 'project_lead' },
  { label: 'Unassigned', value: 'unassigned' }
]

const userOptions = ref([])

const getId = item => item?.Id ?? item?.id ?? item?.ID ?? ''
const getItems = data => {
  const items = Array.isArray(data) ? data : data?.data
  if (!Array.isArray(items)) {
    throw new Error('The server returned an invalid options response')
  }
  return items
}
const toOption = (item, label) => ({
  label: label(item),
  value: getId(item)
})

const projectTypes = async () => {
  try {
    const { data } = await api.get('/users/project-type/find')
    typeOptions.value = getItems(data).map(type =>
      toOption(type, item => item.typeName)
    )
  } catch (error) {
    console.error('Failed to fetch project types:', error)
    throw error
  }
}

const templatesOptions = async () => {
  try {
    const { data } = await api.get('/users/template/find')
    templateOptions.value = getItems(data).map(template =>
      toOption(template, item => item.templateName)
    )
  } catch (error) {
    console.error('Failed to fetch project templates:', error)
    throw error
  }
}

const leadsOptions = async () => {
  try {
    const { data } = await api.get('/users')
    userOptions.value = getItems(data).map(lead =>
      toOption(lead, item => item.username)
    )
  } catch (error) {
    console.error('Failed to fetch project leads:', error)
    throw error
  }
}

const categoriesOptions = async () => {
  try {
    const { data } = await api.get('/users/categories/find')
    categoryOptions.value = getItems(data).map(category =>
      toOption(category, item => item.categoryName)
    )
  } catch (error) {
    console.error('Failed to fetch project categories:', error)
    throw error
  }
}

const fetchOptions = async () => {
  try {
    const [permissionResponse, stageResponse, priorityResponse] =
      await Promise.all([
        api.get('/users/permission/find'),
        api.get('/users/stage/find'),
        api.get('/users/priority/find'),
        projectTypes(),
        templatesOptions(),
        leadsOptions(),
        categoriesOptions()
      ])
    permissions.value = getItems(permissionResponse.data)
      .map(item => toOption(item, value => value.permissions))
      .sort((a, b) => a.label.localeCompare(b.label))
    stages.value = getItems(stageResponse.data)
      .map(item => toOption(item, value => value.stagesName))
      .sort((a, b) => a.label.localeCompare(b.label))
    priorities.value = getItems(priorityResponse.data)
      .map(item => toOption(item, value => value.priority))
      .sort((a, b) => a.label.localeCompare(b.label))
  } catch (error) {
    console.error('Failed to fetch project form options:', error)
    throw error
  }
}

const relationId = value => {
  if (value === null || value === undefined || value === '') return ''
  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? value : numericValue
}

const relation = value => (value === '' ? null : { Id: relationId(value) })
const templateRelation = value =>
  value === '' ? null : { id: relationId(value) }
const nestedId = value => relationId(value?.Id ?? value?.id ?? value)

const loadProject = async () => {
  const { data } = await api.get('/users/projects/find')
  const projects = getItems(data)
  const project = projects.find(
    item => String(getId(item)) === String(route.params.id)
  )

  if (!project) {
    throw new Error('Project not found')
  }

  form.name = project.projectName ?? ''
  form.key = project.projectKey ?? ''
  form.type = nestedId(project.projectTypes)
  form.template = nestedId(project.template)
  form.lead = nestedId(project.leads)
  form.defaultAssignee = project.assignee ?? ''
  form.category = nestedId(project.categories)
  const accessLevel = project.accessLevel ?? project.isRestricted
  form.access = accessLevel === true || accessLevel === 'true'
  form.stage = nestedId(project.stages)
  form.priority = nestedId(project.Priority ?? project.priority)
  form.permission = nestedId(project.permission)
  form.description = project.description ?? ''
}

onMounted(async () => {
  loading.value = true
  try {
    await fetchOptions()
    if (isEditing.value) await loadProject()
  } catch (error) {
    console.error('Failed to initialize project form:', error)
    Notify.create({
      type: 'negative',
      message:
        error.response?.data?.message ||
        error.message ||
        'Failed to load project form'
    })
  } finally {
    loading.value = false
  }
})

const handleSubmit = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const payload = {
      projectName: form.name,
      projectKey: form.key,
      projectTypes: relation(form.type),
      template: templateRelation(form.template),
      leads: relation(form.lead),
      assignee: form.defaultAssignee,
      accessLevel: form.access,
      categories: relation(form.category),
      permission: relation(form.permission),
      Priority: relation(form.priority),
      stages: relation(form.stage),
      description: form.description
    }

    if (isEditing.value) {
      await api.put(`/users/projects/update/${route.params.id}`, {
        ...payload,
        Id: relationId(route.params.id)
      })
    } else {
      await api.post('/users/projects/create', payload)
    }

    Notify.create({
      type: 'positive',
      message: isEditing.value
        ? `Project "${form.name}" updated successfully`
        : `Project "${form.name}" (${form.key}) created successfully`,
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
