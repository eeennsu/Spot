// 자재 이미지 선택 훅 — 갤러리에서 고르고 앱 로컬로 복사한 경로 반환.
// expo-image-picker(선택) → expo-file-system(복사). DB엔 로컬 경로만.
import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';

import { utilCopyImageToApp } from '@shared/utils/util_image';

/** 선택 결과: 앱 로컬 복사 경로 + 원본 파일명(확장자 제거). */
export interface IPickedImage {
  uri: string;
  /** 원본 파일명에서 확장자 뗀 값. 자재 이름 기본값 후보. 없으면 undefined. */
  suggestedName?: string;
}

/** 파일명에서 경로·확장자 제거. "IMG_1234.JPG" → "IMG_1234". */
function fileNameToLabel(fileName?: string | null): string | undefined {
  if (!fileName) return undefined;
  const base = fileName.split(/[/\\]/).pop() ?? fileName;
  const name = base.replace(/\.[^.]+$/, '').trim();
  return name || undefined;
}

export function useMaterialImagePick() {
  /** 이미지 1장 선택 → 앱 로컬 복사 경로 + 원본 파일명. 취소/거부 시 null. */
  return useCallback(async (key: string): Promise<IPickedImage | null> => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      // 조용한 무반응 방지 — 왜 안 되는지 안내 + 설정 이동.
      Alert.alert('사진 접근 권한 필요', '자재 사진을 넣으려면 갤러리 접근을 허용해 주세요.', [
        { text: '취소', style: 'cancel' },
        { text: '설정 열기', onPress: () => Linking.openSettings() },
      ]);
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    const asset = result.assets?.[0];
    if (result.canceled || !asset?.uri) return null;

    const uri = await utilCopyImageToApp(asset.uri, key);
    return { uri, suggestedName: fileNameToLabel(asset.fileName) };
  }, []);
}
