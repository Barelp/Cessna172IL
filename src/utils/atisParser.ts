export interface RunwayWind {
    rwy: string;
    direction: string;
    speed: string;
    max?: string;
    min?: string;
}

export interface DecodedAtis {
    station: string;
    time: string;
    isAuto: boolean;
    generalWind?: {
        direction: string;
        speed: string;
        gust?: string;
    };
    runwayWinds: RunwayWind[];
    visibility?: string;
    cavok: boolean;
    clouds: string[];
    temperature?: string;
    dewPoint?: string;
    qnh?: string;
    trend?: string;
    raw: string;
}

/**
 * Parses Israeli ATIS / MET_REP strings (and general ATIS formats).
 * Example: MET_REP LLBG 260920Z WIND RWY 08 TDZ 280/19KT RWY 12 TDZ 280/19KT MAX24 MNM8 VIS 10KM CLD SCT 4000FT T18 DP08 QNH 1016HPA TREND TEMPO VIS 8KM MOD RA
 */
export const parseAtis = (rawMsg: string): DecodedAtis => {
    const result: DecodedAtis = {
        station: '',
        time: '',
        isAuto: false,
        runwayWinds: [],
        clouds: [],
        cavok: false,
        raw: rawMsg,
    };

    // 1. Station and Time
    // e.g. MET_REP LLBG 260920Z
    const stationMatch = rawMsg.match(/(?:MET_REP|ATIS)\s+([A-Z]{4})\s+(\d{6}Z)/);
    if (stationMatch) {
        result.station = stationMatch[1];
        result.time = stationMatch[2];
    }

    if (rawMsg.includes(' AUTO ')) {
        result.isAuto = true;
    }

    if (rawMsg.includes(' CAVOK ')) {
        result.cavok = true;
    }

    // 2. Wind parsing
    // Check for general wind first: e.g. WIND 270/14KT
    // But be careful not to match 'WIND RWY...'
    const generalWindMatch = rawMsg.match(/WIND\s+(\d{3}|VRB)\/(\d{2,3})(?:G(\d{2,3}))?KT(?!\s+RWY)/);
    if (generalWindMatch) {
        result.generalWind = {
            direction: generalWindMatch[1],
            speed: generalWindMatch[2],
            gust: generalWindMatch[3]
        };
    }

    // Check for runway specific winds
    // e.g. RWY 08 TDZ 280/19KT MAX24 MNM8
    const rwyWindRegex = /RWY\s+(\d{2}[LRC]?)\s+(?:TDZ\s+)?(\d{3}|VRB)\/(\d{2,3})KT(?:\s+MAX(\d{2,3}))?(?:\s+MNM(\d{2,3}))?/g;
    let match;
    while ((match = rwyWindRegex.exec(rawMsg)) !== null) {
        result.runwayWinds.push({
            rwy: match[1],
            direction: match[2],
            speed: match[3],
            max: match[4],
            min: match[5]
        });
    }

    // 3. Visibility
    // e.g. VIS 10KM or VIS 8000M
    const visMatch = rawMsg.match(/VIS\s+(\d+(?:KM|M))/);
    if (visMatch) {
        result.visibility = visMatch[1];
    }

    // 4. Clouds
    // e.g. CLD SCT 4000FT BKN 5000FT
    // We look for the CLD keyword and then capture everything until the next known keyword (like T, DP, QNH, TREND)
    const cldMatch = rawMsg.match(/CLD\s+((?:(?:FEW|SCT|BKN|OVC|NSC|CB|TCU)\s*(?:\d{3,4}FT)?\s*)+)/);
    if (cldMatch) {
        result.clouds = cldMatch[1].trim().split(/\s+(?=(?:FEW|SCT|BKN|OVC|NSC))/);
    }

    // 5. Temp and Dewpoint
    // e.g. T18 DP08 or T18 DP M01
    const tempMatch = rawMsg.match(/T(M?\d{2})\s+DP(M?\d{2})/);
    if (tempMatch) {
        result.temperature = tempMatch[1].replace('M', '-');
        result.dewPoint = tempMatch[2].replace('M', '-');
    }

    // 6. QNH
    // e.g. QNH 1016HPA
    const qnhMatch = rawMsg.match(/QNH\s+(\d{4})(?:HPA)?/);
    if (qnhMatch) {
        result.qnh = qnhMatch[1];
    }

    // 7. Trend
    // e.g. TREND TEMPO VIS 8KM MOD RA
    const trendMatch = rawMsg.match(/TREND\s+(.+)$/);
    if (trendMatch) {
        result.trend = trendMatch[1].trim();
    }

    return result;
};
