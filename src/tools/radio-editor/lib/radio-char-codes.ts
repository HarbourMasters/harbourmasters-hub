// Star Fox 64 radio message character encoding
// Ported from Starship source: sf64mesg.h MsgCharCode enum

// Control code names for non-printing characters
export const RADIO_CTRL_NAMES: Record<number, string> = {
  0x00: 'END',
  0x01: 'NWL',
  0x02: 'NP2',
  0x03: 'NP3',
  0x04: 'NP4',
  0x05: 'NP5',
  0x06: 'NP6',
  0x07: 'NP7',
  0x08: 'PRI0',
  0x09: 'PRI1',
  0x0A: 'PRI2',
  0x0B: 'PRI3',
  0x0C: 'SPC',
  0x0D: 'HSP',
  0x0E: 'QSP',
  0x0F: 'NXT',
};

// Special display chars (C-buttons, arrows)
const SPECIAL_DISPLAY: Record<number, string> = {
  0x10: '←', // C-Left
  0x11: '↑', // C-Up
  0x12: '→', // C-Right
  0x13: '↓', // C-Down
  0x14: '▲', // Up arrow
  0x15: '◀', // Left arrow
  0x16: '▼', // Down arrow
  0x17: '▶', // Right arrow
};


// Char code -> display character
const PRINTABLE_CHARS: Record<number, string> = {
  0x18: 'A', 0x19: 'B', 0x1A: 'C', 0x1B: 'D',
  0x1C: 'E', 0x1D: 'F', 0x1E: 'G', 0x1F: 'H',
  0x20: 'I', 0x21: 'J', 0x22: 'K', 0x23: 'L',
  0x24: 'M', 0x25: 'N', 0x26: 'O', 0x27: 'P',
  0x28: 'Q', 0x29: 'R', 0x2A: 'S', 0x2B: 'T',
  0x2C: 'U', 0x2D: 'V', 0x2E: 'W', 0x2F: 'X',
  0x30: 'Y', 0x31: 'Z',
  0x32: 'a', 0x33: 'b', 0x34: 'c', 0x35: 'd',
  0x36: 'e', 0x37: 'f', 0x38: 'g', 0x39: 'h',
  0x3A: 'i', 0x3B: 'j', 0x3C: 'k', 0x3D: 'l',
  0x3E: 'm', 0x3F: 'n', 0x40: 'o', 0x41: 'p',
  0x42: 'q', 0x43: 'r', 0x44: 's', 0x45: 't',
  0x46: 'u', 0x47: 'v', 0x48: 'w', 0x49: 'x',
  0x4A: 'y', 0x4B: 'z',
  0x4C: '!', 0x4D: '?', 0x4E: '-', 0x4F: ',',
  0x50: '.', 0x51: '0', 0x52: '1', 0x53: '2',
  0x54: '3', 0x55: '4', 0x56: '5', 0x57: '6',
  0x58: '7', 0x59: '8', 0x5A: '9',
  0x5B: "'", 0x5C: '(', 0x5D: ')', 0x5E: ':', 0x5F: '|',
  0x60: 'è', 0x61: 'é', 0x62: 'à', 0x63: 'ê',
  0x64: 'î', 0x65: 'ô', 0x66: 'ï', 0x67: 'û',
  0x68: 'ç', 0x69: 'â', 0x6A: 'ú', 0x6B: 'ü',
  0x6C: 'ö', 0x6D: 'ä', 0x6E: 'ß', 0x6F: 'Ü',
};

export function radioCharToDisplay(code: number): string {
  if (code === 0x0C) return ' ';
  if (SPECIAL_DISPLAY[code]) return SPECIAL_DISPLAY[code];
  if (PRINTABLE_CHARS[code]) return PRINTABLE_CHARS[code];
  return '';
}

const SPECIAL_NAMES: Record<number, string> = {
  0x10: 'CLEFT', 0x11: 'CUP', 0x12: 'CRIGHT', 0x13: 'CDOWN',
  0x14: 'UP', 0x15: 'LEFT', 0x16: 'DOWN', 0x17: 'RIGHT',
};

export function radioCharToName(code: number): string {
  if (RADIO_CTRL_NAMES[code]) return RADIO_CTRL_NAMES[code];
  if (SPECIAL_NAMES[code]) return SPECIAL_NAMES[code];
  const ch = PRINTABLE_CHARS[code];
  if (ch) return ch;
  return `0x${code.toString(16).toUpperCase().padStart(2, '0')}`;
}

// Reverse lookup: ASCII character -> radio char code
const ASCII_TO_RADIO: Record<string, number> = {};
for (const [codeStr, ch] of Object.entries(PRINTABLE_CHARS)) {
  ASCII_TO_RADIO[ch] = parseInt(codeStr);
}

export function asciiToRadioCode(ch: string): number | undefined {
  return ASCII_TO_RADIO[ch];
}

// Control codes insertable via toolbar
// SPC and NWL are handled transparently (space key = SPC, Enter = NWL)
export const INSERTABLE_CONTROLS = [
  { code: 0x08, name: 'PRI0', label: 'Priority 0 (lowest)', icon: 'P0' },
  { code: 0x09, name: 'PRI1', label: 'Priority 1', icon: 'P1' },
  { code: 0x0A, name: 'PRI2', label: 'Priority 2', icon: 'P2' },
  { code: 0x0B, name: 'PRI3', label: 'Priority 3 (highest)', icon: 'P3' },
  { code: 0x0D, name: 'HSP', label: 'Half Space', icon: ' ' },
  { code: 0x0E, name: 'QSP', label: 'Quarter Space', icon: ' ' },
  { code: 0x0F, name: 'NXT', label: 'Next Textbox', icon: '⇨' },
] as const;

// Special characters insertable via toolbar (C-buttons + arrows)
export const INSERTABLE_SPECIALS = [
  { code: 0x10, name: 'CLEFT', label: 'C-Left' },
  { code: 0x11, name: 'CUP', label: 'C-Up' },
  { code: 0x12, name: 'CRIGHT', label: 'C-Right' },
  { code: 0x13, name: 'CDOWN', label: 'C-Down' },
  { code: 0x14, name: 'UP', label: 'Arrow Up' },
  { code: 0x15, name: 'LEFT', label: 'Arrow Left' },
  { code: 0x16, name: 'DOWN', label: 'Arrow Down' },
  { code: 0x17, name: 'RIGHT', label: 'Arrow Right' },
] as const;

// Priority code to display label
export const PRIORITY_LABELS: Record<number, string> = {
  0x08: 'Priority 0 (lowest)',
  0x09: 'Priority 1',
  0x0A: 'Priority 2',
  0x0B: 'Priority 3 (highest)',
};

// RadioCharacterId -> display name
export const RADIO_CHARACTER_NAMES: Record<number, string> = {
  [-1]: 'Unknown', 0: 'Fox', 2: 'Static', 5: 'Fox (Red)',
  10: 'Falco', 15: 'Falco (Red)',
  20: 'Slippy', 25: 'Slippy (Red)',
  30: 'Peppy', 35: 'Peppy (Red)',
  40: 'Katt', 50: 'Andross', 55: 'Andross (Red)',
  60: 'James', 70: 'Gen. Pepper',
  80: 'Boss (Corneria)', 90: 'ROB 64', 95: 'ROB 64 (Red)',
  100: 'Boss (Meteo)', 110: 'Boss (Corneria 2)',
  120: 'Boss (Area 6)', 130: 'Boss (Zoness)',
  140: 'ROB 64 (Alt)', 150: 'Boss (Sector X)',
  160: 'Boss (Sector Y)', 170: 'Bill',
  180: 'Caiman (Area 6)', 190: 'Boss (Macbeth)',
  200: 'Wolf', 210: 'Pigma', 220: 'Leon', 230: 'Andrew',
  240: 'Wolf (Venom)', 250: 'Pigma (Venom)',
  260: 'Leon (Venom)', 270: 'Andrew (Venom)',
  300: 'ROB 64 (Title)', 310: 'Gen. Pepper (Title)',
  350: 'TR', 400: 'Fox (Expert)', 1000: '1000',
};

// Character entries for the avatar selector (unique characters only)
export const RADIO_CHARACTER_ENTRIES = [
  { id: -1, name: 'Unknown' },
  { id: 0, name: 'Fox' },
  { id: 5, name: 'Fox (Red)' },
  { id: 10, name: 'Falco' },
  { id: 15, name: 'Falco (Red)' },
  { id: 20, name: 'Slippy' },
  { id: 25, name: 'Slippy (Red)' },
  { id: 30, name: 'Peppy' },
  { id: 35, name: 'Peppy (Red)' },
  { id: 40, name: 'Katt' },
  { id: 50, name: 'Andross' },
  { id: 55, name: 'Andross (Red)' },
  { id: 60, name: 'James' },
  { id: 70, name: 'Gen. Pepper' },
  { id: 80, name: 'Boss (Corneria)' },
  { id: 90, name: 'ROB 64' },
  { id: 100, name: 'Boss (Meteo)' },
  { id: 110, name: 'Boss (Corneria 2)' },
  { id: 120, name: 'Boss (Area 6)' },
  { id: 130, name: 'Boss (Zoness)' },
  { id: 150, name: 'Boss (Sector X)' },
  { id: 160, name: 'Boss (Sector Y)' },
  { id: 170, name: 'Bill' },
  { id: 180, name: 'Caiman (Area 6)' },
  { id: 190, name: 'Boss (Macbeth)' },
  { id: 200, name: 'Wolf' },
  { id: 210, name: 'Pigma' },
  { id: 220, name: 'Leon' },
  { id: 230, name: 'Andrew' },
  { id: 300, name: 'ROB 64 (Title)' },
  { id: 310, name: 'Gen. Pepper (Title)' },
  { id: 350, name: 'TR' },
  { id: 400, name: 'Fox (Expert)' },
] as const;

// Message ID -> RadioCharacterId, extracted from:
// 1. Starship C source: Radio_PlayMessage(gMsg_ID_*, RCID_*) calls
// 2. Binary event scripts: EVOP_PLAY_MSG commands parsed from sf64.o2r
const MSG_ID_TO_CHAR_ID: Record<number, number> = {
  // Title messages (fox_title.c)
  10: 310, 20: 310, 30: 310, 40: 310, 50: 310, 60: 300,
  // Briefing messages (fox_map.c) — sBriefingMsg[planet][0]=Falco, [1]=Slippy
  1200: 10, 1210: 20, 1220: 10, 1230: 20, 1240: 10, 1250: 20,
  1260: 10, 1270: 20, 1280: 10, 1290: 20, 1300: 10, 1310: 20,
  1320: 10, 1330: 20, 1340: 10, 1350: 20, 1360: 10, 1370: 20,
  1380: 10, 1390: 20, 1400: 10, 1410: 20, 1420: 10, 1430: 20,
  1440: 10, 1450: 20, 1460: 10, 1470: 20,
  // In-game radio messages (C source)
  2005: 0, 2010: 0, 2020: 10, 2030: 30, 2040: 20, 2050: 0,
  // In-game radio messages (event scripts — Corneria)
  2055: 0, 2058: 10, 2061: 30, 2062: 20,
  2090: 10, 2095: 10, 2110: 30, 2115: 30, 2118: 30,
  2140: 30, 2165: 10, 2166: 10, 2167: 10,
  2180: 10, 2181: 10, 2185: 0, 2188: 10,
  2200: 20, 2210: 10,
  2220: 80, 2225: 20, 2230: 30, 2233: 10, 2240: 80, 2250: 80, 2260: 80,
  2263: 80, 2265: 80,
  2270: 80, 2275: 80, 2280: 80, 2282: 30, 2290: 110, 2291: 110, 2292: 110,
  2293: 110, 2294: 110, 2295: 0, 2296: 110, 2298: 30, 2299: 30, 2300: 20,
  2305: 20, 2310: 30, 2320: 10, 2335: 0,
  2336: 20, 2337: 10,
  // Meteo (event scripts)
  3005: 20, 3010: 30, 3015: 0,
  3020: 20, 3025: 30, 3026: 30, 3040: 30, 3041: 30, 3042: 20, 3050: 30,
  3100: 10, 3110: 20, 3120: 20,
  3300: 100, 3310: 100, 3315: 30, 3320: 100, 3321: 100, 3322: 100,
  3330: 100, 3340: 10, 3345: 100, 3350: 100, 3360: 0, 3370: 100, 3371: 100,
  // Titania (event scripts)
  4010: 0, 4011: 90, 4012: 30, 4013: 10,
  4020: 10, 4021: 10, 4022: 0, 4023: 10, 4024: 30,
  4030: 30, 4031: 10, 4040: 30, 4050: 30, 4075: 30,
  4080: 30, 4082: 0, 4083: 10,
  4091: 30, 4092: 20, 4093: 20, 4094: 10, 4095: 30, 4096: 10, 4097: 10,
  4098: 20, 4099: 10, 4100: 20, 4101: 10, 4102: 30, 4103: 0, 4110: 20,
  4111: 20, 4112: 20, 4113: 0,
  // Sector X (event scripts)
  5000: 0, 5010: 10, 5050: 30, 5060: 10, 5100: 30, 5110: 10, 5130: 10,
  5220: 30, 5230: 30,
  5300: 10, 5310: 10, 5311: 170, 5312: 0, 5313: 170, 5314: 170,
  5350: 10, 5360: 10, 5380: 10,
  5400: 30, 5410: 20, 5420: 30, 5430: 30, 5460: 30, 5470: 10,
  5473: 0, 5474: 10, 5475: 20,
  5492: 150, 5493: 150, 5494: 150, 5495: 150, 5496: 0, 5497: 150,
  5498: 150, 5499: 150, 5500: 0, 5501: 30, 5502: 10, 5503: 90, 5504: 10,
  5505: 0, 5506: 20,
  // Zoness (event scripts)
  6010: 0, 6011: 30, 6012: 20, 6013: 10, 6014: 10,
  6020: 20, 6021: 10, 6024: 0,
  6025: 40, 6026: 10, 6027: 40, 6028: 20, 6029: 40,
  6030: 0, 6036: 30, 6038: 30,
  6041: 40, 6042: 40, 6045: 10,
  6050: 10, 6051: 10, 6055: 20,
  6066: 30, 6067: 20,
  6068: 130, 6069: 130, 6071: 130, 6072: 130, 6073: 130, 6074: 130,
  6075: 130, 6076: 130, 6077: 130, 6078: 130, 6079: 130, 6080: 30,
  6081: 30, 6082: 30, 6090: 130, 6100: 30, 6101: 10,
  // Area 6 (event scripts)
  7005: 180, 7006: 180,
  7011: 10, 7012: 0, 7013: 30, 7014: 20,
  7020: 10, 7043: 0,
  7050: 20, 7051: 30, 7052: 120, 7053: 180, 7054: 90,
  7061: 20, 7064: 10, 7065: 10, 7066: 30, 7070: 20,
  7083: 30, 7084: 30, 7085: 10, 7086: 20, 7087: 30, 7093: 0,
  7094: 120, 7095: 180, 7096: 180, 7097: 120, 7098: 120, 7099: 180,
  7100: 10,
  // Venom (event scripts)
  8010: 0, 8020: 10, 8030: 30, 8040: 20, 8045: 10,
  8050: 10, 8060: 10, 8070: 30, 8080: 20,
  8100: 10, 8110: 20, 8120: 20, 8130: 30, 8140: 10,
  8205: 0, 8210: 30, 8215: 0, 8220: 30, 8230: 10, 8240: 20,
  8250: 55, 8255: 55, 8260: 55, 8265: 55,
  8300: 30, 8310: 20, 8320: 10,
  // All-range / Star Wolf (C source)
  9000: 0, 9010: 20,
  9100: 10, 9110: 20, 9120: 30,
  9130: 10, 9140: 20, 9150: 30,
  9151: 10, 9152: 20, 9153: 30,
  9160: 10, 9170: 20, 9180: 30,
  9190: 10, 9200: 20, 9210: 30, 9211: 10, 9212: 20, 9213: 30,
  9220: 10, 9230: 20, 9240: 30,
  9250: 200, 9260: 220, 9270: 210, 9275: 210, 9280: 230, 9285: 0,
  9289: 200, 9290: 200,
  9300: 220, 9310: 210, 9320: 230,
  9322: 200, 9323: 220, 9324: 210, 9325: 230,
  9330: 200, 9340: 220, 9350: 210, 9360: 230,
  9365: 200, 9366: 220, 9367: 210, 9368: 230, 9369: 200,
  9375: 90, 9380: 0, 9385: 0, 9390: 90, 9395: 90, 9400: 90, 9405: 90,
  9411: 0, 9420: 0, 9425: 20, 9426: 30, 9427: 10, 9428: 20, 9429: 30,
  9430: 10, 9431: 200, 9432: 220, 9433: 210, 9434: 230,
  9436: 20, 9437: 30, 9438: 10,
  // Solar (event scripts)
  10010: 0, 10020: 10, 10040: 30, 10050: 30,
  10060: 20, 10070: 20, 10080: 20,
  10200: 170, 10210: 0, 10220: 170, 10230: 170, 10255: 30,
  10300: 30, 10310: 10, 10320: 30, 10321: 10, 10322: 10, 10323: 20, 10324: 30,
  // Sector Y (event scripts)
  11010: 0, 11020: 30, 11030: 10, 11040: 20, 11050: 0, 11060: 10,
  11100: 200, 11110: 220, 11120: 210, 11130: 230,
  11150: 30, 11160: 30, 11200: 0, 11210: 20, 11220: 10, 11230: 30,
  11240: 20, 11241: 0,
  // Sector Y / Expert voice test (event scripts)
  14020: 0, 14030: 10, 14040: 30, 14045: 20, 14050: 30,
  14060: 10, 14070: 30, 14080: 10,
  14100: 30, 14110: 30, 14120: 30, 14130: 10,
  14140: 20, 14150: 20, 14160: 20, 14170: 10,
  14180: 30, 14190: 20,
  // Expert sound test (C source)
  14200: 10, 14210: 30, 14220: 20, 14230: 30,
  14300: 160, 14310: 160, 14320: 160, 14330: 160, 14340: 160, 14350: 160,
  14360: 160, 14370: 0,
  // Aquas (event scripts)
  15010: 0, 15030: 0, 15040: 30, 15045: 20,
  15050: 20, 15051: 30, 15052: 10, 15053: 20, 15054: 30, 15060: 20,
  15100: 0, 15110: 30, 15120: 20, 15130: 10, 15140: 30,
  15200: 0, 15210: 30, 15220: 20, 15230: 10, 15240: 20,
  15250: 10, 15251: 20, 15252: 20, 15253: 0,
  // Katina (C source)
  16010: 90, 16020: 0, 16030: 10, 16040: 10, 16046: 30, 16047: 20,
  16050: 90, 16055: 90, 16060: 0, 16080: 90, 16085: 90, 16090: 90,
  16100: 90, 16110: 90, 16120: 40, 16125: 10, 16130: 40, 16135: 40,
  16140: 40, 16150: 40, 16160: 40, 16165: 40, 16170: 10, 16175: 30,
  16180: 20, 16185: 40, 16200: 0, 16210: 90, 16220: 10, 16230: 30,
  16240: 20, 16250: 90, 16260: 10, 16270: 30, 16280: 20,
  // Macbeth (event scripts)
  17010: 0, 17020: 10, 17030: 30,
  17100: 10, 17110: 30, 17120: 30,
  17130: 40, 17131: 10, 17140: 40,
  17150: 30, 17160: 30, 17170: 30,
  17300: 40, 17310: 30, 17320: 10, 17330: 20, 17350: 40,
  17360: 190, 17370: 190, 17380: 190, 17390: 190,
  17400: 190, 17410: 190, 17420: 190, 17430: 190, 17440: 190,
  17450: 190, 17460: 190, 17470: 190, 17471: 190, 17472: 190,
  17473: 190, 17474: 20, 17475: 190, 17476: 190,
  // Fortuna / Bill (C source)
  18000: 170, 18005: 170, 18006: 0, 18007: 170, 18010: 20, 18015: 170,
  18018: 170,
  18020: 170, 18021: 170, 18022: 170, 18025: 10,
  18030: 170, 18031: 170, 18035: 10, 18040: 170, 18045: 170, 18050: 170,
  18055: 170, 18060: 170, 18065: 170, 18066: 170, 18070: 170, 18075: 0, 18080: 0,
  18085: 30, 18090: 170, 18095: 0, 18100: 170, 18105: 0,
  18120: 170, 18150: 30,
  // Venom approach / Andross (C source)
  19010: 0, 19200: 200, 19205: 0, 19210: 220, 19220: 210, 19230: 230,
  19240: 0, 19250: 10, 19325: 55, 19330: 55, 19335: 55,
  19340: 60, 19350: 0, 19355: 60, 19360: 60, 19370: 60,
  19400: 30, 19410: 20, 19420: 10, 19430: 30, 19440: 0,
  19450: 200, 19451: 220, 19452: 210, 19453: 230,
  19454: 200, 19455: 220, 19456: 210, 19457: 230,
  19458: 200, 19459: 220, 19460: 210, 19461: 230,
  19462: 10, 19463: 20, 19464: 30,
  19465: 0, 19466: 0, 19468: 60,
  // Multiplayer / shared (C source + event scripts)
  20010: 0, 20011: 20, 20012: 30, 20013: 20, 20014: 30, 20015: 20,
  20016: 30, 20017: 10, 20018: 10, 20019: 10,
  20030: 10, 20040: 30, 20050: 20, 20060: 10, 20070: 30, 20080: 20,
  20084: 40, 20085: 170,
  20090: 10, 20091: 30, 20092: 20,
  20150: 20, 20160: 30, 20170: 10,
  20180: 0, 20190: 20, 20200: 30, 20210: 10,
  20220: 10, 20221: 30, 20222: 20, 20230: 90,
  20235: 30, 20236: 30, 20237: 30, 20238: 30, 20239: 30,
  20250: 10, 20260: 20, 20261: 30, 20262: 10, 20263: 20,
  20266: 0, 20267: 30, 20269: 30, 20271: 10, 20272: 20,
  20273: 55, 20274: 55, 20275: 55, 20276: 55, 20277: 55, 20278: 90,
  20280: 10, 20281: 30, 20282: 20,
  20283: 30, 20290: 30,
  20294: 0, 20296: 30, 20297: 20, 20298: 10, 20299: 30, 20300: 20,
  20301: 10, 20302: 20, 20303: 10, 20304: 30, 20305: 20, 20306: 10, 20307: 30,
  20308: 20, 20309: 10, 20310: 10, 20311: 20, 20312: 30,
  20313: 20, 20314: 30,
  20315: 10, 20316: 20, 20317: 30, 20318: 0,
  20319: 10, 20320: 20, 20321: 30,
  20326: 90, 20327: 90, 20328: 90, 20329: 90,
  20330: 90, 20331: 90, 20332: 90, 20333: 90, 20337: 90,
  20338: 90, 20339: 90, 20340: 90, 20343: 90, 20344: 90, 20345: 90,
  // Training mode messages (fox_tr360.c — all use RCID_TR)
  21010: 310, 21020: 310, 21030: 0, 21050: 300, 21060: 0,
  // Expert teammate directions (pattern: 70=Falco, 80=Slippy, 90=Peppy)
  21070: 10, 21071: 10, 21072: 10, 21073: 10,
  21080: 20, 21081: 20, 21082: 20, 21083: 20,
  21090: 30, 21091: 30, 21092: 30, 21093: 30,
  // Star Wolf / villain taunts
  22000: 200, 22001: 210, 22002: 220, 22003: 230,
  22004: 200, 22005: 200, 22006: 230, 22007: 210,
  22008: 220, 22009: 220, 22010: 200, 22011: 200,
  23000: 350, 23001: 350, 23002: 350, 23003: 350, 23004: 350, 23005: 350,
  23006: 350, 23007: 350, 23008: 350, 23009: 350, 23010: 350, 23011: 350,
  23012: 350, 23013: 350, 23014: 350, 23015: 350, 23016: 350, 23017: 350,
  23018: 350, 23019: 350, 23020: 350, 23021: 350, 23022: 350,
  23023: 350, 23024: 350, 23025: 350, 23026: 350, 23027: 350,
  23028: 350, 23029: 350, 23030: 350, 23031: 350, 23032: 350,
};

export function getCharacterIdForMessage(msgId: number): number | undefined {
  return MSG_ID_TO_CHAR_ID[msgId];
}

/**
 * For briefing messages, the internal RCID doesn't match the visual speaker.
 * RCID 10 (Falco) drives Pepper's face, RCID 20 (Slippy) drives Fox's panel.
 */
export function getBriefingSpeakerName(characterId: number): string | null {
  if (characterId === 10) return 'Gen. Pepper';
  if (characterId === 20) return 'Fox';
  return null;
}

/**
 * For briefing messages, the portrait RCID differs from the internal one.
 * characterId 10 → Pepper (70/71), characterId 20 → Fox (0/1)
 */
export function getBriefingPortraitRcid(characterId: number): number {
  if (characterId === 10) return 70;
  if (characterId === 20) return 0;
  return characterId;
}
