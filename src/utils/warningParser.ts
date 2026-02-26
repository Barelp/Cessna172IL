export interface Coordinate {
    lat: string;
    lon: string;
    raw: string; // e.g. N3317 E03450
}

export interface DecodedWarning {
    type: string; // 'AIRMET' or 'SIGMET'
    number?: string;
    fir?: string; // e.g. LLLL TEL AVIV FIR
    validFrom?: string; // e.g. 260800
    validTo?: string; // e.g. 261200
    phenomenon?: string; // e.g. MOD ICE
    polygon: Coordinate[];
    flightLevels?: string; // e.g. FL070/140
    trend?: string; // e.g. NC (No Change), INTSF, WKN
    raw: string;
}

const formatCoord = (coordStr: string) => {
    // N3317 E03450
    const match = coordStr.match(/([NS])(\d{2})(\d{2})\s+([EW])(\d{3})(\d{2})/);
    if (!match) return coordStr;
    const [, latDir, latDeg, latMin, lonDir, lonDeg, lonMin] = match;
    return `${latDeg}°${latMin}'${latDir} ${lonDeg}°${lonMin}'${lonDir}`;
};

/**
 * Parses Israeli Area Warnings (AIRMET / SIGMET) and Aerodrome Warnings (AD WRNG).
 * Typically spread across multiple lines in the API.
 * Examples:
 * LLLL AIRMET 5 VALID 260800/261200 LLBD-
 * LLLL TEL AVIV FIR MOD ICE FCST WI N3317 E03450 ... FL070/140 NC=
 * 
 * LLIB AD WRNG 2 VALID 260800/261200
 * BKN CLD 500/2000FT FCST WKN=
 */
export const parseWarning = (lines: string[]): DecodedWarning => {
    const rawMsg = lines.join(' ');

    const result: DecodedWarning = {
        type: 'WARNING',
        polygon: [],
        raw: lines.join('\n')
    };

    // 1. Identify Type and Validity
    // e.g. LLLL AIRMET 5 VALID 260800/261200
    // or LLIB AD WRNG 2 VALID 260800/261200
    const headerMatch = rawMsg.match(/(AIRMET|SIGMET|AD\s+WRNG)(?:\s+(\w+))?\s+VALID\s+(\d{6})\/(\d{6})/);
    if (headerMatch) {
        result.type = headerMatch[1].replace(/\s+/g, ' '); // normalize AD WRNG spaces
        result.number = headerMatch[2];
        result.validFrom = headerMatch[3];
        result.validTo = headerMatch[4];
    }

    // 1.5 Identify AD (Aerodrome) specifically for AD WRNG
    if (result.type === 'AD WRNG') {
        const adMatch = rawMsg.match(/^([A-Z]{4})\s+AD\s+WRNG/);
        if (adMatch) result.fir = `Aerodrome: ${adMatch[1]}`;
    } else {
        // 2. Identify FIR (for AIRMET/SIGMET)
        // e.g. LLLL TEL AVIV FIR
        const firMatch = rawMsg.match(/([A-Z]{4}\s+[A-Z\s]+FIR)/);
        if (firMatch && !firMatch[1].includes('VALID')) {
            result.fir = firMatch[1].trim();
        }
    }

    // 3. Keep looking for phenomenon
    if (result.type === 'AD WRNG') {
        // Phenomenon for AD WRNG usually follows the VALID block on the next line
        const phenomMatch = rawMsg.match(/VALID\s+\d{6}\/\d{6}\s*(.*?)(?:FCST|OBS|=)/);
        if (phenomMatch && phenomMatch[1].trim()) {
            result.phenomenon = phenomMatch[1].trim();
        }
    } else {
        // Usually comes right after the FIR and before FCST WI or OBS WI
        const phenomMatch = rawMsg.match(/FIR\s+(.*?)\s+(?:FCST|OBS)\s+WI/);
        if (phenomMatch) {
            result.phenomenon = phenomMatch[1].trim();
        } else {
            // Fallback if FIR isn't caught exactly but we see FCST WI
            const phenomFallback = rawMsg.match(/(SIGMET|AIRMET).*?\s+(.*?)\s+(?:FCST|OBS)\s+WI/);
            if (phenomFallback) {
                result.phenomenon = phenomFallback[2].trim();
            }
        }
    }

    // 4. Extract Polygon Coordinates (WI N3317 E03450 - N3315...)
    const coordPattern = /([NS]\d{4}\s+[EW]\d{5})/g;
    let match;
    while ((match = coordPattern.exec(rawMsg)) !== null) {
        result.polygon.push({
            lat: match[1].split(/\s+/)[0],
            lon: match[1].split(/\s+/)[1],
            raw: match[1]
        });
    }

    // 5. Flight Levels
    // e.g. FL070/140 or SFC/FL100
    const flMatch = rawMsg.match(/(?:SFC\/FL\d{3}|FL\d{3}\/\d{3}|FL\d{3})/);
    if (flMatch) {
        result.flightLevels = flMatch[0];
    }

    // 6. Trend
    // e.g. NC, INTSF, WKN
    if (rawMsg.match(/\bNC\b/)) result.trend = 'No Change (NC)';
    else if (rawMsg.match(/\bINTSF\b/)) result.trend = 'Intensifying (INTSF)';
    else if (rawMsg.match(/\bWKN\b/)) result.trend = 'Weakening (WKN)';

    return result;
};

export const formatCoordinateStr = formatCoord;
