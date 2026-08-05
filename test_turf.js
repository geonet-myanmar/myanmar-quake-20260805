import * as turf from '@turf/turf';

const line = turf.lineString([[98.826188, 22.080303, 0.0], [99.355618, 22.218306, 0.0]]);
const pt = turf.point([94.52, 21.91]);

try {
  const len = turf.length(line, { units: 'kilometers' });
  console.log('Length:', len);
  const dist = turf.pointToLineDistance(pt, line, { units: 'kilometers' });
  console.log('Distance:', dist);
} catch (e) {
  console.error('Error:', e);
}
