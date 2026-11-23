const gardenImage = 'winter-natural-garden-v3.png'
const facadeImage = 'winter-natural-facade-v3.png'
const detailsImage = 'winter-natural-details-v3.png'
const hallInteriorsImage = 'winter-hall-interiors-v4.png'
const groundContactImage = 'winter-ground-contact-v4.png'
const treeOverlayImage = 'winter-tree-overlay-v4.png'
const lostMittensImage = 'lost-mittens-snow-v5.png'
const entranceImage = 'winter-entrance-tracks-v5.png'
const hallAndSackImage = 'winter-hall-and-sack-v6.png'

export const houseWidth = 1672
export const houseHeight = 941
export const mittensDay = 15
const tracksRegion = [860, 795, 140, 146]

function paintMask(viewBox, shapes, blur) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.join(' ')}" preserveAspectRatio="none"><defs><filter id="soft"><feGaussianBlur stdDeviation="${blur}"/></filter></defs><g fill="white" filter="url(#soft)">${shapes}</g></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const trackMarks = [
  [924, 825, 7, 3], [923, 832, 5, 4], [922, 837, 7, 3],
  [918, 842, 4, 2], [926, 839, 4, 2], [927, 845, 5, 2],
  [916, 848, 6, 3], [927, 851, 6, 3], [914, 857, 7, 4],
  [928, 864, 8, 5], [909, 866, 10, 5], [927, 874, 9, 7],
  [900, 887, 14, 9], [926, 901, 15, 11], [892, 922, 18, 16],
  [930, 944, 22, 15],
]
const tracksMask = paintMask(tracksRegion,
  '<path d="M863 802Q924 805 994 801L994 825Q925 826 863 826Z"/>' +
  trackMarks.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join(''), 2.5)
const sackSource = [1323, 800, 103, 86]
const sackMask = paintMask(sackSource,
  '<path d="M1330 845Q1331 830 1349 824Q1342 813 1352 807Q1375 799 1394 807Q1400 815 1392 823Q1413 825 1417 849Q1424 859 1420 871Q1407 883 1377 879Q1342 883 1325 866Q1323 856 1330 845Z"/>', 3)
const hallTreeRegion = [930, 327, 117, 103]
const hallTreeMask = paintMask(hallTreeRegion,
  '<path d="M964 348Q969 345 974 349L976 369L988 413Q987 423 985 429L952 429Q947 420 952 406L960 371Z"/>', 2)

// Each rectangle includes the contact shadow or light from the painted object.
export const paintedRegions = {
  0: { image:entranceImage, front:true, region:[900, 524, 50, 50], hit:[925, 548, 44, 46], clip:'polygon(50% 0, 63% 31%, 98% 34%, 72% 58%, 81% 94%, 50% 75%, 19% 94%, 28% 58%, 2% 34%, 37% 31%)' },
  1: { region:[28, 454, 132, 174], hit:[94, 535, 88, 116] },
  2: { region:[300, 750, 280, 181], hit:[450, 843, 147, 116] },
  3: { region:[1068, 643, 308, 282], hit:[1220, 782, 190, 220] },
  4: { image:gardenImage, region:[1604, 389, 68, 139], hit:[1640, 463, 46, 95] },
  5: { image:gardenImage, region:[1578, 526, 94, 225], hit:[1632, 641, 65, 175] },
  6: { image:gardenImage, region:[32, 68, 176, 181], hit:[115, 156, 137, 140] },
  7: { image:entranceImage, region:[140, 607, 55, 67], hit:[167, 640, 43, 49] },
  8: { image:gardenImage, region:[401, 817, 129, 99], hit:[464, 860, 91, 67] },
  9: { image:gardenImage, region:[328, 760, 59, 71], hit:[355, 798, 45, 51] },
  10: { image:hallAndSackImage, source:sackSource, region:[1399, 800, 103, 86], hit:[1451, 838, 75, 62], mask:sackMask },
  11: { image:hallInteriorsImage, region:[930, 463, 116, 75], hit:[989, 475, 97, 25], frame:'lower' },
  12: { image:facadeImage, region:[1520, 451, 59, 79], hit:[1550, 490, 43, 56] },
  13: { image:treeOverlayImage, alpha:true, source:[8, 664, 54, 116], region:[5, 332, 32, 69], hit:[21, 369, 27, 60] },
  14: { image:hallAndSackImage, source:[921, 327, 117, 103], region:hallTreeRegion, hit:[969, 390, 34, 74], mask:hallTreeMask, frame:'upper' },
  [mittensDay]: { image:lostMittensImage, alpha:true, local:true, region:[817, 876, 108, 36], hit:[871, 894, 98, 30] },
  16: { image:gardenImage, region:[588, 812, 154, 99], hit:[663, 866, 121, 65] },
  17: { image:entranceImage, region:[838, 575, 177, 225], hit:[925, 610, 153, 66] },
  18: { image:detailsImage, region:[1415, 762, 65, 56], hit:[1445, 789, 45, 35] },
  19: { image:treeOverlayImage, alpha:true, source:[45, 257, 43, 104], region:[47, 253, 30, 73], hit:[62, 312, 25, 25] },
  20: { image:facadeImage, region:[142, 448, 51, 77], hit:[168, 487, 38, 49] },
  21: { image:gardenImage, region:[1306, 842, 100, 69], hit:[1355, 879, 80, 39] },
  22: { image:gardenImage, region:[108, 202, 39, 107], hit:[127, 288, 29, 32] },
  23: { image:treeOverlayImage, alpha:true, source:[1538, 696, 120, 85], region:[1584, 651, 77, 55], hit:[1622, 683, 71, 43] },
  24: { image:detailsImage, region:[1195, 669, 45, 45], hit:[1217, 691, 27, 29] },
  25: { image:gardenImage, region:[534, 768, 60, 66], hit:[565, 803, 42, 44] },
  26: { image:groundContactImage, region:[363, 801, 190, 67], hit:[458, 836, 178, 51] },
  27: { image:gardenImage, region:[1080, 762, 49, 71], hit:[1104, 800, 31, 48] },
  28: { image:groundContactImage, region:[898, 737, 46, 54], hit:[921, 763, 32, 39] },
  29: { image:facadeImage, region:[1488, 90, 101, 102], hit:[1542, 140, 71, 71] },
  30: { image:gardenImage, region:[1574, 223, 28, 86], hit:[1588, 288, 23, 30] },
  31: { region:[103, 247, 1491, 88], hit:[858, 291, 1420, 40] },
}

export const houseDetails = {
  tracks: { image:entranceImage, region:tracksRegion, canvas:[1670, 942], mask:tracksMask },
  canopy: { image:entranceImage, region:[762, 514, 322, 102],
    clip:'polygon(2.5% 68.6%, 7.5% 52%, 46.3% 5.9%, 50.9% 2%, 55% 5.9%, 94.7% 52.9%, 98.8% 68.6%, 97.2% 85.3%, 84.8% 86.3%, 81.4% 74.5%, 52.5% 34.3%, 50% 32.4%, 45.7% 35.3%, 15.8% 77.5%, 12.7% 89%, 3.4% 85.3%)' },
}
