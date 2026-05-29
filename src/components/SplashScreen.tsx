'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

/**
 * Full-screen intro splash shown once per session.
 * The ball bounces up + spins 360°, then the screen fades out.
 * Uses sessionStorage so it only fires on the first visit per tab/session.
 */
// Check BEFORE first render to avoid a flash. On the server this is always false.
function alreadyShown() {
  if (typeof sessionStorage === 'undefined') return false
  return Boolean(sessionStorage.getItem('splash-done'))
}

export default function SplashScreen() {
  const [phase, setPhase] = useState<'spin' | 'fade' | 'gone'>(
    // Start hidden immediately if session already has the flag
    () => (alreadyShown() ? 'gone' : 'spin')
  )

  useEffect(() => {
    if (phase === 'gone') return

    // After the spin animation (1.3s), start fading out
    const fadeTimer = setTimeout(() => setPhase('fade'), 1300)
    // After fade completes (0.5s), remove from DOM
    const goneTimer = setTimeout(() => {
      setPhase('gone')
      sessionStorage.setItem('splash-done', '1')
    }, 1800)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(goneTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === 'gone') return null

  return (
    <>
      <style>{`
        @keyframes ball-bounce-spin {
          0%   { transform: translateY(24px) rotate(0deg)   scale(0.55); opacity: 0;   }
          28%  { transform: translateY(-10px) rotate(168deg) scale(1.08); opacity: 1;   }
          55%  { transform: translateY(5px)  rotate(310deg) scale(0.97); opacity: 1;   }
          78%  { transform: translateY(-3px) rotate(348deg) scale(1.02); opacity: 1;   }
          100% { transform: translateY(0)   rotate(360deg)  scale(1);    opacity: 1;   }
        }
        @keyframes splash-text-in {
          0%   { opacity: 0; transform: translateY(6px);  }
          60%  { opacity: 0; transform: translateY(6px);  }
          100% { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5"
        style={{
          background: 'var(--lacquer)',
          opacity: phase === 'fade' ? 0 : 1,
          transition: phase === 'fade' ? 'opacity 0.48s ease-out' : 'none',
          pointerEvents: phase === 'fade' ? 'none' : 'auto',
        }}
        aria-hidden="true"
      >
        {/* Spinning ball */}
        <div
          style={{
            width: 128,
            height: 128,
            animation: 'ball-bounce-spin 1.3s cubic-bezier(0.22, 1, 0.36, 1) both',
            filter: 'drop-shadow(0 0 18px oklch(84% 0.19 80.46 / 0.28))',
          }}
        >
          <Image
            src="/brand-mark.svg"
            alt="Mundial 2026"
            width={128}
            height={128}
            priority
          />
        </div>

        {/* "WC 26" text that fades in after the ball lands */}
        <div
          className="eyebrow text-center"
          style={{
            color: 'var(--kinpaku)',
            letterSpacing: '0.26em',
            fontSize: '0.7rem',
            animation: 'splash-text-in 1.3s ease-out both',
            opacity: 0,
          }}
        >
          WORLD CUP 2026
        </div>
      </div>
    </>
  )
}
