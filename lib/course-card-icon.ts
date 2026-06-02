/**
 * inferCourseIcon — maps a course title to a default icon definition.
 *
 * Returns a Lucide icon key for most subjects, or a flag emoji for language
 * courses. The caller decides how to render; this module has no UI dependencies.
 *
 * Issue: #87
 */

export type CourseIconDef =
  | { type: 'lucide'; iconKey: string }
  | { type: 'emoji'; char: string }

/**
 * Infer a sensible default icon from a course title.
 * Matching is case-insensitive and keyword-based — first match wins.
 * Falls back to BookOpen for unrecognised titles.
 */
export function inferCourseIcon(title: string): CourseIconDef {
  const t = title.toLowerCase()

  // ── Language courses (flag emojis) ──────────────────────────────────────
  if (t.includes('spanish') || t.includes('español') || t.includes('span '))
    return { type: 'emoji', char: '🇪🇸' }
  if (t.includes('french') || t.includes('français') || t.includes('fren '))
    return { type: 'emoji', char: '🇫🇷' }
  if (t.includes('german') || t.includes('deutsch'))
    return { type: 'emoji', char: '🇩🇪' }
  if (t.includes('japanese') || t.includes('日本語'))
    return { type: 'emoji', char: '🇯🇵' }
  if (t.includes('chinese') || t.includes('mandarin'))
    return { type: 'emoji', char: '🇨🇳' }
  if (t.includes('portuguese') || t.includes('brasil'))
    return { type: 'emoji', char: '🇧🇷' }
  if (t.includes('italian') || t.includes('italiano'))
    return { type: 'emoji', char: '🇮🇹' }
  if (t.includes('korean') || t.includes('한국어'))
    return { type: 'emoji', char: '🇰🇷' }

  // ── Biology / Life science ───────────────────────────────────────────────
  if (t.includes('bio') || t.includes('anatom') || t.includes('life sci') || t.includes('genetics'))
    return { type: 'lucide', iconKey: 'Dna' }

  // ── Chemistry ───────────────────────────────────────────────────────────
  if (t.includes('chem') || t.includes('organic') || t.includes('biochem'))
    return { type: 'lucide', iconKey: 'FlaskConical' }

  // ── Physics (must come before generic "phys" catch-all) ─────────────────
  if ((t.includes('phys') && !t.includes('phys ed') && !t.includes('physical ed')))
    return { type: 'lucide', iconKey: 'Atom' }

  // ── Astronomy / Space ───────────────────────────────────────────────────
  if (t.includes('astronom') || t.includes('astrophys') || t.includes('cosmol'))
    return { type: 'lucide', iconKey: 'Telescope' }

  // ── Mathematics ─────────────────────────────────────────────────────────
  if (
    t.includes('math') || t.includes('algebra') || t.includes('calculus') ||
    t.includes('geometry') || t.includes('trig') || t.includes('pre-calc') ||
    t.includes('precalc') || t.includes('arithmetic')
  )
    return { type: 'lucide', iconKey: 'Calculator' }

  // ── Statistics / Data ───────────────────────────────────────────────────
  if (t.includes('stat') || t.includes('data sci') || t.includes('data anal'))
    return { type: 'lucide', iconKey: 'BarChart2' }

  // ── Computer Science / Programming ──────────────────────────────────────
  if (
    t.includes('comput') || t.includes('coding') || t.includes('program') ||
    t.includes(' cs ') || t.includes('cs1') || t.includes('software') ||
    t.includes('web dev') || t.includes('algorithm')
  )
    return { type: 'lucide', iconKey: 'Code2' }

  // ── Environmental science / Ecology ─────────────────────────────────────
  if (t.includes('environ') || t.includes('ecology') || t.includes('earth sci') || t.includes('climate'))
    return { type: 'lucide', iconKey: 'Leaf' }

  // ── English / Literature / Writing ──────────────────────────────────────
  if (
    t.includes('english') || t.includes('literature') || t.includes('lit ') ||
    t.includes('reading') || t.includes('composition') || t.includes('writing') ||
    t.includes('creative writ') || t.includes('journalism')
  )
    return { type: 'lucide', iconKey: 'BookOpen' }

  // ── History / Social Studies ─────────────────────────────────────────────
  if (t.includes('histor') || t.includes('civics') || t.includes('social stud') || t.includes('world war'))
    return { type: 'lucide', iconKey: 'Landmark' }

  // ── Geography ───────────────────────────────────────────────────────────
  if (t.includes('geograph') || t.includes('geopolit'))
    return { type: 'lucide', iconKey: 'Globe' }

  // ── Psychology ──────────────────────────────────────────────────────────
  if (t.includes('psych'))
    return { type: 'lucide', iconKey: 'Brain' }

  // ── Sociology / Anthropology ────────────────────────────────────────────
  if (t.includes('sociol') || t.includes('anthrop') || t.includes('social sci'))
    return { type: 'lucide', iconKey: 'Users' }

  // ── Philosophy / Ethics ─────────────────────────────────────────────────
  if (t.includes('philos') || t.includes('ethics') || t.includes('logic'))
    return { type: 'lucide', iconKey: 'Lightbulb' }

  // ── Economics / Business / Finance ──────────────────────────────────────
  if (
    t.includes('econ') || t.includes('business') || t.includes('finance') ||
    t.includes('accounting') || t.includes('marketing') || t.includes('entrepreneur')
  )
    return { type: 'lucide', iconKey: 'TrendingUp' }

  // ── Law / Government / Politics ─────────────────────────────────────────
  if (t.includes('law') || t.includes('government') || t.includes('politic') || t.includes('legal'))
    return { type: 'lucide', iconKey: 'Scale' }

  // ── Theater / Drama (must come before 'art' to avoid 'theater arts' → Palette) ──
  if (t.includes('theater') || t.includes('theatre') || t.includes('drama') || t.includes('acting'))
    return { type: 'lucide', iconKey: 'Drama' }

  // ── Art / Studio / Design ───────────────────────────────────────────────
  if (
    t.includes('art') || t.includes('studio') || t.includes('drawing') ||
    t.includes('painting') || t.includes('sculpture') || t.includes('design')
  )
    return { type: 'lucide', iconKey: 'Palette' }

  // ── Photography / Film / Media ──────────────────────────────────────────
  if (t.includes('photo') || t.includes('film') || t.includes('media') || t.includes('cinemat'))
    return { type: 'lucide', iconKey: 'Camera' }

  // ── Music / Band / Choir ────────────────────────────────────────────────
  if (
    t.includes('music') || t.includes('band') || t.includes('choir') ||
    t.includes('orchestra') || t.includes('chorus') || t.includes('instrument')
  )
    return { type: 'lucide', iconKey: 'Music' }

  // ── Speech / Communications / Public Speaking ───────────────────────────
  if (
    t.includes('speech') || t.includes('communicat') || t.includes('public speak') ||
    t.includes('coms') || t.includes('rhetoric') || t.includes('debate')
  )
    return { type: 'lucide', iconKey: 'Mic' }

  // ── Physical Education / Sports ─────────────────────────────────────────
  if (
    t.includes('phys ed') || t.includes('physical ed') || t.includes('gym') ||
    t.includes('sport') || t.includes('p.e.') || t.includes(' pe ')
  )
    return { type: 'lucide', iconKey: 'Dumbbell' }

  // ── Health / Nutrition ──────────────────────────────────────────────────
  if (t.includes('health') || t.includes('nutrition') || t.includes('wellness'))
    return { type: 'lucide', iconKey: 'Heart' }

  // ── Nursing / Medicine / Anatomy ────────────────────────────────────────
  if (t.includes('nurs') || t.includes('medic') || t.includes('anatomy') || t.includes('pharmacol'))
    return { type: 'lucide', iconKey: 'Stethoscope' }

  // ── Culinary / Cooking ──────────────────────────────────────────────────
  if (t.includes('culinary') || t.includes('cooking') || t.includes('cultur') || t.includes('baking'))
    return { type: 'lucide', iconKey: 'ChefHat' }

  // ── Engineering / Shop / Technology ────────────────────────────────────
  if (t.includes('engineer') || t.includes('shop') || t.includes('manufactur') || t.includes('mechanic'))
    return { type: 'lucide', iconKey: 'Wrench' }

  // ── Fallback ─────────────────────────────────────────────────────────────
  return { type: 'lucide', iconKey: 'BookOpen' }
}
