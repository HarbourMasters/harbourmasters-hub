/**
 * ROM Hash Database for Harbour Masters 64 ports
 * Contains known ROM versions and their compatibility status
 */

export interface RomDatabaseEntry {
  sha1: string
  game: 'shipwright' | '2ship' | 'ghostship' | 'spaghetti' | 'starship'
  version: string
  fullName: string
  region: string
  supported: boolean
  formats?: string[]
  specialNotes?: string
}

export const ROM_DATABASE: RomDatabaseEntry[] = [
  // ============================================================================
  // SHIPWRIGHT (Ocarina of Time) - 21 versions from ship.equipment
  // ============================================================================
  {
    sha1: '328A1F1BEBA30CE5E178F031662019EB32C5F3B5',
    game: 'shipwright',
    version: 'PAL 1.0',
    fullName: 'Legend of Zelda, The - Ocarina of Time (Europe) (En,Fr,De)',
    region: 'PAL',
    supported: true,
    formats: ['cart']
  },
  {
    sha1: 'CFBB98D392E4A9D39DA8285D10CBEF3974C2F012',
    game: 'shipwright',
    version: 'PAL 1.1',
    fullName: 'Legend of Zelda, The - Ocarina of Time (Europe) (En,Fr,De) (Rev 1)',
    region: 'PAL',
    supported: true,
    formats: ['cart', 'digital']
  },
  {
    sha1: '0227D7C0074F2D0AC935631990DA8EC5914597B4',
    game: 'shipwright',
    version: 'PAL GC',
    fullName: 'Legend of Zelda, The - Ocarina of Time (Europe) (GameCube)',
    region: 'PAL',
    supported: true,
    formats: ['optical']
  },
  {
    sha1: 'F46239439F59A2A594EF83CF68EF65043B1BFFE2',
    game: 'shipwright',
    version: 'PAL MQ',
    fullName: 'Legend of Zelda, The - Ocarina of Time - Master Quest (Europe) (GameCube)',
    region: 'PAL',
    supported: true,
    formats: ['optical']
  },
  {
    sha1: 'AD69C91157F6705E8AB06C79FE08AAD47BB57BA7',
    game: 'shipwright',
    version: 'NTSC-U 1.0',
    fullName: 'Legend of Zelda, The - Ocarina of Time (USA)',
    region: 'NTSC-U',
    supported: true,
    formats: ['cart']
  },
  {
    sha1: 'D3ECB253776CD847A5AA63D859D8C89A2F37B364',
    game: 'shipwright',
    version: 'NTSC-U 1.1',
    fullName: 'Legend of Zelda, The - Ocarina of Time (USA) (Rev 1)',
    region: 'NTSC-U',
    supported: true,
    formats: ['cart']
  },
  {
    sha1: '41B3BDC48D98C48529219919015A1AF22F5057C2',
    game: 'shipwright',
    version: 'NTSC-U 1.2',
    fullName: 'Legend of Zelda, The - Ocarina of Time (USA) (Rev 2)',
    region: 'NTSC-U',
    supported: true,
    formats: ['cart', 'digital']
  },
  {
    sha1: 'B82710BA2BD3B4C6EE8AA1A7E9ACF787DFC72E9B',
    game: 'shipwright',
    version: 'NTSC-U GC',
    fullName: 'Legend of Zelda, The - Ocarina of Time (USA) (GameCube)',
    region: 'NTSC-U',
    supported: true,
    formats: ['optical']
  },
  {
    sha1: '8B5D13AAC69BFBF989861CFDC50B1D840945FC1D',
    game: 'shipwright',
    version: 'NTSC-U MQ',
    fullName: 'Legend of Zelda, The - Ocarina of Time - Master Quest (USA) (GameCube)',
    region: 'NTSC-U',
    supported: true,
    formats: ['optical']
  },
  {
    sha1: 'C892BBDA3993E66BD0D56A10ECD30B1EE612210F',
    game: 'shipwright',
    version: 'NTSC-J 1.0',
    fullName: 'Zelda no Densetsu - Toki no Ocarina (Japan)',
    region: 'NTSC-J',
    supported: true,
    formats: ['cart']
  },
  {
    sha1: 'DBFC81F655187DC6FEFD93FA6798FACE770D579D',
    game: 'shipwright',
    version: 'NTSC-J 1.1',
    fullName: 'Zelda no Densetsu - Toki no Ocarina (Japan) (Rev 1)',
    region: 'NTSC-J',
    supported: true,
    formats: ['cart']
  },
  {
    sha1: 'FA5F5942B27480D60243C2D52C0E93E26B9E6B86',
    game: 'shipwright',
    version: 'NTSC-J 1.2',
    fullName: 'Zelda no Densetsu - Toki no Ocarina (Japan) (Rev 2)',
    region: 'NTSC-J',
    supported: true,
    formats: ['cart', 'digital']
  },
  {
    sha1: '0769C84615422D60F16925CD859593CDFA597F84',
    game: 'shipwright',
    version: 'NTSC-J GC',
    fullName: 'Zelda no Densetsu - Toki no Ocarina (Japan) (GameCube)',
    region: 'NTSC-J',
    supported: true,
    formats: ['optical']
  },
  {
    sha1: 'DD14E143C4275861FE93EA79D0C02E36AE8C6C2F',
    game: 'shipwright',
    version: 'NTSC-J MQ',
    fullName: 'Zelda no Densetsu - Toki no Ocarina - Ura (Japan) (GameCube)',
    region: 'NTSC-J',
    supported: true,
    formats: ['optical']
  },
  {
    sha1: '2CE2D1A9F0534C9CD9FA04EA5317B80DA21E5E73',
    game: 'shipwright',
    version: 'NTSC-J GC (Collection)',
    fullName: 'Zelda no Densetsu - Toki no Ocarina (Japan) (GameCube) (Collector\'s Edition)',
    region: 'NTSC-J',
    supported: true,
    formats: ['optical']
  },
  {
    sha1: 'CEE6BC3C2A634B41728F2AF8DA54D9BF8CC14099',
    game: 'shipwright',
    version: 'PAL GC (Debug)',
    fullName: 'Legend of Zelda, The - Ocarina of Time (Europe) (GameCube) (Debug)',
    region: 'PAL',
    supported: true,
    formats: ['debug']
  },
  {
    sha1: '079B855B943D6AD8BD1EB026C0ED169ECBDAC7DA',
    game: 'shipwright',
    version: 'PAL MQ (Debug)',
    fullName: 'Legend of Zelda, The - Ocarina of Time - Master Quest (Europe) (GameCube) (Debug)',
    region: 'PAL',
    supported: true,
    formats: ['debug']
  },
  {
    sha1: '50BEBEDAD9E0F10746A52B07239E47FA6C284D03',
    game: 'shipwright',
    version: 'PAL MQ (Debug)',
    fullName: 'Legend of Zelda, The - Ocarina of Time - Master Quest (Europe) (GameCube) (Debug)',
    region: 'PAL',
    supported: true,
    formats: ['debug']
  },
  {
    sha1: 'CFECFDC58D650E71A200C81F033DE4E6D617A9F6',
    game: 'shipwright',
    version: 'PAL MQ (Debug)',
    fullName: 'Legend of Zelda, The - Ocarina of Time - Master Quest (Europe) (GameCube) (Debug)',
    region: 'PAL',
    supported: true,
    formats: ['debug']
  },
  {
    sha1: '70537A3144C8813B115252C40065C117CB139DCD',
    game: 'shipwright',
    version: 'NTSC-U (Beta)',
    fullName: 'Legend of Zelda, The - Ocarina of Time (USA) (Beta)',
    region: 'NTSC-U',
    supported: false,
    formats: ['beta']
  },

  // ============================================================================
  // 2SHIP (Majora's Mask) - 14 versions from 2ship.equipment
  // ============================================================================
  {
    sha1: 'D6133ACE5AFAA0882CF214CF88DABA39E266C078',
    game: '2ship',
    version: 'NTSC-U',
    fullName: 'Legend of Zelda, The - Majora\'s Mask (USA)',
    region: 'NTSC-U',
    supported: true,
    formats: ['cart']
  },
  {
    sha1: '9743AA026E9269B339EB0E3044CD5830A440C1FD',
    game: '2ship',
    version: 'NTSC-U GC',
    fullName: 'Legend of Zelda, The - Majora\'s Mask (USA) (GameCube)',
    region: 'NTSC-U',
    supported: true,
    formats: ['optical']
  },
  {
    sha1: '5FB2301AACBF85278AF30DCA3E4194AD48599E36',
    game: '2ship',
    version: 'NTSC-J 1.0',
    fullName: 'Zelda no Densetsu - Mujura no Kamen (Japan)',
    region: 'NTSC-J',
    supported: false,
    formats: ['cart']
  },
  {
    sha1: '41FDB879AB422EC158B4EAFEA69087F255EA8589',
    game: '2ship',
    version: 'NTSC-J 1.1',
    fullName: 'Zelda no Densetsu - Mujura no Kamen (Japan) (Rev 1)',
    region: 'NTSC-J',
    supported: false,
    formats: ['cart']
  },
  {
    sha1: '1438FD501E3E5B25461770AF88C02AB1E41D3A7E',
    game: '2ship',
    version: 'NTSC-J GC',
    fullName: 'Zelda no Densetsu - Mujura no Kamen (Japan) (GameCube)',
    region: 'NTSC-J',
    supported: false,
    formats: ['optical']
  },
  {
    sha1: 'C04599CDAFEE1C84A7AF9A71DF68F139179ADA84',
    game: '2ship',
    version: 'PAL 1.0',
    fullName: 'Legend of Zelda, The - Majora\'s Mask (Europe) (En,Fr,De,Es)',
    region: 'PAL',
    supported: false,
    formats: ['cart']
  },
  {
    sha1: 'BB4E4757D10727C7584C59C1F2E5F44196E9C293',
    game: '2ship',
    version: 'PAL 1.1',
    fullName: 'Legend of Zelda, The - Majora\'s Mask (Europe) (En,Fr,De,Es) (Rev 1)',
    region: 'PAL',
    supported: false,
    formats: ['cart']
  },
  {
    sha1: 'A849A65E56D57D4DD98B550524150F898DF90A9F',
    game: '2ship',
    version: 'PAL GC',
    fullName: 'Legend of Zelda, The - Majora\'s Mask (Europe) (GameCube)',
    region: 'PAL',
    supported: false,
    formats: ['optical']
  },
  {
    sha1: 'C487DB55C2C3A97CCD39DED13EF9FD9121DAE729',
    game: '2ship',
    version: 'PAL Wii VC',
    fullName: 'Legend of Zelda, The - Majora\'s Mask (Europe) (En,Fr,De,Es) (Rev 1) (Wii Virtual Console)',
    region: 'PAL',
    supported: false,
    formats: ['digital']
  },
  {
    sha1: 'B38B71D2961DFFB523020A67F4807A4B704E347A',
    game: '2ship',
    version: 'PAL 1.1 (Debug)',
    fullName: 'Legend of Zelda, The - Majora\'s Mask (Europe) (En,Fr,De,Es) (Rev 1) (Debug)',
    region: 'PAL',
    supported: false,
    formats: ['debug']
  },
  {
    sha1: '55541662A192C66E34A011D4BF6F4A0EC69899AE',
    game: '2ship',
    version: 'PAL 1.1 (Debug)',
    fullName: 'Legend of Zelda, The - Majora\'s Mask (Europe) (En,Fr,De,Es) (Rev 1) (Debug)',
    region: 'PAL',
    supported: false,
    formats: ['debug']
  },
  {
    sha1: '2F0744F2422B0421697A74B305CB1EF27041AB11',
    game: '2ship',
    version: 'Kiosk Demo',
    fullName: 'Legend of Zelda, The - Majora\'s Mask (USA) (Demo) (Kiosk)',
    region: 'NTSC-U',
    supported: false,
    formats: ['kiosk']
  },
  {
    sha1: 'F882460A888B8DB76E8B163FD508D89E7B2E9E00',
    game: '2ship',
    version: 'LodgeNet',
    fullName: 'Legend of Zelda, The - Majora\'s Mask (USA) (LodgeNet)',
    region: 'NTSC-U',
    supported: false,
    formats: ['hotel']
  },

  // ============================================================================
  // GHOSTSHIP (Super Mario 64) - 2 versions from Ghostship README
  // ============================================================================
  {
    sha1: '9bef1128717f958171a4afac3ed78ee2bb4e86ce',
    game: 'ghostship',
    version: 'US',
    fullName: 'Super Mario 64 (USA)',
    region: 'NTSC-U',
    supported: true,
    formats: ['cart']
  },
  {
    sha1: '8a20a5c83d6ceb0f0506cfc9fa20d8f438cafe51',
    game: 'ghostship',
    version: 'JP',
    fullName: 'Super Mario 64 (Japan)',
    region: 'NTSC-J',
    supported: true,
    formats: ['cart']
  },

  // ============================================================================
  // SPAGHETTIKART (Mario Kart 64) - 1 version from SpaghettiKart README
  // ============================================================================
  {
    sha1: '579C48E211AE952530FFC8738709F078D5DD215E',
    game: 'spaghetti',
    version: 'US',
    fullName: 'Mario Kart 64 (USA)',
    region: 'NTSC-U',
    supported: true,
    formats: ['cart']
  },

  // ============================================================================
  // STARSHIP (Star Fox 64) - 2 versions (from documentation)
  // ============================================================================
  {
    sha1: 'D8B1088520F7C5F81433292A9258C1184AFA1457',
    game: 'starship',
    version: 'US 1.0',
    fullName: 'Star Fox 64 (USA)',
    region: 'NTSC-U',
    supported: true,
    formats: ['cart'],
    specialNotes: 'Supports EU/JP voice replacement when used with US ROM'
  },
  {
    sha1: '09F0D105F476B00EFA5303A3EBC42E60A7753B7A',
    game: 'starship',
    version: 'US 1.1 Rev A',
    fullName: 'Star Fox 64 (USA) (Rev A)',
    region: 'NTSC-U',
    supported: true,
    formats: ['cart'],
    specialNotes: 'Supports EU/JP voice replacement when used with US ROM'
  },
]

/**
 * Lookup ROM entries by SHA-1 hash
 */
export function lookupRomByHash(sha1: string): RomDatabaseEntry[] {
  return ROM_DATABASE.filter(entry => entry.sha1.toUpperCase() === sha1.toUpperCase())
}

/**
 * Get all ROMs for a specific game
 */
export function getRomsForGame(game: string): RomDatabaseEntry[] {
  return ROM_DATABASE.filter(entry => entry.game === game)
}

/**
 * Get all supported ROMs for a specific game
 */
export function getSupportedRomsForGame(game: string): RomDatabaseEntry[] {
  return ROM_DATABASE.filter(entry => entry.game === game && entry.supported)
}

/**
 * Get all unsupported ROMs for a specific game
 */
export function getUnsupportedRomsForGame(game: string): RomDatabaseEntry[] {
  return ROM_DATABASE.filter(entry => entry.game === game && !entry.supported)
}

/**
 * Get game display name mapping
 */
export const GAME_DISPLAY_NAMES: Record<string, string> = {
  'shipwright': 'Ship of Harkinian',
  '2ship': '2ship',
  'ghostship': 'Ghostship',
  'spaghetti': 'SpaghettiKart',
  'starship': 'Starship',
}
