'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { experimental_useObject as useObject } from 'ai/react'
import { coursePreviewSchema, type CoursePreview } from '@/lib/schemas/course'
import { saveCoursePreview, saveCourseToDB } from '@/app/actions/course'

type FlowState = 'idle' | 'generating' | 'review' | 'saving' | 'error'
type InputMode = 'upload' | 'paste'

interface Props {
  /** Pre-loaded draft from a previous session (tab-close recovery) */
  draft?: { courseId: string; preview: CoursePreview; syllabus: string } | null
}

async function parseFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/parse-document', { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to parse file')
  }
  const { text } = await res.json()
  return text as string
}

export function GenerateFlow({ draft }: Props) {
  const router = useRouter()

  // ── state ────────────────────────────────────────────────────────────────
  const [flowState, setFlowState] = useState<FlowState>(
    draft ? 'review' : 'idle',
  )
  // syllabus = the text stored as raw_syllabus in DB
  const [syllabus, setSyllabus] = useState(draft?.syllabus ?? '')
  // syllabusRef lets onFinish always see the latest syllabus value
  const syllabusRef = useRef(draft?.syllabus ?? '')
  const [courseId, setCourseId] = useState<string | null>(draft?.courseId ?? null)
  const [editablePreview, setEditablePreview] = useState<CoursePreview | null>(
    draft?.preview ?? null,
  )
  const [errorMsg, setErrorMsg] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // input mode state
  const [inputMode, setInputMode] = useState<InputMode>('upload')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [syllabusOpen, setSyllabusOpen] = useState(false)

  // ── AI streaming ─────────────────────────────────────────────────────────
  const { object: streamingPreview, submit } = useObject({
    api: '/api/generate-course',
    schema: coursePreviewSchema,
    onFinish: async ({ object }) => {
      if (!object) {
        setErrorMsg('Generation produced no output. Please try again.')
        setFlowState('error')
        return
      }
      try {
        const { courseId: id } = await saveCoursePreview(syllabusRef.current, object)
        setCourseId(id)
        setEditablePreview(object)
        setFlowState('review')
      } catch {
        setErrorMsg('Failed to save preview. Please try again.')
        setFlowState('error')
      }
    },
    onError: () => {
      setErrorMsg('Generation failed. Check your API key and try again.')
      setFlowState('error')
    },
  })

  // Focus textarea on mount (paste mode)
  useEffect(() => {
    if (flowState === 'idle' && inputMode === 'paste') textareaRef.current?.focus()
  }, [flowState, inputMode])

  // ── helpers ───────────────────────────────────────────────────────────────
  const setSyllabusAndRef = (text: string) => {
    setSyllabus(text)
    syllabusRef.current = text
  }

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setParseError('')

    if (inputMode === 'paste') {
      if (!syllabus.trim()) return
      syllabusRef.current = syllabus
      setFlowState('generating')
      submit({ syllabus })
      return
    }

    // upload mode — parse all files and concatenate
    if (uploadedFiles.length === 0) return

    setIsParsing(true)
    try {
      const texts = await Promise.all(uploadedFiles.map(parseFile))
      const combined = texts.join('\n\n---\n\n')
      setSyllabusAndRef(combined)
      setFlowState('generating')
      submit({ syllabus: combined })
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse file')
      setIsParsing(false)
    }
  }

  const handleSave = async () => {
    if (!courseId || !editablePreview) return
    setFlowState('saving')
    try {
      const { courseId: id } = await saveCourseToDB(courseId, editablePreview)
      router.push(`/course/${id}`)
    } catch {
      setErrorMsg('Save failed. Please try again.')
      setFlowState('error')
    }
  }

  const updateCourseTitle = (title: string) =>
    setEditablePreview((p) => (p ? { ...p, title } : p))

  const updateModule = (
    mi: number,
    field: 'title' | 'description',
    value: string,
  ) =>
    setEditablePreview((p) => {
      if (!p) return p
      const modules = p.modules.map((m, i) =>
        i === mi ? { ...m, [field]: value } : m,
      )
      return { ...p, modules }
    })

  const updateAssignment = (
    mi: number,
    ai: number,
    field: 'title' | 'instructions' | 'due_date' | 'points_possible',
    value: string | number,
  ) =>
    setEditablePreview((p) => {
      if (!p) return p
      const modules = p.modules.map((m, i) => {
        if (i !== mi) return m
        const assignments = m.assignments.map((a, j) =>
          j === ai ? { ...a, [field]: value } : a,
        )
        return { ...m, assignments }
      })
      return { ...p, modules }
    })

  // ── renders ───────────────────────────────────────────────────────────────

  const canGenerate =
    inputMode === 'paste'
      ? syllabus.trim().length > 0
      : uploadedFiles.length > 0

  if (flowState === 'idle') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Create a course from your syllabus
          </h1>
          <p className="mt-2 text-slate-500">
            Upload your documents or paste text. AI will generate modules,
            assignments, due dates, and rubrics in seconds.
          </p>
        </div>

        {/* ── Input mode tabs ── */}
        <div className="mb-5 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
          {(['upload', 'paste'] as InputMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setInputMode(m)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
                inputMode === m
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'upload' ? 'Upload files' : 'Paste text'}
            </button>
          ))}
        </div>

        {inputMode === 'upload' && (
          <MultiDropzone files={uploadedFiles} onFiles={setUploadedFiles} />
        )}

        {inputMode === 'paste' && (
          <textarea
            ref={textareaRef}
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            placeholder="Paste your syllabus here…"
            rows={16}
            className="w-full resize-none rounded-xl border border-slate-300 bg-white p-4 text-sm leading-relaxed text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        )}

        {parseError && (
          <p className="mt-3 text-sm text-red-600">{parseError}</p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isParsing}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isParsing ? 'Reading file…' : 'Generate Course →'}
          </button>
        </div>
      </div>
    )
  }

  if (flowState === 'generating') {
    const partial = streamingPreview
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span className="text-sm font-medium text-slate-600">
            Generating course structure…
          </span>
        </div>

        {partial?.title && (
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            {partial.title}
          </h2>
        )}

        <div className="space-y-3">
          {partial?.modules?.map((mod, mi) => (
            <div
              key={mi}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  Week {mod?.week_number ?? mi + 1}
                </span>
                <span className="font-semibold text-slate-800">
                  {mod?.title ?? '…'}
                </span>
              </div>
              {mod?.description && (
                <p className="mt-1 text-sm text-slate-500">{mod.description}</p>
              )}
              {mod?.assignments && mod.assignments.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {mod.assignments.map((a, ai) => (
                    <li
                      key={ai}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <span className="text-slate-300">→</span>
                      <span>{a?.title ?? '…'}</span>
                      {a?.due_date && (
                        <span className="ml-auto text-xs text-slate-400">
                          {a.due_date}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (flowState === 'error') {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-red-600">{errorMsg}</p>
        <button
          onClick={() => setFlowState('idle')}
          className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          ← Try again
        </button>
      </div>
    )
  }

  // ── review / edit ─────────────────────────────────────────────────────────
  if ((flowState === 'review' || flowState === 'saving') && editablePreview) {
    return (
      <div className="mx-auto max-w-3xl">
        {draft && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ↩ Recovered unsaved course from your last session.
          </div>
        )}

        <div className="mb-6 flex items-end justify-between">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-400">
              Course Title
            </label>
            <input
              value={editablePreview.title}
              onChange={(e) => updateCourseTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-xl font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={flowState === 'saving'}
            className="ml-4 flex-shrink-0 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {flowState === 'saving' ? 'Saving…' : 'Save Course →'}
          </button>
        </div>

        {/* Collapsible syllabus editor */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setSyllabusOpen((o) => !o)}
            className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>Raw Syllabus</span>
            <span className="text-slate-400">{syllabusOpen ? '▲' : '▼'}</span>
          </button>
          {syllabusOpen && (
            <div className="border-t border-slate-100 px-5 py-4">
              <textarea
                value={syllabus}
                onChange={(e) => setSyllabusAndRef(e.target.value)}
                rows={14}
                className="w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <p className="mt-1 text-xs text-slate-400">
                Edits here update the stored syllabus text only — regenerate to reflect changes in the course structure.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {editablePreview.modules.map((mod, mi) => (
            <div
              key={mi}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Module header */}
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <span className="flex-shrink-0 rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  Week {mod.week_number}
                </span>
                <input
                  value={mod.title}
                  onChange={(e) => updateModule(mi, 'title', e.target.value)}
                  className="flex-1 rounded border-0 bg-transparent text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:ring-offset-1"
                />
              </div>

              <div className="px-5 py-3">
                <textarea
                  value={mod.description}
                  onChange={(e) =>
                    updateModule(mi, 'description', e.target.value)
                  }
                  rows={2}
                  className="w-full resize-none rounded border border-transparent bg-slate-50 px-2 py-1.5 text-sm text-slate-600 focus:border-slate-300 focus:outline-none focus:ring-0"
                />
              </div>

              {/* Assignments */}
              {mod.assignments.length > 0 && (
                <div className="divide-y divide-slate-100 border-t border-slate-100">
                  {mod.assignments.map((a, ai) => (
                    <div key={ai} className="px-5 py-4">
                      <div className="grid grid-cols-[1fr_auto_auto] items-start gap-3">
                        <input
                          value={a.title}
                          onChange={(e) =>
                            updateAssignment(mi, ai, 'title', e.target.value)
                          }
                          className="rounded border-0 bg-transparent text-sm font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:ring-offset-1"
                        />
                        <input
                          type="date"
                          value={a.due_date ?? ''}
                          onChange={(e) =>
                            updateAssignment(
                              mi,
                              ai,
                              'due_date',
                              e.target.value || '',
                            )
                          }
                          className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-indigo-500 focus:outline-none"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={a.points_possible}
                            min={1}
                            onChange={(e) =>
                              updateAssignment(
                                mi,
                                ai,
                                'points_possible',
                                Number(e.target.value),
                              )
                            }
                            className="w-16 rounded border border-slate-200 px-2 py-1 text-center text-xs text-slate-600 focus:border-indigo-500 focus:outline-none"
                          />
                          <span className="text-xs text-slate-400">pts</span>
                        </div>
                      </div>
                      <textarea
                        value={a.instructions}
                        onChange={(e) =>
                          updateAssignment(
                            mi,
                            ai,
                            'instructions',
                            e.target.value,
                          )
                        }
                        rows={2}
                        className="mt-2 w-full resize-none rounded border border-transparent bg-slate-50 px-2 py-1.5 text-xs leading-relaxed text-slate-500 focus:border-slate-300 focus:outline-none"
                      />
                      {a.rubric.criteria.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {a.rubric.criteria.map((c, ci) => (
                            <li
                              key={ci}
                              className="flex items-center gap-2 text-xs text-slate-400"
                            >
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span className="flex-1">{c.description}</span>
                              <span className="tabular-nums">{c.points} pts</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={flowState === 'saving'}
            className="rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {flowState === 'saving' ? 'Saving…' : 'Save Course →'}
          </button>
        </div>
      </div>
    )
  }

  return null
}

// ── Folder-aware file reading ────────────────────────────────────────────

async function readFilesFromDrop(items: DataTransferItemList): Promise<File[]> {
  const files: File[] = []

  async function processEntry(entry: FileSystemEntry): Promise<void> {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) =>
        (entry as FileSystemFileEntry).file(resolve, reject),
      )
      files.push(file)
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader()
      const entries = await new Promise<FileSystemEntry[]>((resolve, reject) =>
        reader.readEntries(resolve, reject),
      )
      await Promise.all(entries.map(processEntry))
    }
  }

  const entries = Array.from(items)
    .map((item) => item.webkitGetAsEntry())
    .filter((e): e is FileSystemEntry => e !== null)

  await Promise.all(entries.map(processEntry))
  return files
}

// ── MultiDropzone ────────────────────────────────────────────────────────

function MultiDropzone({
  files,
  onFiles,
}: {
  files: File[]
  onFiles: (files: File[]) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    folderInputRef.current?.setAttribute('webkitdirectory', '')
  }, [])

  const addFiles = (incoming: File[]) =>
    onFiles([...files, ...incoming])

  const removeFile = (i: number) =>
    onFiles(files.filter((_, idx) => idx !== i))

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const incoming = await readFilesFromDrop(e.dataTransfer.items)
    if (incoming.length) addFiles(incoming)
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-slate-300 bg-slate-50 hover:border-indigo-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const f = Array.from(e.target.files ?? [])
            if (f.length) addFiles(f)
            e.target.value = ''
          }}
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const f = Array.from(e.target.files ?? [])
            if (f.length) addFiles(f)
            e.target.value = ''
          }}
        />
        <p className="text-sm text-slate-500">Drag &amp; drop files or folders here</p>
        <div className="mt-3 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            Browse files
          </button>
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            Browse folder
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-1">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <span className="truncate text-sm text-slate-700">{f.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="ml-3 flex-shrink-0 text-xs text-slate-400 hover:text-red-500"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
