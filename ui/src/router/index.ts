//
// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later
//
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Status from '../views/Status.vue'
import Settings from '../views/Settings.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Status',
    component: Status,
    alias: '/status',
    meta: { title: 'Status' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { title: 'Settings' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { title: 'About' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
