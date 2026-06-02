import { describe, expect, it } from 'vitest'
import { inferCourseIcon } from '@/lib/course-card-icon'

describe('inferCourseIcon — STEM subjects', () => {
  it('Biology and Society → Dna', () => {
    expect(inferCourseIcon('Biology and Society')).toEqual({ type: 'lucide', iconKey: 'Dna' })
  })

  it('Anatomy and Physiology → Dna', () => {
    expect(inferCourseIcon('Anatomy and Physiology')).toEqual({ type: 'lucide', iconKey: 'Dna' })
  })

  it('General Chemistry → FlaskConical', () => {
    expect(inferCourseIcon('General Chemistry')).toEqual({ type: 'lucide', iconKey: 'FlaskConical' })
  })

  it('Organic Chemistry → FlaskConical', () => {
    expect(inferCourseIcon('Organic Chemistry')).toEqual({ type: 'lucide', iconKey: 'FlaskConical' })
  })

  it('Physics 101 → Atom', () => {
    expect(inferCourseIcon('Physics 101')).toEqual({ type: 'lucide', iconKey: 'Atom' })
  })

  it('College Algebra → Calculator', () => {
    expect(inferCourseIcon('College Algebra')).toEqual({ type: 'lucide', iconKey: 'Calculator' })
  })

  it('AP Calculus AB → Calculator', () => {
    expect(inferCourseIcon('AP Calculus AB')).toEqual({ type: 'lucide', iconKey: 'Calculator' })
  })

  it('Trigonometry → Calculator', () => {
    expect(inferCourseIcon('Trigonometry')).toEqual({ type: 'lucide', iconKey: 'Calculator' })
  })

  it('Statistics and Probability → BarChart2', () => {
    expect(inferCourseIcon('Statistics and Probability')).toEqual({ type: 'lucide', iconKey: 'BarChart2' })
  })

  it('Data Science Fundamentals → BarChart2', () => {
    expect(inferCourseIcon('Data Science Fundamentals')).toEqual({ type: 'lucide', iconKey: 'BarChart2' })
  })

  it('Intro to Coding → Code2', () => {
    expect(inferCourseIcon('Intro to Coding')).toEqual({ type: 'lucide', iconKey: 'Code2' })
  })

  it('Computer Science Principles → Code2', () => {
    expect(inferCourseIcon('Computer Science Principles')).toEqual({ type: 'lucide', iconKey: 'Code2' })
  })

  it('Environmental Science → Leaf', () => {
    expect(inferCourseIcon('Environmental Science')).toEqual({ type: 'lucide', iconKey: 'Leaf' })
  })

  it('Ecology and Conservation → Leaf', () => {
    expect(inferCourseIcon('Ecology and Conservation')).toEqual({ type: 'lucide', iconKey: 'Leaf' })
  })
})

describe('inferCourseIcon — Humanities and Social Sciences', () => {
  it('English Literature → BookOpen', () => {
    expect(inferCourseIcon('English Literature')).toEqual({ type: 'lucide', iconKey: 'BookOpen' })
  })

  it('AP English Composition → BookOpen', () => {
    expect(inferCourseIcon('AP English Composition')).toEqual({ type: 'lucide', iconKey: 'BookOpen' })
  })

  it('World History → Landmark', () => {
    expect(inferCourseIcon('World History')).toEqual({ type: 'lucide', iconKey: 'Landmark' })
  })

  it('US History → Landmark', () => {
    expect(inferCourseIcon('US History')).toEqual({ type: 'lucide', iconKey: 'Landmark' })
  })

  it('Human Geography → Globe', () => {
    expect(inferCourseIcon('Human Geography')).toEqual({ type: 'lucide', iconKey: 'Globe' })
  })

  it('Introduction to Psychology → Brain', () => {
    expect(inferCourseIcon('Introduction to Psychology')).toEqual({ type: 'lucide', iconKey: 'Brain' })
  })

  it('Sociology of Modern Society → Users', () => {
    expect(inferCourseIcon('Sociology of Modern Society')).toEqual({ type: 'lucide', iconKey: 'Users' })
  })

  it('Ethics and Philosophy → Lightbulb', () => {
    expect(inferCourseIcon('Ethics and Philosophy')).toEqual({ type: 'lucide', iconKey: 'Lightbulb' })
  })

  it('Macroeconomics → TrendingUp', () => {
    expect(inferCourseIcon('Macroeconomics')).toEqual({ type: 'lucide', iconKey: 'TrendingUp' })
  })

  it('Business Management → TrendingUp', () => {
    expect(inferCourseIcon('Business Management')).toEqual({ type: 'lucide', iconKey: 'TrendingUp' })
  })
})

describe('inferCourseIcon — Arts and Electives', () => {
  it('Studio Art → Palette', () => {
    expect(inferCourseIcon('Studio Art')).toEqual({ type: 'lucide', iconKey: 'Palette' })
  })

  it('Music Theory → Music', () => {
    expect(inferCourseIcon('Music Theory')).toEqual({ type: 'lucide', iconKey: 'Music' })
  })

  it('Concert Band → Music', () => {
    expect(inferCourseIcon('Concert Band')).toEqual({ type: 'lucide', iconKey: 'Music' })
  })

  it('Theater Arts → Drama', () => {
    expect(inferCourseIcon('Theater Arts')).toEqual({ type: 'lucide', iconKey: 'Drama' })
  })

  it('Public Speaking → Mic', () => {
    expect(inferCourseIcon('Public Speaking')).toEqual({ type: 'lucide', iconKey: 'Mic' })
  })

  it('COMS 101 → Mic', () => {
    expect(inferCourseIcon('COMS 101')).toEqual({ type: 'lucide', iconKey: 'Mic' })
  })

  it('Physical Education → Dumbbell', () => {
    expect(inferCourseIcon('Physical Education')).toEqual({ type: 'lucide', iconKey: 'Dumbbell' })
  })

  it('Health and Wellness → Heart', () => {
    expect(inferCourseIcon('Health and Wellness')).toEqual({ type: 'lucide', iconKey: 'Heart' })
  })

  it('Photography and Lighting → Camera', () => {
    expect(inferCourseIcon('Photography and Lighting')).toEqual({ type: 'lucide', iconKey: 'Camera' })
  })
})

describe('inferCourseIcon — Language courses (flag emojis)', () => {
  it('Intermediate Spanish → 🇪🇸', () => {
    expect(inferCourseIcon('Intermediate Spanish')).toEqual({ type: 'emoji', char: '🇪🇸' })
  })

  it('AP French Language → 🇫🇷', () => {
    expect(inferCourseIcon('AP French Language')).toEqual({ type: 'emoji', char: '🇫🇷' })
  })

  it('German I → 🇩🇪', () => {
    expect(inferCourseIcon('German I')).toEqual({ type: 'emoji', char: '🇩🇪' })
  })

  it('Japanese Language and Culture → 🇯🇵', () => {
    expect(inferCourseIcon('Japanese Language and Culture')).toEqual({ type: 'emoji', char: '🇯🇵' })
  })

  it('Mandarin Chinese → 🇨🇳', () => {
    expect(inferCourseIcon('Mandarin Chinese')).toEqual({ type: 'emoji', char: '🇨🇳' })
  })
})

describe('inferCourseIcon — fallback', () => {
  it('returns BookOpen for an unrecognised title', () => {
    expect(inferCourseIcon('UNIV 999')).toEqual({ type: 'lucide', iconKey: 'BookOpen' })
  })

  it('returns BookOpen for an empty string', () => {
    expect(inferCourseIcon('')).toEqual({ type: 'lucide', iconKey: 'BookOpen' })
  })

  it('matching is case-insensitive', () => {
    expect(inferCourseIcon('BIOLOGY 101')).toEqual({ type: 'lucide', iconKey: 'Dna' })
    expect(inferCourseIcon('biology 101')).toEqual({ type: 'lucide', iconKey: 'Dna' })
  })

  it('Physical Ed does not match Physics → Dumbbell, not Atom', () => {
    expect(inferCourseIcon('Physical Education')).toEqual({ type: 'lucide', iconKey: 'Dumbbell' })
  })
})
