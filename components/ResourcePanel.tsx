'use client'

import { useRef, useState, useTransition } from 'react'
import { addResource, removeResource, type Resource } from '@/app/actions/resources'

interface Props {
  assignmentId: string
  initialResources: Resource[]
}

export function ResourcePanel({ assignmentId, initialResources }: Props) {
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [mode, setMode] = useState<'file' | 'link'>('link')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) {
      setError('Title and URL are required')
      return
    }
    setError('')
    startTransition(async () => {
      const resource = await addResource(assignmentId, { title: linkTitle, type: 'link', url: linkUrl })
      setResources((prev) => [...prev, resource])
      setLinkTitle('')
      setLinkUrl('')
    })
  }

  const handleFileUpload = async (file: File) => {
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error ?? 'Upload failed')
        return
      }
      const { url } = await res.json()
      startTransition(async () => {
        const resource = await addResource(assignmentId, { title: file.name, type: 'file', url })
        setResources((prev) => [...prev, resource])
      })
    } catch {
      setError('Upload failed')
    }
  }

  const handleRemove = (id: string) => {
    startTransition(async () => {
      await removeResource(id)
      setResources((prev) => prev.filter((r) => r.id !== id))
    })
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Resources</p>

      {resources.length > 0 && (
        <ul className="mb-3 space-y-1">
          {resources.map((r) => (
            <li key={r.id} className="flex items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1.5">
              <span className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-500">{r.type}</span>
              {r.type === 'link' ? (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-xs text-indigo-600 hover:underline">
                  {r.title}
                </a>
              ) : (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-xs text-slate-700 hover:text-indigo-600">
                  {r.title}
                </a>
              )}
              <button
                type="button"
                onClick={() => handleRemove(r.id)}
                disabled={isPending}
                className="text-xs text-slate-400 hover:text-red-500 disabled:opacity-40"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Mode tabs */}
      <div className="mb-2 flex gap-1 rounded border border-slate-200 bg-white p-0.5 w-fit">
        {(['link', 'file'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded px-2 py-0.5 text-xs transition ${mode === m ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {m === 'link' ? 'Add link' : 'Upload file'}
          </button>
        ))}
      </div>

      {mode === 'link' && (
        <div className="flex gap-2">
          <input
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            placeholder="Title"
            className="w-32 rounded border border-slate-200 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none"
          />
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://…"
            className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddLink}
            disabled={isPending}
            className="rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            Add
          </button>
        </div>
      )}

      {mode === 'file' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFileUpload(f)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="rounded border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            {isPending ? 'Uploading…' : 'Choose file…'}
          </button>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
