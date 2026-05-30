import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const runtime = 'nodejs'

const W = 1200
const H = 630

// Colors (Victory Noir, no CSS variables in Satori)
const C = {
  bg: '#0B0B0A',
  raised: '#16130C',
  gold: '#D9B34D',
  goldDeep: '#A8892E',
  champagne: '#EDE8D4',
  textWarm: '#C9C2A8',
  textMuted: '#7A7252',
  textFaint: '#4A4535',
  graphite: '#1E1C15',
  patina: '#5BA89A',
}

const LIVE = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])
const DONE = new Set(['FINISHED', 'AWARDED'])

function formatOgDate(utcDate: string, tz: string): string {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
    timeZone: tz,
  }).format(new Date(utcDate))
}

function formatOgTime(utcDate: string, tz: string): string {
  return new Intl.DateTimeFormat('es', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
  }).format(new Date(utcDate))
}

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const hname = p.get('hname') ?? 'Local'
    const aname = p.get('aname') ?? 'Visitante'
    const htla = p.get('htla') ?? '---'
    const atla = p.get('atla') ?? '---'
    const hcrest = p.get('hcrest') ?? ''
    const acrest = p.get('acrest') ?? ''
    const hs = p.get('hs')
    const as_ = p.get('as')
    const date = p.get('date') ?? new Date().toISOString()
    const status = p.get('status') ?? 'SCHEDULED'
    const group = p.get('group') ?? ''
    const stage = p.get('stage') ?? ''
    const tz = p.get('tz') ?? 'UTC'

    const isLive = LIVE.has(status)
    const isDone = DONE.has(status)
    const isUpcoming = !isLive && !isDone

    const groupLabel = group ? group.replace('GROUP_', 'Grupo ') : stage.replace(/_/g, ' ')

    const fontData = await readFile(join(process.cwd(), 'public/fonts/geist.ttf'))

    return new ImageResponse(
      (
        <div
          style={{
            width: W,
            height: H,
            display: 'flex',
            flexDirection: 'column',
            background: C.bg,
            fontFamily: 'Geist',
            position: 'relative',
          }}
        >
          {/* Gold top stripe */}
          <div style={{ width: '100%', height: 4, background: C.gold, flexShrink: 0 }} />

          {/* Header bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '28px 60px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: C.gold,
                }}
              />
              <span
                style={{
                  color: C.gold,
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 5,
                  textTransform: 'uppercase',
                }}
              >
                FIFA World Cup 2026
              </span>
            </div>
            {groupLabel ? (
              <span style={{ color: C.textFaint, fontSize: 16, letterSpacing: 3 }}>
                {groupLabel.toUpperCase()}
              </span>
            ) : null}
          </div>

          {/* Main match area */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 60px',
              gap: 0,
            }}
          >
            {/* Home team */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20,
                width: 280,
              }}
            >
              {hcrest ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hcrest}
                  width={140}
                  height={140}
                  style={{ objectFit: 'contain' }}
                  alt={htla}
                />
              ) : (
                <div
                  style={{
                    width: 140,
                    height: 140,
                    background: C.graphite,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: C.textFaint, fontSize: 28, fontWeight: 700 }}>{htla}</span>
                </div>
              )}
              <span
                style={{
                  color: C.champagne,
                  fontSize: 32,
                  fontWeight: 700,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {hname}
              </span>
            </div>

            {/* Center — score or time */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minWidth: 220,
              }}
            >
              {isLive && (
                <span style={{ color: C.patina, fontSize: 14, letterSpacing: 4, fontWeight: 600 }}>
                  ● EN JUEGO
                </span>
              )}
              {isDone && (
                <span style={{ color: C.textMuted, fontSize: 14, letterSpacing: 4 }}>FINAL</span>
              )}

              {(isLive || isDone) && hs !== null && as_ !== null ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span
                    style={{
                      color: C.champagne,
                      fontSize: 96,
                      fontWeight: 800,
                      lineHeight: 1,
                    }}
                  >
                    {hs}
                  </span>
                  <span style={{ color: C.goldDeep, fontSize: 48, fontWeight: 300 }}>–</span>
                  <span
                    style={{
                      color: C.champagne,
                      fontSize: 96,
                      fontWeight: 800,
                      lineHeight: 1,
                    }}
                  >
                    {as_}
                  </span>
                </div>
              ) : (
                <>
                  <span
                    style={{
                      color: C.gold,
                      fontSize: 52,
                      fontWeight: 800,
                      letterSpacing: 6,
                    }}
                  >
                    VS
                  </span>
                  <span
                    style={{
                      color: C.textWarm,
                      fontSize: 28,
                      fontWeight: 600,
                      letterSpacing: 2,
                    }}
                    // No suppressHydrationWarning needed in server-only route
                  >
                    {formatOgTime(date, tz)}
                  </span>
                </>
              )}

              {isUpcoming && (
                <span style={{ color: C.textFaint, fontSize: 16, letterSpacing: 2, marginTop: 4 }}>
                  {formatOgDate(date, tz)}
                </span>
              )}
            </div>

            {/* Away team */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20,
                width: 280,
              }}
            >
              {acrest ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={acrest}
                  width={140}
                  height={140}
                  style={{ objectFit: 'contain' }}
                  alt={atla}
                />
              ) : (
                <div
                  style={{
                    width: 140,
                    height: 140,
                    background: C.graphite,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: C.textFaint, fontSize: 28, fontWeight: 700 }}>{atla}</span>
                </div>
              )}
              <span
                style={{
                  color: C.champagne,
                  fontSize: 32,
                  fontWeight: 700,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {aname}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 60px 28px',
            }}
          >
            <span style={{ color: C.textFaint, fontSize: 15, letterSpacing: 2 }}>
              {isDone || isLive ? formatOgDate(date, tz) : ''}
            </span>
            <span style={{ color: C.textFaint, fontSize: 15, letterSpacing: 1 }}>
              worldcup-kappa.vercel.app
            </span>
          </div>

          {/* Gold bottom stripe */}
          <div style={{ width: '100%', height: 4, background: C.gold, flexShrink: 0 }} />
        </div>
      ),
      {
        width: W,
        height: H,
        fonts: [{ name: 'Geist', data: fontData, weight: 400, style: 'normal' }],
      },
    )
  } catch (err) {
    console.error('OG match route error:', err)
    return new Response('Failed to generate image', { status: 500 })
  }
}
