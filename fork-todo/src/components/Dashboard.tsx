import { useState } from 'react'
import type { Context, View } from '../types'
import { CONTEXTS } from '../types'
import type { TaskActions } from '../useTasks'
import TaskCard from './TaskCard'
import CreateTaskForm from './CreateTaskForm'

interface Props {
  actions: TaskActions
  setView: (view: View) => void
}

export default function Dashboard({ actions, setView }: Props) {
  const [creating, setCreating] = useState<Context | null>(null)

  const handleToggle = (id: string) => {
    const task = actions.getTask(id)
    if (task?.status === 'completed') actions.reactivateTask(id)
    else actions.completeTask(id)
  }

  return (
    <div className="dashboard">
      {CONTEXTS.map((context) => {
        const tasks = actions.getActiveByContext(context)
        return (
          <div key={context} className="column">
            <div className="column-header">
              <h2>{context}</h2>
              <button className="add-btn" onClick={() => setCreating(creating === context ? null : context)}>
                +
              </button>
            </div>

            {creating === context && (
              <CreateTaskForm
                defaultContext={context}
                onSubmit={(title, ctx) => {
                  actions.addTask(title, ctx)
                  setCreating(null)
                }}
              />
            )}

            {tasks.length === 0 && !creating && <div className="empty">no tasks</div>}

            {tasks.map((task) => (
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
      })}
    </div>
  )
}
