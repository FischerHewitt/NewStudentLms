'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createAssignment, publishAssignment } from '@/app/actions/assignment'
import { addResource } from '@/app/actions/resources'
import { assignmentHref } from '@/lib/routes'

const C = {
  surface: '#F8FAFC',
  card: '#ffffff',
  border: '#E2E8F0',
  text: '#1b1b1d',
  muted: '#64748b',
  purple: '#7C3AED',
  orange: '#F59E0B',
  green: '#10B981',
}
const GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'

type Criterion = { description: string; points: string }
type PendingResource = { title: string; type: 'file' | 'link'; url: string; fileName?: string }

interface Props {
  courseId: string
  moduleId: string
  moduleName: string
  modules: { id: string; label: string }[]
}

export function NewAssignmentForm({ courseId, moduleId: initialModuleId, moduleName, modules }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [points, setPoints] = useState('10')
  const [dueDate, setDueDate] = useState('')
  const [moduleId, setModuleId] = useState(initialModuleId)
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [resources, setResources] = useState<PendingResource[]>([])

  // Resource add state
  const [showAddResource, setShowAddResource] = useState(false)
  const [resourceMode, setResourceMode] = useState<'link' | 'file'>('link')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Publish confirm state
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)

  const isValid = title.trim().length > 0

  async function save(andPublish: boolean) {
    startTransition(async () => {
      const { id } = await createAssignment({
        courseId,
        moduleId,
        title: title.trim(),
        instructions: instructions.trim(),
        dueDate: dueDate || null,
        pointsPossible: parseInt(points) || 10,
        criteria: criteria
          .filter((c) => c.description.trim())
          .map((c) => ({ description: c.description.trim(), points: parseInt(c.points) || 0 })),
      })

      // Save any pending resources
      await Promise.all(
        resources.map((r) => addResource(id, { title: r.title, type: r.type, url: r.url }))
      )

      if (andPublish) {
        await publishAssignment(id)
      }

      router.push(assignmentHref(courseId, id))
    })
  }

  async function handleFileUpload(file: File) {
    setUploading(true)
    setUploadError(null)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload-resource', { method: 'POST', body: form })
    const json = await res.json()
    setUploading(false)
    if (!res.ok) { setUploadError(json.error ?? 'Upload failed'); return }
    setResources((prev) => [...prev, { title: json.fileName, type: 'file', url: json.url, fileName: json.fileName }])
    setShowAddResource(false)
  }

  function addLink() {
    if (!linkTitle.trim() || !linkUrl.trim()) return
    setResources((prev) => [...prev, { title: linkTitle.trim(), type: 'link', url: linkUrl.trim() }])
    setLinkTitle('')
    setLinkUrl('')
    setShowAddResource(false)
  }

  return (
    <div style={{ background: C.surface, minHeight: '100vh', padding: '32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, background: '#f0edef', color: C.muted, border: `1px solid ${C.border}` }}>
                Draft
              </span>
              {moduleName && <span style={{ fontSize: 13, color: C.muted }}>{moduleName}</span>}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, lineHeight: 1.2, color: title ? C.text : C.muted, fontStyle: title ? 'normal' : 'italic' }}>
              {title || 'New Assignment'}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => router.back()}
              style={{ padding: '8px 16px', border: `1px solid ${C.border}`, background: C.card, borderRadius: 8, fontSize: 13, fontWeight: 500, color: C.muted, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              disabled={!isValid || isPending}
              onClick={() => save(false)}
              style={{ padding: '8px 18px', border: `1px solid ${C.border}`, background: C.card, borderRadius: 8, fontSize: 13, fontWeight: 600, color: C.text, cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.4 }}
            >
              {isPending ? 'Saving…' : 'Save as Draft'}
            </button>
            {!showPublishConfirm ? (
              <button
                disabled={!isValid || isPending}
                onClick={() => !dueDate ? setShowPublishConfirm(true) : save(true)}
                style={{ padding: '8px 18px', background: isValid ? C.green : C.muted, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: 'white', cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.4 }}
              >
                Publish
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.08)', border: `1px solid ${C.orange}`, borderRadius: 10, padding: '6px 12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: C.orange }}>warning</span>
                <span style={{ fontSize: 12, color: C.orange, fontWeight: 600 }}>No due date set</span>
                <button onClick={() => save(true)} style={{ padding: '4px 12px', background: C.green, border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
                  Publish anyway
                </button>
                <button onClick={() => setShowPublishConfirm(false)} style={{ background: 'none', border: 'none', fontSize: 16, color: C.muted, cursor: 'pointer', lineHeight: 1 }}>✕</button>
              </div>
            )}
          </div>
        </div>

        {/* Two-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Core Settings */}
            <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: '0 0 18px' }}>Core Settings</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {modules.length > 1 && (
                  <div>
                    <label style={labelStyle}>Module</label>
                    <select
                      value={moduleId}
                      onChange={(e) => setModuleId(e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      {modules.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label style={labelStyle}>Assignment Title <span style={{ color: 'red' }}>*</span></label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Midterm Essay on Photosynthesis"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, margin: 0 }}>Description &amp; Prompt</label>
                    <button style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: C.purple, cursor: 'pointer' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>auto_awesome</span>
                      Generate with AI
                    </button>
                  </div>
                  <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '6px 8px', display: 'flex', gap: 2 }}>
                      {['format_bold', 'format_italic', 'format_underlined', 'format_list_bulleted', 'link'].map((icon) => (
                        <button key={icon} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: C.muted, display: 'flex', borderRadius: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={7}
                      placeholder="Describe what students need to do. Be specific about length, format, and any required sources."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      style={{ width: '100%', padding: 14, fontSize: 13, color: C.text, background: 'transparent', border: 'none', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Points Possible</label>
                    <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Due Date</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
                  </div>
                </div>
              </div>
            </section>

            {/* Rubric */}
            <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.muted }}>fact_check</span>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: 0 }}>Evaluation Rubric</p>
                </div>
                <button
                  onClick={() => setCriteria((p) => [...p, { description: '', points: '10' }])}
                  style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: C.purple, cursor: 'pointer' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                  Add Criterion
                </button>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {criteria.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <p style={{ fontSize: 13, color: C.muted, margin: '0 0 8px' }}>No criteria yet.</p>
                    <button
                      onClick={() => setCriteria([{ description: '', points: '10' }])}
                      style={{ fontSize: 13, fontWeight: 600, color: C.purple, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      + Add first criterion
                    </button>
                  </div>
                ) : (
                  criteria.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="e.g. Thesis clarity and focus"
                        value={c.description}
                        onChange={(e) => setCriteria((p) => p.map((x, j) => j === i ? { ...x, description: e.target.value } : x))}
                        style={{ ...inputStyle, flex: 1, fontSize: 13 }}
                      />
                      <input
                        type="number"
                        placeholder="pts"
                        value={c.points}
                        onChange={(e) => setCriteria((p) => p.map((x, j) => j === i ? { ...x, points: e.target.value } : x))}
                        style={{ ...inputStyle, width: 70, fontSize: 13 }}
                      />
                      <button
                        onClick={() => setCriteria((p) => p.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 18, lineHeight: 1, padding: '0 4px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Resources */}
            <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.muted }}>attach_file</span>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: 0 }}>
                    Resources &amp; Files
                  </p>
                </div>
                {!showAddResource && (
                  <button
                    onClick={() => setShowAddResource(true)}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: C.purple, cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                    Add
                  </button>
                )}
              </div>

              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Existing pending resources */}
                {resources.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: r.type === 'file' ? C.orange : C.purple }}>
                      {r.type === 'file' ? 'description' : 'link'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                      <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{r.type === 'file' ? 'File upload' : r.url}</p>
                    </div>
                    <button
                      onClick={() => setResources((p) => p.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 16, lineHeight: 1 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Add resource panel */}
                {showAddResource && (
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
                    {/* Mode toggle */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 14, background: '#e2e8f0', borderRadius: 8, padding: 3 }}>
                      {(['link', 'file'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setResourceMode(mode)}
                          style={{
                            flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            background: resourceMode === mode ? C.card : 'transparent',
                            color: resourceMode === mode ? C.text : C.muted,
                            boxShadow: resourceMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          }}
                        >
                          {mode === 'link' ? '🔗 Link' : '📎 File upload'}
                        </button>
                      ))}
                    </div>

                    {resourceMode === 'link' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input
                          type="text"
                          placeholder="Label (e.g. Lecture Slides)"
                          value={linkTitle}
                          onChange={(e) => setLinkTitle(e.target.value)}
                          style={inputStyle}
                        />
                        <input
                          type="url"
                          placeholder="https://…"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          style={inputStyle}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={addLink}
                            disabled={!linkTitle.trim() || !linkUrl.trim()}
                            style={{ padding: '7px 16px', background: C.purple, color: 'white', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: linkTitle.trim() && linkUrl.trim() ? 1 : 0.4 }}
                          >
                            Add Link
                          </button>
                          <button onClick={() => setShowAddResource(false)} style={{ padding: '7px 12px', background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, cursor: 'pointer' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          style={{ padding: '32px 0', border: `2px dashed ${C.border}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', textAlign: 'center' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 28, color: C.muted, display: 'block', marginBottom: 6 }}>upload_file</span>
                          <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>
                            {uploading ? 'Uploading…' : 'Click to choose a file'}
                          </span>
                          <span style={{ display: 'block', fontSize: 11, color: C.muted, marginTop: 3 }}>PDF, DOCX, PPTX, images — up to 20 MB</span>
                        </button>
                        {uploadError && <p style={{ fontSize: 12, color: 'red', margin: 0 }}>{uploadError}</p>}
                        <button onClick={() => setShowAddResource(false)} style={{ alignSelf: 'flex-start', padding: '6px 12px', background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {resources.length === 0 && !showAddResource && (
                  <p style={{ fontSize: 13, color: C.muted, margin: 0, textAlign: 'center', padding: '8px 0' }}>
                    No resources yet. Add files or links students can download.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: AI Co-Pilot */}
          <div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ height: 3, background: GRADIENT }} />
              <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.purple }}>smart_toy</span>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, margin: 0 }}>AI Co-Pilot</p>
                </div>
              </div>
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', display: 'flex', gap: 10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.purple, flexShrink: 0 }}>lightbulb</span>
                  <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                    Add a title and description, then I can suggest rubric criteria or refine your instructions.
                  </p>
                </div>
                <button style={{ width: '100%', padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', background: `${C.purple}1a`, color: C.purple, cursor: 'pointer' }}>
                  Generate Rubric with AI
                </button>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 99, padding: '8px 14px', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Ask AI to help draft this…"
                      style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: C.text, outline: 'none' }}
                    />
                    <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.purple, display: 'flex' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500, color: '#1b1b1d', marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 14,
  border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#1b1b1d',
  outline: 'none', boxSizing: 'border-box',
}
