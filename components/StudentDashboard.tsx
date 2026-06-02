'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import {
  // STEM
  Calculator, Dna, FlaskConical, Atom, Code2, Leaf, BarChart2,
  Microscope, TestTube, Telescope, CircuitBoard, Waves, TreePine,
  Flower2, Bug, Fish, Bird, Mountain, Zap, Flame, Rocket,
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
  // UI
  MoreHorizontal, Check, X,
} from 'lucide-react'
import { checkOffAssignment } from '@/app/actions/assignment'
import { filterOpenAssignments } from '@/lib/studentDashboard'
import { inferCourseIcon } from '@/lib/course-card-icon'
import { getCourseCardPrefs, setCourseCardPrefs, type CourseCardPrefs } from '@/lib/course-card-prefs'
import { usePopoverPosition } from '@/lib/use-popover-position'
import { ALUMOSGradientLogo } from './ALUMOSGradientLogo'
import { GradesCommandCenter } from './GradesCommandCenter'
import type {
  StudentDashboardAssignment,
  StudentDashboardCourse,
} from '@/app/actions/dashboard'
import type { GradeWithFeedback } from '@/lib/grade-summary'

type StudentTab = 'overview' | 'grades' | 'messages'
type WorkView = 'todo' | 'completed'

const TODO_AHEAD_DAYS = 10
const TODO_VISIBLE_LIMIT = 9
const COMPLETED_LOOKBACK_DAYS = 21
const COMPLETED_VISIBLE_LIMIT = 9

interface Props {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
  recentGrades?: GradeWithFeedback[]
  initialTargetGpa?: number | null
  initialTab?: StudentTab
  initialCourseId?: string | null
  initialWorkView?: WorkView
}

const PALETTE = [
  'violet', 'blue', 'emerald', 'amber', 'rose', 'sky', 'orange', 'pink',
  'indigo', 'teal', 'cyan', 'lime', 'yellow', 'red', 'fuchsia', 'slate',
] as const
type PaletteColor = (typeof PALETTE)[number]

type ColorTokens = {
  accent: string
  border: string
  bar: string
  pill: string
  dot: string
  soft: string
  iconBg: string
  hex: string
}

const COLORS: Record<PaletteColor, ColorTokens> = {
  violet:  { accent: 'text-violet-700',  border: 'border-l-violet-500',  bar: 'bg-violet-500',  pill: 'bg-violet-100 text-violet-700',   dot: 'bg-violet-500',  soft: 'bg-violet-50',  iconBg: 'bg-violet-100',  hex: '#7c3aed' },
  blue:    { accent: 'text-blue-700',    border: 'border-l-blue-500',    bar: 'bg-blue-500',    pill: 'bg-blue-100 text-blue-700',        dot: 'bg-blue-500',    soft: 'bg-blue-50',    iconBg: 'bg-blue-100',    hex: '#2563eb' },
  emerald: { accent: 'text-emerald-700', border: 'border-l-emerald-500', bar: 'bg-emerald-500', pill: 'bg-emerald-100 text-emerald-700',  dot: 'bg-emerald-500', soft: 'bg-emerald-50', iconBg: 'bg-emerald-100', hex: '#059669' },
  amber:   { accent: 'text-amber-700',   border: 'border-l-amber-500',   bar: 'bg-amber-500',   pill: 'bg-amber-100 text-amber-700',      dot: 'bg-amber-500',   soft: 'bg-amber-50',   iconBg: 'bg-amber-100',   hex: '#d97706' },
  rose:    { accent: 'text-rose-700',    border: 'border-l-rose-500',    bar: 'bg-rose-500',    pill: 'bg-rose-100 text-rose-700',        dot: 'bg-rose-500',    soft: 'bg-rose-50',    iconBg: 'bg-rose-100',    hex: '#e11d48' },
  sky:     { accent: 'text-sky-700',     border: 'border-l-sky-500',     bar: 'bg-sky-500',     pill: 'bg-sky-100 text-sky-700',          dot: 'bg-sky-500',     soft: 'bg-sky-50',     iconBg: 'bg-sky-100',     hex: '#0284c7' },
  orange:  { accent: 'text-orange-700',  border: 'border-l-orange-500',  bar: 'bg-orange-500',  pill: 'bg-orange-100 text-orange-700',    dot: 'bg-orange-500',  soft: 'bg-orange-50',  iconBg: 'bg-orange-100',  hex: '#ea580c' },
  pink:    { accent: 'text-pink-700',    border: 'border-l-pink-500',    bar: 'bg-pink-500',    pill: 'bg-pink-100 text-pink-700',        dot: 'bg-pink-500',    soft: 'bg-pink-50',    iconBg: 'bg-pink-100',    hex: '#db2777' },
  indigo:  { accent: 'text-indigo-700',  border: 'border-l-indigo-500',  bar: 'bg-indigo-500',  pill: 'bg-indigo-100 text-indigo-700',    dot: 'bg-indigo-500',  soft: 'bg-indigo-50',  iconBg: 'bg-indigo-100',  hex: '#4338ca' },
  teal:    { accent: 'text-teal-700',    border: 'border-l-teal-500',    bar: 'bg-teal-500',    pill: 'bg-teal-100 text-teal-700',        dot: 'bg-teal-500',    soft: 'bg-teal-50',    iconBg: 'bg-teal-100',    hex: '#0d9488' },
  cyan:    { accent: 'text-cyan-700',    border: 'border-l-cyan-500',    bar: 'bg-cyan-500',    pill: 'bg-cyan-100 text-cyan-700',        dot: 'bg-cyan-500',    soft: 'bg-cyan-50',    iconBg: 'bg-cyan-100',    hex: '#0891b2' },
  lime:    { accent: 'text-lime-700',    border: 'border-l-lime-500',    bar: 'bg-lime-500',    pill: 'bg-lime-100 text-lime-700',        dot: 'bg-lime-500',    soft: 'bg-lime-50',    iconBg: 'bg-lime-100',    hex: '#65a30d' },
  yellow:  { accent: 'text-yellow-700',  border: 'border-l-yellow-500',  bar: 'bg-yellow-500',  pill: 'bg-yellow-100 text-yellow-700',    dot: 'bg-yellow-500',  soft: 'bg-yellow-50',  iconBg: 'bg-yellow-100',  hex: '#ca8a04' },
  red:     { accent: 'text-red-700',     border: 'border-l-red-500',     bar: 'bg-red-500',     pill: 'bg-red-100 text-red-700',          dot: 'bg-red-500',     soft: 'bg-red-50',     iconBg: 'bg-red-100',     hex: '#dc2626' },
  fuchsia: { accent: 'text-fuchsia-700', border: 'border-l-fuchsia-500', bar: 'bg-fuchsia-500', pill: 'bg-fuchsia-100 text-fuchsia-700',  dot: 'bg-fuchsia-500', soft: 'bg-fuchsia-50', iconBg: 'bg-fuchsia-100', hex: '#a21caf' },
  slate:   { accent: 'text-slate-700',   border: 'border-l-slate-500',   bar: 'bg-slate-500',   pill: 'bg-slate-100 text-slate-700',      dot: 'bg-slate-500',   soft: 'bg-slate-50',   iconBg: 'bg-slate-100',   hex: '#475569' },
}

function assignColor(index: number): PaletteColor {
  return PALETTE[index % PALETTE.length]
}

// ── Icon component map ────────────────────────────────────────────────────────

const ICON_COMPONENT_MAP: Record<string, React.ElementType> = {
  Calculator, Dna, FlaskConical, Atom, Code2, Leaf, BarChart2,
  Microscope, TestTube, Telescope, CircuitBoard, Waves, TreePine,
  Flower2, Bug, Fish, Bird, Mountain, Zap, Flame, Rocket,
  BookOpen, Landmark, Globe, Globe2, Brain, Users, Lightbulb, TrendingUp,
  Map, Compass, ScrollText, Newspaper, Scale, Gavel, Shield,
  Palette, Music, Drama, Dumbbell, Heart, Camera, PenLine,
  Mic, Headphones, Guitar, Drum, Piano, Film, Clapperboard,
  Paintbrush, Scissors, Feather, Trophy, Medal, Volleyball, Bike,
  ChefHat, Utensils, Hammer, Wrench, Ruler, Stethoscope, HeartPulse,
  Pill, DollarSign, Banknote, Building2, Terminal, FileCode, Server,
}

// ── CourseIconSquare ──────────────────────────────────────────────────────────

function CourseIconSquare({
  courseId,
  courseTitle,
  colorKey,
}: {
  courseId: string
  courseTitle: string
  colorKey: PaletteColor
}) {
  const prefs = getCourseCardPrefs(courseId)
  const tokens = COLORS[colorKey]

  let iconEl: React.ReactNode
  if (prefs?.iconKey === 'Flag') {
    iconEl = <span style={{ fontSize: 20, lineHeight: 1 }}>{prefs.flagEmoji ?? '🏳️'}</span>
  } else if (prefs?.iconKey && ICON_COMPONENT_MAP[prefs.iconKey]) {
    const Icon = ICON_COMPONENT_MAP[prefs.iconKey]
    iconEl = <Icon size={20} color={tokens.hex} strokeWidth={2} />
  } else {
    const def = inferCourseIcon(courseTitle)
    if (def.type === 'emoji') {
      iconEl = <span style={{ fontSize: 20, lineHeight: 1 }}>{def.char}</span>
    } else {
      const Icon = ICON_COMPONENT_MAP[def.iconKey] ?? BookOpen
      iconEl = <Icon size={20} color={tokens.hex} strokeWidth={2} />
    }
  }

  return (
    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${tokens.iconBg}`}>
      {iconEl}
    </div>
  )
}

// ── Icon picker data ──────────────────────────────────────────────────────────

type IconOption = { key: string; label: string }
type IconGroup  = { group: string; icons: IconOption[] }

const ICON_GROUPS: IconGroup[] = [
  { group: 'Science', icons: [
    { key: 'Dna', label: 'Biology' }, { key: 'Microscope', label: 'Microscope' },
    { key: 'FlaskConical', label: 'Chemistry' }, { key: 'TestTube', label: 'Lab' },
    { key: 'Atom', label: 'Physics' }, { key: 'Zap', label: 'Energy' },
    { key: 'Waves', label: 'Waves' }, { key: 'Telescope', label: 'Astronomy' },
    { key: 'Rocket', label: 'Space' }, { key: 'Flame', label: 'Flame' },
  ]},
  { group: 'Nature', icons: [
    { key: 'Leaf', label: 'Leaf' }, { key: 'TreePine', label: 'Tree' },
    { key: 'Flower2', label: 'Flower' }, { key: 'Mountain', label: 'Mountain' },
    { key: 'Bug', label: 'Bug' }, { key: 'Fish', label: 'Fish' }, { key: 'Bird', label: 'Bird' },
  ]},
  { group: 'Math & Tech', icons: [
    { key: 'Calculator', label: 'Math' }, { key: 'BarChart2', label: 'Stats' },
    { key: 'Code2', label: 'Code' }, { key: 'Terminal', label: 'Terminal' },
    { key: 'FileCode', label: 'Script' }, { key: 'CircuitBoard', label: 'Circuit' },
    { key: 'Server', label: 'Server' },
  ]},
  { group: 'Humanities', icons: [
    { key: 'BookOpen', label: 'English' }, { key: 'ScrollText', label: 'Scroll' },
    { key: 'Feather', label: 'Writing' }, { key: 'PenLine', label: 'Pen' },
    { key: 'Newspaper', label: 'News' }, { key: 'Landmark', label: 'History' },
    { key: 'Globe', label: 'Globe' }, { key: 'Globe2', label: 'World' },
    { key: 'Map', label: 'Map' }, { key: 'Compass', label: 'Compass' },
  ]},
  { group: 'Social & Law', icons: [
    { key: 'Brain', label: 'Psychology' }, { key: 'Users', label: 'Sociology' },
    { key: 'Lightbulb', label: 'Philosophy' }, { key: 'TrendingUp', label: 'Economics' },
    { key: 'Scale', label: 'Law' }, { key: 'Gavel', label: 'Gavel' }, { key: 'Shield', label: 'Civics' },
  ]},
  { group: 'Arts & Music', icons: [
    { key: 'Palette', label: 'Art' }, { key: 'Paintbrush', label: 'Paint' },
    { key: 'Scissors', label: 'Craft' }, { key: 'Camera', label: 'Photo' },
    { key: 'Film', label: 'Film' }, { key: 'Clapperboard', label: 'Drama' },
    { key: 'Drama', label: 'Theater' }, { key: 'Mic', label: 'Speech' },
    { key: 'Music', label: 'Music' }, { key: 'Headphones', label: 'Audio' },
    { key: 'Guitar', label: 'Guitar' }, { key: 'Piano', label: 'Piano' }, { key: 'Drum', label: 'Drums' },
  ]},
  { group: 'Sports & Health', icons: [
    { key: 'Dumbbell', label: 'PE' }, { key: 'Volleyball', label: 'Sports' },
    { key: 'Bike', label: 'Cycling' }, { key: 'Heart', label: 'Health' },
    { key: 'HeartPulse', label: 'Cardio' }, { key: 'Stethoscope', label: 'Medical' },
    { key: 'Pill', label: 'Pharma' }, { key: 'Trophy', label: 'Trophy' }, { key: 'Medal', label: 'Medal' },
  ]},
  { group: 'Career & Trade', icons: [
    { key: 'ChefHat', label: 'Culinary' }, { key: 'Utensils', label: 'Food' },
    { key: 'Hammer', label: 'Shop' }, { key: 'Wrench', label: 'Mech.' },
    { key: 'Ruler', label: 'Design' }, { key: 'DollarSign', label: 'Finance' },
    { key: 'Banknote', label: 'Banking' }, { key: 'Building2', label: 'Business' },
  ]},
  { group: 'Languages', icons: [
    { key: 'Flag', label: 'Flag' },
  ]},
]

const FLAG_EMOJIS = ['🇪🇸', '🇫🇷', '🇩🇪', '🇯🇵', '🇧🇷', '🇮🇹', '🇨🇳', '🇰🇷']
const ACCENT_SWATCHES = PALETTE.map((key) => ({ key, hex: COLORS[key].hex }))

// ── CourseCardEditPopover ─────────────────────────────────────────────────────

function CourseCardEditPopover({
  courseId,
  defaultNickname,
  defaultColorKey,
  defaultIconKey,
  defaultFlagEmoji,
  onSave,
  onClose,
  triggerRef,
}: {
  courseId: string
  defaultNickname: string
  defaultColorKey: PaletteColor
  defaultIconKey: string
  defaultFlagEmoji?: string
  onSave: (prefs: CourseCardPrefs) => void
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}) {
  const [nickname, setNickname] = useState(defaultNickname)
  const [colorKey, setColorKey] = useState<PaletteColor>(defaultColorKey)
  const [iconKey, setIconKey] = useState(defaultIconKey)
  const [flagEmoji, setFlagEmoji] = useState(defaultFlagEmoji ?? '🇪🇸')

  const position = usePopoverPosition(
    triggerRef as React.RefObject<HTMLElement | null>,
    { width: 288, height: 460 },
    true,
  )
  const tokens = COLORS[colorKey] ?? COLORS.violet

  // Live preview icon
  let previewIcon: React.ReactNode
  if (iconKey === 'Flag') {
    previewIcon = <span style={{ fontSize: 18, lineHeight: 1 }}>{flagEmoji}</span>
  } else {
    const Icon = ICON_COMPONENT_MAP[iconKey] ?? BookOpen
    previewIcon = <Icon size={18} color={tokens.hex} strokeWidth={2} />
  }

  function handleSave() {
    const prefs: CourseCardPrefs = {
      iconKey,
      colorKey,
      nickname: nickname.trim() || defaultNickname,
      ...(iconKey === 'Flag' ? { flagEmoji } : {}),
    }
    setCourseCardPrefs(courseId, prefs)
    onSave(prefs)
    onClose()
  }

  return (
    <div
      className="fixed z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
      style={{ top: position.top, left: position.left }}
    >
      {/* Header with live preview */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tokens.iconBg}`}>
            {previewIcon}
          </div>
          <p className="text-sm font-bold text-slate-900">Edit tile</p>
        </div>
        <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100">
          <X size={14} />
        </button>
      </div>

      {/* Nickname */}
      <label className="mb-1 block text-xs font-semibold text-slate-500">Nickname</label>
      <input
        className="mb-3 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none"
        value={nickname}
        placeholder={defaultNickname}
        onChange={(e) => setNickname(e.target.value)}
      />

      {/* Color swatches */}
      <label className="mb-2 block text-xs font-semibold text-slate-500">Color</label>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {ACCENT_SWATCHES.map((s) => (
          <button
            key={s.key}
            title={s.key}
            onClick={() => setColorKey(s.key as PaletteColor)}
            style={{ backgroundColor: s.hex }}
            className="relative h-6 w-6 rounded-full transition hover:scale-110"
          >
            {colorKey === s.key && (
              <Check size={12} color="white" className="absolute inset-0 m-auto" />
            )}
          </button>
        ))}
      </div>

      {/* Icon picker — grouped, scrollable */}
      <label className="mb-2 block text-xs font-semibold text-slate-500">Icon</label>
      <div className="mb-1 max-h-44 overflow-y-auto rounded-md border border-slate-100 bg-slate-50 p-2">
        {ICON_GROUPS.map((group) => (
          <div key={group.group} className="mb-2 last:mb-0">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {group.group}
            </p>
            <div className="flex flex-wrap gap-1">
              {group.icons.map((opt) => {
                const isFlag = opt.key === 'Flag'
                const IconComp = !isFlag ? ICON_COMPONENT_MAP[opt.key] : null
                const selected = iconKey === opt.key
                return (
                  <button
                    key={opt.key}
                    title={opt.label}
                    onClick={() => setIconKey(opt.key)}
                    className={`flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-white ${
                      selected ? tokens.iconBg : ''
                    }`}
                    style={selected ? { outline: `2px solid ${tokens.hex}`, outlineOffset: 1 } : {}}
                  >
                    {isFlag
                      ? <span className="text-sm leading-none">{flagEmoji}</span>
                      : IconComp
                        ? <IconComp size={15} color={selected ? tokens.hex : '#64748b'} strokeWidth={2} />
                        : null
                    }
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Flag emoji sub-row */}
      {iconKey === 'Flag' && (
        <div className="mb-2 flex flex-wrap gap-1">
          {FLAG_EMOJIS.map((flag) => (
            <button
              key={flag}
              onClick={() => setFlagEmoji(flag)}
              className={`rounded p-1 text-lg transition hover:bg-slate-100 ${
                flagEmoji === flag ? 'ring-2 ring-indigo-400' : ''
              }`}
            >
              {flag}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={handleSave}
        className="mt-2 w-full rounded-md bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Save
      </button>
    </div>
  )
}

function courseCode(title: string): string {
  const match = title.match(/[A-Z]{2,}\s*\d{2,}/)
  if (match) return match[0].replace(/\s+/, '')

  const words = title
    .split(/\s+/)
    .filter((word) => word.length > 2 && !/^(the|and|for|with|of)$/i.test(word))

  return (words.length ? words : [title])
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 5)
}

function isOpenAssignment(assignment: StudentDashboardAssignment): boolean {
  return assignment.status === 'not-started' || assignment.status === 'in-progress'
}

function courseGradeStats(assignments: StudentDashboardAssignment[], courseId: string) {
  const graded = assignments.filter(
    (assignment) => assignment.courseId === courseId && assignment.status === 'graded',
  )
  const earned = graded.reduce((sum, assignment) => sum + (assignment.grade ?? 0), 0)
  const total = graded.reduce((sum, assignment) => sum + assignment.points, 0)

  if (total === 0) return null
  return { earned, total, pct: Math.round((earned / total) * 100) }
}

function letterGrade(pct: number): string {
  if (pct >= 93) return 'A'
  if (pct >= 90) return 'A-'
  if (pct >= 87) return 'B+'
  if (pct >= 83) return 'B'
  if (pct >= 80) return 'B-'
  if (pct >= 77) return 'C+'
  if (pct >= 73) return 'C'
  return 'D'
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysUntil(due: string): number {
  const today = new Date(`${todayStr()}T12:00:00`)
  const date = new Date(`${due}T12:00:00`)
  return Math.ceil((date.getTime() - today.getTime()) / 86400000)
}

function dateLabel(due: string): string {
  const days = daysUntil(due)
  if (days < 0) return 'Overdue'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return new Date(`${due}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function getWeekDates(dayOffset: number): { date: string; label: string }[] {
  const start = new Date(`${todayStr()}T00:00:00Z`)
  start.setUTCDate(start.getUTCDate() + dayOffset - 1)
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + index)
    return {
      date: date.toISOString().slice(0, 10),
      label: labels[date.getUTCDay()],
    }
  })
}

function buildAiCoachInsight(
  courses: StudentDashboardCourse[],
  assignments: StudentDashboardAssignment[],
): string {
  if (courses.length === 0) {
    return 'Once your teacher publishes a Course, I will help you spot what needs attention first.'
  }

  const nextOpen = assignments
    .filter((assignment) => isOpenAssignment(assignment) && assignment.due)
    .sort((a, b) => new Date(a.due!).getTime() - new Date(b.due!).getTime())[0]

  if (!nextOpen) {
    return 'You are caught up on visible work. Use this window to review materials before the next Module opens.'
  }

  const course = courses.find((item) => item.id === nextOpen.courseId)
  return `Your next priority is ${nextOpen.title}${course ? ` in ${course.title}` : ''}. Review the materials before ${dateLabel(nextOpen.due!)} so the assignment does not sneak up on you.`
}

function findNextOpenAssignment(assignments: StudentDashboardAssignment[]): StudentDashboardAssignment | null {
  return assignments
    .filter((assignment) => isOpenAssignment(assignment) && assignment.due)
    .sort((a, b) => new Date(a.due!).getTime() - new Date(b.due!).getTime())[0] ?? null
}

function groupOpenAssignments(assignments: StudentDashboardAssignment[]) {
  const groups: Record<string, StudentDashboardAssignment[]> = {}
  for (const assignment of assignments) {
    if (!assignment.due) continue
    const key = assignment.due
    groups[key] = groups[key] ? [...groups[key], assignment] : [assignment]
  }
  return Object.keys(groups)
    .sort()
    .map((date) => ({ date, label: dateLabel(date), assignments: groups[date] }))
}

function isInTodoWindow(assignment: StudentDashboardAssignment): boolean {
  if (!assignment.due) return false
  return daysUntil(assignment.due) <= TODO_AHEAD_DAYS
}

function completedReferenceDate(assignment: StudentDashboardAssignment): string | null {
  return assignment.submittedAt?.slice(0, 10) ?? assignment.due
}

function isInCompletedWindow(assignment: StudentDashboardAssignment): boolean {
  const date = completedReferenceDate(assignment)
  if (!date) return false

  const daysAgo = -daysUntil(date)
  return daysAgo >= 0 && daysAgo <= COMPLETED_LOOKBACK_DAYS
}

function switchToTeacher() {
  localStorage.setItem('lms_active_role', 'teacher')
  window.location.href = '/dashboard'
}

function StudentSidebar() {
  const navItems = [
    ['dashboard', 'Dashboard'],
    ['psychology', 'AI Coach'],
    ['calendar_month', 'Calendar'],
  ]

  return (
    <aside className="flex border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:border-r">
      <div className="hidden h-full flex-col p-6 lg:flex">
        <div className="mb-8 flex items-center gap-3">
          <ALUMOSGradientLogo iconSize={32} />
        </div>

        <div className="mb-8 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
            <span className="material-symbols-outlined text-slate-700">person</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-950">Alex Rivera</p>
            <p className="text-xs text-slate-500">Computer Science Year 2</p>
          </div>
        </div>

        <nav className="space-y-2" aria-label="Student">
          {navItems.map(([icon, label], index) => (
            <button
              key={label}
              type="button"
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                index === 0
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[20px]">psychology</span>
            Ask AI Coach
          </button>
          <button
            type="button"
            onClick={switchToTeacher}
            className="flex w-full items-center justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Teacher View
          </button>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <ALUMOSGradientLogo iconSize={28} />
        </div>
        <button
          type="button"
          onClick={switchToTeacher}
          className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Teacher View
        </button>
      </div>
    </aside>
  )
}

function StudentTopBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: StudentTab
  setActiveTab: (tab: StudentTab) => void
}) {
  const tabs: { id: StudentTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'grades', label: 'Grades' },
    { id: 'messages', label: 'Messages' },
  ]

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-[#F8FAFC]/90 px-4 backdrop-blur-md sm:px-8">
      <div className="flex h-full items-center gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative h-full px-1 text-sm font-semibold transition sm:text-base ${
              activeTab === tab.id ? 'text-slate-950' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-orange-500" />
            )}
          </button>
        ))}
      </div>

      <div className="hidden items-center gap-3 sm:flex">
        <button type="button" aria-label="Notifications" className="rounded-full p-2 text-slate-700 hover:bg-white">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button type="button" aria-label="Theme" className="rounded-full p-2 text-slate-700 hover:bg-white">
          <span className="material-symbols-outlined">dark_mode</span>
        </button>
        <button type="button" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600">
          Check In
        </button>
      </div>
    </header>
  )
}

function InsightBanner({
  courses,
  assignments,
  accepted,
  onAccept,
  onDismiss,
}: {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
  accepted: boolean
  onAccept: () => void
  onDismiss: () => void
}) {
  return (
    <section className="rounded-2xl border-2 border-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 p-[3px]">
      <div className="flex flex-col gap-5 rounded-[14px] bg-white p-5 sm:flex-row sm:items-center sm:p-7">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-violet-600 text-white shadow-lg">
          <span className="material-symbols-outlined">psychology</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-950">AI Coach Insights</h2>
            <span className="material-symbols-outlined text-[20px] text-violet-600">auto_awesome</span>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
            {accepted ? 'Schedule accepted. I focused your dashboard on the recommended work window.' : buildAiCoachInsight(courses, assignments)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onAccept}
            disabled={accepted}
            className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:cursor-default disabled:bg-emerald-600"
          >
            {accepted ? 'Schedule accepted' : 'Accept Schedule'}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Dismiss
          </button>
        </div>
      </div>
    </section>
  )
}

// ── CourseCard ────────────────────────────────────────────────────────────────

function CourseCard({
  course,
  color,
  activeColorKey,
  defaultColorKey,
  stats,
  openCount,
  selected,
  nickname,
  defaultIconKey,
  defaultFlagEmoji,
  onSelect,
}: {
  course: StudentDashboardCourse
  color: ColorTokens
  activeColorKey: PaletteColor
  defaultColorKey: PaletteColor
  stats: { pct: number } | null
  openCount: number
  selected: boolean
  nickname: string
  defaultIconKey: string
  defaultFlagEmoji?: string
  onSelect: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [localPrefs, setLocalPrefs] = useState<CourseCardPrefs | null>(() => getCourseCardPrefs(course.id))
  const triggerRef = useState<React.RefObject<HTMLButtonElement | null>>(() => ({ current: null }))[0]

  const activeColor = localPrefs?.colorKey
    ? (COLORS[localPrefs.colorKey as PaletteColor] ?? color)
    : color
  const activeNickname = localPrefs?.nickname ?? nickname
  const resolvedColorKey = (localPrefs?.colorKey as PaletteColor | undefined) ?? activeColorKey

  function handleSave(prefs: CourseCardPrefs) {
    setLocalPrefs(prefs)
  }

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={onSelect}
        className={`w-full min-w-0 rounded-xl border border-l-4 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${activeColor.border} ${
          selected ? 'ring-2 ring-violet-300' : ''
        }`}
      >
        {/* Top row: pill + icon square + grade */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${activeColor.pill}`}>
              {activeNickname}
            </span>
            <CourseIconSquare
              courseId={course.id}
              courseTitle={course.title}
              colorKey={resolvedColorKey}
            />
          </div>
          {stats ? (
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-600">{letterGrade(stats.pct)}</p>
              <p className="text-xs text-slate-600">{stats.pct}%</p>
            </div>
          ) : (
            <p className="text-sm italic text-slate-500">No grades</p>
          )}
        </div>
        <h3 className="text-base font-semibold leading-tight text-slate-950">{course.title}</h3>
        <p className="mt-1.5 text-sm text-slate-600">{course.teacherName}</p>
        {stats && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stats.pct}%` }} />
          </div>
        )}
        <p className="mt-4 text-sm font-semibold text-orange-600">{openCount} open</p>
      </button>

      {/* Three-dot menu — bottom right, outside the selectable button */}
      <button
        ref={triggerRef as React.RefObject<HTMLButtonElement>}
        type="button"
        onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
        className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Edit course tile"
      >
        <MoreHorizontal size={15} />
      </button>

      {menuOpen && (
        <CourseCardEditPopover
          courseId={course.id}
          defaultNickname={activeNickname}
          defaultColorKey={resolvedColorKey}
          defaultIconKey={localPrefs?.iconKey ?? defaultIconKey}
          defaultFlagEmoji={localPrefs?.flagEmoji ?? defaultFlagEmoji}
          onSave={handleSave}
          onClose={() => setMenuOpen(false)}
          triggerRef={triggerRef as React.RefObject<HTMLButtonElement | null>}
        />
      )}
    </div>
  )
}

function CourseCards({
  courses,
  assignments,
  colorByCourse,
  codeByCourse,
  selectedCourseId,
  setSelectedCourseId,
}: {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  codeByCourse: Record<string, string>
  selectedCourseId: string | null
  setSelectedCourseId: (courseId: string | null) => void
}) {
  return (
    <section className="min-w-0">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Courses</h2>
        {selectedCourseId && (
          <button type="button" onClick={() => setSelectedCourseId(null)} className="text-sm font-semibold text-violet-600">
            All courses
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
        {courses.map((course) => {
          const defaultColorKey = colorByCourse[course.id]
          const prefs = getCourseCardPrefs(course.id)
          const activeColorKey = (prefs?.colorKey as PaletteColor | undefined) ?? defaultColorKey
          const color = COLORS[activeColorKey]
          const stats = courseGradeStats(assignments, course.id)
          const openCount = assignments.filter(
            (assignment) => assignment.courseId === course.id && isOpenAssignment(assignment),
          ).length
          const selected = selectedCourseId === course.id
          const nickname = prefs?.nickname ?? codeByCourse[course.id]

          // Default icon key for the popover
          const defIcon = inferCourseIcon(course.title)
          const defaultIconKey = defIcon.type === 'lucide' ? defIcon.iconKey : 'Flag'
          const defaultFlagEmoji = defIcon.type === 'emoji' ? defIcon.char : undefined

          return (
            <CourseCard
              key={course.id}
              course={course}
              color={color}
              activeColorKey={activeColorKey}
              defaultColorKey={defaultColorKey}
              stats={stats}
              openCount={openCount}
              selected={selected}
              nickname={nickname}
              defaultIconKey={prefs?.iconKey ?? defaultIconKey}
              defaultFlagEmoji={prefs?.flagEmoji ?? defaultFlagEmoji}
              onSelect={() => setSelectedCourseId(selected ? null : course.id)}
            />
          )
        })}
      </div>
    </section>
  )
}

function WeekStrip({
  assignments,
  colorByCourse,
  dayFilter,
  setDayFilter,
  workView,
  setWorkView,
  openCount,
  completedCount,
}: {
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  dayFilter: string | null
  setDayFilter: (day: string | null) => void
  workView: WorkView
  setWorkView: (view: WorkView) => void
  openCount: number
  completedCount: number
}) {
  const [weekOffset, setWeekOffset] = useState(0)
  const week = getWeekDates(weekOffset)
  const today = todayStr()

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-950">This Week</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setWeekOffset((value) => value - 7)} className="rounded-full p-2 text-slate-500 hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button type="button" onClick={() => setWeekOffset(0)} className="rounded-full px-3 py-1 text-xs font-semibold text-violet-600 hover:bg-violet-50">
            Today
          </button>
          <button type="button" onClick={() => setWeekOffset((value) => value + 7)} className="rounded-full p-2 text-slate-500 hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
      <div
        aria-label="Weekly assignment status"
        className="mb-5 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1"
      >
        <button
          type="button"
          aria-label={`To-Do ${openCount}`}
          onClick={() => setWorkView('todo')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            workView === 'todo'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-white hover:text-slate-950'
          }`}
        >
          To-Do
          <span className={`ml-2 rounded-md px-2 py-0.5 text-xs ${
            workView === 'todo' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {openCount}
          </span>
        </button>
        <button
          type="button"
          aria-label={`Completed ${completedCount}`}
          onClick={() => setWorkView('completed')}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            workView === 'completed'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-white hover:text-slate-950'
          }`}
        >
          Completed
          <span className={`ml-2 rounded-md px-2 py-0.5 text-xs ${
            workView === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {completedCount}
          </span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {week.map(({ date, label }) => {
          const items = assignments.filter(
            (assignment) => assignment.due === date && isOpenAssignment(assignment),
          )
          const active = dayFilter === date
          const isToday = date === today
          const totalPoints = items.reduce((sum, assignment) => sum + assignment.points, 0)

          return (
            <button
              key={date}
              type="button"
              onClick={() => setDayFilter(active ? null : date)}
              className={`min-h-24 rounded-lg px-2 py-3 text-center transition ${
                active
                  ? 'bg-violet-600 text-white'
                  : isToday
                    ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                    : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="block text-xs font-medium">{label}</span>
              <span className="mt-1 block text-xl font-semibold">{new Date(`${date}T12:00:00`).getDate()}</span>
              <span className="mt-3 flex justify-center gap-1">
                {items.slice(0, 3).map((assignment) => (
                  <span
                    key={assignment.id}
                    className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : COLORS[colorByCourse[assignment.courseId]].dot}`}
                  />
                ))}
              </span>
              {totalPoints > 0 && (
                <span className={`mt-1 block text-xs font-semibold ${active ? 'text-white' : 'text-emerald-600'}`}>
                  {totalPoints}pt
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function AssignmentChecklist({
  assignments,
  colorByCourse,
  codeByCourse,
  hiddenCount,
}: {
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  codeByCourse: Record<string, string>
  hiddenCount: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [checkingOff, setCheckingOff] = useState<string | null>(null)
  const groups = groupOpenAssignments(assignments)

  function handleCheckOff(event: React.MouseEvent, assignmentId: string) {
    event.preventDefault()
    event.stopPropagation()
    setCheckingOff(assignmentId)
    startTransition(async () => {
      await checkOffAssignment(assignmentId)
      router.refresh()
      setCheckingOff(null)
    })
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
        All caught up. New work will appear here when a Course opens it.
      </div>
    )
  }

  return (
    <section className="space-y-8">
      {groups.map((group) => (
        <div key={group.date}>
          <h3 className={`mb-3 text-sm font-semibold ${group.label === 'Overdue' ? 'text-red-600' : group.label === 'Tomorrow' ? 'text-orange-600' : 'text-slate-950'}`}>
            {group.label}
          </h3>
          <div className="space-y-3">
            {group.assignments.map((assignment) => {
              const color = COLORS[colorByCourse[assignment.courseId]]
              const isCheckingThis = checkingOff === assignment.id

              return (
                <div key={assignment.id} className={`flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${color.soft}`}>
                  <Link
                    href={`/course/${assignment.courseId}/assignment/${assignment.id}?view=student`}
                    className="flex min-w-0 flex-1 items-center gap-4 bg-white px-5 py-4 hover:bg-slate-50"
                  >
                    <span className={`h-7 rounded-md px-2 py-1 text-xs font-bold ${color.pill}`}>
                      {codeByCourse[assignment.courseId]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-950">{assignment.title}</p>
                      <p className="text-sm text-slate-600">{assignment.due} - {assignment.points}pts</p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={(event) => handleCheckOff(event, assignment.id)}
                    disabled={isPending}
                    title="Mark as turned in (paper / in-class)"
                    className="flex w-14 flex-shrink-0 items-center justify-center border-l border-slate-200 bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCheckingThis ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <span className="material-symbols-outlined">check_circle</span>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      {hiddenCount > 0 && (
        <button
          type="button"
          className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          {hiddenCount} later assignment{hiddenCount === 1 ? '' : 's'} summarized below the fold
        </button>
      )}
    </section>
  )
}

function CompletedChecklist({
  assignments,
  colorByCourse,
  codeByCourse,
  hiddenCount,
}: {
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  codeByCourse: Record<string, string>
  hiddenCount: number
}) {
  const visibleAssignments = assignments.slice(0, COMPLETED_VISIBLE_LIMIT)
  const tuckedCount = Math.max(0, assignments.length - visibleAssignments.length)
  const groups = groupOpenAssignments(visibleAssignments)

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
        Nothing completed yet. Finished and submitted Assignments will show up here.
      </div>
    )
  }

  return (
    <section className="space-y-8">
      {groups.map((group) => (
        <div key={group.date}>
          <h3 className="mb-3 text-sm font-semibold text-slate-950">{group.label}</h3>
          <div className="space-y-3">
            {group.assignments.map((assignment) => {
              const color = COLORS[colorByCourse[assignment.courseId]]
              const isGraded = assignment.status === 'graded' && assignment.grade !== undefined

              return (
                <div
                  key={assignment.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-500 shadow-sm"
                >
                  <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isGraded ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    <span className="material-symbols-outlined text-[18px]">{isGraded ? 'done' : 'hourglass_top'}</span>
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className={`h-7 rounded-md px-2 py-1 text-xs font-bold ${color.pill}`}>
                      {codeByCourse[assignment.courseId]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-500 line-through decoration-slate-400 decoration-2">{assignment.title}</p>
                      <p className="text-sm text-slate-600">{assignment.due} - {assignment.points}pts</p>
                    </div>
                  </div>
                  {isGraded ? (
                    <span className="flex-shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Completed - {assignment.grade}/{assignment.points}
                    </span>
                  ) : (
                    <span className="flex-shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      Grade pending
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
      {tuckedCount > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          {tuckedCount} older completed assignment{tuckedCount === 1 ? '' : 's'} tucked away.
        </div>
      )}
      {hiddenCount > 0 && (
        <button
          type="button"
          className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Show {hiddenCount} older completed assignment{hiddenCount === 1 ? '' : 's'}
        </button>
      )}
    </section>
  )
}

function OverviewPanel({
  courses,
  assignments,
  colorByCourse,
  codeByCourse,
  selectedCourseId,
  setSelectedCourseId,
  initialWorkView,
}: {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  codeByCourse: Record<string, string>
  selectedCourseId: string | null
  setSelectedCourseId: (courseId: string | null) => void
  initialWorkView: WorkView
}) {
  const [dayFilter, setDayFilter] = useState<string | null>(null)
  const [workView, setWorkView] = useState<WorkView>(initialWorkView)
  const [isInsightDismissed, setIsInsightDismissed] = useState(false)
  const [isScheduleAccepted, setIsScheduleAccepted] = useState(false)
  const visibleAssignments = selectedCourseId
    ? assignments.filter((assignment) => assignment.courseId === selectedCourseId)
    : assignments
  const allOpenAssignments = filterOpenAssignments(visibleAssignments, null, dayFilter)
  const openWindowAssignments = allOpenAssignments.filter(isInTodoWindow)
  const openAssignments = openWindowAssignments.slice(0, TODO_VISIBLE_LIMIT)
  const allCompletedAssignments = visibleAssignments
    .filter(
      (assignment) => assignment.status === 'graded' || assignment.status === 'submitted',
    )
    .sort((a, b) => {
      const aDate = completedReferenceDate(a) ?? ''
      const bDate = completedReferenceDate(b) ?? ''
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })
  const completedAssignments = allCompletedAssignments.filter(
    (assignment) =>
      isInCompletedWindow(assignment) && (!dayFilter || assignment.due === dayFilter),
  )
  const hiddenOpenCount = allOpenAssignments.length - openAssignments.length
  const hiddenCompletedCount = allCompletedAssignments.length - completedAssignments.length
  const openCount = openAssignments.length
  const completedCount = Math.min(completedAssignments.length, COMPLETED_VISIBLE_LIMIT)
  const nextOpenAssignment = findNextOpenAssignment(assignments)

  function acceptSchedule() {
    setWorkView('todo')
    setIsScheduleAccepted(true)

    if (nextOpenAssignment?.due) {
      setSelectedCourseId(nextOpenAssignment.courseId)
      setDayFilter(nextOpenAssignment.due)
    } else {
      setSelectedCourseId(null)
      setDayFilter(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xl font-semibold text-slate-950">Welcome back, Alex.</p>
        <p className="mt-3 text-lg text-slate-700">Here is your academic compass for the week.</p>
      </div>

      {!isInsightDismissed && (
        <InsightBanner
          courses={courses}
          assignments={assignments}
          accepted={isScheduleAccepted}
          onAccept={acceptSchedule}
          onDismiss={() => setIsInsightDismissed(true)}
        />
      )}

      <div className="grid min-w-0 gap-8 xl:grid-cols-[370px_minmax(0,1fr)]">
        <CourseCards
          courses={courses}
          assignments={assignments}
          colorByCourse={colorByCourse}
          codeByCourse={codeByCourse}
          selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId}
        />

        <div className="min-w-0 space-y-8">
          <WeekStrip
            assignments={visibleAssignments}
            colorByCourse={colorByCourse}
            dayFilter={dayFilter}
            setDayFilter={setDayFilter}
            workView={workView}
            setWorkView={setWorkView}
            openCount={openCount}
            completedCount={completedCount}
          />
          {workView === 'todo' ? (
            <AssignmentChecklist
              assignments={openAssignments}
              colorByCourse={colorByCourse}
              codeByCourse={codeByCourse}
              hiddenCount={hiddenOpenCount}
            />
          ) : (
            <CompletedChecklist
              assignments={completedAssignments}
              colorByCourse={colorByCourse}
              codeByCourse={codeByCourse}
              hiddenCount={hiddenCompletedCount}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function GradesPanel({
  courses,
  assignments,
  colorByCourse,
  codeByCourse,
  selectedCourseId,
}: {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
  colorByCourse: Record<string, PaletteColor>
  codeByCourse: Record<string, string>
  selectedCourseId: string | null
}) {
  const visibleCourses = selectedCourseId
    ? courses.filter((course) => course.id === selectedCourseId)
    : courses

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Grades</h1>
        <p className="mt-2 text-sm text-slate-600">
          Only Published Grades are shown here. Submitted work stays private until your teacher publishes the Final Grade.
        </p>
      </div>

      {visibleCourses.map((course) => {
        const color = COLORS[colorByCourse[course.id]]
        const courseAssignments = assignments.filter((assignment) => assignment.courseId === course.id)
        const completed = courseAssignments.filter(
          (assignment) => assignment.status === 'graded' || assignment.status === 'submitted',
        )
        const stats = courseGradeStats(assignments, course.id)

        return (
          <article key={course.id} className={`rounded-xl border border-l-4 bg-white p-5 shadow-sm ${color.border}`}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${color.pill}`}>
                  {codeByCourse[course.id]}
                </span>
                <h2 className="mt-3 text-lg font-semibold text-slate-950">{course.title}</h2>
                <p className="text-sm text-slate-600">{course.teacherName}</p>
              </div>
              {stats ? (
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">{letterGrade(stats.pct)}</p>
                  <p className="text-sm text-slate-600">{stats.earned}/{stats.total} pts - {stats.pct}%</p>
                </div>
              ) : (
                <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">No grades yet</p>
              )}
            </div>

            {completed.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                No submitted or graded Assignments yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {completed.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">{assignment.title}</p>
                      <p className="text-xs text-slate-500">{assignment.due} - {assignment.points}pts</p>
                    </div>
                    {assignment.status === 'graded' && assignment.grade !== undefined ? (
                      <p className="text-sm font-bold text-emerald-600">{assignment.grade}/{assignment.points}</p>
                    ) : (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                        Awaiting grade
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </article>
        )
      })}
    </section>
  )
}

function MessagesPanel() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
        <span className="material-symbols-outlined">mail</span>
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-slate-950">Messages are coming soon</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        Course messages will live here once messaging is connected. For now, keep using Assignments and AI Coach to stay oriented.
      </p>
      <button type="button" className="mt-6 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
        Back to current work
      </button>
    </section>
  )
}

export function StudentDashboard({
  courses,
  assignments,
  recentGrades = [],
  initialTargetGpa = null,
  initialTab = 'overview',
  initialCourseId = null,
  initialWorkView = 'todo',
}: Props) {
  const [activeTab, setActiveTab] = useState<StudentTab>(initialTab)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(initialCourseId)

  const colorByCourse = useMemo(
    () => Object.fromEntries(courses.map((course, index) => [course.id, assignColor(index)])) as Record<string, PaletteColor>,
    [courses],
  )
  const codeByCourse = useMemo(
    () => Object.fromEntries(courses.map((course) => [course.id, courseCode(course.title)])) as Record<string, string>,
    [courses],
  )
  const colorTokensByCourse = useMemo(
    () => Object.fromEntries(courses.map((course, index) => [course.id, COLORS[assignColor(index)]])),
    [courses],
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <StudentSidebar />

      <div className="min-w-0">
        <StudentTopBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8">
          {activeTab === 'overview' && (
            <OverviewPanel
              courses={courses}
              assignments={assignments}
              colorByCourse={colorByCourse}
              codeByCourse={codeByCourse}
              selectedCourseId={selectedCourseId}
              setSelectedCourseId={setSelectedCourseId}
              initialWorkView={initialWorkView}
            />
          )}

          {activeTab === 'grades' && (
            <GradesCommandCenter
              courses={courses}
              assignments={assignments}
              recentGrades={recentGrades}
              colorTokensByCourse={colorTokensByCourse}
              codeByCourse={codeByCourse}
              initialTargetGpa={initialTargetGpa}
            />
          )}

          {activeTab === 'messages' && <MessagesPanel />}
        </main>
      </div>
    </div>
  )
}
