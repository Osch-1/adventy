import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { decorations } from './decemberDecorations.js'
import { houseDetails, mittensDay, paintedRegions } from './decorationArt.js'

const crops = JSON.parse(readFileSync(new URL('./decoration-crops.json', import.meta.url), 'utf8'))
const directory = new URL('../../DecorationAssets/', import.meta.url)

function layer(key, day, { region, hit, clip, mask, alpha, front, frame }, info = {}) {
  const image = readFileSync(new URL(`decor-${key}.webp`, directory))
  if (!crops[key] || image.length === 0) throw new Error(`Missing artwork or crop: ${key}`)
  const version = createHash('sha256').update(image).digest('hex').slice(0, 16)
  return { key:String(key), day, version, region, hit, clip, mask, alpha, front, frame, crop:crops[key], ...info }
}

const layers = [
  layer('tracks', mittensDay, houseDetails.tracks),
  layer('canopy', 0, houseDetails.canopy),
  ...decorations.map(({ day, name, surface }) => layer(day, day, paintedRegions[day], { name, surface })),
]
writeFileSync(new URL('manifest.json', directory), JSON.stringify(layers, null, 2) + '\n')
