const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API error ${res.status}: ${body}`)
  }
  return res.json()
}

// --- Widget (public) ---

export interface WidgetConfig {
  id: string
  name: string
  organization_id: string
  layout: 'carousel' | 'grid' | 'list' | 'masonry'
  config: Record<string, unknown>
}

export interface Post {
  id: string
  linkedin_post_id: string
  organization_id: string
  author_name: string
  author_avatar_url: string | null
  content: string
  media_url: string | null
  media_type: string | null
  post_url: string
  like_count: number
  comment_count: number
  share_count: number
  published_at: string
}

export function fetchWidget(id: string) {
  return request<WidgetConfig>(`/widget/${id}`)
}

export function fetchWidgetPosts(id: string) {
  return request<Post[]>(`/widget/${id}/posts`)
}

// --- Admin: Organizations ---

export interface Organization {
  id: string
  name: string
  linkedin_organization_id: string
  access_token?: string
  post_count?: number
  created_at: string
}

export function listOrganizations() {
  return request<Organization[]>('/admin/organizations')
}

export function createOrganization(data: {
  name: string
  linkedin_organization_id: string
  access_token: string
}) {
  return request<Organization>('/admin/organizations', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function refreshPosts(orgId: string) {
  return request<{ message: string }>(`/admin/organizations/${orgId}/refresh`, {
    method: 'POST',
  })
}

export function deleteOrganization(orgId: string) {
  return request<void>(`/admin/organizations/${orgId}`, {
    method: 'DELETE',
  })
}

// --- Admin: Widgets ---

export function listWidgets() {
  return request<WidgetConfig[]>('/admin/widgets')
}

export function createWidget(data: Partial<WidgetConfig>) {
  return request<WidgetConfig>('/admin/widgets', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateWidget(id: string, data: Partial<WidgetConfig>) {
  return request<WidgetConfig>(`/admin/widgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteWidget(id: string) {
  return request<void>(`/admin/widgets/${id}`, {
    method: 'DELETE',
  })
}
