import { useState } from 'react'
import type { View, Context } from '../types'
import { CONTEXTS } from '../types'
import type { TaskActions } from '../useTasks'
import TaskCard from './TaskCard'

interface Props {
  actions: TaskActions
  setView: (view: View) => void
}

export default function Inbox({ actions, setView }: Props) {
  const [search, setSearch] = useState('')
  const [filterContext, setFilterContext] = useState<Context | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'abandoned'>('all')

  const query = search.toLowerCase()
  const filtered = actions.tasks.filter((t) => {
    if (filterContext !== 'all' && t.context !== filterContext) return false
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (query && !t.title.toLowerCase().includes(query)) return false
    return true
  })

  const handleToggle = (id: string) => {
    const task = actions.getTask(id)
    if (task?.status === 'completed') actions.reactivateTask(id)
    else actions.completeTask(id)
  }

  return (
    <div className="inbox">
      <div className="back-row">
        <button onClick={() => setView({ name: 'dashboard' })}>&larr; Dashboard</button>
        <h2 style={{ margin: 0 }}>Inbox ({filtered.length})</h2>
      </div>

      <div className="inbox-filters">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterContext} onChange={(e) => setFilterContext(e.target.value as Context | 'all')}>
          <option value="all">all contexts</option>
          {CONTEXTS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}>
          <option value="all">all statuses</option>
          <option value="active">active</option>
          <option value="completed">completed</option>
          <option value="abandoned">abandoned</option>
        </select>
      </div>

      {filtered.length === 0 && <div className="empty">no tasks match</div>}

      {filtered.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          forkCount={actions.getForkCount(task.id)}
          onToggle={handleToggle}
          onClick={(id) => setView({ name: 'focus', taskId: id })}
        />
      ))}
    </div>
  )
}
