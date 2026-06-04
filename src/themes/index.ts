import { Theme, ThemeId } from '@/types/theme';
import { commonTheme } from './common';
import { shipwrightTheme } from './shipwright';
import { twoShipTheme } from './2ship';
import { ghostshipTheme } from './ghostship';
import { spaghettiTheme } from './spaghetti';
import { starshipTheme } from './starship';
import { lusTheme } from './lus';

export const themes: Record<ThemeId, Theme> = {
  common: commonTheme,
  shipwright: shipwrightTheme,
  '2ship': twoShipTheme,
  ghostship: ghostshipTheme,
  spaghetti: spaghettiTheme,
  starship: starshipTheme,
  lus: lusTheme
};

export const gameThemes: Record<string, ThemeId> = {
  shipofharkinian: 'shipwright',
  '2ship2harkinian': '2ship',
  ghostship: 'ghostship',
  spaghettikart: 'spaghetti',
  starship: 'starship'
};

export function getTheme(id: ThemeId): Theme {
  return themes[id] || themes.common;
}

export function getGameTheme(gameId: string): ThemeId {
  return gameThemes[gameId] || 'common';
}
