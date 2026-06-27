// 프로젝트 상세 = 도형 편집기 자리. Phase 0 은 네비/파라미터 동작만 증명.
// 실제 도형 캔버스·추가·드래그·리사이즈·색·저장은 Phase 1.
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { colors, spacing, typography } from '@shared/theme';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.root}>
      <Text style={typography.projectTitle}>도형 편집기</Text>
      <Text style={[typography.metadata, styles.note]}>Phase 1 에서 구현 예정</Text>
      <Text style={[typography.metadata, styles.note]}>project: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  note: { textAlign: 'center' },
});
