// 자재 랙 편집 전용 풀스크린 — 입력 많은 집중 작업(층 추가·이름·태그·설명·사진·순서).
// 시트 대신 스크린을 쓰는 이유: gorhom 시트 안 스크롤/키보드 충돌을 근본 회피(일반 KeyboardAware 사용).
// Viewer(읽기 훑기)는 여전히 바텀시트(ProjectCanvas). 여기는 Edit 전용.
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@shared/theme';

import MaterialPanel from '@features/material/ui/MaterialPanel';

export default function RackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { shapeId, title } = useLocalSearchParams<{ shapeId: string; title?: string }>();

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* 네이티브 헤더 숨김 — MaterialPanel 자체 헤더(제목·자재 수·완료)를 그대로 쓴다. */}
      <Stack.Screen options={{ headerShown: false }} />
      <MaterialPanel
        shapeId={shapeId}
        title={title ?? '자재 랙'}
        editable
        variant='screen'
        onRequestClose={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
});
