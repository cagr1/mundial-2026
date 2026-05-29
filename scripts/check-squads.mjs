const baseUrl = (process.argv[2] ?? process.env.APP_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '')

async function fetchJson(path) {
  const res = await fetch(`${baseUrl}${path}`)
  const text = await res.text()

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 240)}`)
  }

  return JSON.parse(text)
}

function teamDetailPath(team) {
  const params = new URLSearchParams({
    name: team.name ?? '',
    shortName: team.shortName ?? team.name ?? '',
    tla: team.tla ?? '',
    crest: team.crest ?? '',
  })

  return `/api/teams/${team.id}?${params}`
}

async function main() {
  console.log(`# Squad Source Check\n`)
  console.log(`Base URL: ${baseUrl}\n`)

  const teamsData = await fetchJson('/api/teams')
  const teams = teamsData.teams ?? []

  if (!teams.length) {
    throw new Error('/api/teams returned no teams')
  }

  const results = []

  for (const team of teams) {
    try {
      const detail = await fetchJson(teamDetailPath(team))
      const count = Array.isArray(detail.squad) ? detail.squad.length : 0
      const ok = detail.squadSource === 'Wikipedia' && count > 0
      const marker = ok ? '[x]' : '[ ]'
      const reason = detail.fallbackReason ? ` - ${detail.fallbackReason}` : ''

      results.push({
        team: team.name,
        source: detail.squadSource ?? 'unknown',
        count,
        ok,
        reason: detail.fallbackReason ?? '',
      })

      console.log(`${marker} ${team.name} | ${detail.squadSource ?? 'unknown'} | ${count} players${reason}`)
    } catch (error) {
      results.push({
        team: team.name,
        source: 'error',
        count: 0,
        ok: false,
        reason: error instanceof Error ? error.message : String(error),
      })
      console.log(`[ ] ${team.name} | error | 0 players - ${error instanceof Error ? error.message : error}`)
    }
  }

  const passed = results.filter((result) => result.ok).length
  const failed = results.length - passed

  console.log(`\nSummary: ${passed}/${results.length} resolved from Wikipedia, ${failed} need review.`)

  if (failed) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(`Squad check failed: ${error instanceof Error ? error.message : error}`)
  process.exitCode = 1
})
