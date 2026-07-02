// 앱 로컬 이미지 표시 래퍼 — 파일 유실 시 플레이스홀더. 이 앱은 사진이 전부 로컬.
import { ImageOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius, typography } from '@shared/theme';
import { utilImageExists } from '@shared/utils/util_image';

interface Props {
  uri?: string;
  style?: StyleProp<ViewStyle>;
  /** 플레이스홀더 라벨(기본 "사진 없음") */
  emptyLabel?: string;
}

export default function LocalImage({ uri, style, emptyLabel = '사진 없음' }: Props) {
  const [status, setStatus] = useState<'checking' | 'ok' | 'missing'>('checking');

  useEffect(() => {
    let alive = true;
    if (!uri) {
      setStatus('missing');
      return;
    }
    setStatus('checking');
    utilImageExists(uri).then(exists => {
      if (alive) setStatus(exists ? 'ok' : 'missing');
    });
    return () => {
      alive = false;
    };
  }, [uri]);

  if (status === 'ok' && uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, style] as StyleProp<ImageStyle>}
        resizeMode='cover'
      />
    );
  }

  return (
    <View style={[styles.base, styles.placeholder, style]}>
      <ImageOff size={20} color={colors.textTertiary} strokeWidth={2} />
      <Text style={[typography.metadata, styles.label]} numberOfLines={1}>
        {status === 'checking' ? '' : emptyLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.standard,
    backgroundColor: colors.surface1,
    overflow: 'hidden',
  },
  placeholder: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { color: colors.textTertiary },
});
