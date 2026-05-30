import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const runtime = 'nodejs'

const W = 1200
const H = 630

const C = {
  bg: '#0B0B0A',
  gold: '#D9B34D',
  goldDeep: '#A8892E',
  champagne: '#EDE8D4',
  textWarm: '#C9C2A8',
  textFaint: '#4A4535',
  graphite: '#1E1C15',
  patina: '#5BA89A',
}

const LIVE = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])
const DONE = new Set(['FINISHED', 'AWARDED'])

function fmtTime(utcDate: string, tz: string) {
  return new Intl.DateTimeFormat('es', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz,
  }).format(new Date(utcDate))
}

function fmtDate(utcDate: string, tz: string) {
  const s = new Intl.DateTimeFormat('es', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: tz,
  }).format(new Date(utcDate))
  return s.charAt(0).toUpperCase() + s.slice(1)
}


export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams
    const hname  = p.get('hname')  ?? 'Local'
    const aname  = p.get('aname')  ?? 'Visitante'
    const htla   = p.get('htla')   ?? '---'
    const atla   = p.get('atla')   ?? '---'
    const hcrest = p.get('hcrest') ?? ''
    const acrest = p.get('acrest') ?? ''
    const hs     = p.get('hs')
    const as_    = p.get('as')
    const date   = p.get('date')   ?? new Date().toISOString()
    const status = p.get('status') ?? 'SCHEDULED'
    const group  = p.get('group')  ?? ''
    const stage  = p.get('stage')  ?? ''
    const tz     = p.get('tz')     ?? 'UTC'

    const isLive     = LIVE.has(status)
    const isDone     = DONE.has(status)
    const isUpcoming = !isLive && !isDone
    const groupLabel = group ? group.replace('GROUP_', 'Grupo ') : stage.replace(/_/g, ' ')

    const fontData = await readFile(join(process.cwd(), 'public/fonts/geist.ttf'))

    // Shared crest renderer — 180×180
    const Crest = ({ src, tla }: { src: string; tla: string }) =>
      src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} width={180} height={180} style={{ objectFit: 'contain' }} alt={tla} />
      ) : (
        <div style={{
          width: 180, height: 180, background: C.graphite, borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: C.textFaint, fontSize: 36, fontWeight: 700 }}>{tla}</span>
        </div>
      )

    return new ImageResponse(
      (
        <div style={{
          width: W, height: H,
          display: 'flex', flexDirection: 'column',
          background: C.bg, fontFamily: 'Geist',
        }}>
          {/* Gold top stripe */}
          <div style={{ width: '100%', height: 5, background: C.gold, flexShrink: 0 }} />

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '24px 52px 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: C.gold }} />
              <span style={{ color: C.gold, fontSize: 17, fontWeight: 700, letterSpacing: 5 }}>
                FIFA WORLD CUP 2026
              </span>
            </div>
            {groupLabel ? (
              <span style={{ color: C.textFaint, fontSize: 16, letterSpacing: 4 }}>
                {groupLabel.toUpperCase()}
              </span>
            ) : null}
          </div>

          {/* Main area */}
          <div style={{
            display: 'flex', flex: 1,
            alignItems: 'center', justifyContent: 'space-between',
            padding: '0 52px',
          }}>

            {/* Home team */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 24, width: 300,
            }}>
              <Crest src={hcrest} tla={htla} />
              <span style={{
                color: C.champagne, fontSize: 38, fontWeight: 700,
                textAlign: 'center', lineHeight: 1.2,
              }}>
                {hname}
              </span>
            </div>

            {/* ── Center ── */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              flex: 1, gap: 0,
            }}>

              {/* UPCOMING: time is the hero */}
              {isUpcoming && (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 16,
                }}>
                  {/* VS label with decorative lines */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{ width: 48, height: 1, background: C.goldDeep }} />
                    <span style={{
                      color: C.textFaint, fontSize: 15,
                      letterSpacing: 8, fontWeight: 600,
                    }}>
                      VS
                    </span>
                    <div style={{ width: 48, height: 1, background: C.goldDeep }} />
                  </div>
                  {/* Time — hero size */}
                  <span style={{
                    color: C.gold, fontSize: 96, fontWeight: 800,
                    lineHeight: 1, letterSpacing: -2,
                  }}>
                    {fmtTime(date, tz)}
                  </span>
                  {/* Full date */}
                  <span style={{
                    color: C.champagne, fontSize: 30, fontWeight: 600,
                    letterSpacing: 0.5, marginTop: 4,
                  }}>
                    {fmtDate(date, tz)}
                  </span>
                </div>
              )}

              {/* LIVE */}
              {isLive && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.patina }} />
                    <span style={{ color: C.patina, fontSize: 16, letterSpacing: 5, fontWeight: 700 }}>EN JUEGO</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <span style={{ color: C.champagne, fontSize: 100, fontWeight: 800, lineHeight: 1 }}>{hs ?? '–'}</span>
                    <span style={{ color: C.goldDeep, fontSize: 56, fontWeight: 300, marginTop: -8 }}>–</span>
                    <span style={{ color: C.champagne, fontSize: 100, fontWeight: 800, lineHeight: 1 }}>{as_ ?? '–'}</span>
                  </div>
                </div>
              )}

              {/* FINISHED */}
              {isDone && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: C.textFaint, fontSize: 15, letterSpacing: 5 }}>RESULTADO FINAL</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <span style={{ color: C.champagne, fontSize: 108, fontWeight: 800, lineHeight: 1 }}>{hs ?? '–'}</span>
                    <span style={{ color: C.goldDeep, fontSize: 60, fontWeight: 300, marginTop: -10 }}>–</span>
                    <span style={{ color: C.champagne, fontSize: 108, fontWeight: 800, lineHeight: 1 }}>{as_ ?? '–'}</span>
                  </div>
                  <span style={{ color: C.textFaint, fontSize: 22, letterSpacing: 2 }}>{fmtDate(date, tz)}</span>
                </div>
              )}
            </div>

            {/* Away team */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 24, width: 300,
            }}>
              <Crest src={acrest} tla={atla} />
              <span style={{
                color: C.champagne, fontSize: 38, fontWeight: 700,
                textAlign: 'center', lineHeight: 1.2,
              }}>
                {aname}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            padding: '0 52px 22px',
          }}>
            <span style={{ color: C.textFaint, fontSize: 14, letterSpacing: 1 }}>
              worldcup-kappa.vercel.app
            </span>
          </div>

          {/* Gold bottom stripe */}
          <div style={{ width: '100%', height: 5, background: C.gold, flexShrink: 0 }} />
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
