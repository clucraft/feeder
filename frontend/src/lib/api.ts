const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('feeder_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  })

  if (res.status === 401) {
    localStorage.removeItem('feeder_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

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

export async function fetchWidget(id: string) {
  const data = await request<{ widget: WidgetConfig; posts: Post[] }>(`/widget/${id}`)
  return data
}

export async function fetchWidgetPosts(id: string) {
  const data = await request<{ posts: Post[] }>(`/widget/${id}/posts`)
  return data.posts
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

export async function listOrganizations() {
  const data = await request<{ organizations: Organization[] }>('/admin/organizations')
  return data.organizations
}

export function createOrganization(data: {
  name: string
  linkedin_organization_id: string
  temp_token_id?: string
  access_token?: string
}) {
  return request<Organization>('/admin/organizations', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      linkedin_id: data.linkedin_organization_id,
      temp_token_id: data.temp_token_id,
      access_token: data.access_token,
    }),
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

export async function listWidgets() {
  const data = await request<{ widgets: WidgetConfig[] }>('/admin/widgets')
  return data.widgets
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
