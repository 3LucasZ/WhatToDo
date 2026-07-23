import type { Task } from '../types'

interface Props {
  task: Task
  forkCount: number
  onToggle: (id: string) => void
  onClick: (id: string) => void
}

export default function TaskCard({ task, forkCount, onToggle, onClick }: Props) {
  return (
    <div
      className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).tagName !== 'INPUT') onClick(task.id)
      }}
    >
      <input
        type="checkbox"
        checked={task.status === 'completed'}
        onChange={() => onToggle(task.id)}
      />
      <span className="task-title">{task.title}</span>
      {forkCount > 0 && <span className="badge badge-fork">{forkCount}</span>}
      <span className={`badge badge-context ${task.context}`}>{task.context}</span>
    </div>
  )
}
