import { useState } from 'react'
import type { Context } from '../types'
import { CONTEXTS } from '../types'

interface Props {
  defaultContext?: Context
  onSubmit: (title: string, context: Context) => void
  placeholder?: string
}

export default function CreateTaskForm({ defaultContext = 'work', onSubmit, placeholder = 'Add a task...' }: Props) {
  const [title, setTitle] = useState('')
  const [context, setContext] = useState<Context>(defaultContext)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onSubmit(trimmed, context)
    setTitle('')
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        autoFocus
      />
      <select value={context} onChange={(e) => setContext(e.target.value as Context)}>
        {CONTEXTS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button type="submit">Add</button>
    </form>
  )
}
