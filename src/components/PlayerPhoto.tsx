'use client'
import { useState } from 'react'
import Image from 'next/image'

interface Props {
  photoUrl: string
  name: string
  initials: string
  posColor: string
}

export default function PlayerPhoto({ photoUrl, name, initials, posColor }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: 'var(--raised-lacquer)' }}
      >
        <span
          className="font-bold select-none"
          style={{
            color: posColor,
            fontFamily: 'var(--font-hanken)',
            fontSize: 'clamp(72px, 22vw, 140px)',
            opacity: 0.18,
          }}
        >
          {initials}
        </span>
      </div>
    )
  }

  return (
    <Image
      src={photoUrl}
      alt={name}
      fill
      priority
      unoptimized
      className="object-cover object-top"
      sizes="100vw"
      onError={() => setFailed(true)}
    />
  )
}
