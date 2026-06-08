'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import MatchList from './MatchList'
import GroupStandings from './GroupStandings'
import GroupDrawer from './GroupDrawer'
import TeamsGrid from './TeamsGrid'
import Countdown from './Countdown'
import CalendarButton from './CalendarButton'
import FavoriteTeamCard from './FavoriteTeamCard'
import KnockoutBracket from './KnockoutBracket'
import DateCarousel from './DateCarousel'
import StatsBento from './StatsBento'
import { useFavoriteTeam } from '@/hooks/useFavoriteTeam'
import { Match, Standing, Team } from '@/types/football'
import { formatDateKey } from '@/lib/format-date'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Tab = 'partidos' | 'grupos' | 'equipos' | 'bracket'

interface Props {
  matches: Match[]
  standings: Standing[]
  teams: Team[]
  liveCount: number
  firstMatchDate: string
}

export default function AppShell({ matches, standings, teams, liveCount, firstMatchDate }: Props) {
  const t = useTranslations('nav')
  const tStage = useTranslations('stage')
  const tMatch = useTranslations('match')

  const TABS: { id: Tab; label: string; icon: string; iconActive: string }[] = [
    { id: 'partidos', label: t('partidos'), icon: 'material-symbols:calendar-month-outline', iconActive: 'material-symbols:calendar-month' },
    { id: 'grupos',   label: t('grupos'),   icon: 'material-symbols:grid-view-outline',      iconActive: 'material-symbols:grid-view' },
    { id: 'equipos',  label: t('equipos'),  icon: 'material-symbols:shield-outline',          iconActive: 'material-symbols:shield' },
    { id: 'bracket',  label: t('bracket'),  icon: 'material-symbols:account-tree-outline',    iconActive: 'material-symbols:account-tree' },
  ]

  const STAGE_PHASE_LABELS: Record<string, string> = {
    GROUP_STAGE:    tStage('GROUP_STAGE'),
    LAST_16:        tStage('LAST_16'),
    QUARTER_FINALS: tStage('QUARTER_FINALS'),
    SEMI_FINALS:    tStage('SEMI_FINALS'),
    THIRD_PLACE:    tStage('THIRD_PLACE'),
    FINAL:          tStage('FINAL'),
  }

  const [tab, setTab] = useState<Tab>('partidos')
  const { favorite, saveFavorite } = useFavoriteTeam()

  const handleToggleFavorite = useCallback(
    (team: Team) => saveFavorite(favorite?.id === team.id ? null : team),
    [favorite, saveFavorite],
  )

  const handleTabChange = useCallback((newTab: Tab) => {
    setTab(newTab)
    const params = new URLSearchParams(window.location.search)
    params.set('tab', newTab)
    if (newTab !== 'equipos') params.delete('equipo')
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `/?${qs}` : '/')
  }, [])

  const [timeZone, setTimeZone] = useState('UTC')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Standing | null>(null)
  const [deferredInstall, setDeferredInstall] = useState<BeforeInstallPromptEvent | null>(null)
  const [installAccepted, setInstallAccepted] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const router = useRouter()

  const isIOSSafari = useSyncExternalStore(
    () => () => {},
    () => {
      const ua = navigator.userAgent
      const isIOS = /iphone|ipad|ipod/i.test(ua) && !/crios/i.test(ua)
      const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as { standalone?: boolean }).standalone === true
      return isIOS && isSafari && !standalone
    },
    () => false,
  )

  const showInstall = !installAccepted && (deferredInstall !== null || isIOSSafari)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam === 'grupos' || tabParam === 'equipos' || tabParam === 'bracket') {
      window.setTimeout(() => setTab(tabParam as Tab), 0)
    }
  }, [])

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    const timer = window.setTimeout(() => setTimeZone(detected), 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 1450)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const alreadyInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as { standalone?: boolean }).standalone === true
    if (alreadyInstalled) return
    const handler = (e: Event) => { e.preventDefault(); setDeferredInstall(e as BeforeInstallPromptEvent) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = useCallback(async () => {
    if (deferredInstall) {
      await deferredInstall.prompt()
      const { outcome } = await deferredInstall.userChoice
      if (outcome === 'accepted') setInstallAccepted(true)
      setDeferredInstall(null)
    } else {
      router.push('/instalar')
    }
  }, [deferredInstall, router])

  const matchDates = Array.from(
    new Set(matches.map((m) => formatDateKey(m.utcDate, timeZone))),
  ).sort()

  const phaseLabel = (() => {
    const upcoming = matches.find(
      (m) => m.status === 'TIMED' || m.status === 'SCHEDULED' || m.status === 'LIVE' || m.status === 'IN_PLAY',
    )
    const stage = upcoming?.stage ?? matches[0]?.stage ?? 'GROUP_STAGE'
    return STAGE_PHASE_LABELS[stage] ?? tStage('GROUP_STAGE')
  })()

  const filteredMatches =
    selectedDate !== null
      ? matches.filter((m) => formatDateKey(m.utcDate, timeZone) === selectedDate)
      : matches

  return (
    <div className="flex-1 flex flex-col">
      {showIntro && (
        <div className="launch-intro" aria-hidden="true">
          <div className="launch-intro-card">
            <Image src="/app-logo.png" alt="" width={150} height={150} priority className="launch-logo" />
          </div>
        </div>
      )}

      <header
        className="ios-blur fixed top-0 left-0 right-0 z-40"
        style={{ background: 'rgba(5, 20, 36, 0.88)', borderBottom: '1px solid var(--glass-border)', paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[500px] mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Image src="/app-logo.png" alt="WC 26" width={38} height={38} priority className="app-header-logo" />
              <span className="font-extrabold tracking-tight uppercase leading-none"
                style={{ color: 'var(--kinpaku)', fontSize: '0.95rem', letterSpacing: '0.06em' }}>
                WC 26
              </span>
              {liveCount > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 eyebrow"
                  style={{ color: 'var(--patina)', border: '1px solid oklch(70% 0.12 188 / 0.35)', background: 'oklch(70% 0.12 188 / 0.08)', borderRadius: 'var(--r-sm)' }}>
                  <span className="live-dot w-1.5 h-1.5 rounded-full block" style={{ background: 'var(--patina)' }} aria-hidden="true" />
                  {liveCount} live
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {showInstall && (
                <button onClick={handleInstallClick} aria-label={t('ariaInstall')} title={t('ariaInstall')}
                  className="flex items-center justify-center soft-haptic focus-visible:outline-none"
                  style={{ background: 'transparent', border: 'none', color: 'var(--kinpaku)', padding: 4 }}>
                  <Icon icon="material-symbols:download-for-offline" width={24} height={24} />
                </button>
              )}
              <CalendarButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-shrink-0" style={{ height: 'calc(56px + env(safe-area-inset-top, 0px))' }} />

      <main className="flex-1 max-w-[500px] mx-auto w-full px-4 py-6 pb-32">
        {tab === 'partidos' ? (
          <div key="partidos" className="tab-panel">
            {liveCount === 0 && <div className="mb-5"><Countdown targetDate={firstMatchDate} /></div>}
            {favorite && (
              <FavoriteTeamCard team={favorite} matches={matches} timeZone={timeZone} onRemove={() => saveFavorite(null)} />
            )}
            <DateCarousel dates={matchDates} selected={selectedDate} onSelect={setSelectedDate} timeZone={timeZone} phaseLabel={phaseLabel} />
            <MatchList matches={filteredMatches} timeZone={timeZone} />
            <StatsBento />
          </div>
        ) : tab === 'grupos' ? (
          <div key="grupos" className="tab-panel">
            {standings.length > 0 ? (
              <>
                <p className="eyebrow mb-5" style={{ color: 'var(--text-faint)' }}>
                  {tMatch('groupsAdvance')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {standings.map((s) => (
                    <GroupStandings key={s.group} standing={s} onSelect={setSelectedGroup} />
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="eyebrow" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                  {tMatch('groupsUnavailable')}
                </p>
              </div>
            )}
          </div>
        ) : tab === 'equipos' ? (
          <div key="equipos" className="tab-panel">
            <TeamsGrid teams={teams} favoriteId={favorite?.id ?? null} onToggleFavorite={handleToggleFavorite} allMatches={matches} timeZone={timeZone} />
          </div>
        ) : (
          <div key="bracket" className="tab-panel">
            <KnockoutBracket matches={matches} timeZone={timeZone} />
          </div>
        )}

        <div className="mt-10 text-center">
          <a href="https://carlosgallardo.dev" target="_blank" rel="noopener noreferrer" className="eyebrow"
            style={{ color: 'var(--text-disabled)', textDecoration: 'none', letterSpacing: '0.08em' }}>
            by Carlos Gallardo
          </a>
        </div>
      </main>

      {selectedGroup && (
        <GroupDrawer key={selectedGroup.group} standing={selectedGroup} matches={matches} timeZone={timeZone} onClose={() => setSelectedGroup(null)} />
      )}

      <nav
        className="ios-blur fixed bottom-0 left-0 right-0 z-40 flex"
        style={{ background: 'rgba(5, 20, 36, 0.88)', borderTop: '1px solid var(--glass-border)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        role="tablist"
        aria-label={t('ariaMain')}
      >
        {TABS.map((tabItem) => {
          const isActive = tab === tabItem.id
          return (
            <button
              key={tabItem.id}
              role="tab"
              onClick={() => handleTabChange(tabItem.id)}
              aria-selected={isActive}
              aria-label={tabItem.label}
              className="flex-1 flex flex-col items-center justify-center soft-haptic focus-visible:outline-none"
              style={{ color: isActive ? 'var(--kinpaku)' : 'var(--text-disabled)', paddingTop: 10, paddingBottom: 8, gap: 3, transition: 'color 150ms' }}
            >
              <Icon icon={isActive ? tabItem.iconActive : tabItem.icon} width={26} height={26} />
              <span style={{ fontSize: '10px', letterSpacing: '0.04em', fontWeight: isActive ? 700 : 400, color: 'inherit', lineHeight: 1 }}>
                {tabItem.label}
              </span>
              <div aria-hidden="true" style={{ width: 4, height: 4, borderRadius: '50%', background: isActive ? 'var(--kinpaku)' : 'transparent', transition: 'background 150ms' }} />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
