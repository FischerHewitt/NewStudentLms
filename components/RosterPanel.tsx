'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  enrollStudentsByEmail,
  enrollStudentsByCSV,
  removeEnrollment,
  type EnrolledStudent,
} from '@/app/actions/enrollment'

interface Props {
  courseId: string
  initialStudents: EnrolledStudent[]
}

export function RosterPanel({ courseId, initialStudents }: Props) {
  const router = useRouter()
  const [students, setStudents] = useState<EnrolledStudent[]>(initialStudents)
  const [emailInput, setEmailInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isPending, startTransition] = useTransition()
  const csvInputRef = useRef<HTMLInputElement>(null)

  const handleEnroll = () => {
    if (!emailInput.trim()) return
    setFeedback('')
    startTransition(async () => {
      const { added } = await enrollStudentsByEmail(courseId, emailInput)
      setEmailInput('')
      setFeedback(added > 0 ? `${added} student${added > 1 ? 's' : ''} added` : 'Students added')
      router.refresh()
    })
  }

  const CSV_MAX_BYTES = 1 * 1024 * 1024 // 1 MB

  const handleCsvUpload = async (file: File) => {
    setFeedback('')
    if (file.size > CSV_MAX_BYTES) {
      setFeedback('CSV file must be under 1 MB')
      return
    }
    const text = await file.text()
    startTransition(async () => {
      const result = await enrollStudentsByCSV(courseId, text)
      const parts = []
      if (result.added > 0) parts.push(`${result.added} added`)
      if (result.alreadyEnrolled > 0) parts.push(`${result.alreadyEnrolled} already enrolled`)
      if (result.skippedInvalid.length > 0) parts.push(`${result.skippedInvalid.length} invalid rows skipped`)
      setFeedback(parts.join(', ') || 'No changes')
      router.refresh()
    })
  }

  const handleRemove = (studentId: string) => {
    startTransition(async () => {
      await removeEnrollment(courseId, studentId)
      setStudents((prev) => prev.filter((s) => s.id !== studentId))
    })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-slate-800">
        Roster ({students.length} student{students.length !== 1 ? 's' : ''})
      </h2>

      {/* Enroll by email */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Add students by email (comma or newline separated)
        </label>
        <textarea
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="student1@school.edu, student2@school.edu"
          rows={3}
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleEnroll}
            disabled={isPending || !emailInput.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {isPending ? 'Adding…' : 'Add students'}
          </button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleCsvUpload(f)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => csvInputRef.current?.click()}
            disabled={isPending}
            className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Upload CSV
          </button>
          {feedback && <span className="text-xs text-emerald-600">{feedback}</span>}
        </div>
      </div>

      {/* Student list */}
      {students.length === 0 ? (
        <p className="text-sm text-slate-400">No students enrolled yet.</p>
      ) : (
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {students.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-800">{s.name !== s.email ? s.name : s.email}</p>
                {s.name !== s.email && (
                  <p className="text-xs text-slate-500">{s.email}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                  s.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {s.status}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(s.id)}
                  disabled={isPending}
                  className="text-xs text-slate-400 hover:text-red-500 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
