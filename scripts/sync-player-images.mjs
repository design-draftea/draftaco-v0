import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import ts from 'typescript'

if (process.argv.includes('--help')) {
  console.log(`Uso: node scripts/sync-player-images.mjs [opções]

Opções:
  --limit=<n>        máximo de jogadores por lote (padrão: 4)
  --retry-deferred   tenta novamente jogadores pendentes
  --reconcile-deferred remove da fila nomes que já possuem asset local
  --dry-run          lista jogadores sem asset local, sem consultar o SofaScore
  --sport=<nome>     restringe o lote a football, basketball ou tennis
  --cooldown=<min>   registra uma espera local antes do próximo lote
  --help             exibe esta ajuda sem iniciar requisições`)
  process.exit(0)
}

const sourcePath = 'src/components/CalendarSection/CalendarSection.tsx'
const manifestPath = 'src/assets/jogadores/manifest.json'
const assetRoot = 'src/assets/jogadores'
const unresolvedPath = 'scripts/player-image-unresolved.json'
const cooldownPath = 'scripts/player-image-cooldown.json'
const lockPath = path.join(os.tmpdir(), 'draftaco-player-images.lock')
const processorPath = path.join(os.tmpdir(), 'remove-player-background')
const imageHost = 'https://img-sofascore-com.translate.goog'
const siteHost = 'https://www-sofascore-com.translate.goog'
const translateLanguages = [
  'en', 'es', 'fr', 'de', 'it', 'nl', 'pt', 'pl', 'ja', 'ko', 'tr', 'sv',
  'da', 'no', 'fi', 'cs', 'ro', 'hu', 'el', 'uk', 'id', 'vi', 'th', 'ar',
]
let translationRequestIndex = Math.floor(Date.now() / 1_000) % translateLanguages.length
const nbaTeams = new Set([
  'Jazz', 'Thunder', 'Knicks', 'Magic', 'Bulls', 'Heat', '76ers', 'Celtics',
  'Nuggets', 'Suns', 'Mavericks', 'Spurs', 'Clippers', 'Kings',
])
const teamAliases = new Map([
  ['Atl. Mineiro', 'Atlético Mineiro'],
  ['Alavés', 'Deportivo Alavés'],
  ['B. Leverkusen', 'Bayer 04 Leverkusen'],
  ['B. Dortmund', 'Borussia Dortmund'],
  ['Bayern', 'Bayern München'],
  ['Eintracht', 'Eintracht Frankfurt'],
  ['Levante', 'Levante UD'],
  ['Man. City', 'Manchester City'],
  ['Man. United', 'Manchester United'],
  ['Mallorca', 'RCD Mallorca'],
  ['PSG', 'Paris Saint-Germain'],
  ['Inter', 'Inter'],
  ['76ers', 'Philadelphia 76ers'],
  ['Jazz', 'Utah Jazz'],
  ['Thunder', 'Oklahoma City Thunder'],
  ['Knicks', 'New York Knicks'],
  ['Magic', 'Orlando Magic'],
  ['Bulls', 'Chicago Bulls'],
  ['Heat', 'Miami Heat'],
  ['Celtics', 'Boston Celtics'],
  ['Nuggets', 'Denver Nuggets'],
  ['Suns', 'Phoenix Suns'],
  ['Mavericks', 'Dallas Mavericks'],
  ['Spurs', 'San Antonio Spurs'],
  ['Clippers', 'Los Angeles Clippers'],
  ['Kings', 'Sacramento Kings'],
  ['Wolfsburg', 'VfL Wolfsburg'],
])
const genericFallbacks = new Set(['silva', 'smith'])
const playerIdOverrides = new Map([
  ['Mirassol:Chico Kim', '880132'],
])
const searchAliases = new Map([
  ['Gabigol', 'Gabriel Barbosa'],
  ['Arias', 'Jhon Arias'],
  ['Savarino', 'Jefferson Savarino'],
  ['Tiquinho Soares', 'Francisco Soares'],
  ['Vini Jr', 'Vinicius Junior'],
  ['Núñez', 'Darwin Nunez'],
  ['Diaz', 'Luis Diaz'],
  ['Yamal', 'Lamine Yamal'],
  ['Neymar Jr', 'Neymar'],
  ['Soteldo', 'Yeferson Soteldo'],
  ['Griezmann', 'Antoine Griezmann'],
  ['Taremi', 'Mehdi Taremi'],
  ['Lacazette', 'Alexandre Lacazette'],
  ['Mikautadze', 'Georges Mikautadze'],
  ['Nuamah', 'Ernest Nuamah'],
  ['Barnes', 'Harvey Barnes'],
  ['Osimhen', 'Victor Osimhen'],
  ['Politano', 'Matteo Politano'],
  ['Raspadori', 'Giacomo Raspadori'],
  ['De Bruyne', 'Kevin De Bruyne'],
  ['Everton Cebolinha', 'Everton'],
  ['Rioja', 'Luis Rioja'],
  ['Samu Omorodion', 'Samu Aghehowa'],
  ['Adeyemi', 'Karim Adeyemi'],
  ['Brandt', 'Julian Brandt'],
  ['Guirassy', 'Serhou Guirassy'],
  ['Sane', 'Leroy Sané'],
  ['Ekitike', 'Hugo Ekitiké'],
  ['Brugué', 'Roger Brugué'],
  ['Iborra', 'Vicente Iborra'],
  ['Larin', 'Cyle Larin'],
  ['Muriqi', 'Vedat Muriqi'],
  ['Openda', 'Loïs Openda'],
  ['Sesko', 'Benjamin Šeško'],
  ['Majer', 'Lovro Majer'],
  ['Wind', 'Jonas Wind'],
  ['Alexander Shevchenko', 'Aleksandr Shevchenko'],
  ['DeAaron Fox', "De'Aaron Fox"],
  ['Miguel Almiron', 'Miguel Almirón'],
  ['Son', 'Son Heung-min'],
  ['Paqueta', 'Lucas Paquetá'],
])
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
const defaultCooldownMilliseconds = 15 * 60 * 1_000
const requestTimeoutMilliseconds = 12_000
let providerRetryAt = 0

const formatRetryAt = (retryAt) => new Date(retryAt).toLocaleString('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const readCooldown = () => {
  if (!fs.existsSync(cooldownPath)) return 0

  try {
    const { retryAt } = JSON.parse(fs.readFileSync(cooldownPath, 'utf8'))
    return Number.isFinite(retryAt) ? retryAt : 0
  } catch {
    return 0
  }
}

const writeCooldown = (retryAt) => {
  fs.writeFileSync(cooldownPath, `${JSON.stringify({ retryAt }, null, 2)}\n`)
}

const clearExpiredCooldown = () => {
  if (readCooldown() <= Date.now()) fs.rmSync(cooldownPath, { force: true })
}

const normalize = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const translatedUrl = (host, pathname, query = '') => {
  const language = translateLanguages[translationRequestIndex % translateLanguages.length]
  translationRequestIndex += 1
  const separator = query ? '&' : '?'
  return `${host}${pathname}${query}${separator}_x_tr_sl=auto&_x_tr_tl=${language}&_x_tr_hl=${language}`
}

const getString = (node) => ts.isStringLiteralLike(node) ? node.text : undefined

const getProperty = (node, name) => node.properties
  .find((property) => ts.isPropertyAssignment(property) && property.name.getText() === name)?.initializer

const extractPlayers = () => {
  const source = ts.createSourceFile(
    sourcePath,
    fs.readFileSync(sourcePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const mapNames = new Map([
    ['calendarFootballFinishingPlayersByTeam', 'football'],
    ['calendarFootballAssistPlayersByTeam', 'football'],
    ['calendarBasketballPointPlayersByTeam', 'basketball'],
    ['calendarBasketballAssistPlayersByTeam', 'basketball'],
  ])
  const players = []

  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      mapNames.has(node.name.text) &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      const sport = mapNames.get(node.name.text)
      for (const property of node.initializer.properties) {
        if (!ts.isPropertyAssignment(property) || !ts.isArrayLiteralExpression(property.initializer)) continue
        const team = property.name.getText().replace(/^['"]|['"]$/g, '')
        if (sport === 'basketball' && !nbaTeams.has(team)) continue

        for (const profile of property.initializer.elements) {
          if (!ts.isObjectLiteralExpression(profile)) continue
          const name = getString(getProperty(profile, 'name'))
          if (name) players.push({ sport, team, name })
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(source)

  const tennisChampionships = source.statements
    .filter((statement) => ts.isVariableStatement(statement))
    .flatMap((statement) => statement.declarationList.declarations)
    .find((declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === 'championships')
    ?.initializer

  if (tennisChampionships && ts.isArrayLiteralExpression(tennisChampionships)) {
    for (const championship of tennisChampionships.elements) {
      if (!ts.isObjectLiteralExpression(championship)) continue
      if (getString(getProperty(championship, 'sport')) !== 'tenis') continue

      const events = getProperty(championship, 'events')
      if (!events || !ts.isArrayLiteralExpression(events)) continue

      for (const event of events.elements) {
        if (!ts.isObjectLiteralExpression(event)) continue
        for (const field of ['homeName', 'awayName']) {
          const name = getString(getProperty(event, field))
          if (name) players.push({ sport: 'tennis', team: 'Tenis', name })
        }
      }
    }
  }

  return [...new Map(players.map((player) => [`${player.sport}:${player.team}:${player.name}`, player])).values()]
}

const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || `${command} failed`)
}

let lockHandle
try {
  lockHandle = fs.openSync(lockPath, 'wx')
} catch {
  const owner = Number(fs.readFileSync(lockPath, 'utf8'))
  if (!Number.isInteger(owner) || owner <= 0) {
    fs.rmSync(lockPath, { force: true })
    lockHandle = fs.openSync(lockPath, 'wx')
  } else {
  try {
    process.kill(owner, 0)
    throw new Error('Já existe um lote de fotos em execução.')
  } catch (error) {
    if (error.code !== 'ESRCH') throw error
    fs.rmSync(lockPath, { force: true })
    lockHandle = fs.openSync(lockPath, 'wx')
  }
  }
}
fs.writeFileSync(lockHandle, String(process.pid))
process.on('exit', () => {
  if (lockHandle !== undefined) {
    fs.closeSync(lockHandle)
    fs.rmSync(lockPath, { force: true })
  }
})

const fetchJson = async (url) => {
  for (let attempt = 0; attempt < 1; attempt += 1) {
    const response = await fetch(url, {
      headers: { 'user-agent': 'Draftaco internal prototype' },
      signal: AbortSignal.timeout(requestTimeoutMilliseconds),
    })
    if (response.status === 429) {
      const retryAfterSeconds = Number(response.headers.get('retry-after'))
      const cooldownMilliseconds = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
        ? retryAfterSeconds * 1_000
        : defaultCooldownMilliseconds
      providerRetryAt = Math.max(providerRetryAt, Date.now() + cooldownMilliseconds)
      throw new Error(`SofaScore limitou as requisições; tente novamente após ${formatRetryAt(providerRetryAt)}`)
    }
    const body = await response.text()
    try {
      return JSON.parse(body)
    } catch {
      if (attempt === 0) throw new Error(`Resposta inválida do SofaScore (${response.status})`)
      await delay(2_000)
    }
  }
}

const findSofascoreIdWithDuckDuckGo = async (player) => {
  const sport = player.sport === 'basketball'
    ? 'basketball'
    : player.sport === 'tennis'
      ? 'tennis'
      : 'football'
  const query = player.sport === 'tennis'
    ? `site:sofascore.com/${sport}/player "${player.name}"`
    : `site:sofascore.com/${sport}/player "${player.name}" "${player.team}"`
  const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: { 'user-agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(requestTimeoutMilliseconds),
  })
  const html = await response.text()
  const match = html.match(/sofascore\.com%2F(?:football|basketball)%2Fplayer%2F.+?%2F(\d+)/i)
    ?? html.match(/sofascore\.com%2Ftennis%2Fteam%2F.+?%2F(\d+)/i)
    ?? html.match(/sofascore\.com\/(?:football|basketball)\/player\/[^/"? ]+\/(\d+)/i)
    ?? html.match(/sofascore\.com\/tennis\/team\/[^/"? ]+\/(\d+)/i)

  return match?.[1]
}

if (!fs.existsSync(processorPath)) {
  run('swiftc', ['scripts/remove-player-background.swift', '-o', processorPath])
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const writeManifest = () => fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
const deferred = new Set(fs.existsSync(unresolvedPath) ? JSON.parse(fs.readFileSync(unresolvedPath, 'utf8')) : [])
const retryDeferred = process.argv.includes('--retry-deferred')
const reconcileDeferred = process.argv.includes('--reconcile-deferred')
const dryRun = process.argv.includes('--dry-run')
const sportArgument = process.argv.find((argument) => argument.startsWith('--sport='))
const selectedSport = sportArgument?.slice('--sport='.length)
if (selectedSport && selectedSport !== 'football' && selectedSport !== 'basketball' && selectedSport !== 'tennis') {
  throw new Error('O esporte do lote deve ser football, basketball ou tennis.')
}
const cooldownArgument = process.argv.find((argument) => argument.startsWith('--cooldown='))
const existing = new Set(
  manifest.players.flatMap((player) => (
    [player.name, ...(player.aliases ?? [])]
      .flatMap((name) => {
        const normalizedName = normalize(name)
        const terms = normalizedName.split('-')
        return terms.map((_, index) => terms.slice(index).join('-'))
          .filter(Boolean)
          .map((candidate) => `${normalize(teamAliases.get(player.team) ?? player.team)}:${candidate}`)
      })
  )),
)
const getExistingPlayerKeys = (team, playerName) => (
  [playerName, searchAliases.get(playerName)]
    .filter(Boolean)
    .flatMap((name) => {
      const normalizedName = normalize(name)
      const terms = normalizedName.split('-')
      return terms.map((_, index) => terms.slice(index).join('-'))
        .filter(Boolean)
        .map((candidate) => `${normalize(teamAliases.get(team) ?? team)}:${candidate}`)
    })
)
const hasExistingPlayer = (team, playerName) => (
  getExistingPlayerKeys(team, playerName).some((key) => existing.has(key))
)
for (const entry of deferred) {
  const separatorIndex = entry.indexOf(':')
  if (separatorIndex <= 0) continue

  const team = entry.slice(0, separatorIndex)
  const playerName = entry.slice(separatorIndex + 1)
  if (hasExistingPlayer(team, playerName)) deferred.delete(entry)
}
const limitArgument = process.argv.find((argument) => argument.startsWith('--limit='))
const limit = limitArgument ? Number(limitArgument.slice('--limit='.length)) : 4
if (!Number.isInteger(limit) || limit <= 0) {
  throw new Error('O limite do lote deve ser um inteiro positivo.')
}
if (cooldownArgument) {
  const cooldownMinutes = Number(cooldownArgument.slice('--cooldown='.length))
  if (!Number.isFinite(cooldownMinutes) || cooldownMinutes <= 0) {
    throw new Error('A espera deve ser um número positivo de minutos.')
  }

  const retryAt = Date.now() + cooldownMinutes * 60 * 1_000
  writeCooldown(retryAt)
  console.log(`Próximo lote liberado após ${formatRetryAt(retryAt)}`)
  process.exit(0)
}
if (reconcileDeferred) {
  fs.writeFileSync(unresolvedPath, `${JSON.stringify([...deferred].sort(), null, 2)}\n`)
  console.log(`Pendências reconciliadas: ${deferred.size}`)
  process.exit(0)
}
clearExpiredCooldown()
const persistedRetryAt = readCooldown()
const candidates = extractPlayers().filter((player) => (
  (!selectedSport || player.sport === selectedSport) &&
  !genericFallbacks.has(normalize(player.name)) &&
  (dryRun || retryDeferred || !deferred.has(`${player.team}:${player.name}`)) &&
  !hasExistingPlayer(player.team, player.name)
))

if (dryRun) {
  console.log(`Jogadores sem asset local (${candidates.length}):`)
  for (const player of candidates) console.log(`${player.team}: ${player.name}`)
  process.exit(0)
}

if (persistedRetryAt > Date.now()) {
  console.log(`Lote adiado até ${formatRetryAt(persistedRetryAt)} por rate limit do SofaScore.`)
  process.exit(0)
}

const targets = candidates.slice(0, limit)
const unresolved = []
const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'draftaco-player-sources-'))

for (const player of targets) {
  if (providerRetryAt > Date.now()) break

  const pendingKey = `${player.team}:${player.name}`
  const searchName = searchAliases.get(player.name) ?? player.name
  const searchUrl = translatedUrl(siteHost, '/api/v1/search/all', `?q=${encodeURIComponent(searchName)}`)
  const overrideId = playerIdOverrides.get(pendingKey)
  let payload
  if (!overrideId) {
    try {
      payload = await fetchJson(searchUrl)
    } catch (error) {
      unresolved.push(`${player.team}: ${player.name} (${error.message})`)
      deferred.add(pendingKey)
      continue
    }
  }
  const expectedName = normalize(searchName)
  const expectedTeam = normalize(teamAliases.get(player.team) ?? player.team)
  const results = payload?.results?.filter(({ type, entity }) => (
    player.sport === 'tennis' ? type === 'team' && entity?.id && entity?.name : entity?.team
  )) ?? []
  let result = overrideId ? { entity: { id: overrideId, name: player.name, shortName: player.name } } : (
    player.sport === 'tennis' ? undefined : results.find(({ entity }) => (
      entity?.team && normalize(entity.team.name) === expectedTeam
    ))
  ) ?? results.find(({ entity }) => (
    normalize(entity.name) === expectedName || normalize(entity.shortName ?? '') === expectedName
  )) ?? (expectedName.includes('-') ? results.find(({ entity }) => (
    normalize(entity.name).includes(expectedName) || expectedName.includes(normalize(entity.name))
  )) : results.find(({ entity }) => (
    expectedName.length >= 4 && normalize(entity.name).split('-').includes(expectedName)
  )))

  if (!result?.entity?.id) {
    const providerId = await findSofascoreIdWithDuckDuckGo(player)
    if (providerId) {
      result = { entity: { id: providerId, name: player.name, shortName: player.name } }
    }
  }

  if (!result?.entity?.id) {
    unresolved.push(pendingKey)
    deferred.add(pendingKey)
    continue
  }

  const entity = result.entity
  const directory = normalize(player.team)
  const filename = `${normalize(player.name)}.png`
  const relativeFile = `${directory}/${filename}`
  const rawPath = path.join(tempDirectory, `${entity.id}.png`)
  const destination = path.join(assetRoot, relativeFile)
  const imagePath = player.sport === 'tennis'
    ? `/api/v1/team/${entity.id}/image`
    : `/api/v1/player/${entity.id}/image`
  const imageUrl = translatedUrl(imageHost, imagePath)
  let imageResponse
  try {
    imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(requestTimeoutMilliseconds) })
  } catch (error) {
    unresolved.push(`${player.team}: ${player.name} (imagem indisponível)`)
    deferred.add(pendingKey)
    continue
  }

  if (!imageResponse.ok) {
    if (imageResponse.status === 429) {
      const retryAfterSeconds = Number(imageResponse.headers.get('retry-after'))
      const cooldownMilliseconds = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
        ? retryAfterSeconds * 1_000
        : defaultCooldownMilliseconds
      providerRetryAt = Math.max(providerRetryAt, Date.now() + cooldownMilliseconds)
    }
    unresolved.push(`${player.team}: ${player.name} (imagem ${imageResponse.status})`)
    deferred.add(pendingKey)
    continue
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.writeFileSync(rawPath, Buffer.from(await imageResponse.arrayBuffer()))
  run(processorPath, [rawPath, destination])
  manifest.players.push({
    team: player.team,
    name: entity.name,
    aliases: [...new Set([player.name, entity.shortName].filter(Boolean))],
    providerId: String(entity.id),
    file: relativeFile,
  })
  for (const key of getExistingPlayerKeys(player.team, player.name)) existing.add(key)
  deferred.delete(pendingKey)
  writeManifest()
  console.log(`OK ${player.team}: ${player.name}`)
  await delay(500)
}

writeManifest()
fs.writeFileSync(unresolvedPath, `${JSON.stringify([...deferred].sort(), null, 2)}\n`)
if (providerRetryAt > Date.now()) writeCooldown(providerRetryAt)
fs.rmSync(tempDirectory, { recursive: true, force: true })

if (unresolved.length > 0) {
  console.error(`Sem correspondência (${unresolved.length}):\n${unresolved.join('\n')}`)
  process.exitCode = 1
}
