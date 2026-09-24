<template>
  <div class="q-pa-xs q-pa-sm-sm q-pa-md-md dark-bg min-height-screen">
    <q-card
      flat
      class="bg-card border-card rounded-borders full-width shadow-dark"
    >
      <q-tabs
        v-model="activeTab"
        dense
        class="text-slate-muted bg-tab-header border-bottom-dark"
        active-color="blue-5"
        indicator-color="blue-6"
        align="left"
        narrow-indicator
        outside-arrows
        mobile-arrows
      >
        <q-tab name="role-list" icon="admin_panel_settings" label="Roles" />
        <q-tab name="add-role" icon="add_moderator" label="Add Role" />
        <q-tab name="user-list" icon="people" label="Users" />
        <q-tab name="add-user" icon="person_add" label="Add User" />
        <q-tab
          name="manage-roles"
          icon="manage_accounts"
          label="Manage Roles"
        />
      </q-tabs>

      <q-separator color="slate-800" />

      <q-tab-panels
        v-model="activeTab"
        animated
        class="q-pa-xs q-pa-sm-md bg-card"
      >
        <q-tab-panel name="role-list" class="q-pa-none bg-card">
          <div
            class="row items-center justify-between q-mb-md q-col-gutter-y-sm"
          >
            <div class="col-12 col-sm-auto text-center text-sm-left">
              <div class="text-h6 text-weight-bold text-white">
                Role Management
              </div>
              <div class="text-caption text-slate-muted">
                System roles and associated permission scopes
              </div>
            </div>

            <div
              class="col-12 col-sm-auto row q-col-gutter-xs items-center justify-end"
            >
              <div class="col-12 col-sm-auto">
                <q-input
                  v-model="roleSearch"
                  dense
                  outlined
                  dark
                  placeholder="Search roles..."
                  class="full-width dark-input"
                  style="min-width: 180px"
                >
                  <template #append>
                    <q-icon name="search" color="blue-4" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-auto q-mt-xs q-mt-sm-none">
                <q-btn
                  color="blue-6"
                  icon="add"
                  label="Create Role"
                  unelevated
                  class="full-width"
                  @click="activeTab = 'add-role'"
                />
              </div>
            </div>
          </div>

          <div
            class="row q-col-gutter-xs q-col-gutter-sm-sm q-col-gutter-md-md"
          >
            <div
              v-for="role in filteredRoles"
              :key="role.id"
              class="col-12 col-xs-12 col-sm-6 col-md-4 col-lg-3"
            >
              <q-card
                flat
                class="full-height column justify-between rounded-borders border-card bg-inner-card card-hover-shadow"
              >
                <q-card-section class="q-pa-sm q-pa-md-md">
                  <div class="row items-center justify-between no-wrap q-mb-xs">
                    <div
                      class="text-subtitle1 text-weight-bold text-white ellipsis"
                    >
                      {{ role.name }}
                    </div>
                    <q-chip
                      size="xs"
                      dense
                      :color="role.isSystem ? 'amber-10' : 'slate-800'"
                      :text-color="role.isSystem ? 'amber-2' : 'slate-300'"
                      class="text-weight-bold"
                    >
                      {{ role.isSystem ? 'System' : 'Custom' }}
                    </q-chip>
                  </div>
                  <div class="text-caption text-slate-muted q-mb-sm text-wrap">
                    {{ role.description }}
                  </div>

                  <div
                    class="text-caption text-weight-bold text-slate-300 q-mb-xs"
                  >
                    Assigned Permissions:
                  </div>
                  <div class="row q-gutter-xs">
                    <q-chip
                      v-for="perm in role.permissions"
                      :key="perm"
                      dense
                      size="xs"
                      color="blue-10"
                      text-color="blue-2"
                      class="text-weight-medium"
                    >
                      {{ perm }}
                    </q-chip>
                  </div>
                </q-card-section>

                <q-separator color="slate-800" />

                <q-card-actions align="right" class="q-pa-xs bg-tab-header">
                  <q-btn
                    flat
                    dense
                    color="blue-4"
                    icon="edit"
                    label="Edit"
                    @click="editRole(role)"
                  />
                  <q-btn
                    flat
                    dense
                    color="red-4"
                    icon="delete"
                    label="Delete"
                    :disable="role.isSystem"
                    @click="deleteRole(role)"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="add-role" class="q-pa-none bg-card">
          <div class="responsive-form-container q-mx-auto q-py-xs q-py-sm-md">
            <div class="text-h6 text-weight-bold text-white q-mb-xs">
              {{ editingRole ? 'Edit Role' : 'Add New Role' }}
            </div>
            <div class="text-caption text-slate-muted q-mb-md">
              Configure role permissions and details below.
            </div>

            <q-form @submit.prevent="saveRole" class="q-gutter-y-md">
              <q-input
                v-model="roleForm.name"
                label="Role Name *"
                outlined
                dark
                dense
                class="dark-input"
                :rules="[val => !!val || 'Role name is required']"
              />

              <q-input
                v-model="roleForm.description"
                label="Description"
                type="textarea"
                outlined
                dark
                dense
                rows="2"
                class="dark-input"
              />

              <div>
                <div class="text-subtitle2 text-slate-300 q-mb-xs">
                  Permissions Matrix *
                </div>
                <q-card
                  flat
                  class="q-pa-xs q-pa-sm-sm bg-inner-card border-card"
                >
                  <div class="row q-col-gutter-xs q-col-gutter-sm-sm">
                    <div
                      v-for="perm in availablePermissions"
                      :key="perm"
                      class="col-12 col-xs-6 col-sm-6"
                    >
                      <q-checkbox
                        v-model="roleForm.permissions"
                        :val="perm"
                        :label="perm"
                        dense
                        dark
                        color="blue-6"
                        class="full-width text-slate-300"
                      />
                    </div>
                  </div>
                </q-card>
              </div>

              <div class="row items-center justify-end q-gutter-x-sm q-pt-md">
                <q-btn
                  flat
                  label="Cancel"
                  color="slate-muted"
                  class="col-grow col-sm-auto"
                  @click="resetRoleForm"
                />
                <q-btn
                  type="submit"
                  color="blue-6"
                  :label="editingRole ? 'Update Role' : 'Save Role'"
                  unelevated
                  class="col-grow col-sm-auto"
                />
              </div>
            </q-form>
          </div>
        </q-tab-panel>

        <q-tab-panel name="user-list" class="q-pa-none bg-card">
          <div
            class="row items-center justify-between q-mb-md q-col-gutter-y-sm"
          >
            <div class="col-12 col-sm-auto text-center text-sm-left">
              <div class="text-h6 text-weight-bold text-white">
                Users Directory
              </div>
              <div class="text-caption text-slate-muted">
                Registered users and their role assignments
              </div>
            </div>

            <div
              class="col-12 col-sm-auto row q-col-gutter-xs items-center justify-end"
            >
              <div class="col-12 col-sm-auto">
                <q-input
                  v-model="userSearch"
                  dense
                  outlined
                  dark
                  placeholder="Search users..."
                  class="full-width dark-input"
                  style="min-width: 180px"
                >
                  <template #append>
                    <q-icon name="search" color="blue-4" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-auto q-mt-xs q-mt-sm-none">
                <q-btn
                  color="blue-6"
                  icon="person_add"
                  label="Add User"
                  unelevated
                  class="full-width"
                  @click="activeTab = 'add-user'"
                />
              </div>
            </div>
          </div>

          <q-table
            :rows="filteredUsers"
            :columns="userColumns"
            row-key="id"
            flat
            dark
            class="bg-card border-card custom-dark-table"
            :grid="$q.screen.lt.sm"
          >
            <template #item="props">
              <div class="q-pa-xs col-12">
                <q-card
                  flat
                  class="q-pa-xs q-pa-sm-sm border-card bg-inner-card"
                >
                  <div class="row items-center justify-between">
                    <div class="row items-center q-gutter-x-xs">
                      <q-avatar
                        size="32px"
                        color="blue-10"
                        text-color="blue-2"
                        class="text-weight-bold"
                      >
                        {{ props.row.name.charAt(0) }}
                      </q-avatar>
                      <div style="max-width: 160px" class="ellipsis">
                        <div class="text-subtitle2 text-white ellipsis">
                          {{ props.row.name }}
                        </div>
                        <div class="text-caption text-slate-muted ellipsis">
                          {{ props.row.email }}
                        </div>
                      </div>
                    </div>
                    <q-badge
                      dense
                      class="q-px-sm text-weight-bold"
                      :color="
                        props.row.status === 'Active' ? 'green-10' : 'red-10'
                      "
                      :text-color="
                        props.row.status === 'Active' ? 'green-3' : 'red-3'
                      "
                    >
                      {{ props.row.status }}
                    </q-badge>
                  </div>

                  <q-separator class="q-my-xs" color="slate-800" />

                  <div
                    class="text-caption text-weight-bold text-slate-300 q-mb-xs"
                  >
                    Roles:
                  </div>
                  <div class="row q-gutter-xs q-mb-sm">
                    <q-chip
                      v-for="role in props.row.roles"
                      :key="role"
                      dense
                      size="xs"
                      color="blue-10"
                      text-color="blue-2"
                      class="text-weight-medium"
                    >
                      {{ role }}
                    </q-chip>
                  </div>

                  <div class="row justify-end q-gutter-x-xs">
                    <q-btn
                      flat
                      dense
                      size="sm"
                      color="blue-4"
                      icon="manage_accounts"
                      label="Manage Roles"
                      @click="quickManageUser(props.row)"
                    />
                    <q-btn
                      flat
                      dense
                      size="sm"
                      color="red-4"
                      icon="delete"
                      @click="deleteUser(props.row)"
                    />
                  </div>
                </q-card>
              </div>
            </template>

            <template #body-cell-user="props">
              <q-td :props="props">
                <div class="row items-center q-gutter-x-sm">
                  <q-avatar
                    size="28px"
                    color="blue-10"
                    text-color="blue-2"
                    class="text-weight-bold"
                  >
                    {{ props.row.name.charAt(0) }}
                  </q-avatar>
                  <div>
                    <div class="text-weight-bold text-white">
                      {{ props.row.name }}
                    </div>
                    <div class="text-caption text-slate-muted">
                      {{ props.row.email }}
                    </div>
                  </div>
                </div>
              </q-td>
            </template>

            <template #body-cell-roles="props">
              <q-td :props="props">
                <div class="row q-gutter-xs">
                  <q-chip
                    v-for="role in props.row.roles"
                    :key="role"
                    dense
                    size="xs"
                    color="blue-10"
                    text-color="blue-2"
                    class="text-weight-medium"
                  >
                    {{ role }}
                  </q-chip>
                </div>
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props" class="text-center">
                <q-badge
                  dense
                  class="q-px-sm text-weight-bold"
                  :color="props.row.status === 'Active' ? 'green-10' : 'red-10'"
                  :text-color="
                    props.row.status === 'Active' ? 'green-3' : 'red-3'
                  "
                >
                  {{ props.row.status }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-actions="props">
              <q-td :props="props" class="text-center">
                <q-btn
                  flat
                  dense
                  round
                  icon="manage_accounts"
                  color="blue-4"
                  @click="quickManageUser(props.row)"
                >
                  <q-tooltip>Manage Roles</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  color="red-4"
                  @click="deleteUser(props.row)"
                >
                  <q-tooltip>Delete User</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="add-user" class="q-pa-none bg-card">
          <div class="responsive-form-container q-mx-auto q-py-xs q-py-sm-md">
            <div class="text-h6 text-weight-bold text-white q-mb-xs">
              Create User Account
            </div>
            <div class="text-caption text-slate-muted q-mb-md">
              Assign single or multiple roles during account creation.
            </div>

            <q-form @submit.prevent="saveUser" class="q-gutter-y-md">
              <q-input
                v-model="userForm.username"
                label="Username *"
                outlined
                dark
                dense
                class="dark-input"
                :rules="[val => !!val || 'Username is required']"
              />
              <q-input
                v-model="userForm.name"
                label="Full Name *"
                outlined
                dark
                dense
                class="dark-input"
                :rules="[val => !!val || 'Name is required']"
              />

              <q-input
                v-model="userForm.email"
                label="Email Address *"
                type="email"
                outlined
                dark
                dense
                class="dark-input"
                :rules="[
                  val => !!val || 'Email is required',
                  val => /.+@.+\..+/.test(val) || 'Invalid email address'
                ]"
              />

              <q-select
                v-model="userForm.roles"
                :options="roleNames"
                label="Assign Roles (Multiple Supported) *"
                outlined
                dark
                dense
                multiple
                use-chips
                stack-label
                class="dark-input"
                :rules="[
                  val => (val && val.length > 0) || 'Assign at least one role'
                ]"
              />

              <q-select
                v-model="userForm.status"
                :options="['Active', 'Inactive']"
                label="Account Status"
                outlined
                dark
                dense
                class="dark-input"
              />

              <div class="row items-center justify-end q-gutter-x-sm q-pt-md">
                <q-btn
                  flat
                  label="Reset"
                  color="slate-muted"
                  class="col-grow col-sm-auto"
                  @click="resetUserForm"
                />
                <q-btn
                  type="submit"
                  color="blue-6"
                  label="Save Account"
                  unelevated
                  class="col-grow col-sm-auto"
                />
              </div>
            </q-form>
          </div>
        </q-tab-panel>

        <q-tab-panel name="manage-roles" class="q-pa-none bg-card">
          <div class="text-h6 text-weight-bold text-white q-mb-xs">
            Manage User Roles
          </div>
          <div class="text-caption text-slate-muted q-mb-md">
            Select a user to modify their active system roles.
          </div>

          <div class="row q-col-gutter-xs q-col-gutter-sm-md">
            <div class="col-12 col-md-5">
              <q-card
                flat
                class="q-mb-sm q-mb-md-none border-card bg-inner-card"
              >
                <q-card-section class="q-pa-sm q-pa-sm-md">
                  <div
                    class="text-subtitle2 text-weight-bold text-white q-mb-sm"
                  >
                    1. Select Target User
                  </div>
                  <q-select
                    v-model="selectedUserForRole"
                    :options="users"
                    option-label="name"
                    label="Choose User"
                    outlined
                    dark
                    dense
                    clearable
                    emit-value
                    map-options
                    class="dark-input"
                  >
                    <template #option="scope">
                      <q-item v-bind="scope.itemProps" class="bg-card">
                        <q-item-section>
                          <q-item-label class="text-white">{{
                            scope.opt.name
                          }}</q-item-label>
                          <q-item-label caption class="text-slate-muted">{{
                            scope.opt.email
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </q-card-section>

                <q-separator color="slate-800" />

                <q-card-section
                  v-if="selectedUserObj"
                  class="q-pa-sm q-pa-sm-md bg-inner-card"
                >
                  <div class="text-caption text-slate-muted">
                    Account Details:
                  </div>
                  <div class="text-subtitle2 text-weight-bold text-white">
                    {{ selectedUserObj.name }}
                  </div>
                  <div class="text-caption text-slate-muted q-mb-sm">
                    {{ selectedUserObj.email }}
                  </div>

                  <div
                    class="text-caption text-weight-bold text-slate-300 q-mt-md"
                  >
                    Active Roles:
                  </div>
                  <div class="row q-gutter-xs q-mt-xs">
                    <q-chip
                      v-for="rName in selectedUserObj.roles"
                      :key="rName"
                      dense
                      color="blue-6"
                      text-color="white"
                    >
                      {{ rName }}
                    </q-chip>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-7">
              <q-card flat class="full-height border-card bg-inner-card">
                <q-card-section class="q-pa-sm q-pa-sm-md">
                  <div
                    class="text-subtitle2 text-weight-bold text-white q-mb-sm"
                  >
                    2. Modify Assigned Roles
                  </div>

                  <div
                    v-if="!selectedUserObj"
                    class="text-body2 text-slate-muted text-center q-py-lg q-py-md-xl"
                  >
                    <q-icon name="arrow_back" size="sm" class="q-mr-xs gt-xs" />
                    Please select a user to configure role assignments.
                  </div>

                  <div v-else class="q-gutter-y-xs">
                    <q-list
                      separator
                      class="border-card rounded-borders bg-card"
                    >
                      <q-item
                        v-for="role in roles"
                        :key="role.id"
                        tag="label"
                        v-ripple
                        class="q-pa-xs q-pa-sm-sm"
                      >
                        <q-item-section side top>
                          <q-checkbox
                            v-model="managedRolesList"
                            :val="role.name"
                            dark
                            color="blue-6"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-bold text-white">{{
                            role.name
                          }}</q-item-label>
                          <q-item-label caption class="text-slate-muted">{{
                            role.description
                          }}</q-item-label>
                        </q-item-section>
                        <q-item-section side class="gt-xs">
                          <q-chip
                            v-if="role.isSystem"
                            dense
                            size="xs"
                            color="amber-10"
                            text-color="amber-2"
                            class="text-weight-bold"
                          >
                            System
                          </q-chip>
                        </q-item-section>
                      </q-item>
                    </q-list>

                    <div class="row justify-end q-mt-md">
                      <q-btn
                        color="blue-6"
                        icon="save"
                        label="Save Changes"
                        unelevated
                        class="full-width col-sm-auto"
                        @click="saveManagedUserRoles"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Notify, useQuasar } from 'quasar'
import { api } from '@/boot/axios'
import { getUserRole } from '../utils/auth'
const userRole = ref('')

onMounted(() => {
  userRole.value = getUserRole()
})

const $q = useQuasar()

// Active Tab & Search Controls
const activeTab = ref('role-list')
const roleSearch = ref('')
const userSearch = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const availablePermissions = [
  'User: Read',
  'User: Write',
  'User: Delete',
  'Role: Read',
  'Role: Write',
  'Role: Delete',
  'Reports: View',
  'System: Configure'
]

const fetchRoles = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/admin/role')
    roles.value = response.data.map(item => {
      // Formats "ROLE_ADMIN" or "ROLE_SALESMANGER" into "Admin" or "Salesmanger"
      const formattedName = item.roleName
        .replace('ROLE_', '')
        .toLowerCase()
        .replace(/^\w/, c => c.toUpperCase())

      const isAdmin = item.roleName === 'ROLE_ADMIN'

      return {
        id: item.Id,
        name: formattedName,
        description: isAdmin
          ? 'Full system access and settings.'
          : `${formattedName} role permissions and access limits.`,
        isSystem: isAdmin,
        permissions: isAdmin ? [...availablePermissions] : []
      }
    })
  } catch (error) {
    console.error('Failed to fetch roles:', error)
    errorMessage.value = 'Failed to load roles. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const fetchUsers = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    if (userRole.value == 'ROLE_USERS') {
      const response = await api.get('/users/me')
      const user = response.data // Single user object
      const fullName =
        user.firstName || user.lastName
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
          : user.username
      const formattedRole = user.role?.roleName
        ? user.role.roleName.replace('ROLE_', '')
        : 'USERS'

      const mappedUser = {
        id: user.Id,
        name: fullName,
        email: user.email,
        roles: [formattedRole], // Wrapped in an array for template compatibility
        status: user.enabled && user.accountNonLocked ? 'Active' : 'Inactive'
      }
      users.value = [mappedUser]
    } else {
      const response = await api.get('/admin/users')
      users.value = response.data.map(item => {
        const fullName =
          item.firstName || item.lastName
            ? `${item.firstName || ''} ${item.lastName || ''}`.trim()
            : item.username
        const formattedRole = item.role?.roleName
          ? item.role.roleName.replace('ROLE_', '')
          : 'USERS'

        return {
          id: item.Id,
          name: fullName,
          email: item.email,
          roles: [formattedRole], // Wrapped in an array for multi-chip compatibility
          status: item.enabled && item.accountNonLocked ? 'Active' : 'Inactive'
        }
      })
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    errorMessage.value = 'Failed to load users. Please try again.'
  } finally {
    isLoading.value = false
  }
}
// Executes automatically when the component mounts
onMounted(() => {
  if (userRole.value == 'ROLE_ADMIN') {
    fetchRoles()
  }
  fetchUsers()
})
// Base Roles Data
const roles = ref([
  {
    id: 1,
    name: 'Admin',
    description: 'Full system access and settings.',
    isSystem: true,
    permissions: [...availablePermissions]
  },
  {
    id: 2,
    name: 'Manager',
    description: 'User management & reports access.',
    isSystem: false,
    permissions: ['User: Read', 'User: Write', 'Reports: View']
  },
  {
    id: 3,
    name: 'Support',
    description: 'Read-only access to records.',
    isSystem: false,
    permissions: ['User: Read']
  }
])

// Base Users Data (Multiple Roles per User)
const users = ref([
  {
    id: 101,
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['Admin', 'Manager'],
    status: 'Active'
  },
  {
    id: 102,
    name: 'Jane Smith',
    email: 'jane@example.com',
    roles: ['Support'],
    status: 'Active'
  },
  {
    id: 103,
    name: 'Robert Paulson',
    email: 'robert@example.com',
    roles: ['Manager'],
    status: 'Inactive'
  }
])

// Forms & Modals
const editingRole = ref(null)
const roleForm = ref({ name: '', description: '', permissions: [] })
const userForm = ref({
  username: '',
  name: '',
  email: '',
  roles: [],
  status: 'Active'
})

// Role Management State
const selectedUserForRole = ref(null)
const managedRolesList = ref([])

// Computeds
const roleNames = computed(() => roles.value.map(r => r.name))

const filteredRoles = computed(() => {
  if (!roleSearch.value) return roles.value
  const query = roleSearch.value.toLowerCase()
  return roles.value.filter(
    r =>
      r.name.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query)
  )
})

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const query = userSearch.value.toLowerCase()
  return users.value.filter(
    u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
  )
})

const userColumns = [
  {
    name: 'user',
    label: 'User Details',
    field: 'name',
    align: 'left',
    sortable: true
  },
  { name: 'roles', label: 'Assigned Roles', field: 'roles', align: 'left' },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const selectedUserObj = computed(() => {
  return (
    users.value.find(
      u =>
        u.id === selectedUserForRole.value?.id ||
        u.id === selectedUserForRole.value
    ) || null
  )
})

// Keep role checklist synced with current user
watch(selectedUserObj, newVal => {
  managedRolesList.value = newVal ? [...newVal.roles] : []
})

// Handlers & Actions
const saveRole = () => {
  if (editingRole.value) {
    editingRole.value.name = roleForm.value.name
    editingRole.value.description = roleForm.value.description
    editingRole.value.permissions = [...roleForm.value.permissions]
    Notify.create({ type: 'positive', message: 'Role updated successfully' })
  } else {
    roles.value.push({
      id: Date.now(),
      name: roleForm.value.name,
      description: roleForm.value.description,
      isSystem: false,
      permissions: [...roleForm.value.permissions]
    })
    Notify.create({ type: 'positive', message: 'New role created' })
  }
  resetRoleForm()
  activeTab.value = 'role-list'
}

const editRole = role => {
  editingRole.value = role
  roleForm.value = {
    name: role.name,
    description: role.description,
    permissions: [...role.permissions]
  }
  activeTab.value = 'add-role'
}

const resetRoleForm = () => {
  editingRole.value = null
  roleForm.value = { name: '', description: '', permissions: [] }
  activeTab.value = 'role-list'
}

const deleteRole = role => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Remove role "${role.name}"?`,
    cancel: true,
    persistent: true,
    dark: true
  }).onOk(() => {
    roles.value = roles.value.filter(r => r.id !== role.id)
    users.value.forEach(u => {
      u.roles = u.roles.filter(rName => rName !== role.name)
    })
    Notify.create({ type: 'info', message: 'Role removed' })
  })
}

const saveUser = async () => {
  try {
    // 1. Map role selection (e.g., role ID from selection, or find ID by name)
    // Assuming userForm.value.roleId holds the numeric ID (e.g., 1 for ADMIN)
    const selectedRoleId = userForm.value.roleId || 1

    // 2. Prepare payload matching your API's expected structure
    const payload = {
      username: userForm.value.username,
      email: userForm.value.email,
      role: {
        Id: Number(selectedRoleId)
      }
    }

    // 3. Send request to backend
    const response = await api.post('/users/create', payload)
    const newUser = response.data

    // 4. Map returned user to your local state
    const formattedUser = {
      id: newUser.Id || newUser.id,
      name:
        newUser.firstName || newUser.lastName
          ? `${newUser.firstName || ''} ${newUser.lastName || ''}`.trim()
          : newUser.username,
      email: newUser.email,
      roles: newUser.role?.roleName
        ? [newUser.role.roleName.replace('ROLE_', '')]
        : ['USER'],
      status: newUser.enabled !== false ? 'Active' : 'Inactive'
    }

    // 5. Update UI state and notify
    users.value.push(formattedUser)

    Notify.create({
      type: 'positive',
      message: 'User account created successfully'
    })

    resetUserForm()
    activeTab.value = 'user-list'
  } catch (error) {
    console.error('Error creating user:', error)
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to create user account'
    })
  }
}

const resetUserForm = () => {
  userForm.value = {
    username: '',
    name: '',
    email: '',
    roles: [],
    status: 'Active'
  }
}

const deleteUser = user => {
  $q.dialog({
    title: 'Delete User',
    message: `Remove user ${user.name}?`,
    cancel: true,
    persistent: true,
    dark: true
  }).onOk(() => {
    users.value = users.value.filter(u => u.id !== user.id)
    if (selectedUserForRole.value === user.id) {
      selectedUserForRole.value = null
    }
    Notify.create({ type: 'info', message: 'User deleted' })
  })
}

const quickManageUser = user => {
  selectedUserForRole.value = user.id
  activeTab.value = 'manage-roles'
}

const saveManagedUserRoles = () => {
  if (!selectedUserObj.value) return
  if (managedRolesList.value.length === 0) {
    Notify.create({
      type: 'warning',
      message: 'User requires at least one role'
    })
    return
  }

  selectedUserObj.value.roles = [...managedRolesList.value]
  Notify.create({
    type: 'positive',
    message: `Updated roles for ${selectedUserObj.value.name}`
  })
}
</script>

<style scoped>
/* Dark Design Palette */
.dark-bg {
  background-color: #0b1120;
}

.bg-card {
  background-color: #131c2e;
}

.bg-inner-card {
  background-color: #172236;
}

.bg-tab-header {
  background-color: #0f172a;
}

.border-card {
  border: 1px solid #1e293b;
}

.border-bottom-dark {
  border-bottom: 1px solid #1e293b;
}

.text-slate-muted {
  color: #94a3b8;
}
.text-slate-300 {
  color: #cbd5e1;
}

.shadow-dark {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
}

.card-hover-shadow {
  transition: all 0.2s ease-in-out;
}

.card-hover-shadow:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.min-height-screen {
  min-height: 100vh;
}

.responsive-form-container {
  width: 100%;
  max-width: clamp(300px, 90vw, 600px);
}

.text-wrap {
  word-break: break-word;
}

/* Custom Input & Table Styling */
/* :deep(.dark-input .q-field__inner) {
  background-color: #1e293b;
  border-radius: 4px;
} */

:deep(.custom-dark-table .q-table__card) {
  background-color: transparent;
}

:deep(.custom-dark-table th) {
  color: #94a3b8;
  font-weight: 600;
  border-bottom: 1px solid #1e293b;
}

:deep(.custom-dark-table td) {
  border-bottom: 1px solid #1e293b;
}
</style>
