import { useState, useCallback, useEffect } from 'react'
import type { Context, Task } from './types'
import { loadTasks, saveTasks } from './storage'

function uid(): string {
  return crypto.randomUUID()
}

export interface TaskActions {
  tasks: Task[]
  addTask: (title: string, context: Context, parentId?: string, forkType?: 'tangent') => string
  completeTask: (id: string) => void
  abandonTask: (id: string) => void
  reactivateTask: (id: string) => void
  getChildTasks: (parentId: string) => Task[]
  getAncestors: (id: string) => Task[]
  getDescendants: (id: string) => Task[]
  getForkCount: (id: string) => number
  getActiveByContext: (context: Context) => Task[]
  getTask: (id: string) => Task | undefined
}

export function useTasks(): TaskActions {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const addTask = useCallback(
    (title: string, context: Context, parentId?: string, forkType?: 'tangent'): string => {
      const id = uid()
      const task: Task = {
        id,
        title,
        description: '',
        status: 'active',
        parentId: parentId ?? null,
        forkType: forkType ?? null,
        context,
        createdAt: Date.now(),
        completedAt: null,
      }
      setTasks((prev) => [...prev, task])
      return id
    },
    []
  )

  const completeTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'completed', completedAt: Date.now() } : t))
    )
  }, [])

  const abandonTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'abandoned' } : t)))
  }, [])

  const reactivateTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'active', completedAt: null } : t))
    )
  }, [])

  const getTask = useCallback((id: string) => tasks.find((t) => t.id === id), [tasks])

  const getChildTasks = useCallback(
    (parentId: string) => tasks.filter((t) => t.parentId === parentId && t.status !== 'abandoned'),
    [tasks]
  )

  const getAncestors = useCallback(
    (id: string): Task[] => {
      const result: Task[] = []
      let current = tasks.find((t) => t.id === id)
      while (current && current.parentId) {
        const cur = current
        const parent = tasks.find((t) => t.id === cur.parentId)
        if (parent) {
          result.unshift(parent)
          current = parent
        } else break
      }
      return result
    },
    [tasks]
  )

  const getDescendants = useCallback(
    (id: string): Task[] => {
      const result: Task[] = []
      const stack = tasks.filter((t) => t.parentId === id && t.status !== 'abandoned')
      while (stack.length) {
        const t = stack.pop()!
        result.push(t)
        stack.push(...tasks.filter((c) => c.parentId === t.id && c.status !== 'abandoned'))
      }
      return result
    },
    [tasks]
  )

  const getForkCount = useCallback(
    (id: string) => tasks.filter((t) => t.parentId === id && t.status !== 'abandoned').length,
    [tasks]
  )

  const getActiveByContext = useCallback(
    (context: Context) =>
      tasks.filter((t) => t.context === context && t.status === 'active' && !t.parentId),
    [tasks]
  )

  return {
    tasks,
    addTask,
    completeTask,
    abandonTask,
    reactivateTask,
    getChildTasks,
    getAncestors,
    getDescendants,
    getForkCount,
    getActiveByContext,
    getTask,
  }
}
