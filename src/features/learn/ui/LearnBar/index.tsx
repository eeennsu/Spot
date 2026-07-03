// 학습 하단 바 — 진행/점수/문제/피드백. 위치=캔버스 탭으로 응답, 이름=보기 선택.
import { Check, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@shared/theme';
import { utilHapticNotify } from '@shared/utils/util_haptics';

import { useLearnStore } from '../../stores/learn';

interface Props {
  /** 같은 유형으로 다시 시작 */
  onRestart: () => void;
}

export default function LearnBar({ onRestart }: Props) {
  const insets = useSafeAreaInsets();
  const {
    active,
    type,
    position,
    name,
    index,
    score,
    answered,
    picked,
    finished,
    answerName,
    next,
    stop,
  } = useLearnStore();

  if (!active) return null;

  const total = type === 'position' ? position.length : name.length;

  // 이름 맞히기 응답 — 정답/오답 확정 순간 햅틱(시각 피드백엔 있었지만 촉각 피드백 누락).
  const handleAnswerName = (choice: string) => {
    const wasAnswered = useLearnStore.getState().answered;
    answerName(choice);
    if (!wasAnswered) {
      const result = useLearnStore.getState().answered;
      utilHapticNotify(result === 'correct' ? 'success' : 'error');
    }
  };

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.topRow}>
        <Text style={typography.metadata}>{finished ? '완료' : `${index + 1} / ${total}`}</Text>
        <Text style={[typography.metadata, { color: colors.blue }]}>점수 {score}</Text>
        <Pressable
          onPress={stop}
          hitSlop={10}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.dim]}
        >
          <Text style={[typography.button, { color: colors.textSecondary }]}>닫기</Text>
        </Pressable>
      </View>

      {finished ? (
        <View style={styles.finishWrap}>
          <Text style={typography.heading}>
            점수 {score} / {total}
          </Text>
          <View style={styles.finishActions}>
            <Pressable
              onPress={onRestart}
              style={({ pressed }) => [styles.actBtn, styles.actPrimary, pressed && styles.dim]}
            >
              <Text style={[typography.button, { color: colors.canvas }]}>다시</Text>
            </Pressable>
            <Pressable
              onPress={stop}
              style={({ pressed }) => [styles.actBtn, pressed && styles.dim]}
            >
              <Text style={typography.button}>닫기</Text>
            </Pressable>
          </View>
        </View>
      ) : type === 'position' ? (
        <PositionBody prompt={position[index]?.name ?? ''} answered={answered} onNext={next} />
      ) : (
        <NameBody
          choices={name[index]?.choices ?? []}
          correctNames={name[index]?.correctNames ?? []}
          answered={answered}
          picked={picked}
          onPick={handleAnswerName}
          onNext={next}
        />
      )}
    </View>
  );
}

function PositionBody({
  prompt,
  answered,
  onNext,
}: {
  prompt: string;
  answered: 'correct' | 'wrong' | null;
  onNext: () => void;
}) {
  return (
    <View style={styles.body}>
      <Text style={typography.taskTitle}>
        「<Text style={{ color: colors.blue }}>{prompt}</Text>」 자재는 어디에?
      </Text>
      {answered ? (
        <Animated.View entering={FadeIn.duration(150)} style={styles.feedbackRow}>
          <View style={styles.feedbackLabel}>
            {answered === 'correct' ? (
              <Check size={16} color={colors.success} strokeWidth={2.5} />
            ) : (
              <X size={16} color={colors.deadline} strokeWidth={2.5} />
            )}
            <Text
              style={[
                typography.button,
                { color: answered === 'correct' ? colors.success : colors.deadline },
              ]}
            >
              {answered === 'correct' ? '정답' : '오답'}
            </Text>
          </View>
          <Pressable
            onPress={onNext}
            style={({ pressed }) => [styles.actBtn, styles.actPrimary, pressed && styles.dim]}
          >
            <Text style={[typography.button, { color: colors.canvas }]}>다음</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <Text style={typography.metadata}>평면도에서 해당 도형을 탭하세요</Text>
      )}
    </View>
  );
}

interface NameBodyProps {
  choices: string[];
  correctNames: string[];
  answered: 'correct' | 'wrong' | null;
  picked: string | null;
  onPick: (c: string) => void;
  onNext: () => void;
}

function NameBody({ choices, correctNames, answered, picked, onPick, onNext }: NameBodyProps) {
  return (
    <View style={styles.body}>
      <Text style={typography.taskTitle}>하이라이트된 도형의 자재 이름은?</Text>
      <View style={styles.choices}>
        {choices.map(c => {
          const isCorrect = correctNames.includes(c);
          const showState = answered != null;
          const tint = showState
            ? isCorrect
              ? colors.success
              : c === picked
                ? colors.deadline
                : undefined
            : undefined;
          return (
            <Pressable
              key={c}
              disabled={showState}
              onPress={() => onPick(c)}
              style={({ pressed }) => [
                styles.choice,
                tint && { borderColor: tint, backgroundColor: `${tint}1A` },
                pressed && !showState && styles.dim,
              ]}
            >
              <Text style={[typography.body, tint && { color: tint }]} numberOfLines={1}>
                {c}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {answered ? (
        <Pressable
          onPress={onNext}
          style={({ pressed }) => [
            styles.actBtn,
            styles.actPrimary,
            styles.nextFull,
            pressed && styles.dim,
          ]}
        >
          <Text style={[typography.button, { color: colors.canvas }]}>다음</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.canvas,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeBtn: { minHeight: 44, justifyContent: 'center' },
  body: { gap: spacing.sm },
  dim: { opacity: 0.6 },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  feedbackLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  choices: { gap: spacing.sm },
  choice: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.standard,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  actBtn: {
    minHeight: 44,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.standard,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface1,
  },
  actPrimary: { backgroundColor: colors.blue },
  nextFull: { alignSelf: 'stretch' },
  finishWrap: { gap: spacing.md, alignItems: 'center', paddingVertical: spacing.sm },
  finishActions: { flexDirection: 'row', gap: spacing.md },
});
