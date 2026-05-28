/**
 * Shared placeholder used by all route stubs until their real content lands.
 * Each placeholder references the issue that will fill it in.
 */
export function PlaceholderPage({
  title,
  description,
  issue,
  detail,
}: {
  title: string
  description: string
  issue: number
  detail?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-white px-8 py-10 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
        {detail && (
          <p className="mt-3 font-mono text-xs text-slate-400">{detail}</p>
        )}
        <p className="mt-6 text-xs font-medium uppercase tracking-widest text-indigo-400">
          Coming in issue #{issue}
        </p>
      </div>
    </div>
  )
}
