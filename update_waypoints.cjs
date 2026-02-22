const fs = require('fs');

const csv = fs.readFileSync('src/data/waypoints.csv', 'utf8');
const lines = csv.split('\n').filter(l => l.trim() && !l.startsWith('5 Letter'));

function parseDMS(dmsStr) {
    const match = dmsStr.match(/(\d+)°\s*(\d+)'\s*(\d+)/);
    if (!match) return 0;
    const d = parseInt(match[1]);
    const m = parseInt(match[2]);
    const s = parseInt(match[3]);
    return d + m / 60 + s / 3600;
}

const waypoints = lines.map(line => {
    // using a straightforward CSV regex matcher taking quotes into account
    // code,"lat","lon",type,name
    // e.g. ZLHAV,"31° 22' 21"" N","34° 47' 36"" E",חובה,צומת להבים
    const parts = [];
    let curr = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && line[i + 1] === '"') {
            curr += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            parts.push(curr);
            curr = '';
        } else {
            curr += char;
        }
    }
    parts.push(curr);

    return {
        code: parts[0].trim(),
        lat: parseDMS(parts[1]),
        lon: parseDMS(parts[2]),
        name: parts[4] ? parts[4].trim() : ''
    };
}).filter(Boolean);

let out = `export interface Waypoint {
    code: string;
    name: string;
    lat: number;
    lon: number;
}

export const waypoints: Waypoint[] = [
`;

waypoints.forEach(wp => {
    out += `    { code: '${wp.code}', name: '${wp.name}', lat: ${wp.lat.toFixed(6)}, lon: ${wp.lon.toFixed(6)} },\n`;
});
out += `];\n`;

fs.writeFileSync('src/data/waypoints.ts', out);
console.log('Done!');
