'use client'

import { useEffect } from 'react'
import { useBreadcrumb, type BreadcrumbItem } from '@/context/BreadcrumbContext'

export function SetBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const { setItems } = useBreadcrumb()
  // stringify so the dep array is stable across re-renders
  const key = items.map((i) => i.label + (i.href ?? '')).join('|')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setItems(items) }, [key])
  return null
}
