import { useState } from 'react'
import type { View } from './types'
import { useTasks } from './useTasks'
import Dashboard from './components/Dashboard'
import FocusView from './components/FocusView'
import TreeView from './components/TreeView'
import Inbox from './components/Inbox'

export default function App() {
  const actions = useTasks()
  const [view, setView] = useState<View>({ name: 'dashboard' })

  return (
    <div className="app">
      <div className="app-header">
        <h1><a href="#" onClick={(e) => { e.preventDefault(); setView({ name: 'dashboard' }) }}>fork todo</a></h1>
        <div className="nav">
          <button onClick={() => setView({ name: 'inbox' })}>
            Inbox ({actions.tasks.length})
          </button>
        </div>
      </div>

      {view.name === 'dashboard' && <Dashboard actions={actions} setView={setView} />}
      {view.name === 'focus' && <FocusView taskId={view.taskId} actions={actions} setView={setView} />}
      {view.name === 'tree' && <TreeView rootTaskId={view.taskId} actions={actions} setView={setView} />}
      {view.name === 'inbox' && <Inbox actions={actions} setView={setView} />}
    </div>
  )
}
