export interface SpriteAsset {
  id: string;
  name: string;
  filename: string;
  imgurUrl: string;
  directUrl: string;
  dataUrl: string;
}

export const SPRITE_ASSETS: SpriteAsset[] = [
  {
    id: 'peasant_pitchfork',
    name: 'Pitchfork Peasant',
    filename: 'peasant_pitchfork.png',
    imgurUrl: 'https://imgur.com/a/VEXYkzW',
    directUrl: 'https://i.imgur.com/uvH316Y.png',
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAABFElEQVR4nGJhIA38R+MzkqKZFMX/Q9gz4Zw1P6eTbAZJLkO3EMlSosxhItEyDAC1HD14KbYMw1ekAop9RgogKqwluLn/2/yJg/MnbVsApvO8EuBixMQdyT6DWYTOJgYQmxr/H7Fvg3Nq7s9gaFHMgNMgYHOwiqB5JPsMZMGp9gIUmlhAks/wGXzg0SOC5pFUgjjIyZFtEQOpwfj1pTdRYlSxDGY4zAJSLGIgJc5MCZQep6mdz+TRaHQ2IUDt4gpvgUyMZQSDEASIUUO2z2DB95CEoCTaMnmowQxINKmArlUMIcuIii8YMCVQaw8qn4EBMQmAGDVE+wxfoiA2wRBlGTbD0MWIsZCYspGoZhoxZgICAAD//8OpVT/aXJo8AAAAAElFTkSuQmCC',
  },
  {
    id: 'peasant_torch',
    name: 'Torch Peasant',
    filename: 'peasant_torch.png',
    imgurUrl: 'https://imgur.com/a/2OlDOSQ',
    directUrl: 'https://i.imgur.com/kKhEjFq.png',
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAABHklEQVR4nGJioCOgq2UsOMT/E9DHSI5l2DT9//SsGq8mPqlWsiykazAiu45Q0BFjBl7AhKYJrNFAQgKO9xUUoNAgjK4ezbHoNFbLMEBfRASD57cNKDQO8D84yBsrTZRlMIO3cwWg0HgsJAiwWcZ44cULnBqcJkxgIDfp4/SZz2xTosSoYhkILDl5EoxhbDyAce26rQzQeALTID56CGCz7H+SpSWGpTAAlcOWTRihFmC1CJdlNANYy8YVl3IY7pxJYVAxmYMijhA7TpZlOH2GbhEuMapYRgQguXhDt+w/F/dSgpqIUYMN4KrPGP7/34RVnJHRjyyL8FpGiaEkW8aAxXeUOgCvZdT23fBtXWFt8FBJL1nVENUAXYMREAAA//9nuVVC4MglqwAAAABJRU5ErkJggg==',
  },
  {
    id: 'village_knight',
    name: 'Village Knight',
    filename: 'village_knight.png',
    imgurUrl: 'https://imgur.com/a/A4uLXgD',
    directUrl: 'https://i.imgur.com/VMPhtDP.png',
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAABP0lEQVR4nGJioCOgq2UsOMT/E9DHSI5l2DT9//SsGq8mPqlWsiykazAiu45Q0BFjBswcrL5mQtMEVmQgIQHH+woKUGgQRlePbNGzvZw4HY43GPsiIhg8v21AofEAmEUMuCzEmkBArsdnsNOECeh64RYx7fjF8M+DDcyWcv6Oog6bzxgvvHhBikVwALLo/3JuMI1VHpehPrNNiRJDBiAfMUZ+hfuMaMtAYMnJk2AMY+MBjNAgwxmEuCz7n2RpiWEpDEDlsKU2sIV+qZJYLcJlGV3Bfy7upf+fXecE08gYJoanAPhvoqSEUx6nz1RM5hAlRgqgJBhJLt7QLQMFE0FNxKjBBnDVZwz//2/CKs7I6EeWRXgtI9fQM/fukW4ZAxbfEeEAvBUqXssoCTJsYPi2rrDWZxToHTyArsEICAAA//81GHBNNaQ/owAAAABJRU5ErkJggg==',
  },
  {
    id: 'carnivore_plant',
    name: 'Carnivore Plant',
    filename: 'carnivore_plant.png',
    imgurUrl: 'https://imgur.com/a/XmJBDFi',
    directUrl: 'https://i.imgur.com/qe0cqr1.png',
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAABqUlEQVR4nOyaoW7zMBSF/f8qGo40hYyNhGyRhgbyHH2BPFX5tOcontSikLGRaFIeYsCSFbVpEjs3ru/J+cAU5Pmrfa8vOLv3/YvZEv/vvYHYUBgdCqNDYXQojA6F0dmc8E58xbzI7EfbdOKLL0dYOC8y59n/TgfJK31heP54EFxcirVq+Pf85P4mxSrC1vP57TNBZzHh/n1+fP0xxnx/7d13OiwSzovM9eQLrGdqtku7tD3ScefUELjSbdMl+PzcYnOTlpiwlkPmCaNDYXQojA6F0aEwOhRGh8LoUBgdCqNDYXQojA6Fp6jqcp2dRMJPuKrL4+Gk2tlD2NoaY1Q7/5uZiHe22mHTQmeu8HjdVnWppaqHEwB293OK1nlqqfBhYbv7ce35P4oUIhm/6S7dF+v36sh9WyrjN13Dx8PpuoDjv1L9XF/bdLeSNJP4Na17jRyCuT6PZ8nZRj5e2Vyf3zvsRsuF/9WLwVxf8K3WMXiM5/pGAoHXzJ2lEyTslZJPxMck4HHScaUFUSwcNnsoFg6DwuhQGB0Ko0NhdCiMDoXR2ZzwXwAAAP//4iOago6bS1IAAAAASUVORK5CYII=',
  },
  {
    id: 'night_bear',
    name: 'NightBear',
    filename: 'night_bear.png',
    imgurUrl: 'https://imgur.com/a/7msjxyi',
    directUrl: 'https://i.imgur.com/iHevmHN.png',
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABC0lEQVR4nOyXTRKDMAiFTacHcuORPJVHcuON6NgJDpMSApgfF32bLrS8T/ISJu/JJxCeBUshy8uX6bqu2Ze2bTPVl16A+BxKpgqYQOqpAGCe5+k4DpcxB4L1Us9XzryFYl0oAXSVCHASJ6EyC9uvBfjZXncgBPPLhwYCMHD0j8uyuMyp9n3//tJQx48KLEAPIcDwEGIHun496uzC8A4UhxEG6I6kIKumYTxCXSqdqsOX4A8wHEAVQi5IXDA9Y7wIwG0haWtaZwcuQbg7dq16zCx4FEC3ZcD2pwBdIKg5B9AUIjXPATSB4MwlgKoQOfNJcRCdELWuZryBoZ50I3bXN12liapdzz8BAAD//92KY73F7w+XAAAAAElFTkSuQmCC',
  },
];

/**
 * Downloads a single sprite image directly as a PNG file
 */
export function downloadSpriteFile(sprite: SpriteAsset) {
  try {
    const link = document.createElement('a');
    link.href = sprite.dataUrl;
    link.download = sprite.filename;
    link.setAttribute('download', sprite.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error(`Failed to download ${sprite.filename}:`, err);
    window.open(sprite.directUrl, '_blank');
  }
}

/**
 * Downloads all sprite PNG images sequentially to user's downloads folder
 */
export async function downloadAllSpritesDirectly(
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const total = SPRITE_ASSETS.length;
  for (let i = 0; i < total; i++) {
    const sprite = SPRITE_ASSETS[i];
    if (onProgress) onProgress(i + 1, total);
    downloadSpriteFile(sprite);
    // Delay 200ms between file downloads to ensure browser triggers all 5 saves
    if (i < total - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}
