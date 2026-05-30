'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { experimental_useObject as useObject } from 'ai/react'
import { coursePreviewSchema, type CoursePreview } from '@/lib/schemas/course'
import { saveCoursePreview, saveCourseToDB } from '@/app/actions/course'
import { TeacherCoachContextBridge } from '@/components/TeacherCoachContextBridge'
import {
  addCourseDurationToStartDate,
  courseDurationBetweenDates,
  rescheduleDateForCourseRange,
  subtractCourseDurationFromEndDate,
  type CourseDurationInput,
  type CourseMetadataInput,
} from '@/lib/course-metadata'
import { validateRubricGenerateInput } from '@/lib/rubric-generator'
import {
  addModule,
  removeModule,
  addAssignment,
  removeAssignment,
  addCriterion,
  removeCriterion,
  updateCriterion,
} from '@/lib/course-editor'
import { RichTextarea } from '@/components/RichTextarea'

type FlowState = 'idle' | 'generating' | 'review' | 'saving' | 'error'
type InputMode = 'upload' | 'paste' | 'manual'
type DurationPart = 'weeks' | 'days'

interface Props {
  /** Pre-loaded draft from an explicit Resume action on the home page */
  draft?: { courseId: string; preview: CoursePreview; syllabus: string; metadata: CourseMetadataInput; draftKey: string | null } | null
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

  // ── draft key (ADR-0008) ─────────────────────────────────────────────────
  // One UUID per browser tab, stored in sessionStorage. When resuming via the
  // home-page Resume link, reuse the draft's existing key so the upsert targets
  // the same row rather than creating a duplicate.
  const draftKeyRef = useRef<string>('')
  useEffect(() => {
    if (draft?.draftKey) {
      draftKeyRef.current = draft.draftKey
      sessionStorage.setItem('generate-draft-key', draft.draftKey)
    } else {
      const stored = sessionStorage.getItem('generate-draft-key')
      if (stored) {
        draftKeyRef.current = stored
      } else {
        const key = crypto.randomUUID()
        sessionStorage.setItem('generate-draft-key', key)
        draftKeyRef.current = key
      }
    }
  }, [draft?.draftKey])

  // ── state ────────────────────────────────────────────────────────────────
  const [flowState, setFlowState] = useState<FlowState>(
    draft ? 'review' : 'idle',
  )
  const [metadata, setMetadata] = useState<CourseMetadataInput>(
    draft?.metadata ?? { title: '' },
  )
  const [courseDuration, setCourseDuration] = useState({ weeks: '', days: '' })
  // syllabus = the text stored as raw_syllabus in DB
  const [syllabus, setSyllabus] = useState(draft?.syllabus ?? '')
  // syllabusRef lets onFinish always see the latest syllabus value
  const syllabusRef = useRef(draft?.syllabus ?? '')
  const [courseId, setCourseId] = useState<string | null>(draft?.courseId ?? null)
  const [editablePreview, setEditablePreview] = useState<CoursePreview | null>(
    draft?.preview ?? null,
  )
  const [errorMsg, setErrorMsg] = useState('')
  const [rubricPending, setRubricPending] = useState<string | null>(null)
  const [rubricSuggestions, setRubricSuggestions] = useState<Record<string, { description: string; points: number }[]>>({})

  const [aiInstructions, setAiInstructions] = useState('')
  const [isGeneratingSyllabus, setIsGeneratingSyllabus] = useState(false)
  const [syllabusGenError, setSyllabusGenError] = useState('')

  // input mode state
  const [inputMode, setInputMode] = useState<InputMode>('upload')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [syllabusOpen, setSyllabusOpen] = useState(false)

  // ── AI streaming ─────────────────────────────────────────────────────────
  const metadataRef = useRef(metadata)
  metadataRef.current = metadata
  // Prevents a background stream from transitioning state after the user cancels
  const generationCancelledRef = useRef(false)

  const { object: streamingPreview, submit, stop } = useObject({
    api: '/api/generate-course',
    schema: coursePreviewSchema,
    onFinish: async ({ object }) => {
      if (generationCancelledRef.current) return
      if (!object) {
        setErrorMsg('Generation produced no output. Please try again.')
        setFlowState('error')
        return
      }
      try {
        const { courseId: id } = await saveCoursePreview(syllabusRef.current, object, metadataRef.current, draftKeyRef.current)
        setCourseId(id)
        setEditablePreview(object)
        setFlowState('review')
      } catch {
        setErrorMsg('Failed to save preview. Please try again.')
        setFlowState('error')
      }
    },
    onError: () => {
      if (generationCancelledRef.current) return
      setErrorMsg('Generation failed. Check your API key and try again.')
      setFlowState('error')
    },
  })


  // ── helpers ───────────────────────────────────────────────────────────────
  const setSyllabusAndRef = (text: string) => {
    setSyllabus(text)
    syllabusRef.current = text
  }

  const appendAiInstruction = (instruction: string) => {
    setAiInstructions((current) => {
      const trimmed = current.trim()
      return trimmed ? `${trimmed}\n${instruction}` : instruction
    })
  }

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleCancelGeneration = () => {
    generationCancelledRef.current = true
    stop()
    setFlowState('idle')
  }

  const handleGenerate = async () => {
    setParseError('')
    generationCancelledRef.current = false
    const startDate = metadata.start_date ?? null

    if (inputMode === 'paste') {
      if (!syllabus.trim()) return
      syllabusRef.current = syllabus
      setFlowState('generating')
      submit({ syllabus, start_date: startDate, instructions: aiInstructions })
      return
    }

    // upload mode — parse all files and concatenate
    if (uploadedFiles.length === 0 && !aiInstructions.trim()) return

    setIsParsing(true)
    try {
      const texts = uploadedFiles.length > 0 ? await Promise.all(uploadedFiles.map(parseFile)) : []
      const combined = texts.join('\n\n---\n\n')
      if (combined) setSyllabusAndRef(combined)
      setFlowState('generating')
      submit({ syllabus: combined, start_date: startDate, instructions: aiInstructions })
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse file')
      setIsParsing(false)
    }
  }

  const handleStartManual = async () => {
    const emptyPreview: CoursePreview = {
      title: 'Untitled Course',
      modules: [{ title: '', week_number: 1, description: '', assignments: [] }],
    }
    setFlowState('saving') // reuse saving spinner while we create the DB row
    try {
      const { courseId: id } = await saveCoursePreview(null, emptyPreview, metadata, draftKeyRef.current)
      setCourseId(id)
      setEditablePreview(emptyPreview)
      updateCourseTitle('Untitled Course')
      setFlowState('review')
    } catch {
      setErrorMsg('Failed to start. Please try again.')
      setFlowState('error')
    }
  }

  const handleClearCourse = () => {
    if (!window.confirm('Clear all modules and assignments? This cannot be undone.')) return
    setEditablePreview((p) => p ? { ...p, modules: [] } : p)
  }

  const handleRegenerateFromSyllabus = () => {
    if (!syllabusRef.current.trim()) return
    setFlowState('generating')
    submit({ syllabus: syllabusRef.current, start_date: metadata.start_date ?? null, instructions: aiInstructions })
  }

  const handleGenerateSyllabusFromStructure = async () => {
    if (!editablePreview) return
    setSyllabusGenError('')
    setIsGeneratingSyllabus(true)
    try {
      const lines: string[] = [`Course: ${editablePreview.title}`]
      for (const mod of editablePreview.modules) {
        lines.push(`\nWeek ${mod.week_number}: ${mod.title}${mod.description ? ` — ${mod.description}` : ''}`)
        for (const a of mod.assignments) {
          const parts = [a.title, `${a.points_possible} pts`]
          if (a.due_date) parts.push(`due ${a.due_date}`)
          lines.push(`  - ${parts.join(', ')}`)
        }
      }
      const description = lines.join('\n')
      const res = await fetch('/api/generate-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })
      if (!res.ok || !res.body) throw new Error('Generation failed')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let generated = ''
      setSyllabusAndRef('')
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        generated += decoder.decode(value, { stream: true })
        setSyllabusAndRef(generated)
      }
    } catch {
      setSyllabusGenError('Failed to generate syllabus. Please try again.')
    } finally {
      setIsGeneratingSyllabus(false)
    }
  }

  const handleSave = async () => {
    if (!courseId || !editablePreview) return
    setFlowState('saving')
    try {
      const { courseId: id } = await saveCourseToDB(courseId, editablePreview, metadata)
      router.push(`/course/${id}`)
    } catch {
      setErrorMsg('Save failed. Please try again.')
      setFlowState('error')
    }
  }

  const updateCourseTitle = (title: string) => {
    setMetadata((m) => ({ ...m, title }))
    setEditablePreview((p) => (p ? { ...p, title } : p))
  }

  const normalizeDuration = (
    nextDuration = courseDuration,
  ): CourseDurationInput => ({
    weeks: Math.max(0, Number.parseInt(nextDuration.weeks, 10) || 0),
    days: Math.max(0, Number.parseInt(nextDuration.days, 10) || 0),
  })

  const hasDuration = (duration: CourseDurationInput) => duration.weeks > 0 || duration.days > 0

  const setCourseDurationFromDates = (startDate: string | undefined, endDate: string | undefined) => {
    if (!startDate || !endDate) return
    const duration = courseDurationBetweenDates(startDate, endDate)
    if (!duration) return
    setCourseDuration({
      weeks: String(duration.weeks),
      days: String(duration.days),
    })
  }

  const rescheduleAssignmentDueDates = (
    previousMetadata: CourseMetadataInput,
    nextMetadata: CourseMetadataInput,
  ) => {
    setEditablePreview((p) => {
      if (!p) return p
      return {
        ...p,
        modules: p.modules.map((module) => ({
          ...module,
          assignments: module.assignments.map((assignment) => ({
            ...assignment,
            due_date: rescheduleDateForCourseRange(
              assignment.due_date,
              previousMetadata,
              nextMetadata,
            ),
          })),
        })),
      }
    })
  }

  const updateMetadataAndDueDates = (
    getNextMetadata: (previousMetadata: CourseMetadataInput) => CourseMetadataInput,
  ) => {
    const previousMetadata = metadata
    const nextMetadata = getNextMetadata(previousMetadata)
    setMetadata(nextMetadata)
    rescheduleAssignmentDueDates(previousMetadata, nextMetadata)
  }

  const handleStartDateChange = (value: string) => {
    const duration = normalizeDuration()
    updateMetadataAndDueDates((m) => {
      const nextStart = value || undefined
      if (nextStart && m.end_date) {
        setCourseDurationFromDates(nextStart, m.end_date)
        return { ...m, start_date: nextStart }
      }
      return {
        ...m,
        start_date: nextStart,
        ...(nextStart && hasDuration(duration)
          ? { end_date: addCourseDurationToStartDate(nextStart, duration) ?? m.end_date }
          : {}),
      }
    })
  }

  const handleEndDateChange = (value: string) => {
    const duration = normalizeDuration()
    updateMetadataAndDueDates((m) => {
      const nextEnd = value || undefined
      if (m.start_date && nextEnd) {
        setCourseDurationFromDates(m.start_date, nextEnd)
        return { ...m, end_date: nextEnd }
      }
      return {
        ...m,
        end_date: nextEnd,
        ...(nextEnd && hasDuration(duration)
          ? { start_date: subtractCourseDurationFromEndDate(nextEnd, duration) ?? m.start_date }
          : {}),
      }
    })
  }

  const handleDurationChange = (part: DurationPart, value: string) => {
    const digitsOnly = value.replace(/\D/g, '')
    const nextDuration = {
      ...courseDuration,
      [part]: part === 'days'
        ? String(Math.min(Number.parseInt(digitsOnly, 10) || 0, 6))
        : digitsOnly,
    }
    setCourseDuration(nextDuration)

    const duration = normalizeDuration(nextDuration)
    updateMetadataAndDueDates((m) => {
      if (!hasDuration(duration)) return m
      if (m.start_date) {
        return {
          ...m,
          end_date: addCourseDurationToStartDate(m.start_date, duration) ?? m.end_date,
        }
      }
      if (m.end_date) {
        return {
          ...m,
          start_date: subtractCourseDurationFromEndDate(m.end_date, duration) ?? m.start_date,
        }
      }
      return m
    })
  }

  const updateModule = (mi: number, field: 'title' | 'description', value: string) =>
    setEditablePreview((p) => {
      if (!p) return p
      return { ...p, modules: p.modules.map((m, i) => i === mi ? { ...m, [field]: value } : m) }
    })

  const updateAssignment = (
    mi: number,
    ai: number,
    field: 'title' | 'instructions' | 'due_date' | 'points_possible',
    value: string | number,
  ) =>
    setEditablePreview((p) => {
      if (!p) return p
      return {
        ...p,
        modules: p.modules.map((m, i) => {
          if (i !== mi) return m
          return { ...m, assignments: m.assignments.map((a, j) => j === ai ? { ...a, [field]: value } : a) }
        }),
      }
    })

  const apply = (fn: (p: typeof editablePreview) => typeof editablePreview) =>
    setEditablePreview(fn)

  const handleGenerateRubric = async (mi: number, ai: number, title: string, instructions: string) => {
    if (!validateRubricGenerateInput(title, instructions)) return
    const key = `${mi}-${ai}`
    setRubricPending(key)
    try {
      const res = await fetch('/api/generate-rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, instructions }),
      })
      const data = await res.json()
      if (data.criteria) {
        setRubricSuggestions((prev) => ({ ...prev, [key]: data.criteria }))
      }
    } finally {
      setRubricPending(null)
    }
  }

  const acceptRubricSuggestion = (mi: number, ai: number) => {
    const key = `${mi}-${ai}`
    const criteria = rubricSuggestions[key]
    if (!criteria) return
    apply((p) => p ? {
      ...p,
      modules: p.modules.map((m, i) =>
        i === mi
          ? {
              ...m,
              assignments: m.assignments.map((a, j) =>
                j === ai ? { ...a, rubric: { criteria } } : a,
              ),
            }
          : m,
      ),
    } : p)
    setRubricSuggestions((prev) => { const next = { ...prev }; delete next[key]; return next })
  }

  const dismissRubricSuggestion = (mi: number, ai: number) => {
    const key = `${mi}-${ai}`
    setRubricSuggestions((prev) => { const next = { ...prev }; delete next[key]; return next })
  }

  // ── renders ───────────────────────────────────────────────────────────────

  const canGenerate =
    inputMode === 'manual'
      ? true
      : inputMode === 'paste'
        ? syllabus.trim().length > 0
        : uploadedFiles.length > 0 || aiInstructions.trim().length > 0

  const aiInstructionShortcuts = [
    'Generate a complete syllabus before creating modules and assignments.',
    'Set the course start date to [YYYY-MM-DD].',
    'My course is [number] weeks and [number] days long.',
    'Create one module per week and keep module names consistent.',
    'Keep pages simple: use clear headings, concise text, and 2-3 visuals where helpful.',
  ]

  if (flowState === 'idle') {
    return (
      <>
        <TeacherCoachContextBridge context={{ syllabus }} />
        <div className="mx-auto max-w-2xl pb-80">
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
          {(['upload', 'paste', 'manual'] as InputMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setInputMode(m)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
                inputMode === m
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'upload' ? 'Upload' : m === 'paste' ? 'Paste text' : 'Manual'}
            </button>
          ))}
        </div>

        {inputMode === 'upload' && (
          <MultiDropzone files={uploadedFiles} onFiles={setUploadedFiles} />
        )}

        {inputMode === 'paste' && (
          <RichTextarea
            value={syllabus}
            onChange={setSyllabus}
            placeholder="Paste your syllabus here…"
            rows={16}
            autoFocus
          />
        )}

        {inputMode !== 'manual' && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
              AI instructions
            </label>
            <textarea
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              placeholder="Tell AI what to do with the uploaded or pasted material..."
              rows={5}
              className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {aiInstructionShortcuts.map((instruction) => (
                <button
                  key={instruction}
                  type="button"
                  onClick={() => appendAiInstruction(instruction)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {instruction.split('.')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {inputMode === 'manual' && (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-medium text-slate-600">Build your course structure from scratch.</p>
            <p className="mt-1 text-xs text-slate-400">Add modules and assignments manually in the next step — no syllabus needed.</p>
          </div>
        )}

        {parseError && (
          <p className="mt-3 text-sm text-red-600">{parseError}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700"
          >
            ← Back
          </button>
          <button
            onClick={
              inputMode === 'manual'
                ? handleStartManual
                : handleGenerate
            }
            disabled={!canGenerate || isParsing || isGeneratingSyllabus}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {inputMode === 'manual'
              ? 'Start Building →'
              : isParsing ? 'Reading file…' : 'Generate Course →'}
          </button>
        </div>
        </div>
      </>
    )
  }

  if (flowState === 'generating') {
    const partial = streamingPreview
    return (
      <>
        <TeacherCoachContextBridge context={{ syllabus }} />
        <div className="mx-auto max-w-3xl pb-80">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <span className="text-sm font-medium text-slate-600">
              Generating course structure…
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancelGeneration}
            className="text-sm text-slate-400 hover:text-slate-700"
          >
            ← Cancel
          </button>
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
      </>
    )
  }

  if (flowState === 'error') {
    return (
      <>
        <TeacherCoachContextBridge context={{ syllabus }} />
        <div className="mx-auto max-w-md pb-80 text-center">
        <p className="text-red-600">{errorMsg}</p>
        <button
          onClick={() => setFlowState('idle')}
          className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          ← Try again
        </button>
        </div>
      </>
    )
  }

  // ── review / edit ─────────────────────────────────────────────────────────
  if ((flowState === 'review' || flowState === 'saving') && editablePreview) {
    return (
      <>
        <TeacherCoachContextBridge context={{ syllabus }} />
        <div className="mx-auto max-w-3xl pb-80">
        {/* Back / Clear row */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setFlowState('idle')}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleClearCourse}
            className="text-xs text-slate-400 hover:text-red-500"
          >
            Clear course
          </button>
        </div>

        {draft && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ↩ Resuming draft — your changes are saved automatically.
          </div>
        )}

        <div className="mb-6">
          <div className="mb-3 flex items-end justify-between gap-4">
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
              className="flex-shrink-0 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {flowState === 'saving' ? 'Saving…' : 'Save Course →'}
            </button>
          </div>

          {/* Optional course details — term, section, dates */}
          <div className="flex flex-wrap gap-2">
            <input
              value={metadata.term ?? ''}
              onChange={(e) => setMetadata((m) => ({ ...m, term: e.target.value || undefined }))}
              placeholder="Term (e.g. Fall 2026)"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            />
            <input
              value={metadata.section ?? ''}
              onChange={(e) => setMetadata((m) => ({ ...m, section: e.target.value || undefined }))}
              placeholder="Section"
              className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Duration</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={courseDuration.weeks}
                onChange={(e) => handleDurationChange('weeks', e.target.value)}
                placeholder="Weeks"
                className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              />
              <span className="text-xs text-slate-400">weeks</span>
              <input
                type="number"
                min="0"
                max="6"
                inputMode="numeric"
                value={courseDuration.days}
                onChange={(e) => handleDurationChange('days', e.target.value)}
                placeholder="Days"
                className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              />
              <span className="text-xs text-slate-400">days</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Start</span>
              <input
                type="date"
                value={metadata.start_date ?? ''}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">End</span>
              <input
                type="date"
                value={metadata.end_date ?? ''}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              />
            </div>
          </div>
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
              <RichTextarea
                value={syllabus}
                onChange={setSyllabusAndRef}
                rows={14}
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  Edit the syllabus then regenerate to update the course structure.
                </p>
                <div className="flex flex-shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateSyllabusFromStructure}
                    disabled={isGeneratingSyllabus}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isGeneratingSyllabus ? 'Writing…' : 'Generate syllabus'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateFromSyllabus}
                    disabled={!syllabus.trim() || isGeneratingSyllabus}
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Generate course →
                  </button>
                </div>
              </div>
              {syllabusGenError && <p className="mt-1 text-xs text-red-600">{syllabusGenError}</p>}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {editablePreview.modules.map((mod, mi) => (
            <div key={mi} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              {/* Module header */}
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <span className="flex-shrink-0 rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  Week {mod.week_number}
                </span>
                <input
                  value={mod.title}
                  onChange={(e) => updateModule(mi, 'title', e.target.value)}
                  placeholder="Module title"
                  className="flex-1 rounded border-0 bg-transparent text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:ring-offset-1"
                />
                <button
                  type="button"
                  onClick={() => apply((p) => p ? removeModule(p, mi) : p)}
                  className="ml-2 text-xs text-slate-400 hover:text-red-500"
                  title="Remove module"
                >
                  ✕
                </button>
              </div>

              <div className="px-5 py-3">
                <textarea
                  value={mod.description}
                  onChange={(e) => updateModule(mi, 'description', e.target.value)}
                  rows={2}
                  placeholder="Module description"
                  className="w-full resize-none rounded border border-transparent bg-slate-50 px-2 py-1.5 text-sm text-slate-600 focus:border-slate-300 focus:outline-none focus:ring-0"
                />
              </div>

              {/* Assignments */}
              <div className="divide-y divide-slate-100 border-t border-slate-100">
                {mod.assignments.map((a, ai) => (
                  <div key={ai} className="px-5 py-4">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] items-start gap-3">
                      <input
                        value={a.title}
                        onChange={(e) => updateAssignment(mi, ai, 'title', e.target.value)}
                        placeholder="Assignment title"
                        className="rounded border-0 bg-transparent text-sm font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:ring-offset-1"
                      />
                      <input
                        type="date"
                        value={a.due_date ?? ''}
                        onChange={(e) => updateAssignment(mi, ai, 'due_date', e.target.value || '')}
                        className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-indigo-500 focus:outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={a.points_possible}
                          min={1}
                          onChange={(e) => updateAssignment(mi, ai, 'points_possible', Number(e.target.value))}
                          className="w-16 rounded border border-slate-200 px-2 py-1 text-center text-xs text-slate-600 focus:border-indigo-500 focus:outline-none"
                        />
                        <span className="text-xs text-slate-400">pts</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => apply((p) => p ? removeAssignment(p, mi, ai) : p)}
                        className="text-xs text-slate-400 hover:text-red-500"
                        title="Remove assignment"
                      >
                        ✕
                      </button>
                    </div>
                    <textarea
                      value={a.instructions}
                      onChange={(e) => updateAssignment(mi, ai, 'instructions', e.target.value)}
                      rows={2}
                      placeholder="Assignment instructions"
                      className="mt-2 w-full resize-none rounded border border-transparent bg-slate-50 px-2 py-1.5 text-xs leading-relaxed text-slate-500 focus:border-slate-300 focus:outline-none"
                    />
                    {/* Rubric criteria */}
                    <div className="mt-2 space-y-1">
                      {a.rubric.criteria.map((c, ci) => (
                        <div key={ci} className="flex items-center gap-2">
                          <span className="h-1 w-1 flex-shrink-0 rounded-full bg-slate-300" />
                          <input
                            value={c.description}
                            onChange={(e) => apply((p) => p ? updateCriterion(p, mi, ai, ci, { description: e.target.value }) : p)}
                            placeholder="Criterion description"
                            className="flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs text-slate-500 focus:border-slate-300 focus:outline-none"
                          />
                          <input
                            type="number"
                            value={c.points}
                            min={0}
                            onChange={(e) => apply((p) => p ? updateCriterion(p, mi, ai, ci, { points: Number(e.target.value) }) : p)}
                            className="w-14 rounded border border-slate-200 px-1 py-0.5 text-center text-xs text-slate-500 focus:border-indigo-400 focus:outline-none"
                          />
                          <span className="text-xs text-slate-400">pts</span>
                          <button
                            type="button"
                            onClick={() => apply((p) => p ? removeCriterion(p, mi, ai, ci) : p)}
                            className="text-xs text-slate-300 hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => apply((p) => p ? addCriterion(p, mi, ai) : p)}
                        className="text-xs text-indigo-500 hover:text-indigo-700"
                      >
                        + Add criterion
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateRubric(mi, ai, a.title, a.instructions)}
                        disabled={!validateRubricGenerateInput(a.title, a.instructions) || rubricPending === `${mi}-${ai}`}
                        className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {rubricPending === `${mi}-${ai}` ? 'Generating…' : 'AI generate rubric'}
                      </button>
                    </div>
                    {rubricSuggestions[`${mi}-${ai}`] && (
                      <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                        <p className="mb-2 text-xs font-medium text-indigo-700">AI suggested criteria:</p>
                        <ul className="mb-3 space-y-1">
                          {rubricSuggestions[`${mi}-${ai}`].map((c, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-indigo-800">
                              <span className="flex-1">{c.description}</span>
                              <span className="tabular-nums">{c.points} pts</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => acceptRubricSuggestion(mi, ai)}
                            className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                          >
                            Use this
                          </button>
                          <button
                            type="button"
                            onClick={() => dismissRubricSuggestion(mi, ai)}
                            className="rounded border border-indigo-200 px-3 py-1 text-xs text-indigo-600 hover:bg-indigo-100"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => apply((p) => p ? addAssignment(p, mi) : p)}
                    className="text-xs text-indigo-500 hover:text-indigo-700"
                  >
                    + Add assignment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => apply((p) => p ? addModule(p) : p)}
          className="mt-3 w-full rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm text-slate-400 transition hover:border-indigo-300 hover:text-indigo-500"
        >
          + Add module
        </button>

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
      </>
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
