import type { ResourceResolver } from './resource-resolver';

export interface DecodedIcon {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

// Item ID to icon texture name mapping from icon_item_static.h
// These are the actual item ICON IMAGES (not text name labels from item_name_static)
const ITEM_ICON_TEXTURES: Record<number, string> = {
  0x00: 'gItemIconDekuStickTex', 0x01: 'gItemIconDekuNutTex', 0x02: 'gItemIconBombTex',
  0x03: 'gItemIconBowTex', 0x04: 'gItemIconArrowFireTex', 0x05: 'gItemIconDinsFireTex',
  0x06: 'gItemIconSlingshotTex', 0x07: 'gItemIconOcarinaFairyTex', 0x08: 'gItemIconOcarinaOfTimeTex',
  0x09: 'gItemIconBombchuTex', 0x0A: 'gItemIconHookshotTex', 0x0B: 'gItemIconLongshotTex',
  0x0C: 'gItemIconArrowIceTex', 0x0D: 'gItemIconFaroresWindTex', 0x0E: 'gItemIconBoomerangTex',
  0x0F: 'gItemIconLensOfTruthTex', 0x10: 'gItemIconMagicBeanTex', 0x11: 'gItemIconHammerTex',
  0x12: 'gItemIconArrowLightTex', 0x13: 'gItemIconNayrusLoveTex',
  0x14: 'gItemIconBottleEmptyTex', 0x15: 'gItemIconBottlePotionRedTex',
  0x16: 'gItemIconBottlePotionGreenTex', 0x17: 'gItemIconBottlePotionBlueTex',
  0x18: 'gItemIconBottleFairyTex', 0x19: 'gItemIconBottleFishTex',
  0x1A: 'gItemIconBottleMilkFullTex', 0x1B: 'gItemIconBottleRutosLetterTex',
  0x1C: 'gItemIconBottleBlueFireTex', 0x1D: 'gItemIconBottleBugTex',
  0x1E: 'gItemIconBottlePoeTex', 0x1F: 'gItemIconBottleMilkHalfTex',
  0x20: 'gItemIconBottleBigPoeTex',
  0x21: 'gItemIconWeirdEggTex', 0x22: 'gItemIconChickenTex', 0x23: 'gItemIconZeldasLetterTex',
  0x24: 'gItemIconMaskKeatonTex', 0x25: 'gItemIconMaskSkullTex', 0x26: 'gItemIconMaskSpookyTex',
  0x27: 'gItemIconMaskBunnyHoodTex', 0x28: 'gItemIconMaskGoronTex', 0x29: 'gItemIconMaskZoraTex',
  0x2A: 'gItemIconMaskGerudoTex', 0x2B: 'gItemIconMaskTruthTex', 0x2C: 'gItemIconSoldOutTex',
  0x2D: 'gItemIconPocketEggTex', 0x2E: 'gItemIconPocketCuccoTex', 0x2F: 'gItemIconCojiroTex',
  0x30: 'gItemIconOddMushroomTex', 0x31: 'gItemIconOddPotionTex', 0x32: 'gItemIconPoachersSawTex',
  0x33: 'gItemIconBrokenGoronsSwordTex', 0x34: 'gItemIconPrescriptionTex',
  0x35: 'gItemIconEyeballFrogTex', 0x36: 'gItemIconEyeDropsTex', 0x37: 'gItemIconClaimCheckTex',
  0x38: 'gItemIconBowFireTex', 0x39: 'gItemIconBowIceTex', 0x3A: 'gItemIconBowLightTex',
  0x3B: 'gItemIconSwordKokiriTex', 0x3C: 'gItemIconSwordMasterTex', 0x3D: 'gItemIconSwordBiggoronTex',
  0x3E: 'gItemIconShieldDekuTex', 0x3F: 'gItemIconShieldHylianTex', 0x40: 'gItemIconShieldMirrorTex',
  0x41: 'gItemIconTunicKokiriTex', 0x42: 'gItemIconTunicGoronTex', 0x43: 'gItemIconTunicZoraTex',
  0x44: 'gItemIconBootsKokiriTex', 0x45: 'gItemIconBootsIronTex', 0x46: 'gItemIconBootsHoverTex',
  0x47: 'gItemIconBulletBag30Tex', 0x48: 'gItemIconBulletBag40Tex', 0x49: 'gItemIconBulletBag50Tex',
  0x4A: 'gItemIconQuiver30Tex', 0x4B: 'gItemIconQuiver40Tex', 0x4C: 'gItemIconQuiver50Tex',
  0x4D: 'gItemIconBombBag20Tex', 0x4E: 'gItemIconBombBag30Tex', 0x4F: 'gItemIconBombBag40Tex',
  0x50: 'gItemIconGoronsBraceletTex', 0x51: 'gItemIconSilverGauntletsTex', 0x52: 'gItemIconGoldenGauntletsTex',
  0x53: 'gItemIconScaleSilverTex', 0x54: 'gItemIconScaleGoldenTex', 0x55: 'gItemIconBrokenGiantsKnifeTex',
  0x56: 'gItemIconAdultsWalletTex', 0x57: 'gItemIconGiantsWalletTex',
  0x58: 'gItemIconDekuSeedsTex', 0x59: 'gItemIconFishingPoleTex',
};

const ICON_PATH_PREFIX = 'textures/icon_item_static/';

export class IconParser {
  private resolver: ResourceResolver;
  private iconCache = new Map<string, DecodedIcon>();

  constructor(resolver: ResourceResolver) {
    this.resolver = resolver;
  }

  async getItemIcon(itemId: number): Promise<DecodedIcon | null> {
    const cacheKey = `item_${itemId}`;
    const cached = this.iconCache.get(cacheKey);
    if (cached) return cached;

    // Direct lookup using known texture name
    const texName = ITEM_ICON_TEXTURES[itemId];
    if (texName) {
      const path = `${ICON_PATH_PREFIX}${texName}`;
      if (this.resolver.hasFile(path)) {
        const icon = await this.loadIcon(path, cacheKey);
        if (icon) return icon;
      }
    }

    // Fallback: search by partial name match in icon_item_static
    if (texName) {
      const files = this.resolver.findFiles(ICON_PATH_PREFIX);
      const matched = files.find(f => f.includes(texName.replace('gItemIcon', '').replace('Tex', '')));
      if (matched) {
        const icon = await this.loadIcon(matched, cacheKey);
        if (icon) return icon;
      }
    }

    return null;
  }

  private async loadIcon(path: string, cacheKey: string): Promise<DecodedIcon | null> {
    try {
      const { imageData, header } = await this.resolver.getTexture(path);
      const canvas = document.createElement('canvas');
      canvas.width = header.width;
      canvas.height = header.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);

      const icon: DecodedIcon = { canvas, width: header.width, height: header.height };
      this.iconCache.set(cacheKey, icon);
      return icon;
    } catch {
      return null;
    }
  }

  clearCache(): void {
    this.iconCache.clear();
  }
}
