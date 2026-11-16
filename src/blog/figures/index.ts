import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/*
  Figure registry. A post embeds a figure with ::figure{id=... caption="..."}
  and the id is looked up here. Each figure is its own chunk, so a post only
  downloads the figures it uses.

  To add one: create the component in this folder, then add a line below.
  `label` is the accessible description of what the figure shows.
*/
export type FigureEntry = {
  label: string
  component: LazyExoticComponent<ComponentType>
}

export const figures: Record<string, FigureEntry> = {
  'zkteco-sync': {
    label: 'Flow from fingerprint terminal to sync worker to ERP API to database, with retries and a unique key on punches.',
    component: lazy(() => import('./ZktecoSync')),
  },
  'tenant-request': {
    label: 'A request carries a token with tenant_id; the tenant context reads it and the DbContext adds a tenant filter, so only tenant A rows return.',
    component: lazy(() => import('./TenantRequest')),
  },
  'tenant-stack': {
    label: 'Four stacked layers, Interface, API, Business logic and Data, each split by organization, with one organization highlighted through all four.',
    component: lazy(() => import('./TenantStack')),
  },
  'db-choice': {
    label: 'Comparison of the coaching center ERP on SQL Server and the land syndicate SaaS on PostgreSQL with PostGIS across hosting, data shape and deciding need.',
    component: lazy(() => import('./DbChoice')),
  },
}
