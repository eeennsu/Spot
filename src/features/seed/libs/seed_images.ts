// 시드 자재 사진 — 번들 에셋을 앱 로컬로 복사한다.
// 갤러리 원본 참조 금지(CLAUDE.md): expo-asset 로 번들 png 의 로컬 uri 를 얻고,
// useMaterialImagePick 과 동일한 utilCopyImageToApp 경로로 앱 문서 폴더에 복사한다.
import { Asset } from 'expo-asset';

import { utilCopyImageToApp } from '@shared/utils/util_image';

import boltPng from '../../../../assets/seed/material-bolt.png';
import cablePng from '../../../../assets/seed/material-cable.png';
import rollerPng from '../../../../assets/seed/material-roller.png';
import siliconePng from '../../../../assets/seed/material-silicone.png';

/** 번들에 포함되는 샘플 이미지. key = 복사본 파일명(안정적 → 재시드 시 덮어씀). */
const SEED_IMAGE_MODULES = {
  bolt: boltPng,
  cable: cablePng,
  silicone: siliconePng,
  roller: rollerPng,
} as const;

export type SeedImageKey = keyof typeof SEED_IMAGE_MODULES;

/**
 * 번들 에셋(png)을 앱 로컬로 복사하고 그 로컬 uri 를 반환.
 * localUri 확보를 위해 downloadAsync 로 캐시에 풀고, 그 경로를 복사한다.
 */
export async function copySeedImage(key: SeedImageKey): Promise<string> {
  const asset = Asset.fromModule(SEED_IMAGE_MODULES[key]);
  await asset.downloadAsync();
  const src = asset.localUri ?? asset.uri;
  return utilCopyImageToApp(src, `seed_${key}`);
}
