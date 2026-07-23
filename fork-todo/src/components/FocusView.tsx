import { useState } from 'react'
import type { View } from '../types'
import type { TaskActions } from '../useTasks'
import TaskCard from './TaskCard'

interface Props {
  taskId: string
  actions: TaskActions
  setView: (view: View) => void
}

export default function FocusView({ taskId, actions, setView }: Props) {
  const [forkTitle, setForkTitle] = useState('')
  const [description, setDescription] = useState('')

  const task = actions.getTask(taskId)
  if (!task) return <div className="empty">task not found</div>

  const ancestors = actions.getAncestors(taskId)
  const forks = actions.getChildTasks(taskId)
  const forkCount = actions.getForkCount(taskId)

  const handleToggle = () => {
    if (task.status === 'completed') actions.reactivateTask(taskId)
    else actions.completeTask(taskId)
  }

  const handleFork = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = forkTitle.trim()
    if (!trimmed) return
    const newId = actions.addTask(trimmed, task.context, taskId, 'tangent')
    setForkTitle('')
    setView({ name: 'focus', taskId: newId })
  }

  return (
    <div className="focus-view">
      <div className="back-row">
        <button onClick={() => setView({ name: 'dashboard' })}>&larr; Back</button>
      </div>

      {ancestors.length > 0 && (
        <div className="breadcrumb">
          {ancestors.map((a) => (
            <span key={a.id} onClick={() => setView({ name: 'focus', taskId: a.id })}>
              {a.title}
            </span>
          ))}
          <span className="sep">/</span>
          <span style={{ fontWeight: 600 }}>{task.title}</span>
        </div>
      )}

      <div className="focus-task">
        <h2>{task.title}</h2>
        <textarea
          className="description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="add notes..."
        />
        <div className="meta">
          <span className={`badge badge-context ${task.context}`}>{task.context}</span>
          {forkCount > 0 && <span className="badge badge-fork">{forkCount} fork{forkCount !== 1 ? 's' : ''}</span>}
          {task.parentId && <span className="badge badge-fork">tangent</span>}
          {task.status === 'completed' && <span className="badge badge-fork" style={{ background: '#e8f5e9', color: '#2e7d32' }}>done</span>}
        </div>
        <div className="actions">
          <button className="primary" onClick={handleToggle}>
            {task.status === 'completed' ? 'Reactivate' : 'Complete'}
          </button>
          <button onClick={() => { actions.abandonTask(taskId); setView({ name: 'dashboard' }) }}>
            Abandon
          </button>
          <button onClick={() => setView({ name: 'tree', taskId })}>
            View Tree
          </button>
        </div>
      </div>

      <div className="fork-section">
        <h3>Fork a tangent</h3>
        <form className="fork-form" onSubmit={handleFork}>
          <input
            type="text"
            value={forkTitle}
            onChange={(e) => setForkTitle(e.target.value)}
            placeholder="What's the tangent?"
            autoFocus
          />
          <button className="primary" type="submit">
            Fork
          </button>
        </form>

        <div className="fork-list">
          {forks.length === 0 && <div className="empty">no forks yet</div>}
          {forks.map((f) => (
            <TaskCard
              key={f.id}
              task={f}
              forkCount={actions.getForkCount(f.id)}
              onToggle={(id) => {
                if (f.status === 'completed') actions.reactivateTask(id)
                else actions.completeTask(id)
              }}
              onClick={(id) => setView({ name: 'focus', taskId: id })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
