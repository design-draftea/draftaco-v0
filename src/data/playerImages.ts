import manifest from '../assets/jogadores/manifest.json'

type PlayerImageManifestEntry = {
  team: string
  name: string
  aliases?: string[]
  file: string
}

const imageModules = import.meta.glob('../assets/jogadores/**/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const normalizePlayerImageKey = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const playerImagesByTeamAndName: Record<string, string> = {}
const playerImagesByName: Record<string, string> = {}
const genericFallbackNames = new Set(['silva', 'smith'])

for (const player of manifest.players as PlayerImageManifestEntry[]) {
  const image = imageModules[`../assets/jogadores/${player.file}`]
  if (!image) continue

  const teamKey = normalizePlayerImageKey(player.team)
  const names = [player.name, ...(player.aliases ?? [])]
    .flatMap((name) => {
      const normalizedName = normalizePlayerImageKey(name)
      const terms = normalizedName.split('-')
      const shortName = terms.length > 1 ? terms.slice(1).join('-') : normalizedName
      const initialName = terms.length > 1 ? `${terms[0][0]}-${shortName}` : normalizedName

      return [
        ...terms.map((_, index) => terms.slice(index).join('-')),
        initialName,
      ]
    })

  for (const name of names) {
    playerImagesByTeamAndName[`${teamKey}:${name}`] = image
    playerImagesByName[name] ??= image
  }
}

export function getLocalPlayerImage(teamName: string, playerName: string): string | undefined {
  const teamKey = normalizePlayerImageKey(teamName)
  const playerKey = normalizePlayerImageKey(playerName)

  if (genericFallbackNames.has(playerKey)) return undefined

  return playerImagesByTeamAndName[`${teamKey}:${playerKey}`] ?? playerImagesByName[playerKey]
}

export function getLocalPlayerImageByName(playerName: string): string | undefined {
  const playerKey = normalizePlayerImageKey(playerName)
  if (genericFallbackNames.has(playerKey)) return undefined

  return playerImagesByName[playerKey]
}
