// Apertures in the 1672 × 941 painted facade. Trim, halls and story shutters are on the base layer.
const rows = [
  { days:[1,2,3,4,5,6,7], x:[265,439,614,798,979,1165,1350], y:183, width:81, height:81 },
  { days:[8,9,10,11,12,13,14], x:[239,377,638,770,1150,1291,1426], y:322, width:81, height:84 },
  { days:[15,16,17,18,19,20,21], x:[238,376,509,639,770,1291,1426], y:449, width:81, height:85 },
  { days:[22,23,24,25,26,27,28], x:[238,376,509,639,1150,1291,1426], y:580, width:81, height:83 },
  { days:[29,30,31], x:[238,376,509], y:700, width:81, height:68 },
]

export const taskWindows = rows.flatMap(row => row.days.map((day, i) => ({
  day, x:row.x[i], y:row.y, width:row.width, height:row.height,
  style:{ left:`${row.x[i] / 1672 * 100}%`, top:`${row.y / 941 * 100}%`,
    width:`${row.width / 1672 * 100}%`, height:`${row.height / 941 * 100}%` },
})))

export const decorativeWindows = [
  { kind:'story', after:9, side:'left', x:509, y:322 },
  { kind:'hall', x:927, y:322 },
  { kind:'hall', x:927, y:449 },
  { kind:'story', after:19, side:'right', x:1150, y:449 },
]
