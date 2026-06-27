// 자재 이미지 선택 훅 — 갤러리에서 고르고 앱 로컬로 복사한 경로 반환.
// expo-image-picker(선택) → expo-file-system(복사). DB엔 로컬 경로만.
import { useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { utilCopyImageToApp } from '@shared/utils/util_image';

export function useMaterialImagePick() {
  /** 이미지 1장 선택 → 앱 로컬 복사 경로. 취소/거부 시 null. */
  return useCallback(async (key: string): Promise<string | null> => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return null;

    return utilCopyImageToApp(result.assets[0].uri, key);
  }, []);
}
