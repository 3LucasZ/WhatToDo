export const CONTEXTS = ['work', 'personal', 'club', 'gym'] as const
export type Context = (typeof CONTEXTS)[number]

export interface Task {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'abandoned'
  parentId: string | null
  forkType: 'tangent' | null
  context: Context
  createdAt: number
  completedAt: number | null
}

export type View =
  | { name: 'dashboard' }
  | { name: 'focus'; taskId: string }
  | { name: 'tree'; taskId: string }
  | { name: 'inbox' }
