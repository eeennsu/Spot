// id 생성 유틸 — 도메인 0 의존. UUID v4.
import * as Crypto from 'expo-crypto';

/** 새 엔티티 id 생성. */
export function utilCreateId(): string {
  return Crypto.randomUUID();
}
