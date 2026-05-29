const args = process.argv.slice(2)
const baseUrl = (args.find((arg) => !arg.startsWith('--')) ?? process.env.APP_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '')
const jsonOutput = args.includes('--json')
// --delay N  →  wait N ms between each team-detail request (default 0)
// Use --delay 1200 when testing against production to avoid football-data.org 429s
const delayArg = args.find((a) => a.startsWith('--delay='))
const delayMs = delayArg ? Number(delayArg.split('=')[1]) : 0

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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

function validateDetail(detail) {
  const issues = []
  const squad = Array.isArray(detail.squad) ? detail.squad : []

  if (!detail || typeof detail !== 'object') {
    return { ok: false, squad, issues: ['detail response is not an object'] }
  }

  if (!Array.isArray(detail.squad)) {
    issues.push('missing squad array')
  }

  if (!detail.squadSource) {
    issues.push('missing squadSource')
  }

  if (squad.length === 0 && !detail.fallbackReason && !detail.error) {
    issues.push('empty squad without fallbackReason/error')
  }

  // position may be null — that is valid per the Player TypeScript type.
  // Only fail when name is missing entirely (structural contract issue).
  if (squad.some((player) => !player.name)) {
    issues.push('one or more players missing name')
  }

  return { ok: issues.length === 0, squad, issues }
}

async function main() {
  if (!jsonOutput) {
    console.log(`# Squad Source Check\n`)
    console.log(`Base URL: ${baseUrl}\n`)
  }

  const teamsData = await fetchJson('/api/teams')
  const teams = teamsData.teams ?? []

  if (!teams.length) {
    throw new Error('/api/teams returned no teams')
  }

  const results = []

  for (const team of teams) {
    if (delayMs > 0) await sleep(delayMs)
    try {
      const detail = await fetchJson(teamDetailPath(team))
      const validation = validateDetail(detail)
      const count = validation.squad.length
      const marker = validation.ok ? '[x]' : '[ ]'
      const reason = detail.fallbackReason ? ` - ${detail.fallbackReason}` : ''
      const issueText = validation.issues.length ? ` - ${validation.issues.join('; ')}` : ''

      results.push({
        id: team.id,
        team: team.name,
        source: detail.squadSource ?? 'unknown',
        count,
        ok: validation.ok,
        issues: validation.issues,
        reason: detail.fallbackReason ?? '',
      })

      if (!jsonOutput) {
        console.log(`${marker} ${team.name} | ${detail.squadSource ?? 'unknown'} | ${count} players${reason}${issueText}`)
      }
    } catch (error) {
      results.push({
        id: team.id,
        team: team.name,
        source: 'error',
        count: 0,
        ok: false,
        issues: ['request failed'],
        reason: error instanceof Error ? error.message : String(error),
      })
      if (!jsonOutput) {
        console.log(`[ ] ${team.name} | error | 0 players - ${error instanceof Error ? error.message : error}`)
      }
    }
  }

  const passed = results.filter((result) => result.ok).length
  const failed = results.length - passed

  if (jsonOutput) {
    console.log(JSON.stringify({ baseUrl, passed, failed, total: results.length, results }, null, 2))
  } else {
    console.log(`\nSummary: ${passed}/${results.length} team detail responses passed contract validation, ${failed} need review.`)
  }

  if (failed) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(`Squad check failed: ${error instanceof Error ? error.message : error}`)
  process.exitCode = 1
})
