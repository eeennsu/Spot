// 상단바 도움말(?) 버튼 — 캔버스 튜토리얼을 수동 실행한다(첫 사용자 안내).
import { HelpCircle } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { colors, spacing } from '@shared/theme';
import { utilHaptic } from '@shared/utils/util_haptics';

import { useTutorialStore } from '@features/tutorial/stores/tutorial';

export default function TutorialButton() {
  const start = useTutorialStore(s => s.start);
  return (
    <Pressable
      onPress={() => {
        utilHaptic('light');
        start();
      }}
      hitSlop={10}
      accessibilityRole='button'
      accessibilityLabel='사용법 안내'
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <HelpCircle size={18} color={colors.textPrimary} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: spacing.xl4, justifyContent: 'center', paddingHorizontal: spacing.xs },
  pressed: { opacity: 0.5 },
});
