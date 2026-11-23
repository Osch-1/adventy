// One illustrated atlas, 8 columns × 4 rows. Tile 32 is reserved; task rooms never repeat.
export function roomTile(day) {
  if (!Number.isInteger(day) || day < 1 || day > 31) throw new RangeError('Expected a December task day')
  const index = day - 1
  return { row: Math.floor(index / 8), column: index % 8 }
}
