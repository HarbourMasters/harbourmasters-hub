import type { O2RReader } from './o2r-reader';

export type GameVersion = 'soh' | '2ship' | 'unknown';
export type Region = 'pal' | 'ntsc-u' | 'ntsc-j' | 'unknown';

export interface DetectedGame {
  version: GameVersion;
  region: Region;
  languages: string[];
  textPaths: Record<string, string>;
  texturePaths: {
    backgrounds: Record<string, string>;
    indicators: Record<string, string>;
    font: string[];
  };
}

const SOH_TEXT_PATHS: Record<string, string> = {
  en: 'text/nes_message_data_static/nes_message_data_static',
  de: 'text/ger_message_data_static/ger_message_data_static',
  fr: 'text/fra_message_data_static/fra_message_data_static',
  ja: 'text/jpn_message_data_static/jpn_message_data_static',
  credits: 'text/staff_message_data_static/staff_message_data_static',
};

const SOH_TEXTURE_PATHS = {
  backgrounds: {
    black: 'textures/message_static/gDefaultMessageBackgroundTex',
    wooden: 'textures/message_static/gSignMessageBackgroundTex',
    blue: 'textures/message_static/gNoteStaffMessageBackgroundTex',
    fading: 'textures/message_static/gFadingMessageBackgroundTex',
  },
  indicators: {
    arrow: 'textures/message_static/gMessageArrowTex',
    triangle: 'textures/message_static/gMessageContinueTriangleTex',
    square: 'textures/message_static/gMessageEndSquareTex',
  },
  font: [
    'textures/nes_font_static',
  ],
};

export function detectGame(reader: O2RReader): DetectedGame {
  const allPaths = reader.files.map(f => f.path);

  // Detect game version
  const hasSoh = allPaths.some(p => p.includes('nes_message_data_static'));
  const has2Ship = allPaths.some(p => p.includes('j_message'));

  const version: GameVersion = has2Ship ? '2ship' : hasSoh ? 'soh' : 'unknown';

  // Detect available languages and region
  const availableLanguages: string[] = [];
  const availableTextPaths: Record<string, string> = {};

  for (const [lang, path] of Object.entries(SOH_TEXT_PATHS)) {
    if (lang === 'credits') continue;
    // Check if the base path exists or if any file starts with it
    if (reader.hasFile(path) || reader.findFiles(path.replace(/\/[^/]+$/, '')).length > 0) {
      availableLanguages.push(lang);
      availableTextPaths[lang] = path;
    }
  }

  // Credits
  if (reader.hasFile(SOH_TEXT_PATHS.credits) || reader.findFiles('text/staff_message_data_static').length > 0) {
    availableTextPaths.credits = SOH_TEXT_PATHS.credits;
  }

  let region: Region = 'unknown';
  if (availableLanguages.includes('de') || availableLanguages.includes('fr')) {
    region = 'pal';
  } else if (availableLanguages.includes('ja')) {
    region = 'ntsc-j';
  } else if (availableLanguages.includes('en')) {
    region = 'ntsc-u';
  }

  // Check for NTSC NES alt path
  if (!availableTextPaths.en) {
    const altNes = 'text/nes_message_data_static/ntsc_nes_message_data_static';
    if (reader.hasFile(altNes) || reader.findFiles('text/nes_message_data_static').length > 0) {
      availableLanguages.push('en');
      availableTextPaths.en = altNes;
    }
  }

  // Verify texture paths exist
  const resolvedBackgrounds: Record<string, string> = {};
  for (const [key, path] of Object.entries(SOH_TEXTURE_PATHS.backgrounds)) {
    if (allPaths.some(p => p.includes(path) || p === path)) {
      resolvedBackgrounds[key] = path;
    }
  }

  const resolvedIndicators: Record<string, string> = {};
  for (const [key, path] of Object.entries(SOH_TEXTURE_PATHS.indicators)) {
    if (allPaths.some(p => p.includes(path) || p === path)) {
      resolvedIndicators[key] = path;
    }
  }

  const resolvedFont = allPaths.filter(p =>
    p.startsWith('textures/nes_font_static/') || p === 'textures/nes_font_static'
  );

  return {
    version,
    region,
    languages: availableLanguages,
    textPaths: availableTextPaths,
    texturePaths: {
      backgrounds: resolvedBackgrounds,
      indicators: resolvedIndicators,
      font: resolvedFont,
    },
  };
}
