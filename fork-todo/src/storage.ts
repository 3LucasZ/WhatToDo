import type { Task } from './types'

const KEY = 'fork-todo:tasks'

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(KEY, JSON.stringify(tasks))
}
