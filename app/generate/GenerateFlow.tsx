'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { experimental_useObject as useObject } from 'ai/react'
import { coursePreviewSchema, type CoursePreview } from '@/lib/schemas/course'
import { saveCoursePreview, saveCourseToDB } from '@/app/actions/course'

type FlowState = 'idle' | 'generating' | 'review' | 'saving' | 'error'

interface Props {
  /** Pre-loaded draft from a previous session (tab-close recovery) */
  draft?: { courseId: string; preview: CoursePreview; syllabus: string } | null
}

export function GenerateFlow({ draft }: Props) {
  const router = useRouter()

  // ── state ────────────────────────────────────────────────────────────────
  const [flowState, setFlowState] = useState<FlowState>(
    draft ? 'review' : 'idle',
  )
  const [syllabus, setSyllabus] = useState(draft?.syllabus ?? '')
  const [courseId, setCourseId] = useState<string | null>(draft?.courseId ?? null)
  const [editablePreview, setEditablePreview] = useState<CoursePreview | null>(
    draft?.preview ?? null,
  )
  const [errorMsg, setErrorMsg] = useState('')
  const syllabusRef = useRef<HTMLTextAreaElement>(null)

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
      // B-lite: write generation_preview to DB for tab-close recovery
      try {
        const { courseId: id } = await saveCoursePreview(syllabus, object)
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

  // Focus textarea on mount
  useEffect(() => {
    if (flowState === 'idle') syllabusRef.current?.focus()
  }, [flowState])

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!syllabus.trim()) return
    setFlowState('generating')
    submit({ syllabus })
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

  if (flowState === 'idle') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Create a course from your syllabus
          </h1>
          <p className="mt-2 text-slate-500">
            Paste your syllabus below. AI will generate modules, assignments,
            due dates, and rubrics in seconds.
          </p>
        </div>
        <textarea
          ref={syllabusRef}
          value={syllabus}
          onChange={(e) => setSyllabus(e.target.value)}
          placeholder="Paste your syllabus here…"
          rows={16}
          className="w-full resize-none rounded-xl border border-slate-300 bg-white p-4 text-sm leading-relaxed text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={!syllabus.trim()}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Generate Course →
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
