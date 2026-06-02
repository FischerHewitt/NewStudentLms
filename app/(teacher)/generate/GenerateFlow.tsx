'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { experimental_useObject as useObject } from 'ai/react'
import { coursePreviewSchema, type CoursePreview } from '@/lib/schemas/course'
import { deleteCourseDraft, getCourseDraftByKey, saveCoursePreview, saveCourseToDB, type CourseDraft } from '@/app/actions/course'
import { TeacherCoachContextBridge } from '@/components/TeacherCoachContextBridge'
import {
  addCourseDurationToStartDate,
  courseDurationBetweenDates,
  extractCourseMetadataHintsFromInstructions,
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
import { AssignmentResourcePanel } from '@/components/AssignmentResourcePanel'
import { StudentViewPreviewModal } from '@/components/StudentViewPreviewModal'
import { getAssignmentBlocks, type ContentBlock } from '@/lib/content-blocks'

type FlowState = 'idle' | 'generating' | 'review' | 'saving' | 'error'
type InputMode = 'upload' | 'paste' | 'manual'
type DurationPart = 'weeks' | 'days'

const LI = {
  surfaceLow: '#f6f3f5',
  outlineVariant: '#c6c6cd',
  onSurface: '#1b1b1d',
  onSurfaceVariant: '#45464d',
  alumosPurple: '#7C3AED',
}
const AI_GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'

type PlainShortcut = { id: string; type: 'plain'; label: string }
type DateShortcut = { id: 'start-date'; type: 'date'; label: string }
type DurationShortcut = { id: 'duration'; type: 'duration'; label: string }
type Shortcut = PlainShortcut | DateShortcut | DurationShortcut

const SHORTCUTS: Shortcut[] = [
  { id: 'syllabus', type: 'plain', label: 'Generate a complete syllabus first' },
  { id: 'start-date', type: 'date', label: 'Set the course start date' },
  { id: 'one-module', type: 'plain', label: 'One module per week' },
  { id: 'simple', type: 'plain', label: 'Keep pages simple and visual' },
  { id: 'duration', type: 'duration', label: 'Course length' },
]

interface Props {
  /** Pre-loaded draft from an explicit Resume action on the home page */
  draft?: CourseDraft | null
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

  // Resource Side Panel state (issue #111)
  const [panelAssignmentKey, setPanelAssignmentKey] = useState<string | null>(null)
  const [panelTab, setPanelTab] = useState<import('@/components/AssignmentResourcePanel').ResourcePanelTab>('edit')
  // Staged student files keyed by `mi-ai` (issue #114)
  const [stagedFiles, setStagedFiles] = useState<Record<string, import('@/components/AssignmentResourcePanel').StagedFile[]>>({})
  // Preview modal (issue #125)
  const [previewKey, setPreviewKey] = useState<string | null>(null)
  // Dirty flag for data-loss guard (issue #122)
  const blocksAreDirtyRef = useRef(false)

  const [aiInstructions, setAiInstructions] = useState(draft?.aiInstructions ?? '')
  const [aiInstructionsOpen, setAiInstructionsOpen] = useState(Boolean(draft?.aiInstructions))
  const [activeChip, setActiveChip] = useState<'start-date' | 'duration' | null>(null)
  const [chipDate, setChipDate] = useState('')
  const [chipWeeks, setChipWeeks] = useState('')
  const [chipDays, setChipDays] = useState('')
  const [resumedFromSessionDraft, setResumedFromSessionDraft] = useState(false)
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
  const aiInstructionsRef = useRef(aiInstructions)
  aiInstructionsRef.current = aiInstructions
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
        const { courseId: id } = await saveCoursePreview(
          syllabusRef.current,
          object,
          metadataRef.current,
          draftKeyRef.current,
          aiInstructionsRef.current,
        )
        setCourseId(id)
        setEditablePreview(object)
        setAiInstructionsOpen(Boolean(aiInstructionsRef.current.trim()))
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

  const loadDraft = (courseDraft: CourseDraft, source: 'link' | 'session') => {
    if (courseDraft.draftKey) {
      draftKeyRef.current = courseDraft.draftKey
      sessionStorage.setItem('generate-draft-key', courseDraft.draftKey)
    }
    setCourseId(courseDraft.courseId)
    setMetadata(courseDraft.metadata)
    setSyllabusAndRef(courseDraft.syllabus)
    setEditablePreview(courseDraft.preview)
    setAiInstructions(courseDraft.aiInstructions)
    setAiInstructionsOpen(Boolean(courseDraft.aiInstructions))
    setFlowState('review')
    if (source === 'session') setResumedFromSessionDraft(true)
  }

  useEffect(() => {
    if (draft) loadDraft(draft, 'link')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.courseId])

  useEffect(() => {
    if (draft || editablePreview || flowState !== 'idle') return

    const stored = sessionStorage.getItem('generate-draft-key')
    if (!stored) return

    let cancelled = false
    getCourseDraftByKey(stored).then((courseDraft) => {
      if (cancelled || !courseDraft) return
      loadDraft(courseDraft, 'session')
    })

    return () => {
      cancelled = true
    }
    // Run once after the initial sessionStorage draft-key setup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const appendAiInstruction = (instruction: string) => {
    const trimmed = aiInstructions.trim()
    const next = trimmed ? `${trimmed}\n${instruction}` : instruction
    setAiInstructions(next)
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
      submit({ syllabus, start_date: startDate, instructions: aiInstructionsRef.current })
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
      submit({ syllabus: combined, start_date: startDate, instructions: aiInstructionsRef.current })
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
      const { courseId: id } = await saveCoursePreview(
        null,
        emptyPreview,
        metadata,
        draftKeyRef.current,
        aiInstructionsRef.current,
      )
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
    if (blocksAreDirtyRef.current) {
      const ok = window.confirm(
        'Regenerating will replace the course structure. Your content block edits will be lost. Continue?'
      )
      if (!ok) return
    }
    blocksAreDirtyRef.current = false
    setFlowState('generating')
    submit({
      syllabus: syllabusRef.current,
      start_date: metadata.start_date ?? null,
      instructions: aiInstructionsRef.current,
    })
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
      blocksAreDirtyRef.current = false
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

  const applyAiInstructionHints = (instructions: string) => {
    const hints = extractCourseMetadataHintsFromInstructions(instructions)
    if (!hints.duration && !hints.start_date && !hints.end_date) return

    const nextDuration = { ...courseDuration }
    let durationChanged = false

    if (hints.duration) {
      if (!nextDuration.weeks.trim()) {
        nextDuration.weeks = String(hints.duration.weeks)
        durationChanged = true
      }
      if (!nextDuration.days.trim()) {
        nextDuration.days = String(hints.duration.days)
        durationChanged = true
      }
    }

    if (durationChanged) setCourseDuration(nextDuration)

    const duration = normalizeDuration(nextDuration)
    updateMetadataAndDueDates((m) => {
      let next = m

      if (hints.start_date && !next.start_date) {
        next = { ...next, start_date: hints.start_date }
      }
      if (hints.end_date && !next.end_date) {
        next = { ...next, end_date: hints.end_date }
      }
      if (!next.end_date && next.start_date && hasDuration(duration)) {
        next = {
          ...next,
          end_date: addCourseDurationToStartDate(next.start_date, duration) ?? next.end_date,
        }
      }
      if (!next.start_date && next.end_date && hasDuration(duration)) {
        next = {
          ...next,
          start_date: subtractCourseDurationFromEndDate(next.end_date, duration) ?? next.start_date,
        }
      }

      return next
    })
  }

  useEffect(() => {
    if (!aiInstructions.trim()) return
    applyAiInstructionHints(aiInstructions)
    // Fill only empty fields from the current AI instruction text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiInstructions])

  // Before-unload guard — warn when unsaved block edits exist (issue #122)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!blocksAreDirtyRef.current) return
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

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
    if (nextMetadata !== previousMetadata) {
      rescheduleAssignmentDueDates(previousMetadata, nextMetadata)
    }
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

  const handleAiInstructionsChange = (value: string) => {
    setAiInstructions(value)
  }

  const resetDraftState = () => {
    const key = crypto.randomUUID()
    sessionStorage.setItem('generate-draft-key', key)
    draftKeyRef.current = key
    setCourseId(null)
    setMetadata({ title: '' })
    setCourseDuration({ weeks: '', days: '' })
    setSyllabusAndRef('')
    setEditablePreview(null)
    setAiInstructions('')
    setAiInstructionsOpen(false)
    setResumedFromSessionDraft(false)
    setInputMode('upload')
    setUploadedFiles([])
    setErrorMsg('')
    setParseError('')
    setFlowState('idle')
  }

  const handleDeleteDraft = async () => {
    if (!courseId) return
    if (!window.confirm('Delete this draft? This cannot be undone.')) return
    try {
      await deleteCourseDraft(courseId)
      resetDraftState()
      router.push('/generate')
      router.refresh()
    } catch {
      setErrorMsg('Failed to delete draft. Please try again.')
    }
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

  const updateAssignmentBlocks = (mi: number, ai: number, blocks: ContentBlock[]) => {
    blocksAreDirtyRef.current = true
    setEditablePreview((p) => {
      if (!p) return p
      return {
        ...p,
        modules: p.modules.map((m, i) => {
          if (i !== mi) return m
          return { ...m, assignments: m.assignments.map((a, j) => j === ai ? { ...a, content_blocks: blocks } : a) }
        }),
      }
    })
  }

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

  if (flowState === 'idle') {
    return (
      <>
        <TeacherCoachContextBridge context={{ syllabus }} />
        <div className="mx-auto max-w-[1280px]">
          {/* Page header */}
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>
              ✦ New Course
            </p>
            <h1 className="mt-1 text-2xl font-bold" style={{ color: LI.onSurface, fontFamily: 'var(--font-hanken, system-ui)' }}>
              Create from your syllabus
            </h1>
            <p className="mt-1 text-sm" style={{ color: LI.onSurfaceVariant }}>
              Upload materials or paste text — AI generates modules, assignments, and rubrics in seconds.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: main input (2/3) */}
            <div className="space-y-4 lg:col-span-2">
              {/* Course Materials card */}
              <section className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid ' + LI.outlineVariant }}>
                <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>
                  Course Materials
                </h2>
                {/* Tabs */}
                <div className="mb-4 flex gap-1 rounded-xl p-1" style={{ background: LI.surfaceLow, border: '1px solid ' + LI.outlineVariant }}>
                  {(['upload', 'paste', 'manual'] as InputMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setInputMode(m)}
                      className="flex-1 rounded-lg py-1.5 text-sm font-medium transition"
                      style={
                        inputMode === m
                          ? { background: '#fff', color: LI.onSurface, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                          : { color: LI.onSurfaceVariant }
                      }
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
                    rows={12}
                    autoFocus
                  />
                )}

                {inputMode === 'manual' && (
                  <div
                    className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-10 text-center"
                    style={{ borderColor: LI.outlineVariant, background: LI.surfaceLow }}
                  >
                    <span className="material-symbols-outlined text-[36px]" style={{ color: LI.alumosPurple }}>edit_note</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: LI.onSurface }}>Build structure from scratch</p>
                      <p className="mt-1 text-xs" style={{ color: LI.onSurfaceVariant }}>Add modules and assignments manually in the next step.</p>
                    </div>
                    <button
                      onClick={handleStartManual}
                      className="rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                      style={{ background: AI_GRADIENT }}
                    >
                      Start Building →
                    </button>
                  </div>
                )}

                {parseError && <p className="mt-3 text-sm text-red-600">{parseError}</p>}
              </section>

              {/* AI Instructions card */}
              {inputMode !== 'manual' && (
                <section className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid ' + LI.outlineVariant }}>
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className="text-sm font-bold"
                      style={{ background: AI_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                    >✦</span>
                    <h2 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>
                      AI Instructions
                    </h2>
                  </div>
                  <textarea
                    value={aiInstructions}
                    onChange={(e) => handleAiInstructionsChange(e.target.value)}
                    placeholder="Tell AI what to do with the uploaded or pasted material…"
                    rows={4}
                    className="w-full resize-y rounded-xl border p-4 text-sm leading-relaxed focus:outline-none focus:ring-2"
                    style={{ borderColor: LI.outlineVariant, color: LI.onSurface, background: LI.surfaceLow }}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SHORTCUTS.map((s) => {
                      const chipStyle = {
                        borderColor: LI.alumosPurple + '44',
                        color: LI.alumosPurple,
                        background: LI.alumosPurple + '0d',
                      }
                      const inputStyle: React.CSSProperties = {
                        border: `1px solid ${LI.alumosPurple}66`,
                        borderRadius: 6,
                        padding: '1px 6px',
                        fontSize: 12,
                        color: LI.onSurface,
                        background: '#fff',
                        outline: 'none',
                        width: 52,
                      }

                      if (s.type === 'plain') {
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => appendAiInstruction(s.label)}
                            className="rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-80"
                            style={chipStyle}
                          >
                            {s.label}
                          </button>
                        )
                      }

                      if (s.type === 'date') {
                        if (activeChip === 'start-date') {
                          return (
                            <form
                              key={s.id}
                              className="flex items-center gap-1.5 rounded-full border px-3 py-1"
                              style={{ borderColor: LI.alumosPurple + '44', background: LI.alumosPurple + '0d' }}
                              onSubmit={(e) => {
                                e.preventDefault()
                                if (chipDate.trim()) {
                                  appendAiInstruction(`Set the course start date ${chipDate.trim()}`)
                                  setChipDate('')
                                  setActiveChip(null)
                                }
                              }}
                            >
                              <span className="text-xs font-semibold" style={{ color: LI.alumosPurple }}>Start date</span>
                              <input
                                autoFocus
                                value={chipDate}
                                onChange={(e) => setChipDate(e.target.value)}
                                placeholder="e.g. Mon Jun 1"
                                style={{ ...inputStyle, width: 110 }}
                              />
                              <button type="submit" className="text-xs font-bold" style={{ color: LI.alumosPurple }}>✓</button>
                              <button type="button" className="text-xs" style={{ color: LI.onSurfaceVariant }} onClick={() => setActiveChip(null)}>✕</button>
                            </form>
                          )
                        }
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setActiveChip('start-date')}
                            className="rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-80"
                            style={chipStyle}
                          >
                            {s.label} __
                          </button>
                        )
                      }

                      if (s.type === 'duration') {
                        if (activeChip === 'duration') {
                          return (
                            <form
                              key={s.id}
                              className="flex items-center gap-1.5 rounded-full border px-3 py-1"
                              style={{ borderColor: LI.alumosPurple + '44', background: LI.alumosPurple + '0d' }}
                              onSubmit={(e) => {
                                e.preventDefault()
                                const w = chipWeeks.trim() || '0'
                                const d = chipDays.trim() || '0'
                                appendAiInstruction(`Course length is ${w} weeks and ${d} days`)
                                setChipWeeks('')
                                setChipDays('')
                                setActiveChip(null)
                              }}
                            >
                              <span className="text-xs font-semibold" style={{ color: LI.alumosPurple }}>Length</span>
                              <input
                                autoFocus
                                type="number"
                                min={1}
                                value={chipWeeks}
                                onChange={(e) => setChipWeeks(e.target.value)}
                                placeholder="wks"
                                style={inputStyle}
                              />
                              <span className="text-xs" style={{ color: LI.alumosPurple }}>wks</span>
                              <input
                                type="number"
                                min={0}
                                max={6}
                                value={chipDays}
                                onChange={(e) => setChipDays(e.target.value)}
                                placeholder="days"
                                style={inputStyle}
                              />
                              <span className="text-xs" style={{ color: LI.alumosPurple }}>days</span>
                              <button type="submit" className="text-xs font-bold" style={{ color: LI.alumosPurple }}>✓</button>
                              <button type="button" className="text-xs" style={{ color: LI.onSurfaceVariant }} onClick={() => setActiveChip(null)}>✕</button>
                            </form>
                          )
                        }
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setActiveChip('duration')}
                            className="rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-80"
                            style={chipStyle}
                          >
                            Course length __ wks __ days
                          </button>
                        )
                      }

                      return null
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Right: tips + actions (1/3) */}
            <div className="space-y-4">
              <section className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid ' + LI.outlineVariant }}>
                <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>
                  What AI will generate
                </h2>
                <ul className="space-y-3">
                  {[
                    { icon: 'menu_book', label: 'Course modules & structure' },
                    { icon: 'assignment', label: 'Assignments with due dates' },
                    { icon: 'grade', label: 'Rubrics & grading criteria' },
                    { icon: 'calendar_today', label: 'Weekly schedule' },
                  ].map(({ icon, label }) => (
                    <li key={label} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px]" style={{ color: LI.alumosPurple }}>{icon}</span>
                      <span className="text-sm" style={{ color: LI.onSurface }}>{label}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl p-5" style={{ background: LI.surfaceLow, border: '1px solid ' + LI.outlineVariant }}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: LI.onSurfaceVariant }}>Tip</p>
                <p className="text-xs leading-relaxed" style={{ color: LI.onSurfaceVariant }}>
                  The more context you give AI — dates, learning goals, assessment types — the better the generated course structure.
                </p>
              </section>

              <div className="space-y-2">
                <button
                  onClick={inputMode === 'manual' ? handleStartManual : handleGenerate}
                  disabled={!canGenerate || isParsing}
                  className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: AI_GRADIENT }}
                >
                  {isParsing ? 'Reading file…' : inputMode === 'manual' ? 'Start Building →' : 'Generate Course →'}
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full rounded-xl py-2 text-xs font-semibold transition hover:bg-slate-50"
                  style={{ color: LI.onSurfaceVariant, border: '1px solid ' + LI.outlineVariant }}
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
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
        <div className="mx-auto max-w-3xl pb-80" style={{ transition: 'margin-right 0.25s ease', marginRight: panelAssignmentKey ? '576px' : undefined }}>
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

        {(draft || resumedFromSessionDraft) && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span>↩ Resuming draft — your changes are saved automatically.</span>
            <button
              type="button"
              onClick={handleDeleteDraft}
              className="flex-shrink-0 rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-800 transition hover:border-red-300 hover:text-red-600"
            >
              Delete draft
            </button>
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

          {/* Optional course details — row 1: term, section, duration */}
          <div className="flex flex-wrap items-center gap-2">
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
                className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
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
                className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              />
              <span className="text-xs text-slate-400">days</span>
            </div>
          </div>
          {/* Row 2: start and end dates */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
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

        {/* Collapsible AI instructions editor */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setAiInstructionsOpen((o) => !o)}
            className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>AI Instructions</span>
            <span className="text-slate-400">{aiInstructionsOpen ? '▲' : '▼'}</span>
          </button>
          {aiInstructionsOpen && (
            <div className="border-t border-slate-100 px-5 py-4">
              <textarea
                value={aiInstructions}
                onChange={(e) => handleAiInstructionsChange(e.target.value)}
                rows={4}
                placeholder="Tell AI what to preserve or change when regenerating…"
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  These instructions are saved with this draft and reused when you regenerate.
                </p>
                <button
                  type="button"
                  onClick={handleRegenerateFromSyllabus}
                  disabled={!syllabus.trim() || isGeneratingSyllabus}
                  className="flex-shrink-0 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Generate course →
                </button>
              </div>
            </div>
          )}
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
                {mod.assignments.map((a, ai) => {
                  const assignmentKey = `${mi}-${ai}`
                  const isPanelTarget = panelAssignmentKey === assignmentKey
                  return (
                  <div key={ai} className="px-5 py-4 transition-colors" style={{ background: isPanelTarget ? '#7C3AED14' : undefined }}>
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
                    <div className="relative mt-2">
                    <textarea
                      value={a.instructions}
                      onChange={(e) => updateAssignment(mi, ai, 'instructions', e.target.value)}
                      rows={2}
                      placeholder="Assignment instructions"
                      className="mt-2 w-full resize-none rounded border border-transparent bg-slate-50 px-2 py-1.5 text-xs leading-relaxed text-slate-500 focus:border-slate-300 focus:outline-none"
                      style={{ paddingRight: '110px' }}
                    />
                    <button
                      type="button"
                      onClick={() => { setPanelAssignmentKey(assignmentKey); setPanelTab('edit') }}
                      className="absolute right-2 top-2 cursor-pointer rounded-md border px-2 py-1 text-[10px] font-semibold transition hover:opacity-80"
                      style={{
                        borderColor: isPanelTarget ? '#7C3AED' : '#e2e8f0',
                        color: isPanelTarget ? '#7C3AED' : '#45464d',
                        background: '#fff',
                      }}
                    >
                      Advanced Edit ↗
                    </button>
                    </div>
                    {/* Resource chips — always visible, v2 style */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <ResourceChip
                        icon="%" label="Math"
                        count={a.content_blocks?.filter(b => b.kind === 'math').length ?? 0}
                        active={isPanelTarget && panelTab === 'math'}
                        onClick={() => { setPanelAssignmentKey(assignmentKey); setPanelTab('math') }}
                      />
                      <ResourceChip
                        icon="doc" label="PDF files"
                        count={0}
                        active={isPanelTarget && panelTab === 'pdf'}
                        onClick={() => { setPanelAssignmentKey(assignmentKey); setPanelTab('pdf') }}
                        showDrop
                      />
                      <ResourceChip
                        icon="dl" label="Student files"
                        count={stagedFiles[assignmentKey]?.length ?? 0}
                        active={isPanelTarget && panelTab === 'files'}
                        onClick={() => { setPanelAssignmentKey(assignmentKey); setPanelTab('files') }}
                        showDrop
                      />
                      <ResourceChip
                        icon="eye" label="Preview"
                        count={0}
                        active={false}
                        onClick={() => setPreviewKey(assignmentKey)}
                        accent
                      />
                    </div>
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
                  )
                })}
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

      {/* Resource Side Panel (issue #111) */}
      {panelAssignmentKey !== null && (() => {
        const [mi, ai] = panelAssignmentKey.split('-').map(Number)
        const mod = editablePreview?.modules[mi]
        const assignment = mod?.assignments[ai]
        if (!assignment) return null
        return (
          <AssignmentResourcePanel
            key={panelAssignmentKey}
            assignmentTitle={assignment.title || 'Untitled Assignment'}
            dueDate={assignment.due_date}
            pointsPossible={assignment.points_possible}
            instructions={assignment.instructions}
            contentBlocks={getAssignmentBlocks(assignment)}
            onBlocksChange={(blocks) => updateAssignmentBlocks(mi, ai, blocks)}
            stagedFiles={stagedFiles[panelAssignmentKey] ?? []}
            activeTab={panelTab}
            onTabChange={setPanelTab}
            onInstructionsChange={(val) => updateAssignment(mi, ai, 'instructions', val)}
            onAddFile={(file) => setStagedFiles((prev) => ({ ...prev, [panelAssignmentKey]: [...(prev[panelAssignmentKey] ?? []), file] }))}
            onRemoveFile={(id) => setStagedFiles((prev) => ({ ...prev, [panelAssignmentKey]: (prev[panelAssignmentKey] ?? []).filter((f) => f.id !== id) }))}
            onClose={() => setPanelAssignmentKey(null)}
          />
        )
      })()}
      {previewKey !== null && (() => {
        const [pmi, pai] = previewKey.split('-').map(Number)
        const pa = editablePreview?.modules[pmi]?.assignments[pai]
        if (!pa) return null
        return (
          <StudentViewPreviewModal
            title={pa.title || 'Untitled Assignment'}
            dueDate={pa.due_date}
            pointsPossible={pa.points_possible}
            instructions={pa.instructions}
            contentBlocks={getAssignmentBlocks(pa)}
            onClose={() => setPreviewKey(null)}
          />
        )
      })()}
      </>
    )
  }

  return null
}

// ── Resource chip ────────────────────────────────────────────────────────────

function ResourceChip({
  icon, label, count, active, onClick, showDrop, accent,
}: {
  icon: string; label: string; count: number; active: boolean
  onClick: () => void; showDrop?: boolean; accent?: boolean
}) {
  const [dragging, setDragging] = useState(false)
  const purple = '#7C3AED'

  const iconEl = icon === '%'
    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
    : icon === 'doc'
    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
    : icon === 'dl'
    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

  return (
    <button
      type="button"
      onClick={onClick}
      onDragOver={showDrop ? (e) => { e.preventDefault(); setDragging(true) } : undefined}
      onDragLeave={showDrop ? () => setDragging(false) : undefined}
      onDrop={showDrop ? (e) => { e.preventDefault(); setDragging(false) } : undefined}
      className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition"
      style={{
        borderColor: dragging ? purple : accent ? purple + '55' : active ? purple : '#e2e8f0',
        color: dragging || accent || active ? purple : '#45464d',
        background: dragging ? '#7C3AED14' : active && !accent ? '#7C3AED14' : '#fff',
        borderStyle: dragging ? 'dashed' : 'solid',
        minWidth: showDrop ? 110 : undefined,
      }}
    >
      <span className="flex h-3.5 w-3.5 items-center justify-center opacity-70">{iconEl}</span>
      {label}
      {count > 0 && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: purple }}>
          {count}
        </span>
      )}
      {showDrop && count === 0 && <span className="ml-auto text-[9px] opacity-40">drop</span>}
    </button>
  )
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
