'use client'

import { ALUMOSGradientLogo } from '@/components/ALUMOSGradientLogo'

export default function RootPage() {
  function goToTeacher() {
    localStorage.setItem('lms_active_role', 'teacher')
    window.location.href = '/dashboard'
  }

  function goToStudent() {
    localStorage.setItem('lms_active_role', 'student')
    window.location.href = '/studentview'
  }

  function goToBusinessMetrics() {
    window.location.href = '/business-metrics'
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-[#fcf8fa]">
      <ALUMOSGradientLogo iconSize={48} />

      <p className="text-sm text-slate-500">Continue as…</p>

      <div className="flex gap-4">
        <button
          onClick={goToTeacher}
          className="rounded-xl border border-slate-200 bg-white px-8 py-5 text-center shadow-sm transition hover:shadow-md"
        >
          <span className="material-symbols-outlined mb-2 block text-[32px] text-slate-600">person_edit</span>
          <span className="block font-semibold text-slate-800">Teacher</span>
        </button>

        <button
          onClick={goToStudent}
          className="rounded-xl border border-slate-200 bg-white px-8 py-5 text-center shadow-sm transition hover:shadow-md"
        >
          <span className="material-symbols-outlined mb-2 block text-[32px] text-slate-600">school</span>
          <span className="block font-semibold text-slate-800">Student</span>
        </button>
      </div>

      <button
        onClick={goToBusinessMetrics}
        aria-label="Business Metrics"
        title="Business Metrics"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(126,34,206,0.4)',
          fontSize: 22,
        fontWeight: 700,
        }}
      >
        $
      </button>
    </div>
  )
}
