import type { View, Task } from '../types'
import type { TaskActions } from '../useTasks'

interface Props {
  rootTaskId: string
  actions: TaskActions
  setView: (view: View) => void
}

function TreeNode({ task, depth, actions, setView }: { task: Task; depth: number; actions: TaskActions; setView: (view: View) => void }) {
  const children = actions.getChildTasks(task.id)
  const cls = task.status === 'abandoned' ? 'abandoned' : task.status === 'completed' ? 'completed' : ''

  return (
    <div style={{ marginLeft: depth * 24 }}>
      <div className={`node-row ${cls}`} onClick={() => setView({ name: 'focus', taskId: task.id })}>
        <span className={`badge badge-context ${task.context}`} style={{ fontSize: 9 }}>
          {task.context[0]}
        </span>
        <span className="task-title">{task.title}</span>
        {task.forkType && <span className="badge badge-fork" style={{ fontSize: 9 }}>fork</span>}
      </div>
      {children.length > 0 && (
        <div className="tree-node">
          {children.map((child) => (
            <TreeNode key={child.id} task={child} depth={depth + 1} actions={actions} setView={setView} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TreeView({ rootTaskId, actions, setView }: Props) {
  const root = actions.getTask(rootTaskId)
  if (!root) return <div className="empty">task not found</div>

  return (
    <div className="tree-view">
      <div className="back-row">
        <button onClick={() => setView({ name: 'focus', taskId: rootTaskId })}>&larr; Back to task</button>
      </div>
      <TreeNode task={root} depth={0} actions={actions} setView={setView} />
    </div>
  )
}
