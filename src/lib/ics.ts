import type { Match } from '@/types/football'

function icsDate(utcDate: string) {
  return new Date(utcDate).toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
}

function icsEnd(utcDate: string) {
  const d = new Date(utcDate)
  d.setTime(d.getTime() + 105 * 60 * 1000) // 105 min
  return d.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
}

function fold(line: string): string {
  // RFC 5545: fold lines > 75 chars
  const out: string[] = []
  while (line.length > 75) {
    out.push(line.slice(0, 75))
    line = ' ' + line.slice(75)
  }
  out.push(line)
  return out.join('\r\n')
}

function escapeICS(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export function matchToVEVENT(m: Match): string {
  const groupLabel = m.group
    ? m.group.replace('GROUP_', 'Grupo ')
    : m.stage.replace(/_/g, ' ')
  const summary = `⚽ ${m.homeTeam.shortName} vs ${m.awayTeam.shortName}`
  const desc = `${groupLabel} · Jornada ${m.matchday}\\nMundial 2026 — FIFA World Cup\\n${m.homeTeam.name} vs ${m.awayTeam.name}`

  return [
    'BEGIN:VEVENT',
    fold(`UID:wc2026-${m.id}@mundial2026`),
    fold(`DTSTART:${icsDate(m.utcDate)}`),
    fold(`DTEND:${icsEnd(m.utcDate)}`),
    fold(`SUMMARY:${escapeICS(summary)}`),
    fold(`DESCRIPTION:${escapeICS(desc)}`),
    'LOCATION:USA / Canada / Mexico',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    fold(`DESCRIPTION:Comienza en 30 min: ${escapeICS(m.homeTeam.shortName + ' vs ' + m.awayTeam.shortName)}`),
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    fold(`DESCRIPTION:En 1 hora: ${escapeICS(m.homeTeam.shortName + ' vs ' + m.awayTeam.shortName)}`),
    'END:VALARM',
    'END:VEVENT',
  ].join('\r\n')
}

export function buildICS(matches: Match[], calName = 'Mundial 2026 ⚽'): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mundial 2026//mundial2026//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    fold(`X-WR-CALNAME:${calName}`),
    'X-WR-CALDESC:Todos los partidos del FIFA World Cup 2026',
    'X-WR-TIMEZONE:UTC',
    'X-PUBLISHED-TTL:PT1H',
    ...matches.map(matchToVEVENT),
    'END:VCALENDAR',
  ].join('\r\n')
}
