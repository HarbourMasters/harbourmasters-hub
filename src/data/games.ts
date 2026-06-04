import { Game, GameId } from '@/types/game';

export const GAMES: Record<GameId, Game> = {
  shipofharkinian: {
    id: 'shipofharkinian',
    name: 'Ship of Harkinian',
    fullName: 'Ship of Harkinian',
    tagline: 'The Legend of Zelda: Ocarina of Time',
    description: 'A native PC port of the N64 classic, featuring enhanced graphics, mod support, and modern controls.',
    themeId: 'shipwright',
    gradient: 'from-emerald-600/30 to-green-400/20',
    icon: '/icons/games/ShipOfHarkinian.png',
    stars: '4638',
    latestVersion: '9.2.3',
    repo: {
      owner: 'HarbourMasters',
      name: 'Shipwright'
    },
    features: [
      'Native resolution and widescreen',
      'Customizable button layouts',
      'Analog camera control',
      'Enhanced graphics options',
      'Active modding community'
    ],
    releases: [],
    links: {
      github: 'https://github.com/HarbourMasters/Shipwright',
      discord: 'https://discord.gg/harbourmasters',
      wiki: 'https://wiki.harbourmasters.com'
    },
    gamebanana: {
      gameId: 16121,
      url: 'https://gamebanana.com/games/16121',
      slug: 'soh'
    }
  },
  '2ship2harkinian': {
    id: '2ship2harkinian',
    name: '2ship2Harkinian',
    fullName: '2ship2Hakinian',
    tagline: 'The Legend of Zelda: Majora\'s Mask',
    description: 'Experience the temporal adventure with modern enhancements and quality-of-life improvements.',
    themeId: '2ship',
    gradient: 'from-purple-600/30 to-pink-400/20',
    icon: '/icons/games/2Ship2Hakinian.png',
    stars: '1856',
    latestVersion: '6.0.2',
    repo: {
      owner: 'HarbourMasters',
      name: '2ship2harkinian'
    },
    features: [
      'Stable 60 FPS gameplay',
      'Customizable button layouts',
      'Enhanced graphics options',
      'Mod support and custom quests',
      'Input lag reduction'
    ],
    releases: [],
    links: {
      github: 'https://github.com/HarbourMasters/2ship2harkinian',
      discord: 'https://discord.gg/harbourmasters',
      wiki: 'https://wiki.harbourmasters.com'
    },
    gamebanana: {
      gameId: 20371,
      url: 'https://gamebanana.com/games/20371',
      slug: '2ship'
    }
  },
  ghostship: {
    id: 'ghostship',
    name: 'Ghostship',
    fullName: 'Ghostship',
    tagline: 'Super Mario 64',
    description: 'The iconic 3D platformer brought to modern PCs with enhanced features.',
    themeId: 'ghostship',
    gradient: 'from-red-500/30 to-blue-500/20',
    icon: '/icons/games/Ghostship.png',
    stars: '484',
    latestVersion: '1.0.3',
    repo: {
      owner: 'HarbourMasters',
      name: 'Ghostship'
    },
    features: [
      'High framerate support',
      'Improved camera controls',
      'Enhanced visuals and options',
      'Character skin support',
      'Custom level support'
    ],
    releases: [],
    links: {
      github: 'https://github.com/HarbourMasters/Ghostship',
      discord: 'https://discord.gg/harbourmasters',
      wiki: 'https://wiki.harbourmasters.com'
    },
    gamebanana: {
      gameId: 24131,
      url: 'https://gamebanana.com/games/24131',
      slug: 'ghostship'
    }
  },
  spaghettikart: {
    id: 'spaghettikart',
    name: 'Spaghetti Kart',
    fullName: 'Spaghetti Kart',
    tagline: 'Mario Kart 64',
    description: 'Relive the classic Mario Kart 64 on PC with local multiplayer, enhanced graphics and smooth performance.',
    themeId: 'spaghetti',
    gradient: 'from-yellow-500/30 to-red-500/20',
    icon: '/icons/games/SpaghettiKart.png',
    stars: '2123',
    latestVersion: '2.1.0',
    repo: {
      owner: 'HarbourMasters',
      name: 'SpaghettiKart'
    },
    features: [
      'Local multiplayer',
      'Custom track support',
      '60 FPS gameplay',
      'Enhanced graphics',
      'Controller support'
    ],
    releases: [],
    links: {
      github: 'https://github.com/HarbourMasters/SpaghettiKart',
      discord: 'https://discord.gg/harbourmasters',
      wiki: 'https://wiki.harbourmasters.com'
    },
    gamebanana: {
      gameId: 22970,
      url: 'https://gamebanana.com/games/22970',
      slug: 'spaghetti'
    }
  },
  starship: {
    id: 'starship',
    name: 'Starship',
    fullName: 'Starship',
    tagline: 'Star Fox 64',
    description: 'Barrel roll through space in this faithful port with modern enhancements.',
    themeId: 'starship',
    gradient: 'from-blue-600/30 to-orange-500/20',
    icon: '/icons/games/Starship.png',
    stars: '1809',
    latestVersion: '1.1.2',
    repo: {
      owner: 'HarbourMasters',
      name: 'Starship'
    },
    features: [
      'Widescreen support',
      'Improved audio',
      'Custom controls',
      'Enhanced graphics',
      '60 FPS gameplay'
    ],
    releases: [],
    links: {
      github: 'https://github.com/HarbourMasters/Starship',
      discord: 'https://discord.gg/harbourmasters',
      wiki: 'https://wiki.harbourmasters.com'
    },
    gamebanana: {
      gameId: 21612,
      url: 'https://gamebanana.com/games/21612',
      slug: 'starship'
    }
  }
};

// Organization-wide stats
export const ORG_STATS = {
  totalStars: 10910,
  totalForks: 1120,
  totalPorts: 5,
  founded: 2022
} as const;

export const GAME_IDS: GameId[] = Object.keys(GAMES) as GameId[];

export function getGame(id: string): Game | undefined {
  return GAMES[id as GameId];
}

export function getGameByRepo(owner: string, name: string): Game | undefined {
  return Object.values(GAMES).find(
    game => game.repo.owner === owner && game.repo.name === name
  );
}
