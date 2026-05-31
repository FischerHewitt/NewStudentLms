const SURFACE = '#fcf8fa'
const OUTLINE_VARIANT = '#c6c6cd'
const ALUMOS_PURPLE = '#7C3AED'
const ON_SURFACE_VARIANT = '#45464d'
const AI_GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'

interface ComingSoonPageProps {
  featureName: string
  icon: string
  description: string
}

export function ComingSoonPage({ featureName, icon, description }: ComingSoonPageProps) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
      style={{ background: SURFACE }}
    >
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-white"
        style={{ background: AI_GRADIENT }}
        aria-hidden="true"
      >
        <span className="material-symbols-outlined text-[40px]">{icon}</span>
      </div>

      <p
        className="mb-2 text-[11px] font-bold uppercase tracking-widest"
        style={{ color: ON_SURFACE_VARIANT }}
      >
        {featureName}
      </p>

      <h1 className="mb-3 text-3xl font-bold" style={{ color: '#1b1b1d' }}>
        Coming Soon
      </h1>

      <p className="mb-8 max-w-sm text-sm leading-relaxed" style={{ color: ON_SURFACE_VARIANT }}>
        {description}
      </p>

      <button
        type="button"
        className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition hover:bg-white"
        style={{ borderColor: OUTLINE_VARIANT, color: ALUMOS_PURPLE }}
      >
        Notify me
      </button>
    </div>
  )
}
