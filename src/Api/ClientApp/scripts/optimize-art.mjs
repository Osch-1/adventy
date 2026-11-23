import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { houseDetails, houseHeight, houseWidth, paintedRegions } from './decorationArt.js'

const assets = fileURLToPath(new URL('../src/assets/', import.meta.url))
const output = join(assets, 'optimized')
const decorationOutput = fileURLToPath(new URL('../../DecorationAssets/', import.meta.url))
const encoder = process.argv[2] || 'cwebp'
mkdirSync(output, { recursive: true })
mkdirSync(decorationOutput, { recursive: true })

function encode(source, target, options, destinationFolder = output) {
  const input = join(assets, source)
  const destination = join(destinationFolder, target + '.webp')
  execFileSync(encoder, ['-quiet', '-mt', '-metadata', 'icc', ...options.map(String), input, '-o', destination], { stdio: 'inherit' })
  console.log(`${target}: ${statSync(destination).size.toLocaleString()} bytes`)
}

for (const [source, width] of [
  ['house/winter-house-base-v1.png'],
  ['house/winter-house-mobile-v1.png'],
  ['window-demo/frame.png', 800],
  ['window-demo/shutters.png', 640],
  ['window-demo/wooden-sash-v2.png', 640],
  ['task-card/winter-letter-v1.png', 1536],
]) {
  encode(source, basename(source, '.png'), ['-q', 95, '-m', 6, '-sharp_yuv', ...(width ? ['-resize', width, 0] : [])])
}

const rooms = 'window-demo/rooms-atlas-v2.png'
const roomAtlas = readFileSync(join(assets, rooms))
const atlasWidth = roomAtlas.readUInt32BE(16)
const atlasHeight = roomAtlas.readUInt32BE(20)
const rowHeight = atlasHeight / 4
const strips = Array.from({ length: 4 }, (_, row) => {
  const y = row * rowHeight
  const top = Math.max(0, Math.floor((y - 2) / 2) * 2)
  const height = Math.min(atlasHeight, Math.ceil(y + rowHeight + 2)) - top
  encode(rooms, 'room-strip-' + row, ['-q', 95, '-m', 6, '-sharp_yuv', '-crop', 0, top, atlasWidth, height])
  return [height / rowHeight * 100, (y - top) / (height - rowHeight) * 100]
})
writeFileSync(join(output, 'room-strips.json'), JSON.stringify(strips) + '\n')

const crops = {}
for (const [key, value] of Object.entries({ ...paintedRegions, ...houseDetails })) {
  const { image = 'winter-house-decorated-v2.png', alpha, local, source = value.region,
    canvas = [alpha ? 1671 : houseWidth, houseHeight] } = value
  const input = 'house/' + image
  if (local) {
    encode(input, 'decor-' + key, ['-lossless', '-resize', 432, 0], decorationOutput)
    crops[key] = [100, 100, 50, 50]
    continue
  }
  const png = readFileSync(join(assets, input))
  const dimensions = [png.readUInt32BE(16), png.readUInt32BE(20)]
  const [x, y, width, height] = source.map((n, i) => n * dimensions[i % 2] / canvas[i % 2])
  const left = Math.max(0, Math.floor((x - 2) / 2) * 2)
  const top = Math.max(0, Math.floor((y - 2) / 2) * 2)
  const cropWidth = Math.min(dimensions[0], Math.ceil(x + width + 2)) - left
  const cropHeight = Math.min(dimensions[1], Math.ceil(y + height + 2)) - top
  encode(input, 'decor-' + key, ['-lossless', '-exact', '-crop', left, top, cropWidth, cropHeight], decorationOutput)
  crops[key] = [cropWidth / width * 100, cropHeight / height * 100,
    cropWidth === width ? 0 : (x - left) / (cropWidth - width) * 100,
    cropHeight === height ? 0 : (y - top) / (cropHeight - height) * 100].map(n => +n.toFixed(8))
}
writeFileSync(new URL('./decoration-crops.json', import.meta.url), '{\n' +
  Object.entries(crops).map(([key, value]) => `  "${key}": ${JSON.stringify(value)}`).join(',\n') + '\n}\n')
await import('./build-decoration-manifest.mjs')
