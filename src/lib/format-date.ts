export function formatTime(utcDate: string, timeZone: string): string {
  return new Intl.DateTimeFormat('es', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
    hour12: false,
  }).format(new Date(utcDate))
}

export function formatDayHeading(utcDate: string, timeZone: string): string {
  return new Intl.DateTimeFormat('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone,
  }).format(new Date(utcDate))
}

export function formatDateKey(utcDate: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).format(new Date(utcDate))
}

export function isToday(utcDate: string, timeZone: string): boolean {
  return formatDateKey(utcDate, timeZone) === formatDateKey(new Date().toISOString(), timeZone)
}

export function groupMatchesByDay(
  matches: import('@/types/football').Match[],
  timeZone: string,
): Map<string, import('@/types/football').Match[]> {
  const map = new Map<string, import('@/types/football').Match[]>()
  for (const match of matches) {
    const key = formatDateKey(match.utcDate, timeZone)
    const list = map.get(key) ?? []
    list.push(match)
    map.set(key, list)
  }
  return map
}

export const COMMON_TIMEZONES = [
  { label: 'Ciudad de México (UTC-6)', value: 'America/Mexico_City' },
  { label: 'Nueva York (UTC-5)', value: 'America/New_York' },
  { label: 'Los Ángeles (UTC-8)', value: 'America/Los_Angeles' },
  { label: 'Buenos Aires (UTC-3)', value: 'America/Argentina/Buenos_Aires' },
  { label: 'Bogotá (UTC-5)', value: 'America/Bogota' },
  { label: 'Santiago (UTC-4)', value: 'America/Santiago' },
  { label: 'Madrid (UTC+2)', value: 'Europe/Madrid' },
  { label: 'Londres (UTC+1)', value: 'Europe/London' },
  { label: 'UTC', value: 'UTC' },
]
