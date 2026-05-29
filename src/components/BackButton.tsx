'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'

interface Props {
  label?: string
  /** If provided, renders as a Link to this href. Otherwise uses router.back(). */
  href?: string | null
}

export default function BackButton({ label = 'Volver', href }: Props) {
  const router = useRouter()
  const inner = (
    <>
      <Icon icon="material-symbols:arrow-back" width={20} height={20} />
      <span className="eyebrow" style={{ letterSpacing: '0.1em' }}>{label}</span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kinpaku)]"
        style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
      >
        {inner}
      </Link>
    )
  }

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kinpaku)]"
      style={{ color: 'var(--text-muted)' }}
    >
      {inner}
    </button>
  )
}
