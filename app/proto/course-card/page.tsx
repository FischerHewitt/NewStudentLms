// PROTOTYPE — throwaway. Delete or absorb after design decision.
// Question: What should the student course card tile look like?
// Icon square next to course code pill, three-dot menu to edit icon/color/name.
// Route: /proto/course-card

'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PrototypeSwitcher } from '@/components/prototype/PrototypeSwitcher'
import {
  // STEM
  Calculator, Dna, FlaskConical, Atom, Code2, Leaf, BarChart2,
  Microscope, TestTube, Telescope, CircuitBoard, Cpu, Waves,
  TreePine, Flower2, Bug, Fish, Bird, Mountain, Zap, Flame, Rocket,
  // Humanities / Social
  BookOpen, Landmark, Globe, Globe2, Brain, Users, Lightbulb, TrendingUp,
  Map, Compass, ScrollText, Newspaper, Scale, Gavel, Shield,
  // Arts & Electives
  Palette, Music, Drama, Dumbbell, Heart, Camera, PenLine,
  Mic, Headphones, Guitar, Drum, Piano, Film, Clapperboard,
  Paintbrush, Scissors, Feather, Trophy, Medal, Volleyball, Bike,
  // Career / Vocational
  ChefHat, Utensils, Hammer, Wrench, Ruler, Stethoscope, HeartPulse,
  Pill, DollarSign, Banknote, Building2, Terminal, FileCode, Server,
  // Utility
  MoreHorizontal, Check, X,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type IconKey =
  // STEM
  | 'Calculator' | 'Dna' | 'FlaskConical' | 'Atom' | 'Code2' | 'Leaf' | 'BarChart2'
  | 'Microscope' | 'TestTube' | 'Telescope' | 'CircuitBoard' | 'Cpu' | 'Waves'
  | 'TreePine' | 'Flower2' | 'Bug' | 'Fish' | 'Bird' | 'Mountain' | 'Zap' | 'Flame' | 'Rocket'
  // Humanities / Social
  | 'BookOpen' | 'Landmark' | 'Globe' | 'Globe2' | 'Brain' | 'Users' | 'Lightbulb' | 'TrendingUp'
  | 'Map' | 'Compass' | 'ScrollText' | 'Newspaper' | 'Scale' | 'Gavel' | 'Shield'
  // Arts & Electives
  | 'Palette' | 'Music' | 'Drama' | 'Dumbbell' | 'Heart' | 'Camera' | 'PenLine'
  | 'Mic' | 'Headphones' | 'Guitar' | 'Drum' | 'Piano' | 'Film' | 'Clapperboard'
  | 'Paintbrush' | 'Scissors' | 'Feather' | 'Trophy' | 'Medal' | 'Volleyball' | 'Bike'
  // Career / Vocational
  | 'ChefHat' | 'Utensils' | 'Hammer' | 'Wrench' | 'Ruler' | 'Stethoscope' | 'HeartPulse'
  | 'Pill' | 'DollarSign' | 'Banknote' | 'Building2' | 'Terminal' | 'FileCode' | 'Server'
  // Special
  | 'Flag'

type AccentColor = {
  key: string
  label: string
  bg: string        // icon square bg
  text: string      // icon color + pill text
  pill: string      // pill bg
  border: string    // card left border
  hex: string       // raw hex for the SVG icon stroke
}

type Course = {
  id: string
  code: string
  name: string
  teacher: string
  iconKey: IconKey
  colorKey: string
  flagEmoji?: string // only when iconKey === 'Flag'
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ACCENT_COLORS: AccentColor[] = [
  { key: 'violet',  label: 'Violet',  bg: 'bg-violet-100',  text: 'text-violet-700',  pill: 'bg-violet-100',  border: 'border-violet-500', hex: '#7c3aed' },
  { key: 'blue',    label: 'Blue',    bg: 'bg-blue-100',    text: 'text-blue-700',    pill: 'bg-blue-100',    border: 'border-blue-500',   hex: '#2563eb' },
  { key: 'emerald', label: 'Green',   bg: 'bg-emerald-100', text: 'text-emerald-700', pill: 'bg-emerald-100', border: 'border-emerald-500',hex: '#059669' },
  { key: 'amber',   label: 'Amber',   bg: 'bg-amber-100',   text: 'text-amber-700',   pill: 'bg-amber-100',   border: 'border-amber-500',  hex: '#d97706' },
  { key: 'rose',    label: 'Rose',    bg: 'bg-rose-100',    text: 'text-rose-700',    pill: 'bg-rose-100',    border: 'border-rose-500',   hex: '#e11d48' },
  { key: 'sky',     label: 'Sky',     bg: 'bg-sky-100',     text: 'text-sky-700',     pill: 'bg-sky-100',     border: 'border-sky-500',    hex: '#0284c7' },
  { key: 'orange',  label: 'Orange',  bg: 'bg-orange-100',  text: 'text-orange-700',  pill: 'bg-orange-100',  border: 'border-orange-500', hex: '#ea580c' },
  { key: 'pink',    label: 'Pink',    bg: 'bg-pink-100',    text: 'text-pink-700',    pill: 'bg-pink-100',    border: 'border-pink-500',   hex: '#db2777' },
]

const ICON_GROUPS: { group: string; icons: { key: IconKey; label: string }[] }[] = [
  {
    group: 'Science',
    icons: [
      { key: 'Dna',          label: 'Biology' },
      { key: 'Microscope',   label: 'Microscope' },
      { key: 'FlaskConical', label: 'Chemistry' },
      { key: 'TestTube',     label: 'Lab' },
      { key: 'Atom',         label: 'Physics' },
      { key: 'Zap',          label: 'Energy' },
      { key: 'Waves',        label: 'Waves' },
      { key: 'Telescope',    label: 'Astronomy' },
      { key: 'Rocket',       label: 'Space' },
      { key: 'Flame',        label: 'Flame' },
    ],
  },
  {
    group: 'Nature',
    icons: [
      { key: 'Leaf',     label: 'Leaf' },
      { key: 'TreePine', label: 'Tree' },
      { key: 'Flower2',  label: 'Flower' },
      { key: 'Mountain', label: 'Mountain' },
      { key: 'Bug',      label: 'Bug' },
      { key: 'Fish',     label: 'Fish' },
      { key: 'Bird',     label: 'Bird' },
    ],
  },
  {
    group: 'Math & Tech',
    icons: [
      { key: 'Calculator',  label: 'Math' },
      { key: 'BarChart2',   label: 'Stats' },
      { key: 'Code2',       label: 'Code' },
      { key: 'Terminal',    label: 'Terminal' },
      { key: 'FileCode',    label: 'Script' },
      { key: 'CircuitBoard',label: 'Circuit' },
      { key: 'Cpu',         label: 'CPU' },
      { key: 'Server',      label: 'Server' },
    ],
  },
  {
    group: 'Humanities',
    icons: [
      { key: 'BookOpen',   label: 'English' },
      { key: 'ScrollText', label: 'Scroll' },
      { key: 'Feather',    label: 'Writing' },
      { key: 'PenLine',    label: 'Pen' },
      { key: 'Newspaper',  label: 'News' },
      { key: 'Landmark',   label: 'History' },
      { key: 'Globe',      label: 'Globe' },
      { key: 'Globe2',     label: 'World' },
      { key: 'Map',        label: 'Map' },
      { key: 'Compass',    label: 'Compass' },
    ],
  },
  {
    group: 'Social & Law',
    icons: [
      { key: 'Brain',      label: 'Psychology' },
      { key: 'Users',      label: 'Sociology' },
      { key: 'Lightbulb',  label: 'Philosophy' },
      { key: 'TrendingUp', label: 'Economics' },
      { key: 'Scale',      label: 'Law' },
      { key: 'Gavel',      label: 'Gavel' },
      { key: 'Shield',     label: 'Civics' },
    ],
  },
  {
    group: 'Arts & Music',
    icons: [
      { key: 'Palette',     label: 'Art' },
      { key: 'Paintbrush',  label: 'Paint' },
      { key: 'Scissors',    label: 'Craft' },
      { key: 'Camera',      label: 'Photo' },
      { key: 'Film',        label: 'Film' },
      { key: 'Clapperboard',label: 'Drama' },
      { key: 'Drama',       label: 'Theater' },
      { key: 'Mic',         label: 'Speech' },
      { key: 'Music',       label: 'Music' },
      { key: 'Headphones',  label: 'Audio' },
      { key: 'Guitar',      label: 'Guitar' },
      { key: 'Piano',       label: 'Piano' },
      { key: 'Drum',        label: 'Drums' },
    ],
  },
  {
    group: 'Sports & Health',
    icons: [
      { key: 'Dumbbell',    label: 'PE' },
      { key: 'Volleyball',  label: 'Sports' },
      { key: 'Bike',        label: 'Cycling' },
      { key: 'Heart',       label: 'Health' },
      { key: 'HeartPulse',  label: 'Cardio' },
      { key: 'Stethoscope', label: 'Medical' },
      { key: 'Pill',        label: 'Pharma' },
      { key: 'Trophy',      label: 'Trophy' },
      { key: 'Medal',       label: 'Medal' },
    ],
  },
  {
    group: 'Career & Trade',
    icons: [
      { key: 'ChefHat',   label: 'Culinary' },
      { key: 'Utensils',  label: 'Food' },
      { key: 'Hammer',    label: 'Shop' },
      { key: 'Wrench',    label: 'Mech.' },
      { key: 'Ruler',     label: 'Design' },
      { key: 'DollarSign',label: 'Finance' },
      { key: 'Banknote',  label: 'Banking' },
      { key: 'Building2', label: 'Business' },
    ],
  },
  {
    group: 'Languages',
    icons: [
      { key: 'Flag', label: 'Flag' },
    ],
  },
]

// Flat list for the ICON_MAP
const ICON_OPTIONS: { key: IconKey; label: string }[] = ICON_GROUPS.flatMap((g) => g.icons)

const ICON_MAP: Record<IconKey, React.ElementType | null> = {
  // STEM
  Calculator, Dna, FlaskConical, Atom, Code2, Leaf, BarChart2,
  Microscope, TestTube, Telescope, CircuitBoard, Cpu, Waves,
  TreePine, Flower2, Bug, Fish, Bird, Mountain, Zap, Flame, Rocket,
  // Humanities / Social
  BookOpen, Landmark, Globe, Globe2, Brain, Users, Lightbulb, TrendingUp,
  Map, Compass, ScrollText, Newspaper, Scale, Gavel, Shield,
  // Arts
  Palette, Music, Drama, Dumbbell, Heart, Camera, PenLine,
  Mic, Headphones, Guitar, Drum, Piano, Film, Clapperboard,
  Paintbrush, Scissors, Feather, Trophy, Medal, Volleyball, Bike,
  // Career
  ChefHat, Utensils, Hammer, Wrench, Ruler, Stethoscope, HeartPulse,
  Pill, DollarSign, Banknote, Building2, Terminal, FileCode, Server,
  // Special
  Flag: null,
}

const FLAG_EMOJIS = ['🇪🇸', '🇫🇷', '🇩🇪', '🇯🇵', '🇧🇷', '🇮🇹', '🇨🇳', '🇰🇷']

const INITIAL_COURSES: Course[] = [
  { id: '1', code: 'BIO 111', name: 'Biology and Society',  teacher: 'Dr. Chen',    iconKey: 'Dna',         colorKey: 'emerald' },
  { id: '2', code: 'COMS 101',name: 'Public Speaking',     teacher: 'Prof. Watts', iconKey: 'Users',       colorKey: 'blue' },
  { id: '3', code: 'MATH 143',name: 'College Algebra',     teacher: 'Dr. Park',    iconKey: 'Calculator',  colorKey: 'violet' },
  { id: '4', code: 'SPAN 201', name: 'Intermediate Spanish',teacher: 'Sra. López', iconKey: 'Flag',        colorKey: 'rose',  flagEmoji: '🇪🇸' },
  { id: '5', code: 'HIST 110',name: 'World History',       teacher: 'Prof. Osei',  iconKey: 'Landmark',    colorKey: 'amber' },
  { id: '6', code: 'CS 101',   name: 'Intro to Coding',    teacher: 'Dr. Nguyen',  iconKey: 'Code2',       colorKey: 'sky' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getColor(key: string): AccentColor {
  return ACCENT_COLORS.find((c) => c.key === key) ?? ACCENT_COLORS[0]
}

function CourseIcon({
  iconKey,
  flagEmoji,
  hex,
  size = 22,
}: {
  iconKey: IconKey
  flagEmoji?: string
  hex: string
  size?: number
}) {
  if (iconKey === 'Flag') {
    return <span style={{ fontSize: size }}>{flagEmoji ?? '🏳️'}</span>
  }
  const Icon = ICON_MAP[iconKey]
  if (!Icon) return null
  return <Icon size={size} color={hex} strokeWidth={2} />
}

// ─── Edit Popover ─────────────────────────────────────────────────────────────

function EditPopover({
  course,
  onSave,
  onClose,
}: {
  course: Course
  onSave: (updated: Course) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<Course>({ ...course })
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose])

  const color = getColor(draft.colorKey)

  return (
    <div
      ref={ref}
      className="absolute bottom-10 right-0 z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-900">Edit tile</p>
        <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100">
          <X size={14} />
        </button>
      </div>

      {/* Name */}
      <label className="mb-1 block text-xs font-semibold text-slate-500">Course name</label>
      <input
        className="mb-3 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
      />

      {/* Color */}
      <label className="mb-2 block text-xs font-semibold text-slate-500">Accent color</label>
      <div className="mb-3 flex flex-wrap gap-2">
        {ACCENT_COLORS.map((c) => (
          <button
            key={c.key}
            title={c.label}
            onClick={() => setDraft({ ...draft, colorKey: c.key })}
            style={{ backgroundColor: c.hex }}
            className="relative h-6 w-6 rounded-full transition hover:scale-110"
          >
            {draft.colorKey === c.key && (
              <Check size={12} color="white" className="absolute inset-0 m-auto" />
            )}
          </button>
        ))}
      </div>

      {/* Icon */}
      <label className="mb-2 block text-xs font-semibold text-slate-500">Icon</label>
      <div className="max-h-52 overflow-y-auto rounded-md border border-slate-100 bg-slate-50 p-2">
        {ICON_GROUPS.map((group) => (
          <div key={group.group} className="mb-3 last:mb-0">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {group.group}
            </p>
            <div className="flex flex-wrap gap-1">
              {group.icons.map((opt) => {
                const isFlag = opt.key === 'Flag'
                const IconComp = !isFlag ? ICON_MAP[opt.key] : null
                const selected = draft.iconKey === opt.key
                return (
                  <button
                    key={opt.key}
                    title={opt.label}
                    onClick={() => setDraft({ ...draft, iconKey: opt.key })}
                    className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
                      selected
                        ? `${color.bg} ring-2 ring-offset-1`
                        : 'hover:bg-white'
                    }`}
                    style={selected ? { '--tw-ring-color': color.hex } as React.CSSProperties : {}}
                  >
                    {isFlag ? (
                      <span className="text-base leading-none">{draft.flagEmoji ?? '🏳️'}</span>
                    ) : IconComp ? (
                      <IconComp size={16} color={selected ? color.hex : '#64748b'} strokeWidth={2} />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Flag emoji picker — only visible when Flag is selected */}
      {draft.iconKey === 'Flag' && (
        <div className="mb-3 mt-2 flex flex-wrap gap-1">
          {FLAG_EMOJIS.map((flag) => (
            <button
              key={flag}
              onClick={() => setDraft({ ...draft, flagEmoji: flag })}
              className={`rounded p-1 text-lg transition hover:bg-slate-100 ${
                draft.flagEmoji === flag ? 'ring-2 ring-indigo-400' : ''
              }`}
            >
              {flag}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => { onSave(draft); onClose() }}
        className="mt-2 w-full rounded-md bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Save
      </button>
    </div>
  )
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ course, onUpdate }: { course: Course; onUpdate: (c: Course) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const color = getColor(course.colorKey)

  return (
    <div
      className={`relative flex min-h-36 flex-col justify-between overflow-visible rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md`}
    >
      {/* Left accent border */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${color.border}`} />

      {/* Top row: pill + icon square */}
      <div className="flex items-start gap-3">
        {/* Course code pill */}
        <div className={`rounded-lg px-3 py-1.5 ${color.pill}`}>
          <span className={`text-sm font-bold ${color.text}`}>{course.code}</span>
        </div>

        {/* Icon square */}
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color.bg}`}>
          <CourseIcon
            iconKey={course.iconKey}
            flagEmoji={course.flagEmoji}
            hex={color.hex}
            size={20}
          />
        </div>
      </div>

      {/* Course name + teacher */}
      <div className="mt-3">
        <p className="text-sm font-bold leading-snug text-slate-900">{course.name}</p>
        <p className="mt-0.5 text-xs text-slate-500">{course.teacher}</p>
      </div>

      {/* Three-dot menu — bottom right */}
      <div className="absolute bottom-3 right-3">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Edit tile"
        >
          <MoreHorizontal size={16} />
        </button>

        {menuOpen && (
          <EditPopover
            course={course}
            onSave={onUpdate}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>
    </div>
  )
}

// ─── Variants ────────────────────────────────────────────────────────────────

function VariantGrid({ courses, onUpdate }: { courses: Course[]; onUpdate: (c: Course) => void }) {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My Courses</h1>
      <div className="grid grid-cols-3 gap-4">
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  )
}

function VariantList({ courses, onUpdate }: { courses: Course[]; onUpdate: (c: Course) => void }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My Courses</h1>
      <div className="flex flex-col gap-3">
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  )
}

function VariantLarge({ courses, onUpdate }: { courses: Course[]; onUpdate: (c: Course) => void }) {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My Courses</h1>
      <div className="grid grid-cols-2 gap-5">
        {courses.map((c) => {
          const color = getColor(c.colorKey)
          return (
            <div
              key={c.id}
              className="relative flex min-h-48 flex-col justify-between overflow-visible rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className={`absolute left-0 top-5 bottom-5 w-1.5 rounded-full ${color.border}`} />

              <div className="flex items-start gap-4">
                {/* Larger icon square */}
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${color.bg}`}>
                  <CourseIcon iconKey={c.iconKey} flagEmoji={c.flagEmoji} hex={color.hex} size={28} />
                </div>
                <div>
                  <div className={`inline-flex rounded-lg px-3 py-1 ${color.pill}`}>
                    <span className={`text-sm font-bold ${color.text}`}>{c.code}</span>
                  </div>
                  <p className="mt-1.5 text-base font-bold leading-snug text-slate-900">{c.name}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{c.teacher}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className={`rounded-lg px-4 py-2 text-sm font-semibold ${color.bg} ${color.text}`}>
                  Open course
                </button>
              </div>

              {/* Three-dot */}
              <div className="absolute bottom-4 right-4">
                <CourseCardMenu course={c} onUpdate={onUpdate} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CourseCardMenu({ course, onUpdate }: { course: Course; onUpdate: (c: Course) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Edit tile"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <EditPopover course={course} onSave={onUpdate} onClose={() => setOpen(false)} />
      )}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const variants = [
  { id: 'a', label: 'Grid (3-col)' },
  { id: 'b', label: 'List' },
  { id: 'c', label: 'Large Cards' },
]

function CourseCardPrototype() {
  const params = useSearchParams()
  const variant = params.get('variant') ?? 'a'
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES)

  function handleUpdate(updated: Course) {
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  return (
    <div className="min-h-screen bg-[#fcf8fa] px-8 py-10 pb-28">
      {variant === 'b' ? (
        <VariantList courses={courses} onUpdate={handleUpdate} />
      ) : variant === 'c' ? (
        <VariantLarge courses={courses} onUpdate={handleUpdate} />
      ) : (
        <VariantGrid courses={courses} onUpdate={handleUpdate} />
      )}
      <PrototypeSwitcher variants={variants} current={variant} />
    </div>
  )
}

export default function ProtoCoursCardPage() {
  return (
    <Suspense>
      <CourseCardPrototype />
    </Suspense>
  )
}
