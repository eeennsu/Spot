// 튜토리얼 스포트라이트 오버레이 — 대상 외 영역을 어둡게 눌러 초점을 만들고,
// 대상 위엔 파란 링 + 설명 카드를 띄운다. interactive 스텝은 대상을 실제로 눌러볼 수 있게
// 사각 구멍(4분할 스크림)으로 터치를 통과시킨다(pass-through). 캔버스 root 의 마지막 자식으로 렌더.
import { ChevronUp } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, tutorialScrim, typography } from '@shared/theme';

import { selectCurrentStep, useTutorialStore } from '@features/tutorial/stores/tutorial';

interface Origin {
  x: number;
  y: number;
}

const RING_PAD = spacing.sm; // 링과 대상 사이 여백
const CARD_GAP = spacing.md; // 카드와 대상 사이 간격

export default function TutorialOverlay() {
  const active = useTutorialStore(s => s.active);
  const step = useTutorialStore(selectCurrentStep);
  const index = useTutorialStore(s => s.index);
  const total = useTutorialStore(s => s.steps.length);
  const rect = useTutorialStore(s => (s.active && step?.target ? s.rects[step.target] : undefined));
  const next = useTutorialStore(s => s.next);
  const prev = useTutorialStore(s => s.prev);
  const stop = useTutorialStore(s => s.stop);

  // 오버레이 자신의 화면 원점(window) + 크기 — window 좌표를 로컬로 환산하는 데 쓴다.
  const rootRef = useRef<View>(null);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [cardH, setCardH] = useState(160);

  const onRootLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
    rootRef.current?.measureInWindow((x, y) => setOrigin({ x, y }));
  }, []);

  if (!active || !step) return null;

  const isLast = index >= total - 1;
  const hasSpotlight = !!step.target && !!rect && !!origin;

  // ── 설명 카드 내용(중앙/앵커 공통) ──
  const card = (
    <View
      style={styles.card}
      pointerEvents='auto'
      onLayout={e => setCardH(e.nativeEvent.layout.height)}
    >
      <Text style={styles.progress}>
        {index + 1} / {total}
      </Text>
      <Text style={[typography.taskTitle, styles.title]}>{step.title}</Text>
      <Text style={[typography.body, styles.body]}>{step.body}</Text>
      <View style={styles.actions}>
        <Pressable onPress={stop} hitSlop={8} style={({ pressed }) => pressed && styles.dim}>
          <Text style={[typography.button, styles.skip]}>건너뛰기</Text>
        </Pressable>
        <View style={styles.actionsRight}>
          {index > 0 ? (
            <Pressable onPress={prev} hitSlop={8} style={({ pressed }) => pressed && styles.dim}>
              <Text style={[typography.button, styles.prev]}>이전</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={next}
            style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]}
          >
            <Text style={[typography.button, styles.nextText]}>{isLast ? '완료' : '다음'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  // ── 스포트라이트 있음: 4분할(또는 전체) 스크림 + 링 + 앵커된 카드 ──
  if (hasSpotlight && rect && origin) {
    const sx = Math.max(rect.x - origin.x - RING_PAD, 0);
    const sy = Math.max(rect.y - origin.y - RING_PAD, 0);
    const sw = rect.w + RING_PAD * 2;
    const sh = rect.h + RING_PAD * 2;

    // 대상이 화면 위쪽이면 카드는 아래, 아래쪽이면 위로.
    const below = sy < size.h / 2;
    const cardTop = below
      ? Math.min(sy + sh + CARD_GAP, size.h - cardH - spacing.lg)
      : Math.max(sy - CARD_GAP - cardH, spacing.lg);

    return (
      <View ref={rootRef} onLayout={onRootLayout} style={StyleSheet.absoluteFill} pointerEvents='box-none'>
        {step.interactive ? (
          <>
            {/* 대상 사각 구멍만 비우고 나머지를 4분할로 덮는다 → 대상 터치 통과. */}
            <View style={[styles.dimRect, styles.dimTop, { width: size.w, height: sy }]} />
            <View style={[styles.dimRect, styles.dimBottom, { top: sy + sh, width: size.w }]} />
            <View style={[styles.dimRect, styles.dimLeft, { top: sy, width: sx, height: sh }]} />
            <View style={[styles.dimRect, styles.dimRight, { top: sy, left: sx + sw, height: sh }]} />
          </>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.dim]} pointerEvents='auto' />
        )}

        {/* 파란 링(대상 강조) — 터치 통과. */}
        <View
          pointerEvents='none'
          style={[styles.ring, { left: sx, top: sy, width: sw, height: sh }]}
        />

        <View
          style={[styles.cardAnchor, { top: cardTop }]}
          pointerEvents='box-none'
        >
          {card}
        </View>
      </View>
    );
  }

  // ── 스포트라이트 없음(헤더 버튼/인트로/아웃트로): 전체 스크림 + 중앙 카드 ──
  return (
    <View ref={rootRef} onLayout={onRootLayout} style={StyleSheet.absoluteFill} pointerEvents='box-none'>
      <View style={[StyleSheet.absoluteFill, styles.dim, styles.center]} pointerEvents='auto'>
        {step.point === 'topRight' ? (
          <View style={styles.topRightHint} pointerEvents='none'>
            <ChevronUp size={28} color={colors.canvas} strokeWidth={2.5} />
          </View>
        ) : null}
        {card}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: { backgroundColor: tutorialScrim },
  dimRect: { position: 'absolute', backgroundColor: tutorialScrim },
  dimTop: { left: 0, top: 0 },
  dimBottom: { left: 0, bottom: 0 },
  dimLeft: { left: 0 },
  dimRight: { right: 0 },
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.blue,
    borderRadius: radius.standard,
  },
  topRightHint: { position: 'absolute', top: spacing.sm, right: spacing.lg },
  cardAnchor: { position: 'absolute', left: spacing.xl, right: spacing.xl },
  card: {
    backgroundColor: colors.canvas,
    borderRadius: radius.comfortable,
    padding: spacing.lg,
    gap: spacing.sm,
    // 카드가 어두운 스크림 위에서 떠 보이게(Android elevation).
    elevation: 8,
  },
  progress: { ...typography.metadata, color: colors.blue },
  title: { color: colors.textPrimary },
  body: { color: colors.textSecondary },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  actionsRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  skip: { color: colors.textSecondary },
  prev: { color: colors.textSecondary },
  nextBtn: {
    backgroundColor: colors.blue,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.standard,
  },
  nextBtnPressed: { backgroundColor: colors.bluePressed },
  nextText: { color: colors.canvas },
});
