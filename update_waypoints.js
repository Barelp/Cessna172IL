const fs = require('fs');

const csv = fs.readFileSync('src/data/waypoints.csv', 'utf8');
const lines = csv.split('\n').filter(l => l.trim() && !l.startsWith('5 Letter'));

function parseDMS(dmsStr) {
  const match = dmsStr.match(/(\d+)°\s*(\d+)'\s*(\d+)/);
  if (!match) return 0;
  const d = parseInt(match[1]);
  const m = parseInt(match[2]);
  const s = parseInt(match[3]);
  return d + m/60 + s/3600;
}

const waypoints = lines.map(line => {
    // Use regex to parse CSV nicely: code,"lat","lon",type,name
    // or sometimes no quotes if missing.
    // Let's just match the pattern.
    const re = /^([^,]+),"(.*?)","(.*?)",([^,]+),(.+)$/;
    const m = line.match(re);
    
    if (m) {
        return {
            code: m[1].trim(),
            lat: parseDMS(m[2]),
            lon: parseDMS(m[3]),
            name: m[5].trim()
        };
    } else {
        const parts = line.split(',');
        if (parts.length >= 5) {
            return {
                code: parts[0].trim(),
                lat: parseDMS(parts[1]),
                lon: parseDMS(parts[2]),
                name: parts[4].trim()
            };
        }
    }
    return null;
}).filter(Boolean);

let out = `export interface Waypoint {
    code: string;
    name: string;
    lat: number;
    lon: number;
}

export const waypoints: Waypoint[] = [\n`;

waypoints.forEach(wp => {
    out += `    { code: '${wp.code}', name: '${wp.name}', lat: ${wp.lat.toFixed(6)}, lon: ${wp.lon.toFixed(6)} },\n`;
});
out += `];\n`;

fs.writeFileSync('src/data/waypoints.ts', out);
console.log('Done!');
