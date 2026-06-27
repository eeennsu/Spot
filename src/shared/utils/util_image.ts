// 이미지 로컬 복사 유틸 — 도메인 0 의존. 갤러리 원본 의존 금지(앱 디렉터리로 복사).
// expo-file-system legacy API 사용(SDK 56: 신 File/Directory API 대신 안정적 레거시 경로).
import * as FileSystem from 'expo-file-system/legacy';

/** 복사본 보관 디렉터리(앱 문서). */
const IMAGE_DIR = `${FileSystem.documentDirectory}materials/`;

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(IMAGE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
  }
}

/**
 * 외부(갤러리) 이미지를 앱 로컬로 복사하고 그 경로를 반환.
 * DB 에는 이 반환 경로(앱 로컬)만 저장한다.
 */
export async function utilCopyImageToApp(srcUri: string, key: string): Promise<string> {
  await ensureDir();
  const ext = srcUri.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
  const dest = `${IMAGE_DIR}${key}.${ext}`;
  await FileSystem.copyAsync({ from: srcUri, to: dest });
  return dest;
}

/** 앱 로컬 복사본 삭제(자재 삭제 시 정리). 외부 경로는 건드리지 않음. */
export async function utilDeleteAppImage(uri?: string): Promise<void> {
  if (!uri || !uri.startsWith(IMAGE_DIR)) return;
  await FileSystem.deleteAsync(uri, { idempotent: true });
}

/** 파일 존재 여부(사진 유실 플레이스홀더 판단). */
export async function utilImageExists(uri?: string): Promise<boolean> {
  if (!uri) return false;
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists;
}
