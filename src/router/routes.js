const routes = [
  {
    path: '/',
    // Render through your main layout wrapper
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/pages/AuthPage.vue')
      }
    ]
  },
  {
    path: '/dashboard',
    // Render through your main layout wrapper
    component: () => import('@/layouts/MainLayout.vue'),
    meta: {
      roles: [
        'ROLE_ADMIN',
        'ADMIN',
        'ROLE_USERS',
        'ROLE_ENGINEER',
        'ROLE_DEVELOPER',
        'ROLE_SEO',
        'ROLE_HR',
        'ROLE_TEMALEADS'
      ]
    },
    children: [
      {
        path: '/dashboard',
        component: () => import('@/pages/DashboardPage.vue')
      },
      {
        path: '/projects',
        component: () => import('@/pages/ProjectsListPage.vue')
      },
      {
        path: '/projects/create',
        component: () => import('@/pages/AddProjectPage.vue')
      },
      {
        path: '/view/tasks',
        component: () => import('@/pages/TaskListBoard.vue')
      },
      {
        path: '/project/:id/view/tasks/:taskId',
        component: () => import('@/pages/TaskDetailPage.vue')
      },
      {
        path: '/users',
        component: () => import('@/pages/Users.vue')
      },
      {
        path: '/git-integration',
        component: () => import('@/pages/IntegrationConfiguration.vue')
      },
      {
        path: '/reports',
        component: () => import('@/pages/Reports.vue')
      },
      {
        path: '/project-workspace-chat',
        component: () => import('@/pages/ProjectWorkspaceChat.vue')
      },
      {
        path: '/configuration',
        component: () => import('@/pages/ConfigurationPage.vue')
      },
      {
        path: '/git-configuration',
        component: () => import('@/pages/GitSetup.vue')
      }
    ]
  }
]

export default routes
