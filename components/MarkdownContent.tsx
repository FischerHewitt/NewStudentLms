'use client'

import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

const components: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="mb-2 list-disc pl-5 space-y-0.5 text-sm">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 space-y-0.5 text-sm">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <h1 className="mb-1 text-base font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-1 text-sm font-bold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1 text-sm font-semibold">{children}</h3>,
  code: ({ children }) => <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">{children}</code>,
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-slate-300 pl-3 text-slate-500 italic text-sm">
      {children}
    </blockquote>
  ),
}

export function MarkdownContent({ children, className = '' }: { children: string; className?: string }) {
  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(children)

  if (containsHtml) {
    const safeHtml = children
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/\son\w+="[^"]*"/gi, '')
      .replace(/\son\w+='[^']*'/gi, '')
      .replace(/href=["']javascript:[^"']*["']/gi, 'href="#"')

    return (
      <div
        className={`text-slate-700 [&_a]:text-indigo-600 [&_a]:underline [&_blockquote]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:text-sm [&_blockquote]:italic [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_hr]:my-4 [&_li]:ml-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_p]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed [&_span[data-editor-math]]:rounded [&_span[data-editor-math]]:border [&_span[data-editor-math]]:border-slate-200 [&_span[data-editor-math]]:bg-slate-50 [&_span[data-editor-math]]:px-1 [&_span[data-editor-math]]:font-mono [&_strong]:font-semibold [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-50 [&_th]:p-2 [&_u]:underline [&_ul]:mb-2 [&_ul]:list-disc ${className}`}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    )
  }

  return (
    <div className={`text-slate-700 ${className}`}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  )
}
