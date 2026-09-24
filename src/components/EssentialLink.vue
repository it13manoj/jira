<template>
  <div>
    <!-- Accessible to ALL roles -->
    <q-item
      clickable
      v-ripple
      to="/dashboard"
      active-class="text-primary text-weight-bold"
    >
      <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
      <q-item-section>Dashboard</q-item-section>
    </q-item>

    <!-- ADMIN ONLY: Users Menu -->
    <!-- <q-expansion-item
      v-if="userRole === 'ROLE_ADMIN' || userRole === 'ADMIN'"
      icon="people"
      label="Users"
      header-class="text-weight-medium"
    > -->
    <!-- <q-list class="q-pl-md"> -->
    <q-item
      clickable
      v-ripple
      to="/users"
      active-class="text-primary text-weight-bold"
    >
      <q-item-section avatar
        ><q-icon name="format_list_bulleted" size="20px"
      /></q-item-section>
      <q-item-section>List Users</q-item-section>
    </q-item>
    <!-- <q-item
      clickable
      v-ripple
      to="/users/create"
      active-class="text-primary text-weight-bold"
    >
      <q-item-section avatar
        ><q-icon name="person_add" size="20px"
      /></q-item-section>
      <q-item-section>Add User</q-item-section>
    </q-item> -->
    <!-- </q-list>
    </q-expansion-item> -->

    <!-- Shared Links -->
    <q-item
      clickable
      v-ripple
      to="/projects"
      active-class="text-primary text-weight-bold"
    >
      <q-item-section avatar><q-icon name="assignment" /></q-item-section>
      <q-item-section>Projects</q-item-section>
    </q-item>

    <q-item
      clickable
      v-ripple
      to="/git-integration"
      active-class="text-primary text-weight-bold"
    >
      <q-item-section avatar
        ><q-icon name="settings" size="20px"
      /></q-item-section>
      <q-item-section>Git Integration Configuration</q-item-section>
    </q-item>

    <q-item
      clickable
      v-ripple
      to="/reports"
      active-class="text-primary text-weight-bold"
    >
      <q-item-section avatar
        ><q-icon name="analytics" size="20px"
      /></q-item-section>
      <q-item-section>Reports</q-item-section>
    </q-item>

    <q-item
      clickable
      v-ripple
      to="/project-workspace-chat"
      active-class="text-primary text-weight-bold"
    >
      <q-item-section avatar
        ><q-icon name="message" size="20px"
      /></q-item-section>
      <q-item-section>Project Workspace Chat</q-item-section>
    </q-item>

    <q-item
      clickable
      v-ripple
      to="/configuration"
      active-class="text-primary text-weight-bold"
    >
      <q-item-section avatar
        ><q-icon name="settings" size="20px"
      /></q-item-section>
      <q-item-section>Configuration</q-item-section>
    </q-item>
    <q-item
      clickable
      v-ripple
      to="/git-configuration"
      active-class="text-primary text-weight-bold"
    >
      <q-item-section avatar
        ><q-icon name="settings" size="20px"
      /></q-item-section>
      <q-item-section>Git Configuration</q-item-section>
    </q-item>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserRole } from '../utils/auth'

const userRole = ref('')

onMounted(() => {
  userRole.value = getUserRole()
})

console.log(userRole.value)
</script>
