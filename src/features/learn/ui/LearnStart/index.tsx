// 학습 시작 선택 시트 — 위치 맞히기 / 이름 맞히기.
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MapPin, Tag } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BottomSheet from '@shared/components/customs/BottomSheet';
import { colors, radius, spacing, typography } from '@shared/theme';
import { utilHaptic } from '@shared/utils/util_haptics';

import type { ILearnType } from '../../types';

interface Props {
  /** useBottomSheet().ref 주입 → present/dismiss 로 제어 */
  sheetRef: React.Ref<BottomSheetModal>;
  /** 퀴즈 가능한 자재 수(0이면 안내) */
  count: number;
  onClose?: () => void;
  onPick: (type: ILearnType) => void;
}

export default function LearnStart({ sheetRef, count, onClose, onPick }: Props) {
  const disabled = count === 0;
  return (
    <BottomSheet ref={sheetRef} onClose={onClose} maxHeightRatio={0.5} dynamic>
      <View style={styles.root}>
        <Text style={typography.heading}>학습 모드</Text>
        {disabled ? (
          <Text style={[typography.body, styles.muted]}>
            먼저 자재를 등록하세요. 등록된 자재가 있어야 퀴즈를 만들 수 있습니다.
          </Text>
        ) : (
          <>
            <Text style={[typography.metadata, styles.muted]}>
              자재 이름 라벨을 가리고 퀴즈를 냅니다.
            </Text>
            <Pressable
              onPress={() => {
                utilHaptic('light');
                onPick('position');
              }}
              style={({ pressed }) => [styles.card, pressed && styles.dim]}
            >
              <View style={styles.cardTitle}>
                <MapPin size={18} color={colors.textPrimary} strokeWidth={2} />
                <Text style={typography.taskTitle}>위치 맞히기</Text>
              </View>
              <Text style={typography.metadata}>자재 이름을 보고 평면도에서 도형을 찾습니다.</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                utilHaptic('light');
                onPick('name');
              }}
              style={({ pressed }) => [styles.card, pressed && styles.dim]}
            >
              <View style={styles.cardTitle}>
                <Tag size={18} color={colors.textPrimary} strokeWidth={2} />
                <Text style={typography.taskTitle}>이름 맞히기</Text>
              </View>
              <Text style={typography.metadata}>하이라이트된 도형의 자재 이름을 고릅니다.</Text>
            </Pressable>
          </>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: spacing.xl, gap: spacing.md },
  muted: { color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface1,
    borderRadius: radius.comfortable,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dim: { opacity: 0.6 },
});
